const chai = require('chai');
const server = require('../server/index');
const {APPNAME, VERSION} = require('../config');

const assert = chai.assert;

describe('server', function() {
  it(`should return ${APPNAME} ${VERSION}`, async function() {
    const res = await server.inject({method: 'GET', url: '/'});

    assert.equal(res.statusCode, 200);
    assert.equal(res.payload, `{"APPNAME":"${APPNAME}","VERSION":"${VERSION}"}`);
  });
});
