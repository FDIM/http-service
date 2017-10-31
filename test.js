const assert = require('assert');
const http = require("http");
const HttpService = require("./index.js");

const port = 34356;
const proxy = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end('{"data":["test"]}');
});
proxy.listen(port);

const endpoint = "http://localhost:" + port;
const https = new HttpService(endpoint);

Promise.all([
  new Promise((resolve, reject) => {
    https.get("/key/value/one/two", {}, (err, res) => {
      assert.equal(res.data[0], 'test');
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  }),
  https.get("/key/value/one/two", {}).then((res) => {
    assert.equal(res.data[0], 'test');
  })

]).then(() => {
  console.info('tests passed')
  proxy.close();
}).catch((err) => {
  console.error(err);
  proxy.close();
});
