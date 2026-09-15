package org.nostrocket.hypergolic.identityowner;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.function.LongSupplier;
import java.util.function.Supplier;

/** Native-only deletion authority. No exported Expo method accepts an inventory or auth result. */
final class DeletionAuthority {
  static final long MAX_REVISION = 9_007_199_254_740_991L;
  static final long AUTH_MILLIS = 60_000L;
  static final long GRANT_MILLIS = 15_000L;
  static final class Denied extends RuntimeException {
    Denied() { super("Identity action unavailable"); }
  }
  interface InventoryReader { Inventory read(); }
  /** Synchronous native erase/readback, with no callbacks into this authority. */
  interface Erase { void run(String target); }

  static final class Inventory {
    final String vault, selected, receiptDigest;
    final long revision;
    final Map<String, String> identities;
    Inventory(String vault, long revision, String selected, String receiptDigest, Map<String, String> identities) {
      require(vault != null && vault.matches("[A-Za-z0-9_-]{16,80}") && revision > 0 && revision <= MAX_REVISION && key(selected) && key(receiptDigest));
      require(identities != null && !identities.isEmpty() && identities.size() <= 16);
      Map<String, String> copy = new HashMap<>(identities);
      require(copy.containsKey(selected));
      for (Map.Entry<String, String> item : copy.entrySet()) require(key(item.getKey()) && key(item.getValue()));
      this.vault = vault; this.revision = revision; this.selected = selected; this.receiptDigest = receiptDigest;
      this.identities = Collections.unmodifiableMap(copy);
    }
    @Override public boolean equals(Object other) {
      if (!(other instanceof Inventory)) return false;
      Inventory value = (Inventory) other;
      return revision == value.revision && vault.equals(value.vault) && selected.equals(value.selected)
          && receiptDigest.equals(value.receiptDigest) && identities.equals(value.identities);
    }
    @Override public int hashCode() { return Objects.hash(vault, revision, selected, receiptDigest, identities); }
  }
  static final class Attempt {
    private final Object owner;
    private final long epoch, deadline;
    private final String session, target;
    private final Inventory inventory;
    private Attempt(Object owner, long epoch, long deadline, String session, String target, Inventory inventory) {
      this.owner = owner; this.epoch = epoch; this.deadline = deadline;
      this.session = session; this.target = target; this.inventory = inventory;
    }
  }
  private static final class Grant {
    final Attempt attempt;
    final String token;
    final long deadline;
    Grant(Attempt attempt, String token, long deadline) { this.attempt = attempt; this.token = token; this.deadline = deadline; }
  }

  private final InventoryReader reader;
  private final LongSupplier clock;
  private final Supplier<String> entropy;
  private final Object owner = new Object();
  private boolean activated, retired, foreground, opening;
  private long epoch;
  private Inventory inventory;
  private String session;
  private Attempt attempt;
  private Grant grant;

  DeletionAuthority(InventoryReader reader, LongSupplier clock, Supplier<String> entropy) {
    this.reader = Objects.requireNonNull(reader); this.clock = Objects.requireNonNull(clock); this.entropy = Objects.requireNonNull(entropy);
  }
  private static void require(boolean accepted) { if (!accepted) throw new Denied(); }
  static boolean key(String value) { return value != null && value.matches("[0-9a-f]{64}"); }
  static boolean opaque(String value) { return value != null && value.matches("[A-Za-z0-9_-]{16,128}"); }
  private long now() { long value = clock.getAsLong(); require(value >= 0); return value; }
  private long deadline(long lifetime) { long value = now(); require(value <= Long.MAX_VALUE - lifetime); return value + lifetime; }
  private String token() { String value = entropy.get(); require(opaque(value)); return value; }
  private void available() { require(activated && !retired && foreground && epoch < Long.MAX_VALUE); }
  private void invalidate() {
    if (epoch == Long.MAX_VALUE) retired = true; else epoch++;
    inventory = null; session = null; attempt = null; grant = null;
  }
  /** Called once after the exact native AppContext's process claim succeeds. */
  synchronized void activate() { require(!activated && !retired); activated = true; }
  /** Resume never restores a previous Settings session. OS prompt inactivity is not background. */
  synchronized void updateForeground(boolean value) {
    foreground = value;
    if (!value) invalidate();
  }
  synchronized void retire() { retired = true; invalidate(); }
  synchronized void vaultWillMutate() { invalidate(); }
  synchronized void endSettings(String expectedSession) {
    if (session != null && session.equals(expectedSession)) invalidate();
  }
  synchronized void cancel(String expectedSession) {
    if (session != null && session.equals(expectedSession)) { attempt = null; grant = null; }
  }
  private boolean matches(Attempt value) {
    return activated && !retired && foreground && value.owner == owner && value.epoch == epoch
        && value.session.equals(session) && value.inventory.equals(inventory);
  }
  private void compareCurrent(Inventory fresh) {
    if (!Objects.equals(inventory, fresh)) { invalidate(); throw new Denied(); }
  }
  String beginSettings(String expectedSelected, long expectedRevision) {
    final long reserved;
    synchronized (this) {
      available(); require(!opening); require(key(expectedSelected) && expectedRevision > 0 && expectedRevision <= MAX_REVISION);
      invalidate(); available(); opening = true; reserved = epoch;
    }
    try {
      Inventory fresh = reader.read();
      String newSession = token();
      synchronized (this) {
        available(); require(epoch == reserved && fresh != null && fresh.selected.equals(expectedSelected) && fresh.revision == expectedRevision);
        inventory = fresh; session = newSession; return newSession;
      }
    } finally { synchronized (this) { opening = false; } }
  }
  synchronized Attempt begin(String expectedSession, String target, String expectedSelected, long expectedRevision) {
    available(); require(!opening && opaque(expectedSession) && key(target) && inventory != null && expectedSession.equals(session));
    require(inventory.selected.equals(expectedSelected) && inventory.revision == expectedRevision);
    compareCurrent(reader.read());
    if (grant != null && now() >= grant.deadline) grant = null;
    if (attempt != null && now() >= attempt.deadline) attempt = null;
    require(attempt == null && grant == null && inventory.identities.size() >= 2
        && !target.equals(inventory.selected) && inventory.identities.containsKey(target));
    attempt = new Attempt(owner, epoch, deadline(AUTH_MILLIS), session, target, inventory);
    return attempt;
  }
  synchronized boolean canPresent(Attempt value) {
    return value != null && value == attempt && matches(value) && now() < value.deadline;
  }
  /** Native OS-auth callback only; complete exactly the reserved attempt, never a caller-selected ID. */
  synchronized String complete(Attempt value, boolean authenticated) {
    require(value != null && value == attempt);
    attempt = null; // A failed, stale or repeated callback cannot be retried into a grant.
    require(authenticated && matches(value) && now() < value.deadline);
    compareCurrent(reader.read());
    String next = token();
    // Entropy can fail. Do not leave the attempt active, and do not issue an unbounded grant.
    grant = new Grant(value, next, deadline(GRANT_MILLIS));
    return next;
  }
  private Grant validate(String expectedSession, String target, String expectedToken) {
    require(opaque(expectedSession) && key(target) && opaque(expectedToken));
    Grant value = grant;
    require(value != null && value.token.equals(expectedToken) && value.attempt.target.equals(target)
        && value.attempt.session.equals(expectedSession) && matches(value.attempt) && now() < value.deadline);
    return value;
  }
  synchronized void assertActive(String expectedSession, String target, String expectedToken) {
    validate(expectedSession, target, expectedToken);
  }
  /** Inventory is re-read at the actual effect. Revocation and erase serialize on this monitor. */
  synchronized void erase(String expectedSession, String target, String expectedToken, Erase effect) {
    validate(expectedSession, target, expectedToken);
    compareCurrent(reader.read());
    validate(expectedSession, target, expectedToken);
    grant = null; // Consume before the effect; an uncertain or failed commit requires new authentication.
    effect.run(target);
  }
}
