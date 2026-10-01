#!/usr/bin/env python3
"""Actual iOS picker cancellation/background with sealed products and zero TLS dispatch."""
import argparse,json,subprocess
from pathlib import Path
from evidence import ROOT,sha,sources,product
p=argparse.ArgumentParser(description=__doc__)
for key in ['device','app','build','observer','output']:p.add_argument('--'+key,required=True,type=str if key=='device' else Path)
a=p.parse_args();a.output.mkdir(parents=True,exist_ok=False)
r={'status':'running','scope':__doc__,'sourceBefore':sources(),'checks':[]}
expected={'menu-cancel','photo-cancel','file-cancel','photo-background-revoked','file-background-revoked','fresh-menu-after-revocation'}
try:
 build=json.loads(a.build.read_text());assert build['status']=='built' and build['platform']=='ios' and build['sourceAfter']==r['sourceBefore']
 installed=Path(subprocess.check_output(['xcrun','simctl','get_app_container',a.device,'org.nostrocket.hypergolic.uploadfixture','app'],text=True).strip())
 r['productFiles']=product(installed);assert r['productFiles']==build['productFiles']==product(a.app);r['buildManifestSha256']=sha(a.build.read_bytes())
 before=json.loads(a.observer.read_text());r['observerBefore']=before
 command=['xcodebuild','test','-project','tests/native/ios/XCTest/HypergolicUITests.xcodeproj','-scheme','HypergolicUITests','-destination','platform=iOS Simulator,id='+a.device,'-only-testing:HypergolicUITests/UploadTests/testPickerCancellationAndBackground','-derivedDataPath',str(a.output/'build'),'-resultBundlePath',str(a.output/'journey.xcresult'),'CODE_SIGNING_ALLOWED=NO']
 with (a.output/'journey.log').open('w') as log:
  process=subprocess.Popen(command,cwd=ROOT,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,bufsize=1)
  for line in process.stdout:
   log.write(line);log.flush()
   if 'UPLOAD_PICKER_DENIED:' in line:
    name=line.split('UPLOAD_PICKER_DENIED:',1)[1].strip();assert name in expected and name not in r['checks']
    current=json.loads(a.observer.read_text());assert current['connections']==before['connections'] and current['requests']==before['requests']
    r['checks'].append(name);print('Observed zero TLS for '+name,flush=True)
  assert process.wait()==0,'Native picker denial journey failed'
 assert set(r['checks'])==expected
 r['observerAfter']=json.loads(a.observer.read_text());assert r['observerAfter']['connections']==before['connections'] and r['observerAfter']['requests']==before['requests']
 r['sourceAfter']=sources();assert r['sourceAfter']==r['sourceBefore'] and product(installed)==r['productFiles'];r['status']='passed';print('PASS actual iOS picker cancellation and background revocation',flush=True)
except Exception as error:r.update(status='failed',error=str(error));raise
finally:(a.output/'result.json').write_text(json.dumps(r,indent=2)+'\n')
