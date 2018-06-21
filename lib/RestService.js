'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var RequestFactoryMock = require("./RequestFactoryMock");
var RequestFactory_1 = require("./RequestFactory");
var clientType = {};
var defaultHeaderList = [];
var RestClient = {};
function filterHeader(headers, type) {
    if (!headers && type.headers.list.length === 0) {
        return headers;
    }
    var whiteList = type.headers.whiteList.concat(defaultHeaderList);
    var tmp = _.pick(headers, whiteList);
    var uniqueHeaders = _.reduce(type.headers.list, function (result, value) {
        Object.assign(result, value);
        return result;
    }, {});
    uniqueHeaders = _.reduce(uniqueHeaders, function (result, value, key) {
        var _a;
        if (_.isFunction(value)) {
            Object.assign(result, (_a = {}, _a[key] = value(), _a));
        }
        else {
            result[key] = value;
        }
        return result;
    }, {});
    Object.assign(tmp, uniqueHeaders);
    return tmp;
}
function reset() {
    for (var key in RestClient) {
        delete RestClient[key];
    }
}
/*
 * Initialize with given options.
 */
function init(options) {
    var clients = options.clients;
    var defaultHeaders = options.defaultHeaders || [];
    validateClients(clients);
    validateDefaultHeaders(defaultHeaders);
    Object.assign(defaultHeaderList, defaultHeaders);
    clients.forEach(register);
}
/*
 * Registers a client
 */
function register(client) {
    var headers = client.headers || [];
    var url = client.url;
    var type = client.type;
    var interceptor = client.interceptor;
    var timeout = client.timeout;
    validateHeaders(headers);
    validateUrl(url);
    validateType(type);
    validateInterceptor(interceptor);
    var currentType = createCurrentType(url, headers);
    RestClient[type] = function (req) {
        req = req || {};
        var headers = req.headers;
        headers = filterHeader(headers, Object.assign({}, currentType));
        var options = _.omitBy(_.assign({
            headers: headers,
            timeout: timeout,
        }, client.options), _.isNil);
        return new RequestFactory_1.default(currentType.url, options, interceptor);
    };
}
function validateClients(clients) {
    if (!clients) {
        throw new Error("Cannot init RestClient, 'clients' property is required.");
    }
}
function validateDefaultHeaders(defaultHeaders) {
    if (!_.isArray(defaultHeaders) || !defaultHeaders.every(function (element) { return _.isString(element); })) {
        throw new Error("'defaultHeaders' should be array, and each element should be a string!");
    }
}
function validateHeaders(headers) {
    if (!_.isArray(headers)) {
        throw new Error("'headers' should be an array!");
    }
}
function validateType(type) {
    if (!_.isString(type)) {
        throw new Error("'type' should be a string!");
    }
}
function validateUrl(url) {
    if (!_.isString(url)) {
        throw new Error("'url' should be a string!");
    }
}
function validateInterceptor(interceptor) {
    if (interceptor) {
        if (!interceptor || !_.isPlainObject(interceptor)) {
            throw new Error("interceptor is not an object or, interceptor.success or interceptor.error are undefined.");
        }
        if (!_.every(interceptor, function (element) { return _.isFunction(element); })) {
            throw new Error("interceptor property is not a function.");
        }
    }
}
function createCurrentType(url, headers) {
    return {
        url: url,
        headers: {
            whiteList: _.filter(headers, function (obj) { return _.isString(obj); }),
            list: _.filter(headers, function (obj) { return _.isPlainObject(obj); })
        }
    };
}
/*
 * Gets a mock instance
 */
function mock() {
    if (typeof jasmine === "undefined") {
        throw new Error("Please use mock function in jasmine test environment.");
    }
    return new RequestFactoryMock();
}
module.exports = { init: init, reset: reset, register: register, mock: mock, RestClient: RestClient };
