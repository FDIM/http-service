const url = require('url');
const querystring = require('querystring');
const http = require('http');
const https = require('https');

function HttpService(endpoint) {
  this.requestOptions = undefined;
  if (typeof endpoint !== 'undefined' && endpoint) {
    this.init(endpoint);
  }
}
// export
module.exports = HttpService;

HttpService.prototype.init = function (endpoint) {
  if (!endpoint) {
    return;
  }
  this.init = function () { };
  this.requestOptions = url.parse(endpoint);
  this.requestOptions.headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
    'Accept': 'application/json;charset=UTF-8'
  };
  // add authorization header
  if (this.requestOptions.auth) {
    this.requestOptions.headers.Authorization = 'Basic ' + (new Buffer(this.requestOptions.auth)).toString('base64');
  }
};

HttpService.prototype.delete = function (path, query, callback) {
  return this.request(path, 'delete', query, callback);
};

HttpService.prototype.put = function (path, query, data, callback) {
  const payload = JSON.stringify(data);
  return this.upload(path, 'put', query, 'application/json;charset=UTF-8', payload, callback);
};

HttpService.prototype.get = function (path, query, callback) {
  return this.request(path, 'get', query, callback);
};

HttpService.prototype.post = function (path, query, data, callback) {
  const payload = JSON.stringify(data);
  return this.upload(path, 'post', query, 'application/json;charset=UTF-8', payload, callback);
};

HttpService.prototype.request = function (path, method, query, callback) {
  return this.$request({
    path: path,
    method: method,
    query: query
  }, callback);
};

HttpService.prototype.upload = function (path, method, query, contentType, payload, callback) {
  return this.$request({
    path: path,
    method: method,
    query: query,
    contentType: contentType,
    payload: payload
  }, callback);
};

HttpService.prototype.$request = function (options, callback) {
  return returnPromiseOrInvokeCallback(new Promise((resolve, reject) => {
    const request = Object.assign({}, this.requestOptions);
    if (options.path !== undefined) {
      request.path = options.path + '?' + querystring.stringify(options.query);
    }
    if (options.contentType) {
      request.headers['Content-Type'] = options.contentType;
    }
    if (options.payload) {
      request.headers['Content-Length'] = Buffer.byteLength(options.payload);
    }
    request.method = options.method;
    const pending = (request.protocol === 'https:' ? https : http).request(request, (res) => {
      let result = '';
      res.on('data', (chunk) => {
        result += chunk;
      });
      res.on('end', () => {
        const contentType = (res.headers['content-type'] || '').toLowerCase();
        if (contentType.indexOf('application/json') !== -1) {
          try {
            const json = JSON.parse(result || '""');
            result = json;
          } catch (err) { }
        }
        // 2xx
        if (res.statusCode / 100 !== 2) {
          reject({
            code: res.statusCode,
            message: res.statusMessage || "Status code is not 2xx"
          }, result);
        } else {
          resolve(result);
        }
      });

    });
    pending.on('error', reject);

    if (options.payload) {
      pending.write(options.payload);
    }
    pending.end();

  }), callback);
};

function returnPromiseOrInvokeCallback(promise, callback) {
  if (typeof (callback) !== 'function') {
    return promise;
  }
  // invoke callback
  promise.then((result) => { callback(null, result); }).catch(callback);
}