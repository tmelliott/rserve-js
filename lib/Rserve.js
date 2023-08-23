"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Robj_1 = __importDefault(require("./Robj"));
const Rsrv_1 = __importDefault(require("./Rsrv"));
const make_basic_1 = __importDefault(require("./make_basic"));
class Rserve {
    Rsrv;
    Robj;
    constructor() {
        this.Rsrv = Rsrv_1.default;
        this.Robj = Robj_1.default;
    }
    make_basic = make_basic_1.default;
}
exports.default = Rserve;
