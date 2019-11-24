/**
 * Defines handlers for the routes
 * @module handlers
 *
*/

const {APPNAME, VERSION} = require('../config');

module.exports = {
  default: (request, h) => {
    return {APPNAME, VERSION};
  },

  healthCheck: (request, h) => {
    return {status: 'ok'};
  },

  testCircuitBreaker: async (request, h) => {
    const sleep = (ms) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    };
    await sleep(2000);
    return {status: 'ok'};
  },

  hello: (request, h) =>{
    return `Hello ${request.params.name}!`;
  },

};
