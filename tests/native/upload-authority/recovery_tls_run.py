#!/usr/bin/env python3
"""Real native Java/Swift fixed-hash TLS GETs; injected metadata store, no disk or app acceptance."""
import json,socket,ssl,subprocess,tempfile,threading,time
from pathlib import Path
from tls_run import certificate,ROOT,HERE,JAVA,SWIFT,HASH

def serve(listener,pem,key,mode,observed,errors,checkpoint):
    context=ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER);context.load_cert_chain(str(pem),str(key));listener.settimeout(1.5)
    try:
        raw,_=listener.accept();observed['connections']+=1;raw.settimeout(5)
        with context.wrap_socket(raw,server_side=True) as peer:
            wire=bytearray()
            while b'\r\n\r\n' not in wire:
                chunk=peer.recv(8192)
                if not chunk:return
                wire.extend(chunk);assert len(wire)<32768
            head,body=wire.split(b'\r\n\r\n',1);assert not body
            lines=head.decode('ascii').split('\r\n');assert lines[0]=='GET /'+HASH+' HTTP/1.1'
            headers=dict(line.split(': ',1) for line in lines[1:]);assert len(headers)==len(lines)-1
            assert set(headers)=={'Host','Accept','Accept-Encoding','Connection'}
            assert headers['Accept-Encoding']=='identity' and headers['Connection']=='close'
            observed['gets']+=1;observed['target']=lines[0]
            status=404 if mode=='absent' else 429 if mode=='quota' else 302 if mode=='redirect' else 200
            data=bytes([1,2,4]) if mode=='wrong-hash' else bytes([1,2,3,4]) if mode=='wrong-size' else b'not found' if mode=='absent' else bytes([1,2,3])
            head=f'HTTP/1.1 {status} Test\r\nConnection: close\r\n'.encode()
            if mode=='chunked':response=head+b'Transfer-Encoding: chunked\r\n\r\n3\r\n'+data+b'\r\n0\r\n\r\n'
            else:
                head+=b'Content-Length: '+str(len(data)).encode()+b'\r\n'
                if mode=='ambiguous':head+=b'Content-Length: 2\r\n'
                if mode=='redirect':head+=b'Location: https://other.example.com/unapproved\r\n'
                if mode=='encoding':head+=b'Content-Encoding: gzip\r\n'
                response=head+b'\r\n'+(data[:-1] if mode=='truncated' else data)+(b'extra' if mode=='trailing' else b'')
            if mode=='cancel-read':checkpoint.write_text('GET received');time.sleep(.5)
            peer.sendall(response)
    except (socket.timeout,ssl.SSLError,BrokenPipeError,ConnectionResetError):pass
    except Exception as error:errors.append(repr(error))
    finally:listener.close()

def main():
    with tempfile.TemporaryDirectory(prefix='hg-recovery-tls-') as temporary:
        out=Path(temporary);key,pem,der=certificate(out,'files.example.com');wrong_key,wrong_pem,wrong_der=certificate(out,'other.example.com')
        names=['UploadFileProfile','UploadPngProfile','UploadPngMetadata','NativeUploadAuthority','UploadRecoveryLedger','UploadRecoveryReadAuthority','UploadRecoveryHttps','PublishedHttpsRequestOwner','PublishedHttpsTransport','PublishedHttpsResponseReader','PublicAddressPolicy']
        subprocess.run(['javac','-Xlint:all','-Werror','-d',str(out),*[str(JAVA/(name+'.java')) for name in names],str(HERE/'UploadRecoveryTLSProof.java')],check=True)
        names=['UploadFileProfile','UploadPngProfile','UploadPngMetadata','NativeUploadAuthority','UploadRecoveryLedger','UploadRecoveryReadAuthority','PublishedHTTPResponse','PublishedPinnedHTTPS','PublicAddressPolicy']
        subprocess.run(['swiftc','-swift-version','6','-D','HYPERGOLIC_NETWORK_PROOF','-warnings-as-errors','-module-cache-path',str(out/'swift-cache'),*[str(SWIFT/(name+'.swift')) for name in names],str(HERE/'UploadRecoveryTLSProof.swift'),'-o',str(out/'swift-proof')],check=True)
        rows=[]
        for language in ['Java','Swift']:
            for mode in ['present','chunked','absent','wrong-hash','wrong-size','truncated','trailing','ambiguous','redirect','quota','encoding','cancel-before','cancel-read','mixed-dns','untrusted','wrong-host']:
                listener=socket.socket();listener.bind(('127.0.0.1',0));listener.listen(1);port=listener.getsockname()[1]
                observed={'connections':0,'gets':0,'puts':0};errors=[]
                endpoint=(wrong_pem,wrong_key,wrong_der) if mode=='wrong-host' else (pem,key,der)
                checkpoint=out/(language+'-'+mode+'.checkpoint')
                server=threading.Thread(target=serve,args=(listener,*endpoint[:2],mode,observed,errors,checkpoint));server.start()
                command=['java','-cp',str(out),'org.nostrocket.hypergolic.host.UploadRecoveryTLSProof',str(port),str(endpoint[0]),mode,str(checkpoint)] if language=='Java' else [str(out/'swift-proof'),str(port),str(endpoint[2]),mode,str(checkpoint)]
                result=json.loads(subprocess.check_output(command,text=True,cwd=ROOT,timeout=12));server.join(6);assert not server.is_alive() and not errors,(language,mode,errors)
                state='present' if mode in ['present','chunked'] else 'absent' if mode=='absent' else 'unknown'
                assert result['state']==state and result['blocked']==(state=='unknown'),(language,mode,result)
                assert observed['gets']==(0 if mode in ['cancel-before','mixed-dns','untrusted','wrong-host'] else 1),(language,mode,observed)
                assert observed['puts']==0
                rows.append({'language':language,'mode':mode,**result,'observer':observed});print(json.dumps(rows[-1]),flush=True)
        print(json.dumps({'nativeTlsRecoveryCases':len(rows),'failed':0,'scope':'Real fixed-hash TLS reads with injected metadata store; no native app or durable disk proof'}))
if __name__=='__main__':main()
