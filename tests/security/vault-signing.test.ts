import test from 'node:test';
import assert from 'node:assert/strict';
import { finalizeEvent, getPublicKey } from 'nostr-tools/pure';
import { captureEventSnapshot } from '../../src/security/event-snapshot.ts';
import { IdentityVault, VaultError, type DatabaseRecord, type EncryptedSecrets, type Inventory, type SecretRecord, type StagedSecret } from '../../src/security/identity-vault.ts';

const secret = new Uint8Array(32); secret[31] = 2;
const pubkey = getPublicKey(secret);
const clone = <T>(value: T): T => structuredClone(value);
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
};

function fixture() {
  let database: DatabaseRecord | null = null;
  let inventory: Inventory | null = null;
  let stage: StagedSecret | null = null;
  const keys = new Map<string, SecretRecord>();
  const returned: Uint8Array[] = [];
  let readSecret: EncryptedSecrets['readSecret'] = async key => {
    const value = keys.get(key) ?? null;
    const result = clone(value);
    if (result) returned.push(result.secretKey);
    return result;
  };
  const secrets: EncryptedSecrets = {
    readInventory: async () => clone(inventory),
    writeInventory: async value => { inventory = clone(value); },
    readStage: async () => clone(stage),
    writeStage: async value => { stage = clone(value); },
    deleteStage: async () => { stage = null; },
    readSecret: key => readSecret(key),
    writeSecret: async (key, value) => { keys.set(key, clone(value)); },
    deleteSecret: async () => undefined,
  };
  const vault = new IdentityVault({
    database: {
      read: async () => clone(database),
      compareAndSwap: async (expected, next) => {
        assert.equal(database?.revision ?? null, expected);
        database = clone(next);
      },
    },
    secrets,
    generateSecretKey: () => new Uint8Array(secret),
    parseNsec: value => {
      if (value !== 'nsec1fixture-3') throw new Error('unused');
      const key = new Uint8Array(32); key[31] = 3;
      return key;
    },
    derivePublicKey: getPublicKey,
    newId: () => 'signing_fixture_id_0001',
    now: () => 1,
    authorizeDeletion: async () => ({ assertActive: () => undefined }),
  });
  return {
    vault,
    keys,
    returned,
    inventory: () => clone(inventory),
    database: () => clone(database),
    setInventory: (value: Inventory | null) => { inventory = clone(value); },
    setDatabase: (value: DatabaseRecord | null) => { database = clone(value); },
    setReadSecret: (reader: EncryptedSecrets['readSecret']) => { readSecret = reader; },
  };
}

const authority = (active = { value: true }) => Object.freeze({
  signal: new AbortController().signal,
  assertActive: () => { if (!active.value) throw new Error('revoked'); },
});

function note(selectedPubkey: string) {
  return captureEventSnapshot({ kind: 1, content: 'exact note', tags: [['t', 'one']], created_at: 1 }, selectedPubkey, ['wss://relay.example.org']);
}

test('signApproved signs the exact captured event and wipes each secret buffer', async () => {
  const { vault, returned } = fixture();
  const state = await vault.open();
  const snapshot = note(state.selectedPubkey);
  let signerSecret: Uint8Array | null = null;
  const grant = authority();
  const signed = await vault.signApproved(snapshot, grant, (event, key) => {
    signerSecret = key;
    return JSON.parse(JSON.stringify(finalizeEvent(event, key)));
  });
  assert.equal(signed.pubkey, pubkey);
  assert.equal(signed.content, 'exact note');
  assert.deepEqual(signed.tags, [['t', 'one']]);
  assert(signerSecret !== null);
  assert((signerSecret as Uint8Array).every(value => value === 0));
  assert(returned.every(key => key.every(value => value === 0)));
  await assert.rejects(vault.signApproved(snapshot, grant, () => undefined), (error: unknown) => error instanceof VaultError && error.code === 'AUTHORIZATION_DENIED');
});

test('revocation after the protected secret read starts denies signing and preserves readiness', async () => {
  const { vault, keys, setReadSecret } = fixture();
  const state = await vault.open();
  const snapshot = note(state.selectedPubkey);
  const entered = deferred<void>();
  const release = deferred<SecretRecord | null>();
  setReadSecret(async key => {
    if (key === state.selectedPubkey) entered.resolve();
    return release.promise;
  });
  const active = { value: true };
  const denied = vault.signApproved(snapshot, authority(active), () => { throw new Error('must not sign'); });
  await entered.promise;
  active.value = false;
  release.resolve(clone(keys.get(state.selectedPubkey) ?? null));
  await assert.rejects(denied, (error: unknown) => error instanceof VaultError && error.code === 'AUTHORIZATION_DENIED');
  assert.equal(vault.getSnapshot().selectedPubkey, state.selectedPubkey);
});

test('call-time selection is captured before a queued selection completes', async () => {
  const { vault, keys, setReadSecret } = fixture();
  const selectedTwo = await vault.open();
  const imported = await vault.importNsec('nsec1fixture-3');
  await vault.select(selectedTwo.selectedPubkey);
  const selectedThree = imported.selectedPubkey;
  const entered = deferred<void>();
  const release = deferred<SecretRecord | null>();
  setReadSecret(async key => {
    if (key === selectedThree) entered.resolve();
    return release.promise;
  });
  const queuedSelection = vault.select(selectedThree);
  const stale = vault.signApproved(note(selectedTwo.selectedPubkey), authority(), () => { throw new Error('must not sign'); });
  await entered.promise;
  assert.equal(vault.getSnapshot().selectedPubkey, selectedTwo.selectedPubkey);
  release.resolve(clone(keys.get(selectedThree) ?? null));
  await queuedSelection;
  await assert.rejects(stale, (error: unknown) => error instanceof VaultError && error.code === 'AUTHORIZATION_DENIED');
  assert.equal(vault.getSnapshot().selectedPubkey, selectedThree);
});

test('missing protected secrets and protected state disagreement revoke vault readiness', async () => {
  const missing = fixture();
  const missingState = await missing.vault.open();
  missing.keys.delete(missingState.selectedPubkey);
  await assert.rejects(missing.vault.signApproved(note(missingState.selectedPubkey), authority(), () => undefined), (error: unknown) => error instanceof VaultError && error.code === 'RECOVERY_REQUIRED');
  assert.throws(() => missing.vault.getSnapshot(), (error: unknown) => error instanceof VaultError && error.code === 'NOT_READY');

  const inventoryMismatch = fixture();
  const inventoryState = await inventoryMismatch.vault.open();
  const protectedInventory = inventoryMismatch.inventory()!;
  inventoryMismatch.setInventory({ ...protectedInventory, revision: protectedInventory.revision + 1 });
  await assert.rejects(inventoryMismatch.vault.signApproved(note(inventoryState.selectedPubkey), authority(), () => undefined), (error: unknown) => error instanceof VaultError && error.code === 'CORRUPT_METADATA');
  assert.throws(() => inventoryMismatch.vault.getSnapshot(), (error: unknown) => error instanceof VaultError && error.code === 'NOT_READY');

  const databaseMismatch = fixture();
  const databaseState = await databaseMismatch.vault.open();
  const storedDatabase = databaseMismatch.database()!;
  databaseMismatch.setDatabase({ ...storedDatabase, revision: storedDatabase.revision + 1 });
  await assert.rejects(databaseMismatch.vault.signApproved(note(databaseState.selectedPubkey), authority(), () => undefined), (error: unknown) => error instanceof VaultError && error.code === 'CORRUPT_METADATA');
  assert.throws(() => databaseMismatch.vault.getSnapshot(), (error: unknown) => error instanceof VaultError && error.code === 'NOT_READY');
});

test('signer failure and mismatched signed output wipe the signer copy', async () => {
  const failedSigner = fixture();
  const state = await failedSigner.vault.open();
  let observed: Uint8Array | null = null;
  await assert.rejects(failedSigner.vault.signApproved(note(state.selectedPubkey), authority(), (_event, key) => {
    observed = key;
    throw new Error('signer failure');
  }), (error: unknown) => error instanceof VaultError && error.code === 'STORAGE_FAILURE');
  assert(observed !== null);
  assert((observed as Uint8Array).every(value => value === 0));

  const mismatched = fixture();
  const mismatchState = await mismatched.vault.open();
  await assert.rejects(mismatched.vault.signApproved(note(mismatchState.selectedPubkey), authority(), (_event, key) => {
    return JSON.parse(JSON.stringify(finalizeEvent({ kind: 1, content: 'different', tags: [['t', 'one']], created_at: 1 }, key)));
  }), (error: unknown) => error instanceof VaultError && error.code === 'STORAGE_FAILURE');
});

test('ordinary signing rejects NIP-42 authentication events', async () => {
  const { vault } = fixture();
  const state = await vault.open();
  const auth = captureEventSnapshot({ kind: 22242, content: '', tags: [['challenge', 'x']], created_at: 1 }, state.selectedPubkey, ['wss://relay.example.org']);
  await assert.rejects(vault.signApproved(auth, authority(), () => undefined), (error: unknown) => error instanceof VaultError && error.code === 'AUTHORIZATION_DENIED');
});
