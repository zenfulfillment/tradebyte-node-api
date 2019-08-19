# tradebyte node api

## Usage

```js
const Promise = require('bluebird');

const tradebyte = require('tradebyte-node-api')({
  hnr: 1234,
  user: 'my-username',
  pass: 'my-password',
  isSandbox: true // Remove this line if you want to hit Tradebyte production server
});

tradebyte
  .getOrders({channel: 8})
  .then((res) => console.log(res));
```
