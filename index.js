const fs = require('fs');
const {promisify} = require('util');
const request = require('request-promise');
const xml2js = require('xml2js');

const parseString = promisify(xml2js.parseString);
const TRADEBYTE_API_URL = 'https://rest.tradebyte.com';
const TRADEBYTE_STAGING_API_URL = 'https://reststaging.tradebyte.com';

module.exports = ({hnr, user, pass, isSandbox = false} = {}) => {
  if (!hnr || !user || !pass) {
    throw new Error('Missing credentials');
  }

  const baseUrl = isSandbox ? TRADEBYTE_STAGING_API_URL : TRADEBYTE_API_URL;

  function _request(args) {
    return request.defaults({
      baseUrl: `https://${user}:${pass}@reststaging.tradebyte.com/${hnr}`
    })(args).promise();
  }

  return {
    async getOrders(qs = {}) {
      const url = 'orders/';
      const xml = await _request({url, method: 'GET', qs});

      const json = await parseString(xml, {explicitArray: false, ignoreAttrs: true});
      const orders = json ? json.ORDER_LIST : [];
      const ordersArray = orders && !Array.isArray(orders) ? [orders] : orders;

      fs.writeFileSync(`${__dirname}/res.json`, JSON.stringify(ordersArray, null, 2))

      return ordersArray.map(({ORDER}) => ORDER);
    },

    async setExportedOrder(orderId) {
      if (!orderId) {
        throw new Error('Missing orderId parameter');
      }

      const url = `orders/${orderId}/exported`;
      return _request({url, method: 'POST'});
    },

    async sendMessage(data) {
      const url = 'messages/'
      if (!data) {
        throw new Error('Missing data parameter');
      }

      const builder = new xml2js.Builder();
      const body = builder.buildObject(data);

      return _request({url, method: 'POST', body});
    },

    async post(url, data) {
      if (!url) {
        throw new Error('Missing endpoint');
      }

      if (!data) {
        throw new Error('Missing data');
      }

      const builder = new xml2js.Builder();
      const body = builder.buildObject(data);

      return _request({url, method: 'POST', body});
    }
  };
};
