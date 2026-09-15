package org.nostrocket.hypergolic.identityowner

import android.os.SystemClock
import com.facebook.react.common.LifecycleState
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.security.SecureRandom
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout

/** Trusted shell module. Native construction supplies context, inventory, clock and OS authentication. */
class IdentityActionsModule : Module() {
  private class Binding(val records: SecureStoreIdentityRecords, val authority: DeletionAuthority, val prompt: SystemDeletionAuthentication) {
    fun background() { authority.updateForeground(false); prompt.cancel() }
    fun retire() { authority.retire(); prompt.cancel() }
  }
  private class EraseUnconfirmed : RuntimeException()
  @Volatile private var binding: Binding? = null
  private fun owned(): Binding {
    if (!IdentityOwnerClaim.contexts.owns(appContext)) throw DeletionAuthority.Denied()
    return binding ?: throw DeletionAuthority.Denied()
  }
  private fun mainJavaScript() {
    if (appContext.runtime.reactContext?.isOnJSQueueThread != true) throw DeletionAuthority.Denied()
  }
  private fun revision(value: Double): Long {
    if (!value.isFinite() || value < 1 || value > DeletionAuthority.MAX_REVISION || value % 1.0 != 0.0) throw DeletionAuthority.Denied()
    return value.toLong()
  }
  private inline fun <T> action(block: () -> T): T = try { block() } catch (_: EraseUnconfirmed) {
    throw CodedException("ERR_IDENTITY_ERASE_UNCONFIRMED", "Identity removal could not be confirmed.", null)
  } catch (_: Exception) {
    throw CodedException("ERR_IDENTITY_ACTION_DENIED", "Identity action could not be completed.", null)
  }
  override fun definition() = ModuleDefinition {
    Name("HypergolicIdentityActions")
    Function("activateIdentityActions") { action {
      mainJavaScript()
      if (!IdentityOwnerClaim.contexts.owns(appContext) || binding != null) throw DeletionAuthority.Denied()
      val context = appContext.runtime.reactContext ?: throw DeletionAuthority.Denied()
      val records = SecureStoreIdentityRecords(context)
      val random = SecureRandom()
      val authority = DeletionAuthority(records, SystemClock::elapsedRealtime) {
        val bytes = ByteArray(32); random.nextBytes(bytes)
        bytes.joinToString("") { "%02x".format(it.toInt() and 255) }
      }
      authority.activate()
      val next = Binding(records, authority, SystemDeletionAuthentication())
      if (!IdentityOwnerClaim.contexts.register(appContext, next::retire)) { next.retire(); throw DeletionAuthority.Denied() }
      binding = next
      authority.updateForeground(context.lifecycleState == LifecycleState.RESUMED)
    } }
    AsyncFunction("isDeletionAvailableAsync") Coroutine { -> action {
      val owner = owned()
      withContext(Dispatchers.Main.immediate) {
        val activity = appContext.currentActivity
        activity != null && owner.prompt.available(activity)
      }
    } }
    AsyncFunction("beginSettingsAsync") Coroutine { selected: String, value: Double -> action {
      val owner = owned(); val expected = revision(value)
      withContext(Dispatchers.Default) { owner.authority.beginSettings(selected, expected) }
    } }
    Function("endSettings") { session: String -> action {
      mainJavaScript(); val owner = owned(); owner.authority.endSettings(session)
      owner.prompt.cancel()
    } }
    Function("cancelDeletion") { session: String -> action {
      mainJavaScript(); val owner = owned(); owner.authority.cancel(session)
      owner.prompt.cancel()
    } }
    AsyncFunction("authorizeDeletionAsync") Coroutine { session: String, target: String, selected: String, value: Double -> action {
      val owner = owned(); val expected = revision(value)
      val attempt = withContext(Dispatchers.Default) { owner.authority.begin(session, target, selected, expected) }
      try {
        val accepted = withTimeout(DeletionAuthority.AUTH_MILLIS) {
          withContext(Dispatchers.Main.immediate) {
            val activity = appContext.currentActivity ?: throw DeletionAuthority.Denied()
            owner.prompt.authenticate(activity) { owner.authority.canPresent(attempt) }
          }
        }
        withContext(Dispatchers.Default) { owner.authority.complete(attempt, accepted) }
      } catch (error: Exception) { owner.authority.cancelAttempt(attempt); throw error }
    } }
    Function("assertDeletionGrantActive") { session: String, target: String, token: String -> action {
      mainJavaScript(); owned().authority.assertActive(session, target, token)
    } }
    AsyncFunction("deleteSecretAsync") Coroutine { target: String, token: String -> action {
      val owner = owned()
      withContext(Dispatchers.Default) {
        owner.authority.eraseAuthorized(target, token) { key ->
          try { owner.records.erase(key) } catch (_: Exception) { throw EraseUnconfirmed() }
        }
      }
    } }
    OnActivityEntersForeground { binding?.authority?.updateForeground(true) }
    OnActivityEntersBackground { binding?.background() }
    OnUserLeavesActivity { binding?.background() }
    OnActivityDestroys { binding?.background() }
    OnDestroy { IdentityOwnerClaim.contexts.retireIfOwned(appContext); binding?.retire() }
  }
}
