/**
 * A class to represent the Circuit breaker pattern. To use pass a request object
 * to callService()
 * @class
 *
 * @property states object to store the state of each request
 * @property failureThreshold int number of failed requests before setting open circuit
 * @property cooldownPeriod int seconds to wait until trying request after circuit opened
 * @property requestTimeout int time in seconds before a request is deemed as failed
 */

const axios = require('axios');
const {debug} = require('../config');
/**
 * CircutiBreaker to handle failed requests.
 */
class CircuitBreaker {
  /**
   * @contructor
   * @param {Object} config settings
   */
  constructor(config) {
    this.states = {};
    this.failureThreshold = config.failureThreshold || 3;
    this.cooldownPeriod = config.cooldownPeriod || 30;
    this.requestTimeout = config.requestTimeout || 1;
  }

  /** getFailureThreshold how many failed tries before an endpoint is set to failed
   * @method
   * @return {int} number representing the failure threshold
   */
  getFailureThreshold() {
    return this.failureThreshold;
  }

  /** setFailureThreshold sets a new failure threshold
  * @method
  * @param  {int} failureThreshold the new value
   */
  setFailureThreshold(failureThreshold) {
    this.failureThreshold = failureThreshold;
  }

  /** getCooldownPeriod how many seconds before trying a failed endpoint
   * @return {int} seconds representing the cooldown period
   */
  getCooldownPeriod() {
    return this.cooldownPeriod;
  }

  /** setCooldownPeriod sets cool down period before a failed endpoint is tried again
   * @param  {int} cooldownPeriod the new value (in seconds)
   */
  setCooldownPeriod(cooldownPeriod) {
    this.cooldownPeriod = cooldownPeriod;
  }

  /** getRequestTimeout seconds to wait before timing out a request
   * @return {int} the request timeout
   */
  getRequestTimeout() {
    return this.requestTimeout;
  }

  /** setRequestTimeout sets a new request time out
   * @param  {int} requestTimeout the new value (in seconds)
   */
  setRequestTimeout(requestTimeout) {
    this.requestTimeout = requestTimeout;
  }

  /** callService attempts to send a request to an endpoint and records success or failure
   * @param  {object} requestOptions the request to make
   * @return {object|boolean} object containing { statusCode, data } or false if failed or
   *  can't make request
   */
  async callService(requestOptions) {
    const endpoint = `${requestOptions.method}:${requestOptions.url}`;
    debug('TCL: CircuitBreaker -> callService -> endpoint', endpoint);

    if (!this._canRequest(endpoint)) return false;
    requestOptions.timeout = this.requestTimeout * 1000;

    try {
      const response = await axios(requestOptions);

      debug('TCL: CircuitBreaker -> callService -> response', response);
      // eslint-disable-next-line max-len
      debug('TCL: CircuitBreaker -> callService -> response code, data', response.status, response.data);

      this._onSuccess(endpoint);
      return {statusCode: response.status, data: response.data};
    } catch (err) {
      // debug('TCL: CircuitBreaker -> callService -> err', err);
      this._onFailure(endpoint);
      return false;
    }
  }

  /** _onSuccess resets an endpoint to initial values
   * @private
   * @param  {string} endpoint
   */
  _onSuccess(endpoint) {
    this._initState(endpoint);
  }

  /** _onFailure sets errors states for a failed request to the endpoint
  * @private
  * @param  {string} endpoint
   */
  _onFailure(endpoint) {
    const state = this.states[endpoint];

    state.failures += 1;
    if (state.failures > this.failureThreshold) {
      state.circuit = 'OPEN';
      state.nextTry = new Date() / 1000 + this.cooldownPeriod;
      console.log(`ALERT! Circuit for ${endpoint} is in state 'OPEN'`);
    }
    debug('TCL: CircuitBreaker -> _onFailure -> state', state);
  }

  /** _canRequest checks to see if the endpoint's state allows for requests
   * @private
   * @param  {string} endpoint
   * @return {boolean} true if circuit is closed or half open, false otherwise
   */
  _canRequest(endpoint) {
    if (!this.states[endpoint]) this._initState(endpoint);
    const state = this.states[endpoint];
    if (state.circuit === 'CLOSED') return true;
    const now = new Date() / 1000;
    debug('TCL: CircuitBreaker -> _canRequest -> now', now);
    if (state.nextTry <= now) {
      state.circuit = 'HALF';
      return true;
    }
    return false;
  }

  /** _initState for the endpoint
   * @private
   * @param  {string} endpoint
   */
  _initState(endpoint) {
    this.states[endpoint] = {
      failures: 0,
      cooldownPeriod: this.cooldownPeriod,
      circuit: 'CLOSED',
      nextTry: 0,
    };
  }
}

module.exports = CircuitBreaker;
