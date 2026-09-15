package org.nostrocket.hypergolic.identityowner

import java.util.concurrent.atomic.AtomicBoolean

/** One trusted identity bootstrap per OS process. Deliberately no reset or reclaim. */
internal object IdentityOwnerClaim {
  private val consumed = AtomicBoolean(false)

  fun claim(): Boolean = consumed.compareAndSet(false, true)
}
