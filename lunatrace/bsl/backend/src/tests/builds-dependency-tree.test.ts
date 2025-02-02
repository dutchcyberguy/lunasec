/*
 * Copyright by LunaSec (owned by Refinery Labs, Inc)
 *
 * Licensed under the Business Source License v1.1
 * (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 *
 * https://github.com/lunasec-io/lunasec/blob/master/licenses/BSL-LunaTrace.txt
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { fakeDependencyTreeHasuraOutputFixture } from '../fixtures/manifests/fake-dependency-tree-hasura-output-fixture';
import { DependencyTree } from '../models/dependency-tree/builds-dependency-tree';

describe('The dependency tree', () => {
  const tree = new DependencyTree(fakeDependencyTreeHasuraOutputFixture);

  it('should generate a dependency tree', () => {
    expect(tree).toBeDefined();
    expect(tree.depNodesById.size).toEqual(4);
    expect(tree.parentsByNodeId.size).toEqual(3);
    expect(tree.parentsByNodeId.get('4')?.size).toEqual(2);
    // parse out vulnerable releases and check the data
  });

  it('Should show vulnerable releases properly', () => {
    const vulnReleases = tree.vulnerableReleases;
    expect(vulnReleases.length).toEqual(1);

    const vulnQux = vulnReleases[0];
    expect(vulnQux.trivially_updatable).toEqual('yes');
    expect(vulnQux.chains.length).toEqual(2);
    const chain = vulnQux.chains[0];

    const chainPackageNames = chain.map((dep) => dep.release.package.name);
    expect(chainPackageNames).toEqual(['foo', 'bar', 'baz', 'qux']);

    const leafNode = chain[chain.length - 1];
    expect(leafNode.id).toEqual('4');
  });

  it('should show all vulnerabilities with getVulnerabilities()', () => {
    const vulnerabilities = tree.getVulnerabilities();
    expect(vulnerabilities.length).toEqual(1);
    expect(vulnerabilities[0].vulnerability.source_id).toEqual('GHSA123ABC');
    expect(vulnerabilities[0].chains.length).toEqual(2);
    expect(vulnerabilities[0].chains[0].length).toEqual(4);
    expect(vulnerabilities[0].chains[1].length).toEqual(2);
  });

  it('should convert chain to edge ids', () => {
    const chain = tree.vulnerableReleases[0].chains[0];
    const edgeId = tree.getEdgeIdFromNodePair(chain[0].id, chain[1].id);
    expect(edgeId).toEqual('e2');
  });
});
