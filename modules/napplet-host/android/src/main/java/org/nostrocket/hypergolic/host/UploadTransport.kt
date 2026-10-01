package org.nostrocket.hypergolic.host

import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import org.json.JSONArray
import org.json.JSONObject

/** Native byte admission, original recipient and progress ownership. Expo sees lookup tokens only. */
internal object UploadTransport {
  val leases = UploadLeaseRegistry(SystemClock::elapsedRealtime, UploadPhotoPreparation::prepare)
  private val main = Handler(Looper.getMainLooper())
  private data class Pending(val generation: String, val uploadId: String, val sequence: Long,
    val review: NativeUploadAuthority.Review, val push: (String) -> Unit, var delivery: Long = 0, var sent: Int = 0)
  private val pending = mutableMapOf<String, Pending>()
  private val statuses = linkedMapOf<Pair<String, String>, JSONObject>()
  private val completed = mutableMapOf<String, JSONObject>()
  @Volatile private var progressObserver: ((Map<String, Any>) -> Unit)? = null
  fun observeProgress(observer: ((Map<String, Any>) -> Unit)?) { progressObserver = observer }
  @Volatile private var proofFactory: javax.net.ssl.SSLSocketFactory? = null
  private val proofDns = java.util.concurrent.ThreadPoolExecutor(1, 1, 0, java.util.concurrent.TimeUnit.MILLISECONDS,
    java.util.concurrent.ArrayBlockingQueue(2), java.util.concurrent.ThreadFactory { task -> Thread(task, "upload-proof-dns").apply {isDaemon = true} })
  @Synchronized fun configureProof(anchor: String) {
    require(BuildConfig.UPLOAD_NETWORK_PROOF && proofFactory == null && anchor.length <= 8192)
    val bytes = java.util.Base64.getDecoder().decode(anchor)
    require(java.util.Base64.getEncoder().encodeToString(bytes) == anchor)
    val certificate = java.security.cert.CertificateFactory.getInstance("X.509").generateCertificate(bytes.inputStream())
    val store = java.security.KeyStore.getInstance(java.security.KeyStore.getDefaultType()).apply {load(null, null); setCertificateEntry("disposable-upload-proof", certificate)}
    val trust = javax.net.ssl.TrustManagerFactory.getInstance(javax.net.ssl.TrustManagerFactory.getDefaultAlgorithm()).apply {init(store)}
    proofFactory = javax.net.ssl.SSLContext.getInstance("TLS").apply {init(null, trust.trustManagers, null)}.socketFactory
  }
  private fun transfer(transfer: UploadLeaseRegistry.Transfer, progress: UploadPinnedHttpsTransport.Progress): PublishedHttpsResponseReader.UploadResponse {
    val factory = proofFactory
    if (!BuildConfig.UPLOAD_NETWORK_PROOF || factory == null) return UploadPinnedHttpsTransport.put(transfer.authority, transfer.grant, transfer.permit, progress)
    require(transfer.permit.review.destination == "https://files.example.com:19943")
    val address = java.net.InetAddress.getByAddress(byteArrayOf(127, 0, 0, 1))
    val policy = object : PublishedHttpsTransport.AddressPolicy {
      override fun isAllowedHost(host: String) = host == "files.example.com"
      override fun isAllowedAddress(candidate: java.net.InetAddress) = candidate == address
    }
    return UploadPinnedHttpsTransport.putWithTransport(transfer.authority, transfer.grant, transfer.permit, progress, policy,
      {host -> require(host == "files.example.com"); arrayOf(address)}, proofDns, factory, javax.net.ssl.HttpsURLConnection.getDefaultHostnameVerifier(), {System.currentTimeMillis() / 1000})
  }
  @Volatile private var destination: String? = null
  fun configure(server: String?) {
    if (server != null) require(NativeUploadAuthority.validDestination(server))
    destination = server
  }
  fun register(generation: String, config: CapabilityConfiguration): Boolean =
    !config.allowsUpload || leases.register(generation, config.user, config.snapshot, true)
  fun foreground(value: Boolean) { leases.foreground(value); main.post { sweep() } }
  fun focus(generation: String, value: Boolean) { leases.focus(generation, value); main.post { sweep() } }
  fun revoke(generation: String) {
    leases.revoke(generation)
    main.post { sweep(); statuses.keys.removeAll { it.first == generation } }
  }
  fun receive(generation: String, sequence: Long, raw: String, push: (String) -> Unit,
    onReview: (String) -> Unit): String? {
    check(Looper.myLooper() == Looper.getMainLooper())
    sweep()
    var type: String? = null; var id: String? = null
    return try {
      require(CapabilityTransport.leases.sessionActive(generation) && raw.toByteArray(Charsets.UTF_8).size <= 400 * 1024)
      val value = UploadWire.objectValue(raw)
      type = UploadWire.text(value.get("type"), 32); id = UploadWire.text(value.get("id"), 128)
      val response = JSONObject().put("type", "$type.result").put("id", id)
      when (type) {
        "upload.info" -> {
          UploadWire.fields(value, setOf("type", "id"))
          response.put("info", JSONObject().put("rails", JSONArray().put(JSONObject().put("rail", "blossom").put("enabled", destination != null)
            .put("returns", JSONArray(listOf("https", "blossom")))).put(JSONObject().put("rail", "nip96").put("enabled", false)))
            .put("maxBytes", NativeUploadAuthority.MAX_BYTES))
        }
        "upload.status" -> {
          UploadWire.fields(value, setOf("type", "id", "uploadId"))
          val publicId = UploadWire.text(value.get("uploadId"), 128)
          val status = statuses[Pair(generation, publicId)] ?: error("Unknown upload")
          response.put("status", status)
        }
        "upload.__begin" -> {
          UploadWire.fields(value, setOf("type", "id", "wireId", "byteLength", "request"))
          val server = destination ?: return response.put("error", "no server configured").toString()
          val header = value.getJSONObject("request")
          if (header.has("rail") && header.get("rail") != "blossom") return response.put("error", "unsupported rail").toString()
          val requestText = UploadWire.header(header)
          val length = UploadWire.integer(value.get("byteLength"), NativeUploadAuthority.MAX_BYTES.toLong()).toInt()
          val token = leases.begin(generation, UploadWire.text(value.get("wireId"), 128), requestText, length, server)
            ?: return response.put("error", "quota exceeded").toString()
          response.put("token", token).put("uploadId", leases.publicId(generation, token))
        }
        "upload.__append" -> {
          UploadWire.fields(value, setOf("type", "id", "token", "offset", "base64"))
          val chunk = UploadWire.chunk(value.get("base64"))
          try {
            val cursor = leases.append(generation, UploadWire.text(value.get("token"), 128),
              UploadWire.integer(value.get("offset"), NativeUploadAuthority.MAX_BYTES.toLong()).toInt(), chunk)
            require(cursor >= 0); response.put("cursor", cursor)
          } finally { chunk.fill(0) }
        }
        "upload.__seal" -> {
          UploadWire.fields(value, setOf("type", "id", "token"))
          val token = UploadWire.text(value.get("token"), 128)
          if (!leases.seal(generation, token)) return response.put("error", "unsupported media type").toString()
          val publicId = leases.publicId(generation, token) ?: error("Revoked upload")
          val review = leases.sealedReview(generation, token) ?: error("Revoked upload")
          pending[token] = Pending(generation, publicId, sequence, review, push)
          val status = UploadWire.status(publicId, "pending"); retain(generation, publicId, status)
          // Review notification follows the initial one-use seal reply; status push uses a separate captured recipient.
          main.post { if (pending.containsKey(token)) onReview(token) }
          main.postDelayed({ sweep() }, NativeUploadAuthority.REVIEW_MS)
          response.put("result", status)
        }
        "upload.__cancel" -> {
          UploadWire.fields(value, setOf("type", "id", "token"))
          require(leases.cancelOwned(generation, UploadWire.text(value.get("token"), 128))); sweep()
        }
        else -> error("Unknown operation")
      }
      response.toString()
    } catch (_: Exception) {
      if (type == null || id == null) null else JSONObject().put("type", "$type.result").put("id", id).put("error", "policy denied").toString()
    }
  }
  fun take(token: String): String? {
    val taken = leases.take(token) ?: return null
    return JSONObject().put("registration", JSONObject(taken.registration)).put("request", taken.request)
      .put("uploadId", taken.uploadId).put("review", UploadWire.review(taken.review)).toString()
  }
  fun cancel(token: String) { leases.cancel(token); main.post { sweep() } }
  fun put(token: String, credential: String): String {
    val transfer = leases.transfer(token, credential, System.currentTimeMillis() / 1000)
      ?: return JSONObject().put("ok", false).put("error", "policy denied").toString()
    return try {
      val response = transfer(transfer) { sent -> main.post { progress(token, sent) } }
      val publicId = synchronized(completed) { leases.publicIdForApp(token) } ?: error("Revoked upload")
      val (descriptor, result) = UploadWire.receipt(response.body, transfer.permit.review, publicId)
      require(leases.isApproved(token))
      synchronized(completed) {
        completed[token] = result
        while (completed.size > 2) completed.remove(completed.keys.first())
      }
      JSONObject().put("ok", true).put("descriptor", descriptor).toString()
    } catch (failed: UploadPinnedHttpsTransport.Failure) {
      JSONObject().put("ok", false).put("error", failed.code).toString()
    } catch (_: Exception) {
      JSONObject().put("ok", false).put("error", if (leases.wasDispatched(token)) "outcome unknown" else "upload failed").toString()
    }
  }
  fun finish(token: String, raw: String) {
    val publicId = leases.publicIdForApp(token) ?: return
    val captured = synchronized(completed) { completed.remove(token) }
    val result = runCatching { UploadWire.terminal(raw, publicId) }.getOrNull()
    val success = result != null && result.optString("status") == "complete" && captured != null && UploadWire.sameCompletion(result, captured)
    val approved = leases.finish(token)
    val terminal = if (success && approved) captured!! else if (result != null && result.optString("status") != "complete") {
      val uncertain = leases.wasDispatched(token) && result.optString("error") !in setOf("server rejected", "file too large", "quota exceeded")
      if (uncertain) UploadWire.status(publicId, "failed", "outcome unknown") else result
    } else UploadWire.status(publicId, "failed", if (leases.wasDispatched(token)) "outcome unknown" else "policy denied")
    main.post {
      if (pending[token]?.uploadId == publicId) deliver(token, terminal)
      sweep()
    }
  }
  private fun progress(token: String, sent: Int) {
    val request = pending[token] ?: return
    if (!leases.isApproved(token) || sent < request.sent || sent > request.review.size) { sweep(); return }
    request.sent = sent
    progressObserver?.invoke(mapOf("token" to token, "bytesSent" to sent, "bytesTotal" to request.review.size))
    publish(request, UploadWire.status(request.uploadId, "uploading").put("bytesSent", sent).put("bytesTotal", request.review.size))
  }
  private fun retain(generation: String, id: String, value: JSONObject) {
    statuses[Pair(generation, id)] = value
    while (statuses.size > 128) statuses.remove(statuses.keys.first())
  }
  private fun publish(request: Pending, result: JSONObject) {
    retain(request.generation, request.uploadId, result)
    if (!CapabilityTransport.leases.sessionActive(request.generation)) return
    request.push(JSONObject().put("type", "capability.upload").put("sessionId", request.generation).put("sequence", request.sequence)
      .put("delivery", ++request.delivery).put("response", JSONObject().put("type", "upload.status.changed").put("status", result).toString()).toString())
  }
  private fun deliver(token: String, result: JSONObject) {
    val request = pending.remove(token) ?: return
    synchronized(completed) { completed.remove(token) }; publish(request, result)
  }
  private fun sweep() {
    check(Looper.myLooper() == Looper.getMainLooper())
    for (invalid in leases.drainInvalid()) deliver(invalid.token, UploadWire.status(invalid.uploadId,
      if (invalid.dispatched) "failed" else "cancelled", if (invalid.dispatched) "outcome unknown" else "user cancelled"))
  }
}
