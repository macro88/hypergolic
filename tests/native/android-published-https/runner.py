#!/usr/bin/env python3
"""Compile and run the Android HTTPS URL-contract proof on the host JVM."""
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "modules/napplet-host/android/src/main/java/org/nostrocket/hypergolic/host/PublishedHttpsTransport.java"
POLICY = ROOT / "modules/napplet-host/android/src/main/java/org/nostrocket/hypergolic/host/PublicAddressPolicy.java"
RESPONSE_READER = ROOT / "modules/napplet-host/android/src/main/java/org/nostrocket/hypergolic/host/PublishedHttpsResponseReader.java"
PROOF = Path(__file__).with_name("PublishedHttpsTransportProof.java")
JDK = ROOT / ".tools/jdk/Contents/Home/bin"
JAVAC = str(JDK / "javac") if (JDK / "javac").is_file() else "javac"
JAVA = str(JDK / "java") if (JDK / "java").is_file() else "java"

with tempfile.TemporaryDirectory(prefix="published-https-proof-") as temp:
    out = Path(temp)
    subprocess.run([
        JAVAC, "-Xlint:all", "-Werror", "-d", str(out), str(SOURCE), str(POLICY), str(RESPONSE_READER), str(PROOF),
    ], check=True)
    subprocess.run([
        JAVA, "-cp", str(out), "org.nostrocket.hypergolic.host.PublishedHttpsTransportProof",
    ], check=True)
