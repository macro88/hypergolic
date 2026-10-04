/** Sign exact Routing Lab bytes with public test scalar 2; never publish. */
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {finalizeEvent} from 'nostr-tools/pure';
import {naddrEncode} from 'nostr-tools/nip19';
const root=new URL('../../../',import.meta.url),secret=new Uint8Array(32);secret[31]=2;
const hash=value=>createHash('sha256').update(value).digest('hex');
const html=await readFile(new URL('runtime/fixtures/routing-lab.html',root),'utf8'),htmlHash=hash(html),aggregate=hash(htmlHash+' /index.html\n');
const rows=[['caller',['notify']],['peer',['notify']],['no-notify',['theme']],['config-caller',['config']],['config-peer',['config']],['no-config',['theme']]].map(([role,domains])=>{
 const appId=(role.startsWith('config-') ? 'signed-' : 'signed-notify-')+role+'-lab';
 const event=finalizeEvent({kind:35129,created_at:1791079200,content:'',tags:[['d',appId],['path','/index.html',htmlHash],['x',aggregate,'aggregate'],...domains.map(domain=>['requires',domain])]},secret);
 return {role,appId,event,address:naddrEncode({kind:35129,pubkey:event.pubkey,identifier:appId}),htmlHash,html};
});
const original = rows.find(row => row.role === 'config-caller'), updatedHtml = html + '\n<!-- distinct signed configuration version -->\n', updatedHash = hash(updatedHtml), updatedAggregate = hash(updatedHash + ' /index.html\n');
const updatedEvent = finalizeEvent({kind:35129,created_at:1791165600,content:'',tags:[['d',original.appId],['path','/index.html',updatedHash],['x',updatedAggregate,'aggregate'],['requires','config']]},secret);
rows.push({...original,role:'config-update',event:updatedEvent,htmlHash:updatedHash,html:updatedHtml});
await writeFile(new URL('tests/native/presentation/published-fixture.ts',root),'/** Generated local signed artifacts; public test scalar 2. No publication. */\nexport const SIGNED_PRESENTATION_ARTIFACTS = '+JSON.stringify(rows)+' as const;\n');
console.log(JSON.stringify(rows.map(({role,appId,event,htmlHash})=>({role,appId,eventId:event.id,publisher:event.pubkey,htmlHash}))));
