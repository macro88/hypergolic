package org.nostrocket.hypergolic.host

import org.json.JSONArray
import org.json.JSONObject

object CapabilityConfigurationProof {
  private var assertions = 0
  private fun checkProof(value: Boolean) {
    assertions++
    check(value) { "Capability configuration proof assertion $assertions failed" }
  }
  private fun raw(fixture: String, domains: List<String>, extra: String? = null): String {
    val value = JSONObject()
      .put("sessionId", "session-A").put("epoch", 1)
      .put("user", "1".repeat(64)).put("publisher", "2".repeat(64))
      .put("appId", "test.napplet").put("version", "3".repeat(64))
      .put("instanceId", "instance-A").put("fixture", fixture)
      .put("domains", JSONArray(domains))
    if (extra != null) value.put(extra, true)
    return value.toString()
  }
  private fun denied(raw: String, published: Boolean = true) {
    checkProof(runCatching { CapabilityConfiguration(raw, "view-generation", published) }.isFailure)
  }

  @JvmStatic fun main(args: Array<String>) {
    val old = CapabilityConfiguration(raw("ux-lab", listOf("theme")), "old-generation")
    checkProof(old.fixture == "ux-lab" && old.grantedDomains == listOf("theme"))
    checkProof(old.snapshot.contains("old-generation"))
    val published = CapabilityConfiguration(raw("published", listOf("identity", "storage", "theme", "relay")),
      "published-generation", allowPublished = true)
    checkProof(published.fixture == "published" && published.grantedDomains.size == 4)
    checkProof(published.grantedDomains == listOf("identity", "relay", "storage", "theme"))
    checkProof(published.sessionId == "session-A" && published.publisher == "2".repeat(64))
    checkProof(published.appId == "test.napplet" && published.version == "3".repeat(64))
    checkProof(published.allowsRelay && published.snapshot.contains("published-generation"))
    checkProof(CapabilityConfiguration(raw("published", emptyList()), "empty-domains", true).grantedDomains.isEmpty())
    checkProof(CapabilityConfiguration(raw("published", listOf("theme")), "theme-only", true).grantedDomains == listOf("theme"))

    denied(raw("published", listOf("theme")), published = false)
    denied(raw("published", listOf("theme", "theme")))
    denied(raw("published", listOf("unknown")))
    denied(raw("published", listOf("identity", "storage", "theme", "relay", "identity")))
    denied(raw("ux-lab", listOf("identity", "theme")))
    denied(raw("published", listOf("theme"), extra = "untrusted"))
    denied("{" + " ".repeat(8200) + "}")
    println("{\"status\":\"passed\",\"assertions\":$assertions}")
  }
}
