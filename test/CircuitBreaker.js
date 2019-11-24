const chai = require('chai');
const assert = chai.assert;
const CircuitBreaker = require('../modules/CircuitBreaker');
const server = require('../server/index');
const {APPNAME} = require('../config');

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

describe('CircuitBreaker', function() {
  let circuitBreaker;
  const ft = 1;
  const cdp = 2;
  const rt = 2;

  before(function() {
    const config = {failureThreshold: ft, cooldownPeriod: cdp, requestTimeout: rt};
    circuitBreaker = new CircuitBreaker(config);
  });

  it('should initialize with custom settings', function() {
    assert.equal(circuitBreaker.getFailureThreshold(), ft, 'failure threshold');
    assert.equal(circuitBreaker.getCooldownPeriod(), cdp, 'cooldown period');
    assert.equal(circuitBreaker.getRequestTimeout(), rt, 'request timeout');
  });

  it('should set a new failure threshold setting', function() {
    circuitBreaker.setFailureThreshold(2);
    assert.equal(circuitBreaker.getFailureThreshold(), 2, 'set failure threshold');
  });

  it('should set a new cooldown period setting', function() {
    circuitBreaker.setCooldownPeriod(4);
    assert.equal(circuitBreaker.getCooldownPeriod(), 4, 'set cooldown period');
  });

  it('should set a new request timeout setting', function() {
    circuitBreaker.setRequestTimeout(5);
    assert.equal(circuitBreaker.getRequestTimeout(), 5, 'set request timeout');
  });

  // Note: make calls to ourself instead of hassle of mocking axios
  describe('callService', function() {
    before(async function() {
      await server.start();
    });

    after(async function() {
      await server.stop();
    });

    it('should call a service and return success data', async function() {
      const request = {
        method: 'GET',
        url: 'http://0.0.0.0:88/',
      };
      const res = await circuitBreaker.callService(request);
      assert.equal(res.statusCode, 200, 'statusCode');
      assert.equal(res.data.APPNAME, APPNAME, 'response data');
    });

    it('should trip the circuit to OPEN, fail on 2nd request, and clear on 3rd request', async function() {
      circuitBreaker.setFailureThreshold(1);
      circuitBreaker.setRequestTimeout(1);
      circuitBreaker.setCooldownPeriod(3);
      this.timeout(9000);

      const request = {
        method: 'POST',
        url: 'http://0.0.0.0:88/mock-test-circuitbreaker-failover',
      };
      const res = await circuitBreaker.callService(request);
      assert.equal(res, false, 'circuit breaker should return false');

      const res2 = await circuitBreaker.callService(request);
      assert.equal(res2, false, 'circuit breaker should return false again');

      await sleep(3000);

      circuitBreaker.setRequestTimeout(5);
      const res3 = await circuitBreaker.callService(request);
      assert.equal(res3.statusCode, 200, 'circuit breaker should return success');
    });
  });
});
