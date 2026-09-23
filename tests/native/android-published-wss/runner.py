#!/usr/bin/env python3
"""Compile and run the Android WSS policy proof on a host JVM."""
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[3]
HOST = ROOT / "modules/napplet-host/android/src/main/java/org/nostrocket/hypergolic/host"
SOURCES = [
    HOST / "PublicAddressPolicy.java",
    HOST / "PublishedHttpsResponseReader.java",
    HOST / "PublishedHttpsTransport.java",
    HOST / "PublishedHttpsRequestOwner.java",
    HOST / "PublishedRelayWebSocketHandshake.java",
    HOST / "PublishedRelayWebSocketFrames.java",
    HOST / "PublishedRelayWebSocketClientFrames.java",
    HOST / "PublishedRelayWssQuery.java",
    HOST / "PublishedRelayResponseClassifier.java",
    HOST / "PublishedRelayWssRequestOwner.java",
    Path(__file__).with_name("PublishedRelayWssQueryProof.java"),
    Path(__file__).with_name("PublishedRelayResponseClassifierProof.java"),
    Path(__file__).with_name("PublishedRelayWssRequestOwnerProof.java"),
]
JDK = ROOT / ".tools/jdk/Contents/Home/bin"
JAVAC = str(JDK / "javac") if (JDK / "javac").is_file() else "javac"
JAVA = str(JDK / "java") if (JDK / "java").is_file() else "java"

with tempfile.TemporaryDirectory(prefix="published-wss-proof-") as temp:
    subprocess.run([JAVAC, "-Xlint:all", "-Werror", "-d", temp, *map(str, SOURCES)], check=True)
    subprocess.run([JAVA, "-cp", temp, "org.nostrocket.hypergolic.host.PublishedRelayWssQueryProof"], check=True)
    subprocess.run([JAVA, "-cp", temp, "org.nostrocket.hypergolic.host.PublishedRelayResponseClassifierProof"], check=True)
    subprocess.run([JAVA, "-cp", temp, "org.nostrocket.hypergolic.host.PublishedRelayWssRequestOwnerProof"], check=True)
