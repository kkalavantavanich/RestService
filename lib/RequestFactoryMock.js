'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var bluebird_1 = require("bluebird");
var _ = require("lodash");
var MockState = Object.freeze({
    CREATED: 0,
    BUILD: 1,
});
var methods = ["get", "post", "put", "patch", "delete"];
var RequestFactoryMock = /** @class */ (function () {
    function RequestFactoryMock() {
        this.urlArray = [];
        this.state = MockState.CREATED;
    }
    RequestFactoryMock.prototype.get = function (url, data) {
        data = data || {};
        return this.action(url, "get", _.cloneDeep(data));
    };
    RequestFactoryMock.prototype.delete = function (url, data) {
        data = data || {};
        return this.action(url, "delete", _.cloneDeep(data));
    };
    RequestFactoryMock.prototype.post = function (url, data) {
        return this.action(url, "post", _.cloneDeep(data));
    };
    RequestFactoryMock.prototype.put = function (url, data) {
        return this.action(url, "put", _.cloneDeep(data));
    };
    RequestFactoryMock.prototype.patch = function (url, data) {
        return this.action(url, "patch", _.cloneDeep(data));
    };
    RequestFactoryMock.prototype.build = function () {
        if (this.urlArray.length === 0) {
            throw new Error("Please add at less one action with get, post, put, patch, or delete method before build mock.");
        }
        this.state = MockState.BUILD;
        resetObj(this);
        spyObj(this);
        return this;
    };
    RequestFactoryMock.prototype.action = function (url, method, data) {
        if (this.state === MockState.CREATED) {
            this.urlArray.push({ url: url, method: method, data: data });
        }
        else {
            if (data instanceof Error) {
                return bluebird_1.Promise.reject(data);
            }
            var result = _.find(this.urlArray, function (obj) {
                if (obj.url === "*") {
                    return method === obj.method;
                }
                var regex = new RegExp(obj.url);
                return regex.test(url) && method === obj.method;
            });
            if (!result) {
                throw new Error("URL " + url + ", Method " + method + " is not found in RequestFactoryMock. Please specific path or use '*'");
            }
            if (result.data instanceof Array) {
                var currentMethod = this[method];
                return bluebird_1.Promise.resolve(result.data[currentMethod.calls.count() - 1]);
            }
            return bluebird_1.Promise.resolve(result.data);
        }
    };
    return RequestFactoryMock;
}());
var spyObj = function (that) {
    for (var _i = 0, methods_1 = methods; _i < methods_1.length; _i++) {
        var method = methods_1[_i];
        spyOn(that, method).and.callThrough();
    }
};
var resetObj = function (that) {
    for (var _i = 0, methods_2 = methods; _i < methods_2.length; _i++) {
        var method = methods_2[_i];
        if (that[method].calls) {
            that[method].calls.reset();
        }
    }
};
module.exports = RequestFactoryMock;
