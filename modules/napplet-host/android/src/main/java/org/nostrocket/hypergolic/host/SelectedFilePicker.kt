package org.nostrocket.hypergolic.host

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.webkit.ValueCallback
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicReference

/** One system selection; provider authority ends at the selected URI, not the whole library. */
internal object SelectedFilePicker {
  private const val CODE = 24871
  private val main = Handler(Looper.getMainLooper())
  private val worker = Executors.newSingleThreadExecutor()
  private class Pending(val activity: Activity, val generation: String, val live: () -> Boolean,
    val callback: ValueCallback<Array<Uri>>, val deadline: Long) {
    @Volatile var cancelled = false
    val stream = AtomicReference<java.io.InputStream?>()
    var awaitingSystem = true
    var result: Uri? = null
  }
  private val reading = AtomicBoolean(false)
  private var pending: Pending? = null
  private var foreground = false
  fun choose(activity: Activity?, generation: String, live: () -> Boolean, callback: ValueCallback<Array<Uri>>) {
    if (activity == null || !foreground || !live() || pending != null || reading.get()) { callback.onReceiveValue(null); return }
    val entry = Pending(activity, generation, live, callback, SystemClock.elapsedRealtime() + 600_000)
    pending = entry
    main.postDelayed({ if (pending === entry) cancel() }, 600_000)
    try {
      // Avoid guest-supplied chooser intents, cameras, directories and persistent grants.
      activity.startActivityForResult(Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
        addCategory(Intent.CATEGORY_OPENABLE); type = "*/*"; putExtra(Intent.EXTRA_ALLOW_MULTIPLE, false)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      }, CODE)
    } catch (_: Exception) { cancel() }
  }
  fun result(activity: Activity, code: Int, result: Int, data: Intent?) {
    if (code != CODE) return
    val entry = pending ?: return
    entry.awaitingSystem = false
    val uri = data?.data
    if (activity !== entry.activity || result != Activity.RESULT_OK || uri == null || data.clipData?.itemCount?.let {it != 1} == true ||
      uri.scheme != "content" || uri.authority.isNullOrEmpty() || uri.query != null || uri.fragment != null ||
      SystemClock.elapsedRealtime() >= entry.deadline || !entry.live()) { cancel(); return }
    // Providers can return URIs for files our own app can access; never accept our UID.
    val provider = activity.packageManager.resolveContentProvider(uri.authority!!, 0)
    if (provider == null || provider.applicationInfo.uid == activity.applicationInfo.uid ||
      activity.checkUriPermission(uri, android.os.Process.myPid(), android.os.Process.myUid(), Intent.FLAG_GRANT_READ_URI_PERMISSION) != android.content.pm.PackageManager.PERMISSION_GRANTED) { cancel(); return }
    entry.result = uri
    if (foreground) prepare(entry)
    else main.postDelayed({ if (pending === entry && !foreground) cancel() }, 5_000)
  }
  fun foreground(active: Boolean) {
    foreground = active
    if (!active) {
      SelectedFileProvider.revokeAll()
      // An outstanding external system chooser may return a newly selected file on resume.
      // It revives no upload grants. A returned/processing selection is cancelled on background.
      if (pending?.awaitingSystem == false) cancel()
    } else pending?.let { if (!it.awaitingSystem && it.result != null) prepare(it) }
  }
  fun revoke(generation: String) { SelectedFileProvider.revoke(generation); if (pending?.generation == generation) cancel() }
  fun cancel() {
    val entry = pending; pending = null
    entry?.cancelled = true
    try {entry?.stream?.getAndSet(null)?.close()} catch (_: Exception) {}
    entry?.callback?.onReceiveValue(null)
  }
  private fun prepare(entry: Pending) {
    val uri = entry.result ?: return
    entry.result = null
    if (!reading.compareAndSet(false, true)) {cancel(); return}
    main.postDelayed({if (pending === entry) cancel()}, 30_000)
    worker.execute {
      var original: ByteArray? = null
      try {
        val resolver = entry.activity.contentResolver
        resolver.openInputStream(uri)?.use { input ->
          entry.stream.set(input)
          val buffer = ByteArray(NativeUploadAuthority.MAX_BYTES + 1); var cursor = 0
          try {
            while (!entry.cancelled) {
              val count = input.read(buffer, cursor, minOf(64 * 1024, buffer.size - cursor))
              if (count < 0) {original = buffer.copyOf(cursor); break}
              if (count == 0 || count > NativeUploadAuthority.MAX_BYTES - cursor) throw IllegalArgumentException()
              cursor += count
            }
          } finally {buffer.fill(0); entry.stream.compareAndSet(input, null)}
        }
        val bytes = original ?: throw IllegalArgumentException()
        // Failed photos never become unchanged attachments.
        val prepared = UploadFileProfile.prepare(bytes) ?: throw IllegalArgumentException()
        main.post {
          try {
            if (pending !== entry || !foreground || !entry.live() || SystemClock.elapsedRealtime() >= entry.deadline) return@post
            val output = SelectedFileProvider.stage(entry.activity, entry.generation, prepared.bytes(), prepared.mimeType(), entry.live)
            pending = null; entry.callback.onReceiveValue(output?.let {arrayOf(it)})
          } finally {prepared.bytes().fill(0)}
        }
      } catch (_: Exception) { main.post {
        if (pending === entry) {
          val show = foreground && entry.live(); cancel()
          if (show) android.widget.Toast.makeText(entry.activity, "File could not be prepared. No file was shared.", android.widget.Toast.LENGTH_LONG).show()
        }
      } }
      finally {original?.fill(0); reading.set(false)}
    }
  }
}
