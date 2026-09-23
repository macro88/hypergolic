package org.nostrocket.hypergolic.host

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import android.net.http.SslError
import android.os.Message
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.webkit.*
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import androidx.webkit.WebMessageCompat
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import expo.modules.kotlin.viewevent.EventDispatcher
import org.json.JSONObject
import java.io.ByteArrayInputStream
import java.util.UUID
import java.util.Collections
import java.util.WeakHashMap

/** Owns one trusted document. No arbitrary URL, HTML or privileged operation prop. */
@SuppressLint("SetJavaScriptEnabled")
class NappletHostView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val onHostEvent by EventDispatcher()
  override val shouldUseAndroidLayout = true
  private var sessionId: String? = null
  private var configuration: CapabilityConfiguration? = null
  private var published: PublishedClaims? = null
  private var publishedReader: PublishedArtifactReadOwner? = null
  private val generation = UUID.randomUUID().toString()
  private var live = false
  private var loaded = false
  private var ready = false
  private var disposed = false
  private var active = false
  private var expectedUrl: String? = null
  private val webView = WebView(context)
  private val assetLoader = WebViewAssetLoader.Builder()
    .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(context)).build()

  init {
    synchronized(publishedViews) { publishedViews.add(this) }
    webView.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    webView.setBackgroundColor(0xff120e0a.toInt())
    webView.settings.apply {
      javaScriptEnabled = true
      domStorageEnabled = false
      allowFileAccess = false
      allowContentAccess = false
      mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
      javaScriptCanOpenWindowsAutomatically = false
      setSupportMultipleWindows(false)
      mediaPlaybackRequiresUserGesture = true
      setGeolocationEnabled(false)
      cacheMode = WebSettings.LOAD_NO_CACHE
    }
    CookieManager.getInstance().setAcceptCookie(false)
    CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false)
    webView.setDownloadListener { _, _, _, _, _ -> }
    webView.webChromeClient = object : WebChromeClient() {
      override fun onPermissionRequest(request: PermissionRequest) { request.deny() }
      override fun onGeolocationPermissionsShowPrompt(origin: String?, callback: GeolocationPermissions.Callback?) {
        callback?.invoke(origin, false, false)
      }
      override fun onShowFileChooser(view: WebView?, callback: ValueCallback<Array<Uri>>?, params: FileChooserParams?): Boolean {
        callback?.onReceiveValue(null); return true
      }
      override fun onCreateWindow(view: WebView?, dialog: Boolean, gesture: Boolean, result: Message?) = false
      override fun onJsAlert(view: WebView?, url: String?, message: String?, result: JsResult?): Boolean {
        result?.cancel(); return true
      }
      override fun onJsConfirm(view: WebView?, url: String?, message: String?, result: JsResult?): Boolean {
        result?.cancel(); return true
      }
      override fun onJsPrompt(view: WebView?, url: String?, message: String?, value: String?, result: JsPromptResult?): Boolean {
        result?.cancel(); return true
      }
    }
    webView.webViewClient = object : WebViewClient() {
      override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse {
        val uri = request.url
        val allowedOrigin = uri.scheme == "https" && uri.host == HOST && uri.port == -1 && uri.userInfo == null
        val allowedPath = (request.isForMainFrame && uri.toString() == expectedUrl) ||
          (!request.isForMainFrame && uri.path == "/assets/runtime/host.js" && uri.query == null && uri.fragment == null)
        if (!live || !allowedOrigin || !allowedPath || request.method != "GET") return blocked()
        return assetLoader.shouldInterceptRequest(uri)?.also {
          it.responseHeaders = mapOf("Cache-Control" to "no-store", "X-Content-Type-Options" to "nosniff")
        } ?: blocked()
      }
      override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
        if (request.isForMainFrame || (configuration != null && ready)) fail("navigation-blocked")
        return true
      }
      override fun onPageStarted(view: WebView, url: String?, favicon: Bitmap?) {
        if (url != expectedUrl || loaded) { fail("navigation-blocked"); view.stopLoading() }
      }
      override fun onPageFinished(view: WebView, url: String?) {
        if (live && url == expectedUrl) loaded = true
      }
      override fun onReceivedSslError(view: WebView, handler: SslErrorHandler, error: SslError) { handler.cancel() }
      override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
        if (request.isForMainFrame) fail("host-load-failed")
      }
      override fun onRenderProcessGone(view: WebView, detail: RenderProcessGoneDetail): Boolean {
        fail("renderer-stopped"); destroySession(); return true
      }
    }
    if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
      WebViewCompat.addWebMessageListener(webView, "HypergolicHost", setOf(ORIGIN)) { view, message, origin, mainFrame, reply ->
        if (!live || view !== webView || !mainFrame || origin.toString() != ORIGIN || view.url != expectedUrl) return@addWebMessageListener
        if (message.type != WebMessageCompat.TYPE_STRING) {
          if (published != null) fail("artifact-message-invalid")
          return@addWebMessageListener
        }
        val text = message.data ?: run {
          if (published != null) fail("artifact-message-invalid")
          return@addWebMessageListener
        }
        if (text.toByteArray(Charsets.UTF_8).size > CapabilityLeaseRegistry.MAX_BYTES) {
          if (published != null) fail("artifact-message-invalid")
          return@addWebMessageListener
        }
        try {
          val data = JSONObject(text)
          if (data.optString("type") == "artifact.read" && published != null) {
            if (data.optString("sessionId") != generation) { fail("artifact-read-invalid"); return@addWebMessageListener }
            val chunk = receivePublishedRead(data) ?: run {
              fail("artifact-read-invalid"); return@addWebMessageListener
            }
            val claims = published ?: return@addWebMessageListener
            val result = JSONObject().put("type", "artifact.chunk").put("sessionId", generation)
              .put("sequence", chunk.sequence).put("base64", chunk.base64)
              .put("byteLength", chunk.byteLength).put("totalBytes", chunk.totalBytes)
              .put("publisher", claims.publisher).put("appId", claims.appId)
              .put("eventId", claims.eventId).put("version", claims.version)
              .put("htmlHash", claims.htmlHash).put("done", chunk.done)
            reply.postMessage(result.toString())
            return@addWebMessageListener
          }
          if (data.optString("sessionId") != generation) return@addWebMessageListener
          if (data.optString("type") == "capability") {
            receiveCapability(data) { response ->
              if (live && !disposed && view === webView && view.url == expectedUrl) {
                val result = JSONObject().put("type", "capability.result").put("sessionId", generation)
                  .put("sequence", data.getLong("sequence")).put("response", response ?: JSONObject.NULL)
                reply.postMessage(result.toString())
              }
            }
            return@addWebMessageListener
          }
          if (text.toByteArray(Charsets.UTF_8).size > 2048) return@addWebMessageListener
          when (data.optString("type")) {
            "ready" -> if (data.length() == 2 && !ready) { ready = true; emit("ready") }
            "error" -> if (data.length() == 3 && data.optString("code").matches(Regex("[a-z-]{1,80}"))) fail(data.getString("code"))
          }
        } catch (_: Exception) {
          if (published != null) fail("artifact-message-invalid")
        }
      }
    }
    addView(webView)
  }

  fun setActive(active: Boolean) {
    if (disposed) return
    this.active = active
    ApprovalTransport.focus(generation, active)
    webView.importantForAccessibility = if (active) View.IMPORTANT_FOR_ACCESSIBILITY_AUTO
      else View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS
    if (active || !webView.hasFocus()) return
    val token = webView.windowToken
    webView.clearFocus()
    (context.getSystemService(Context.INPUT_METHOD_SERVICE) as? InputMethodManager)
      ?.hideSoftInputFromWindow(token, 0)
  }

  fun startConfiguredSession(raw: String) {
    if (disposed) return
    if (sessionId != null) {
      // A native generation is immutable, including repeated React prop updates.
      try {
        if (CapabilityConfiguration(raw, generation).snapshot == configuration?.snapshot) return
      } catch (_: Exception) { }
      fail("session-reuse-blocked"); return
    }
    try { configuration = CapabilityConfiguration(raw, generation) }
    catch (_: Exception) { fail("invalid-session"); return }
    startSession(configuration!!.sessionId)
  }

  private data class PublishedClaims(
    val sessionId: String, val publisher: String, val appId: String, val eventId: String,
    val version: String, val htmlHash: String, val handle: String
  )

  fun startPublishedArtifact(raw: String) {
    if (disposed) return
    if (sessionId != null) { fail("session-reuse-blocked"); return }
    val claims = parsePublishedClaims(raw) ?: run { fail("invalid-session"); return }
    sessionId = claims.sessionId
    if (!WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
      fail("webview-update-required"); return
    }
    val claimed = PublishedArtifactTransfer.INSTANCE.claimForHost(
      claims.handle, claims.sessionId, claims.publisher, claims.appId, claims.eventId,
      claims.version, claims.htmlHash, generation)
    val bytes = claimed?.takeHtmlBytes()
    if (bytes == null) { fail("artifact-claim-failed"); return }
    published = claims
    publishedReader = PublishedArtifactReadOwner(bytes)
    live = true
    expectedUrl = "$ORIGIN/assets/runtime/index.html?sessionId=$generation&source=published"
    webView.loadUrl(expectedUrl!!)
    webView.postDelayed({ if (live && !ready) fail("readiness-timeout") }, 15000)
  }

  private fun parsePublishedClaims(raw: String): PublishedClaims? {
    if (raw.toByteArray(Charsets.UTF_8).size > 2048) return null
    return try {
      val data = JSONObject(raw)
      if (data.keys().asSequence().toSet() != setOf(
          "sessionId", "publisher", "appId", "eventId", "version", "htmlHash", "handle")) return null
      val values = listOf("sessionId", "publisher", "appId", "eventId", "version", "htmlHash", "handle")
        .map { data.get(it) as? String ?: return null }
      val session = values[0]
      if (!session.matches(Regex("[A-Za-z0-9_-]{1,80}")) ||
          !PublishedArtifactRegistry.validClaims(values[1], values[2], values[3], values[4], values[5]) ||
          !values[6].matches(Regex("[0-9a-f]{64}"))) return null
      PublishedClaims(session, values[1], values[2], values[3], values[4], values[5], values[6])
    } catch (_: Exception) { null }
  }

  private fun receivePublishedRead(data: JSONObject): PublishedArtifactReadOwner.Chunk? {
    if (data.keys().asSequence().toSet() != setOf("type", "sessionId", "sequence")) return null
    val number = data.get("sequence")
    if (number !is Int && number !is Long) return null
    val sequence = (number as Number).toLong()
    if (sequence < 0 || sequence > Int.MAX_VALUE) return null
    return publishedReader?.read(sequence.toInt())
  }

  private fun receiveCapability(data: JSONObject, reply: (String?) -> Unit) {
    val config = configuration ?: return
    if (!ready || data.keys().asSequence().toSet() != setOf("type", "sessionId", "sequence", "message")) return
    val number = data.get("sequence")
    if ((number !is Int && number !is Long) || data.get("message") !is String) return
    val sequence = (number as Number).toLong()
    if (sequence !in 1..9_007_199_254_740_991L) return
    val message = data.getString("message")
    val request = runCatching { JSONObject(message) }.getOrNull()
    if (request?.optString("type") == "relay.publish") {
      if (!CapabilityTransport.leases.consumeSequence(generation, sequence)) { reply(null); return }
      val id = request.opt("id") as? String
      if (!config.allowsRelay || id == null || id.isEmpty() || id.toByteArray(Charsets.UTF_8).size > 128) { reply(null); return }
      val approval = ApprovalTransport.admit(generation, config.request(message), id, reply)
      if (approval == null) { reply(null); return }
      onHostEvent(mapOf("type" to "capability", "lane" to "approval", "sessionId" to config.sessionId, "generation" to generation, "token" to approval))
      return
    }
    val token = CapabilityTransport.admit(generation, sequence, config.request(message), reply)
    if (token == null) { reply(null); return }
    onHostEvent(mapOf("type" to "capability", "sessionId" to config.sessionId, "generation" to generation, "token" to token))
  }

  fun startSession(id: String) {
    if (disposed) return
    if (sessionId == id) return
    if (sessionId != null) { fail("session-reuse-blocked"); return }
    sessionId = id
    if (!id.matches(Regex("[A-Za-z0-9_-]{1,80}"))) { fail("invalid-session"); return }
    if (!WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
      fail("webview-update-required"); return
    }
    if (configuration != null && !CapabilityTransport.leases.register(generation)) { fail("capability-unavailable"); return }
    if (configuration != null && !ApprovalTransport.register(generation)) { fail("approval-unavailable"); return }
    ApprovalTransport.focus(generation, active)
    live = true
    expectedUrl = "$ORIGIN/assets/runtime/index.html?sessionId=$generation"
    configuration?.let { expectedUrl += "&fixture=" + it.fixture }
    webView.loadUrl(expectedUrl!!)
    webView.postDelayed({ if (live && !ready) fail("readiness-timeout") }, 15000)
  }

  private fun emit(type: String, code: String? = null) {
    val payload = mutableMapOf<String, Any>("type" to type, "sessionId" to (sessionId ?: ""))
    if (code != null) payload["code"] = code
    onHostEvent(payload)
  }
  private fun fail(code: String) {
    if (disposed) return
    live = false
    publishedReader?.clear()
    ApprovalTransport.revoke(generation)
    CapabilityTransport.leases.revoke(generation)
    emit("error", code)
    destroySession()
  }
  fun destroySession() {
    if (disposed) return
    disposed = true
    live = false
    publishedReader?.clear()
    publishedReader = null
    synchronized(publishedViews) { publishedViews.remove(this) }
    ApprovalTransport.revoke(generation)
    CapabilityTransport.revoke(generation)
    if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
      WebViewCompat.removeWebMessageListener(webView, "HypergolicHost")
    }
    webView.stopLoading()
    removeView(webView)
    webView.destroy()
  }
  private fun blocked() = WebResourceResponse("text/plain", "utf-8", 403, "Blocked", emptyMap(), ByteArrayInputStream(byteArrayOf()))
  companion object {
    const val HOST = "appassets.androidplatform.net"
    const val ORIGIN = "https://appassets.androidplatform.net"
    private val publishedViews = Collections.newSetFromMap(WeakHashMap<NappletHostView, Boolean>())
    fun revokePublishedOnBackground() {
      val views = synchronized(publishedViews) { publishedViews.toList() }
      views.forEach { if (it.published != null) it.fail("backgrounded") }
    }
  }
}
