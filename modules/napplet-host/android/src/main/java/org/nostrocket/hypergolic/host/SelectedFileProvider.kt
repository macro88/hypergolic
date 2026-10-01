package org.nostrocket.hypergolic.host

import android.content.ContentProvider
import android.content.ContentValues
import android.content.res.AssetFileDescriptor
import android.database.Cursor
import android.database.MatrixCursor
import android.net.Uri
import android.os.Binder
import android.os.ParcelFileDescriptor
import android.os.Process
import android.provider.OpenableColumns
import java.util.UUID
import java.util.concurrent.Executors
import java.util.concurrent.Semaphore

/** App-private copied selections, never third-party picker URIs or original filesystem paths. */
class SelectedFileProvider : ContentProvider() {
  override fun onCreate() = true
  override fun getType(uri: Uri): String? = selection(uri)?.mime
  override fun query(uri: Uri, projection: Array<out String>?, selection: String?, args: Array<out String>?, sort: String?): Cursor? {
    val entry = selection(uri) ?: return null
    val columns = projection ?: arrayOf(OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE)
    return MatrixCursor(columns).apply { addRow(columns.map<String, Any?> { when (it) {OpenableColumns.DISPLAY_NAME -> entry.name; OpenableColumns.SIZE -> entry.bytes.size; else -> null} }.toTypedArray()) }
  }
  override fun openAssetFile(uri: Uri, mode: String): AssetFileDescriptor {
    val length = selection(uri)?.bytes?.size ?: throw java.io.FileNotFoundException()
    return AssetFileDescriptor(openFile(uri, mode), 0, length.toLong())
  }
  override fun openFile(uri: Uri, mode: String): ParcelFileDescriptor {
    if (mode != "r") throw java.io.FileNotFoundException()
    if (!readSlots.tryAcquire()) throw java.io.FileNotFoundException()
    val bytes = synchronized(entries) { selection(uri)?.bytes?.clone() } ?: run {readSlots.release(); throw java.io.FileNotFoundException()}
    val pipe = try {ParcelFileDescriptor.createReliablePipe()} catch (error: Exception) {bytes.fill(0); readSlots.release(); throw error}
    android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({try {pipe[1].closeWithError("Selection read expired")} catch (_: Exception) {}}, 30_000)
    executor.execute {
      try { ParcelFileDescriptor.AutoCloseOutputStream(pipe[1]).use { it.write(bytes) } }
      catch (_: Exception) { try { pipe[1].closeWithError("Selection unavailable") } catch (_: Exception) {} }
      finally { bytes.fill(0); readSlots.release() }
    }
    return pipe[0]
  }
  override fun insert(uri: Uri, values: ContentValues?): Uri? = null
  override fun delete(uri: Uri, selection: String?, args: Array<out String>?) = 0
  override fun update(uri: Uri, values: ContentValues?, selection: String?, args: Array<out String>?) = 0
  private fun selection(uri: Uri): Selection? {
    if (Binder.getCallingUid() != Process.myUid() || uri.scheme != "content" || uri.authority != context?.packageName + ".selected-files" || uri.pathSegments.size != 1 || uri.query != null || uri.fragment != null) return null
    synchronized(entries) {
      val entry = entries[uri.lastPathSegment] ?: return null
      if (android.os.SystemClock.elapsedRealtime() >= entry.deadline || !entry.live()) { entries.remove(uri.lastPathSegment)?.bytes?.fill(0); return null }
      return entry
    }
  }
  private class Selection(val generation: String, val bytes: ByteArray, val name: String, val mime: String,
    val live: () -> Boolean, val deadline: Long)
  companion object {
    private val entries = mutableMapOf<String, Selection>()
    private val readSlots = Semaphore(2)
    private val executor = Executors.newFixedThreadPool(2)
    fun stage(context: android.content.Context, generation: String, bytes: ByteArray, mime: String, live: () -> Boolean): Uri? = synchronized(entries) {
      revoke(generation)
      if (bytes.size > NativeUploadAuthority.MAX_BYTES || entries.size >= 2 || !live()) return null
      val token = UUID.randomUUID().toString()
      val extension = if (mime == "image/png") ".png" else ".bin"
      entries[token] = Selection(generation, bytes.clone(), "Selected file$extension", mime, live, android.os.SystemClock.elapsedRealtime() + 600_000)
      android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({ synchronized(entries) { entries.remove(token)?.bytes?.fill(0) } }, 600_000)
      Uri.Builder().scheme("content").authority(context.packageName + ".selected-files").appendPath(token).build()
    }
    fun revoke(generation: String) = synchronized(entries) {
      entries.entries.removeAll { if (it.value.generation == generation) {it.value.bytes.fill(0); true} else false }
    }
    fun revokeAll() = synchronized(entries) {entries.values.forEach {it.bytes.fill(0)}; entries.clear()}
  }
}
