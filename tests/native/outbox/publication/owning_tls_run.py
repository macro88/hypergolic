#!/usr/bin/env python3
"""Actual owning Swift publication receipts against an independent controlled TLS receiver."""
import argparse,hashlib,importlib.util,json,socket,subprocess,threading
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
spec=importlib.util.spec_from_file_location('tls_core',HERE/'tls_run.py');tls=importlib.util.module_from_spec(spec);spec.loader.exec_module(tls)
MODES=['accepted','accepted-close','rejected','missing','wrong-id','malformed','auth-required','revoke-before-send','trailing-data','trailing-nul','concatenated','oversized-reason','multibyte-overflow']
def inputs():
 files=[*(tls.core.IOS/n for n in tls.core.I_NAMES),HERE/'fixtures.json',HERE/'OwnerTLSProof.swift',HERE/'tls_run.py',HERE/'run.py',Path(__file__)]
 return {str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output',type=Path,required=True);a=p.parse_args();out=a.output.resolve();out.mkdir(parents=True,exist_ok=False)
 receipt={'status':'failed','scope':'Controlled host loopback TLS: actual native owner/approval/WSS, public signed fixture, independent exact frames. No device, signer, guest/Expo or public DNS proof.','inputsBefore':inputs(),'runs':[]}
 try:
  key=out/'server.key';cert=out/'server.pem';der=out/'server.der'
  tls.run(['openssl','req','-x509','-newkey','rsa:2048','-nodes','-days','1','-keyout',str(key),'-out',str(cert),'-subj','/CN=relay.example.org','-addext','subjectAltName=DNS:relay.example.org','-addext','extendedKeyUsage=serverAuth','-addext','keyUsage=digitalSignature,keyEncipherment'],out,'certificate')
  tls.run(['openssl','x509','-in',str(cert),'-outform','DER','-out',str(der)],out,'certificate-der')
  binary=out/'owner-proof';tls.run(['xcrun','swiftc','-swift-version','6','-D','HYPERGOLIC_NETWORK_PROOF','-warnings-as-errors','-parse-as-library',*(str(tls.core.IOS/n) for n in tls.core.I_NAMES),str(HERE/'OwnerTLSProof.swift'),'-o',str(binary)],out,'compile')
  fixture=json.loads((HERE/'fixtures.json').read_text())
  for mode in MODES:
   listener=socket.socket();listener.bind(('127.0.0.1',0));listener.listen(1);port=listener.getsockname()[1];trace=[];errors=[]
   thread=threading.Thread(target=tls.serve,args=(listener,key,cert,mode,fixture,trace,errors),daemon=True);thread.start()
   tls.run([str(binary),str(port),str(der),mode,str(HERE/'fixtures.json')],out,mode);thread.join(timeout=8);assert not thread.is_alive() and not errors,(mode,errors)
   r=json.loads((out/(mode+'.log')).read_text());assert r['status']=='passed';event_count=sum(v['phase']=='exact-event' for v in trace);assert event_count==(0 if mode=='revoke-before-send' else 1)
   assert any(v['phase']=='verified-upgrade' for v in trace)
   receipt['runs'].append({**r,'eventCount':event_count,'observed':trace});print('PASS '+mode,flush=True)
  receipt['inputsAfter']=inputs();assert receipt['inputsBefore']==receipt['inputsAfter'];receipt['status']='passed'
 finally:
  (out/'server.key').unlink(missing_ok=True);receipt['logs']={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in out.glob('*.log')};(out/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
if __name__=='__main__':main()
