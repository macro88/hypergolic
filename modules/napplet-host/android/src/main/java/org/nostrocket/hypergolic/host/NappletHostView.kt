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

/** Owns one trusted document. No arbitrary URL, HTML or privileged operation prop. */
@SuppressLint("SetJavaScriptEnabled")
class NappletHostView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val onHostEvent by EventDispatcher()
  override val shouldUseAndroidLayout = true
  private var sessionId: String? = null
  private val generation = UUID.randomUUID().toString()
  private var live = false
  private var loaded = false
  private var ready = false
  private var disposed = false
  private var expectedUrl: String? = null
  private val webView = WebView(context)
  private val assetLoader = WebViewAssetLoader.Builder()
    .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(context)).build()

  init {
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
        if (request.isForMainFrame) fail("navigation-blocked")
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
      WebViewCompat.addWebMessageListener(webView, "HypergolicHost", setOf(ORIGIN)) { view, message, origin, mainFrame, _ ->
        if (!live || view !== webView || !mainFrame || origin.toString() != ORIGIN || view.url != expectedUrl) return@addWebMessageListener
        if (message.type != WebMessageCompat.TYPE_STRING) return@addWebMessageListener
        val text = message.data ?: return@addWebMessageListener
        if (text.toByteArray(Charsets.UTF_8).size > 2048) return@addWebMessageListener
        try {
          val data = JSONObject(text)
          if (data.optString("sessionId") != generation) return@addWebMessageListener
          when (data.optString("type")) {
            "ready" -> if (data.length() == 2 && !ready) { ready = true; emit("ready") }
            "error" -> if (data.length() == 3 && data.optString("code").matches(Regex("[a-z-]{1,80}"))) fail(data.getString("code"))
          }
        } catch (_: Exception) { /* Malformed diagnostics confer no authority. */ }
      }
    }
    addView(webView)
  }

  fun setActive(active: Boolean) {
    if (disposed) return
    webView.importantForAccessibility = if (active) View.IMPORTANT_FOR_ACCESSIBILITY_AUTO
      else View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS
    if (active || !webView.hasFocus()) return
    val token = webView.windowToken
    webView.clearFocus()
    (context.getSystemService(Context.INPUT_METHOD_SERVICE) as? InputMethodManager)
      ?.hideSoftInputFromWindow(token, 0)
  }

  fun startSession(id: String) {
    if (sessionId == id) return
    if (sessionId != null) { fail("session-reuse-blocked"); return }
    sessionId = id
    if (!id.matches(Regex("[A-Za-z0-9_-]{1,80}"))) { fail("invalid-session"); return }
    if (!WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
      fail("webview-update-required"); return
    }
    live = true
    expectedUrl = "$ORIGIN/assets/runtime/index.html?sessionId=$generation"
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
    emit("error", code)
    destroySession()
  }
  fun destroySession() {
    if (disposed) return
    disposed = true
    live = false
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
  }
}
