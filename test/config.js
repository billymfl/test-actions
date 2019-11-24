const chai = require('chai');
const pkg = require('../package');
const {NODE_ENV, HOST, PORT, APPNAME, VERSION, _error} = require('../config');

const assert = chai.assert;

describe('config', function() {
  it('_error should be undefined', function() {
    assert.equal(_error, undefined);
  });

  it('APPNAME value should be set from package.json', function() {
    assert.equal(APPNAME, pkg.name);
  });

  it('VERSION value should be set from package.json', function() {
    assert.equal(VERSION, pkg.version);
  });

  it('NODE_ENV value should be set to test', function() {
    assert.equal(NODE_ENV, 'test');
  });

  it('HOST value should be set', function() {
    assert.equal(HOST, '0.0.0.0');
  });

  it('PORT value should be set', function() {
    assert.equal(PORT, 88);
  });
});
