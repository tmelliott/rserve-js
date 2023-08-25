"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RserveError = function (message, status_code) {
    this.name = "RserveError";
    this.message = message;
    this.status_code = status_code || 0;
};
RserveError.prototype = Object.create(Error);
RserveError.prototype.constructor = RserveError;
exports.default = RserveError;
