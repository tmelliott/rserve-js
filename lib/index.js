"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Rsrv_1 = __importDefault(require("./Rsrv"));
const endian_1 = require("./endian");
const Robj_1 = __importDefault(require("./Robj"));
const error_1 = __importDefault(require("./error"));
const read_1 = require("./read");
const write_1 = require("./write");
const ocap_1 = require("./ocap");
// const Rserve = (function () {
const Rserve = {};
Rserve.Robj = Robj_1.default;
Rserve.Rsrv = Rsrv_1.default;
Rserve.parse_websocket_frame = read_1.parse;
Rserve.parse_payload = read_1.parse_payload;
Rserve.EndianAwareDataView = endian_1.EndianAwareDataView;
Rserve.my_ArrayBufferView = endian_1.my_ArrayBufferView;
// ocaps
Rserve.create = ocap_1.create;
Rserve.wrap_all_ocaps = ocap_1.wrap_all_ocaps;
Rserve.wrap_ocap = ocap_1.wrap_ocap;
Rserve.RserveError = error_1.default;
Rserve.type_id = write_1.type_id;
Rserve.determine_size = write_1.determine_size;
Rserve.write_into_view = write_1.write_into_view;
//   this.Rserve = Rserve;
// })();
exports.default = Rserve;
