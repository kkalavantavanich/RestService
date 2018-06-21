'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var Request = require('request');
var bluebird_1 = require("bluebird");
var RequestAsync = bluebird_1.Promise.promisify(Request);
module.exports.request = RequestAsync;
