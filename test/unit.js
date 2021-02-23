import {assert} from 'chai';

import '../src/dbp-dd-activity';
import '../src/dbp-dualdelivery.js';

suite('dbp-dualdelivery-activity basics', () => {
  let node;

  suiteSetup(async () => {
    node = document.createElement('dbp-dualdelivery-activity');
    document.body.appendChild(node);
    await node.updateComplete;
  });

  suiteTeardown(() => {
    node.remove();
  });

  test('should render', () => {
    assert(node.shadowRoot !== undefined);
  });
});