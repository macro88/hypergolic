import { emptyWorkspace, focusNapplet, openNapplet, type NappletDescriptor, type Workspace } from './workspace.ts';

const fixtureVersion = '01ab63dbcdadab0b44fd6f3b9a6bcfbd98d8c1de1510f96c821d3efe1876909c';
export function bundledUXDescriptor(number: number): NappletDescriptor {
  return { id: `ux-lab-${number}`, title: `UX Lab ${number}`, publisher: 'bundled-unsigned-fixture', appId: 'ux-lab', version: fixtureVersion, source: 'bundled' };
}
export function initialTestWorkspace(): Workspace {
  const loaded = [1, 2, 3].reduce((state, number) => openNapplet(state, bundledUXDescriptor(number)), emptyWorkspace());
  return focusNapplet(loaded, 'ux-lab-1');
}

export function assertBundledWorkspace(workspace: Workspace): void {
  for (const session of workspace.sessions) {
    const number = Number(session.id.match(/^ux-lab-([1-9][0-9]*)$/)?.[1]);
    if (!Number.isSafeInteger(number)) throw new Error('Unavailable saved napplet');
    const expected = bundledUXDescriptor(number);
    if (session.title !== expected.title || session.publisher !== expected.publisher || session.appId !== expected.appId ||
        session.version !== expected.version || session.source !== expected.source) throw new Error('Unavailable saved napplet');
  }
}
