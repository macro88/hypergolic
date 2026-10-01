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

const selection = element<HTMLInputElement>('selection'), selectedRequest = element<HTMLButtonElement>('selected-request'), selectedRead = element<HTMLButtonElement>('selected-read'), selectedStatus = element('selected-status');
let selected: File | null = null;
async function readSelected(): Promise<void> {
  if (!selected) return;
  const data = await selected.arrayBuffer();
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', data)), byte => byte.toString(16).padStart(2, '0')).join('');
  selectedStatus.textContent = 'Selected bytes: ' + data.byteLength + '; SHA-256: ' + hash + '; type: ' + selected.type + '; name: ' + selected.name + '; relative path: ' + selected.webkitRelativePath;
}
selection.addEventListener('change', () => {
  selected = selection.files?.length === 1 ? selection.files[0]! : null;
  selectedRequest.disabled = selected === null; selectedRead.disabled = selected === null;
  if (selected) void readSelected().catch(() => {selectedStatus.textContent = 'Selected file unavailable.';});
});
selectedRead.addEventListener('click', () => {void readSelected().catch(() => {selectedStatus.textContent = 'Selected file unavailable.';});});
selectedRequest.addEventListener('click', () => {
  if (busy || !selected) return;
  busy = true; selectedRequest.disabled = true; status.textContent = 'Waiting for trusted review…';
  void upload.upload({data: selected, filename: selected.name, caption: 'Selected file', noTransform: true})
    .then(value => {uploadId = value.uploadId; render(value); status.textContent = 'Upload pending approval.';})
    .catch(error => {status.textContent = error instanceof Error ? error.message : 'Upload request failed.';})
    .finally(() => {busy = false; selectedRequest.disabled = selected === null;});
});
