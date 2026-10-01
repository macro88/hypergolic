import { upload } from '@napplet/sdk';
import './style.css';
function element<T extends HTMLElement>(id: string): T {const value = document.getElementById(id); if (!value) throw Error('Missing upload control'); return value as T;}
const request = element<HTMLButtonElement>('request'), inspect = element<HTMLButtonElement>('inspect'), status = element('status'), receipt = element('receipt');
let uploadId: string | null = null, busy = false;
const encoded = 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAADklEQVR4nGP4z8DwHwQBEPgD/U6VwW8AAAAASUVORK5CYII=';
const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
element<HTMLImageElement>('preview').src = 'data:image/png;base64,' + encoded;
function render(value: unknown): void {receipt.textContent = JSON.stringify(value, null, 2);}
request.addEventListener('click', () => {
  if (busy) return; busy = true; request.disabled = true; status.textContent = 'Waiting for trusted review…';
  void upload.upload({data: new Blob([bytes], {type: 'image/png'}), filename: 'two-pixels.png', caption: 'Generated red and green PNG', noTransform: true, metadata: {fixture: 'upload-lab'}})
    .then(value => {uploadId = value.uploadId; render(value); status.textContent = 'Upload pending approval.';})
    .catch(error => {status.textContent = error instanceof Error ? error.message : 'Upload request failed.';})
    .finally(() => {busy = false; request.disabled = false;});
});
inspect.addEventListener('click', () => {if (uploadId) void upload.status(uploadId).then(render).catch(() => {status.textContent = 'Upload status unavailable.';});});
let subscription: ReturnType<typeof upload.onStatus> | null = null;
try {subscription = upload.onStatus(value => {render(value); status.textContent = 'Upload ' + value.status + '.';});}
catch {status.textContent = 'Upload status notifications are unavailable in this host.';}
window.addEventListener('pagehide', () => {subscription?.close(); bytes.fill(0);}, {once: true});
status.textContent = 'Ready to request a PNG upload.';
