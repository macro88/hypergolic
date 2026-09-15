/** Reviewed unsigned test artifacts. These records confer no remote publisher trust. */
export const BUNDLED_FIXTURES = Object.freeze({
  'ux-lab': Object.freeze({ title: 'UX Lab', appId: 'ux-lab',
    sha256: '01ab63dbcdadab0b44fd6f3b9a6bcfbd98d8c1de1510f96c821d3efe1876909c',
    aggregateHash: '3e96b737ec8fd25b170ff64a7f0f1c4a95f8badb943ee190cc79d629459988a6',
    domains: Object.freeze(['theme']) }),
  'state-lab': Object.freeze({ title: 'State Lab', appId: 'state-lab',
    sha256: 'd0be59b2b67c8be3f82befdc73da8d4fc3961a802ea0b4029c02b6891379d7f9',
    aggregateHash: '29eb8d2619ec80ded13395c0670ee78f541d8d854787f28482e1bc83d3d72a83',
    domains: Object.freeze(['identity', 'storage', 'theme']) }),
  'state-lab-peer': Object.freeze({ title: 'State Lab Peer', appId: 'state-lab-peer',
    sha256: '2339e2ee738e73b089587c4a6a4ce88dc1d44a94d9b283e1f73ecf74442b8d98',
    aggregateHash: '6b77fa8c7a67cb6a1d7d44ba56944eccc6710f5ddf3c3c672b0a02b8f8b0158b',
    domains: Object.freeze(['identity', 'storage', 'theme']) }),
});
export type BundledFixture = keyof typeof BUNDLED_FIXTURES;
