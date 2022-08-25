import {assert} from 'chai';

import '../src/dbp-dispatch-activity';
import '../src/dbp-dispatch.js';

suite('dbp-dispatch-activity basics', () => {
    let node;

    suiteSetup(async () => {
        node = document.createElement('dbp-dispatch-activity');
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
