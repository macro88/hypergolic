package org.nostrocket.hypergolic.host

import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import org.json.JSONObject

/** Trusted React Native configuration. No field is accepted from a napplet request. */
internal class CapabilityConfiguration(raw: String, generation: String) {
  val snapshot: String
  val sessionId: String
  val fixture: String
  init {
    require(raw.toByteArray(Charsets.UTF_8).size <= 8192)
    val value = JSONObject(raw)
    val names = setOf("sessionId", "epoch", "user", "publisher", "appId", "version", "instanceId", "fixture", "domains")
    require(value.keys().asSequence().toSet() == names)
    fun string(name: String): String = (value.get(name) as? String) ?: error("Invalid configuration")
    for (name in listOf("sessionId", "instanceId", "fixture")) require(string(name).matches(Regex("[A-Za-z0-9_-]{1,80}")))
    for (name in listOf("user", "publisher", "version")) require(string(name).matches(Regex("[0-9a-f]{64}")))
    require(string("appId").toByteArray(Charsets.UTF_8).size in 1..1024)
    val epoch = value.get("epoch")
    require((epoch is Int || epoch is Long) && (epoch as Number).toLong() in 0..9_007_199_254_740_991L)
    val domains = value.getJSONArray("domains")
    val granted = (0 until domains.length()).map { domains.get(it) as? String ?: error("Invalid domain") }
    require(granted.size == granted.toSet().size)
    fixture = string("fixture")
    val expected = when (fixture) {
      "ux-lab" -> setOf("theme")
      "state-lab", "state-lab-peer" -> setOf("identity", "storage", "theme")
      else -> error("Unknown bundled fixture")
    }
    require(granted.toSet() == expected)
    sessionId = string("sessionId")
    value.put("generation", generation)
    snapshot = value.toString()
  }
  fun request(message: String): String = JSONObject().put("registration", JSONObject(snapshot))
    .put("request", message).toString()
}

/** Registry methods run synchronously on the calling thread. Reply closures stay on the UI thread. */
internal object CapabilityTransport {
  val leases = CapabilityLeaseRegistry(SystemClock::elapsedRealtime)
  private val main = Handler(Looper.getMainLooper())
  private data class Pending(val generation: String, val reply: (String?) -> Unit)
  private val pending = mutableMapOf<String, Pending>()

  fun admit(generation: String, sequence: Long, snapshot: String, reply: (String?) -> Unit): String? {
    check(Looper.myLooper() == Looper.getMainLooper())
    val token = leases.admit(generation, sequence, snapshot) ?: return null
    pending[token] = Pending(generation, reply)
    main.postDelayed({
      // The registry's elapsedRealtime deadline is authoritative, including device sleep.
      if (!leases.isActive(token)) pending.remove(token)?.reply?.invoke(null)
    }, 25_000)
    return token
  }
  fun finish(token: String, response: String?) {
    val bounded = response?.takeIf { it.toByteArray(Charsets.UTF_8).size <= CapabilityLeaseRegistry.MAX_BYTES }
    main.post {
      val admitted = leases.finish(token)
      val request = pending.remove(token) ?: return@post
      request.reply(if (admitted && leases.sessionActive(request.generation)) bounded else null)
    }
  }
  fun revoke(generation: String) {
    // Revoke before dispatching callbacks, navigating or dismantling a renderer.
    leases.revoke(generation)
    check(Looper.myLooper() == Looper.getMainLooper())
    val tokens = pending.filterValues { it.generation == generation }.keys.toList()
    for (token in tokens) pending.remove(token)?.reply?.invoke(null)
  }
}
