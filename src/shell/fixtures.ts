import { emptyWorkspace, focusNapplet, openNapplet, type NappletDescriptor, type Workspace } from './workspace';

const fixtureVersion = '01ab63dbcdadab0b44fd6f3b9a6bcfbd98d8c1de1510f96c821d3efe1876909c';
export function bundledUXDescriptor(number: number): NappletDescriptor {
  return { id: `ux-lab-${number}`, title: `UX Lab ${number}`, publisher: 'bundled-unsigned-fixture', appId: 'ux-lab', version: fixtureVersion, source: 'bundled' };
}
export function initialTestWorkspace(): Workspace {
  const loaded = [1, 2, 3].reduce((state, number) => openNapplet(state, bundledUXDescriptor(number)), emptyWorkspace());
  return focusNapplet(loaded, 'ux-lab-1');
}
