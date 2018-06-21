'use strict'
export default class NotSuccessfulResponseError extends Error {
  isOperational: boolean;
  body: any;
  statusCode: number;

  constructor(response) {
    super(response.body.message)
    this.isOperational = true
    this.body = response.body
    this.statusCode = response.statusCode
  }
}