#!/usr/bin/env python3
"""Run XCTest native inputs while independently witnessing rejection and exact TLS receipt."""
import argparse,json,subprocess
from pathlib import Path
from evidence import ROOT,sha,sources,product
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--picker',action='store_true');p.add_argument('--attachments',type=Path);p.add_argument('--device',required=True);p.add_argument('--app',type=Path,required=True);p.add_argument('--build',type=Path,required=True);p.add_argument('--observer',type=Path,required=True);p.add_argument('--output',type=Path,required=True);args=p.parse_args()
args.output.mkdir(parents=True,exist_ok=False)
report={'kind':'hypergolic-ios-upload-observer-v1','status':'running','sourceBefore':sources(),'scope':'Native XCTest plus independent loopback TLS observer. Disposable signing key; no picker, protected identity or public provider acceptance.'}
try:
    report['scope'] = 'Native XCTest selected-PNG sanitation, guest read after rejected upload and independent loopback TLS observer; disposable identity. Broader formats, file selection, revocation and production identity remain open.' if args.picker else report['scope']
    build=json.loads(args.build.read_text());assert build['status']=='built' and build['platform']=='ios'
    assert build['sourceAfter']==report['sourceBefore'],'Build inputs differ from current source'
    assert build['productFiles']==product(args.app),'Supplied app differs from sealed build'
    report['buildManifestSha256']=sha(args.build.read_bytes())
    baseline=json.loads(args.observer.read_text());report['observerBefore']=baseline
    items=json.loads((args.attachments/'attachments.json').read_text())['files'] if args.attachments else []
    if items:
        data=Path(subprocess.check_output(['xcrun','simctl','get_app_container',args.device,'org.nostrocket.hypergolic.uploadfixture','data']).decode().strip())
        directory=data/'Documents/UploadLab';directory.mkdir(parents=True,exist_ok=True)
        for item in items:
            body=(args.attachments/item['file']).read_bytes();assert sha(body)==item['sha256'] and len(body)==item['size']
            (directory/('proof-'+item['file'].rsplit('.',1)[1]+'.'+item['file'].rsplit('.',1)[1])).write_bytes(body)
        report['fixtures']=items;report['scope']='Actual iOS document selection of unchanged WAV/MP4/PDF/ZIP/text with exact guest bytes, native reject/read/review/approve and independent signed TLS uploads; no protected or published acceptance.'
    selected_checks=set();read_checks=set();reject_checks=set()
    installed=Path(subprocess.check_output(['xcrun','simctl','get_app_container',args.device,'org.nostrocket.hypergolic.uploadfixture','app']).decode().strip())
    report['productFiles']=product(args.app);assert report['productFiles']==product(installed),'Installed app differs from supplied product'
    command=['xcodebuild','test','-project','tests/native/ios/XCTest/HypergolicUITests.xcodeproj','-scheme','HypergolicUITests','-destination','platform=iOS Simulator,id='+args.device,'-only-testing:HypergolicUITests/UploadTests/'+('testSelectedAttachmentsRejectApprove' if items else 'testSelectedPhotoRejectApprove' if args.picker else 'testReviewRejectApprove'),'-derivedDataPath',str(args.output/'build'),'-resultBundlePath',str(args.output/'journey.xcresult'),'CODE_SIGNING_ALLOWED=NO']
    rejected=False
    with (args.output/'journey.log').open('w') as log:
        process=subprocess.Popen(command,cwd=ROOT,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,bufsize=1)
        for line in process.stdout:
            log.write(line);log.flush()
            if items:
                for item in items:
                    ext=item['file'].rsplit('.',1)[1];expected='Selected bytes: '+str(item['size'])+'; SHA-256: '+item['sha256']
                    if 'UPLOAD_ATTACHMENT_SELECTED:'+ext+':' in line:
                        assert expected in line,'Guest bytes differ from independently generated fixture';selected_checks.add(ext)
                    if 'UPLOAD_ATTACHMENT_READ:'+ext+':' in line:
                        assert expected in line,'Post-rejection bytes differ';read_checks.add(ext)
                    if 'UPLOAD_ATTACHMENT_REJECT:'+ext in line:
                        observed=json.loads(args.observer.read_text());index=items.index(item)
                        assert observed['connections']==baseline['connections']+index and len(observed['requests'])==len(baseline['requests'])+index,'Rejection dispatched network traffic'
                        reject_checks.add(ext);print('Observed zero-network rejection: '+ext,flush=True)
            if not items and ('UPLOAD_PICKER_REJECT_CHECKPOINT' if args.picker else 'UPLOAD_REJECT_CHECKPOINT') in line:
                observed=json.loads(args.observer.read_text());report['observerAfterReject']=observed
                rejected=observed['connections']==baseline['connections'] and observed['requests']==baseline['requests']
                print('Observed rejection: zero new TLS connections = '+str(rejected),flush=True)
        code=process.wait()
    assert code==0,'Native XCTest journey failed'
    assert (len(selected_checks)==len(read_checks)==len(reject_checks)==len(items)) if items else rejected,'Native selected/reject/read checkpoints missing'
    observed=json.loads(args.observer.read_text());report['observerAfterApprove']=observed
    requests=observed['requests'][len(baseline['requests']):]
    assert len(requests)==(len(items) if items else 1) and observed['connections']==baseline['connections']+(len(items) if items else 1) and not observed['errors']
    if items:
        for request,item in zip(requests,items):assert request['sha256']==item['sha256'] and request['size']==item['size'] and request['mimeType']==item['mimeType'] and request['signatureVerified'] is True
    else:assert requests[0]['sha256']=='5a852fbaaaecaf4cd14c01e150c7f881c5c5894b0a1e3c53be7e007c58374ee6' and requests[0]['size']==71 and requests[0]['signatureVerified'] is True
    assert product(installed)==report['productFiles'],'Installed product changed during journey'
    report['sourceAfter']=sources();assert report['sourceBefore']==report['sourceAfter'],'Source changed during native journey'
    report['status']='passed';print('PASS native iOS review/reject/exact approved bytes and signature',flush=True)
except Exception as error:
    report.update(status='failed',error=str(error));raise
finally:(args.output/'result.json').write_text(json.dumps(report,indent=2)+'\n')
