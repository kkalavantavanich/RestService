'use strict'
const Request = require('request');
import {Promise} from 'bluebird';

let RequestAsync = Promise.promisify(Request);

module.exports.request = RequestAsync;
