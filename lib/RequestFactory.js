'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var bluebird_1 = require("bluebird");
var NotSuccessfulResponseError_1 = require("./NotSuccessfulResponseError");
var RequestAsync = require('./RequestAsync');
var RequestFactory = /** @class */ (function () {
    function RequestFactory(baseApi, options, interceptor) {
        this.options = options || {};
        this.baseApi = baseApi;
        this.interceptor = interceptor;
    }
    RequestFactory.prototype.get = function (path) {
        var options = this.getOptions(path, "get");
        return doRequest.call(this, options);
    };
    RequestFactory.prototype.post = function (path, body) {
        var options = this.getOptions(path, "post", body);
        return doRequest.call(this, options);
    };
    RequestFactory.prototype.put = function (path, body) {
        var options = this.getOptions(path, "put", body);
        return doRequest.call(this, options);
    };
    RequestFactory.prototype.patch = function (path, body) {
        var options = this.getOptions(path, "patch", body);
        return doRequest.call(this, options);
    };
    RequestFactory.prototype.delete = function (path) {
        var options = this.getOptions(path, "delete");
        return doRequest.call(this, options);
    };
    RequestFactory.prototype.getOptions = function (path, method, body) {
        body = body || {};
        var result = Object.assign({
            timeout: 10000,
            forever: true,
        }, this.options, {
            url: "" + this.baseApi + path,
            method: method,
        });
        if (body.formData) {
            result = Object.assign(result, { formData: body.formData });
        }
        else if (Object.keys(body).length !== 0) {
            result = Object.assign(result, { body: body, json: true });
        }
        else {
            result.json = true;
        }
        return result;
    };
    Object.defineProperty(RequestFactory.prototype, "headers", {
        get: function () {
            return this.getHeaders();
        },
        enumerable: true,
        configurable: true
    });
    RequestFactory.prototype.getHeaders = function () {
        return this.options.headers;
    };
    RequestFactory.prototype.setHeaders = function (headers) {
        Object.assign(this.options.headers, headers);
    };
    return RequestFactory;
}());
exports.default = RequestFactory;
var doRequest = function (options) {
    var _this = this;
    var startTime = process.hrtime();
    doInterceptor.call(this, "before", options);
    return RequestAsync.request(options)
        .then(function (r) {
        r = r;
        var diff = process.hrtime(startTime);
        var responseTime = (diff[0] * 1e9) + diff[1];
        r.responseTime = responseTime;
        return r;
    })
        .then(checkStatusCode)
        .then(doInterceptor.bind(this, "success", options))
        .then(function (obj) { return obj.body; })
        .catch(function (e) {
        doInterceptor.call(_this, "error", options, e);
        e.request = options;
        throw e;
    });
};
var doInterceptor = function (type, options, result) {
    if (this.interceptor && this.interceptor[type]) {
        this.interceptor[type](options, result);
    }
    return result;
};
var checkStatusCode = function (res) {
    return bluebird_1.Promise.try(function () {
        if (res.statusCode >= 400) {
            throw new NotSuccessfulResponseError_1.default(res);
        }
        return res;
    });
};
