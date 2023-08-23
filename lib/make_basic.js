"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const underscore_1 = __importDefault(require("underscore"));
class RObject {
    type;
    value;
    attributes;
    constructor(type, value, attributes) {
        this.type = type;
        this.value = value;
        this.attributes = attributes;
    }
}
const make_basic = (type, proto) => {
    proto = proto || {
        json: function () {
            throw new Error("json() unsupported for type " + this.type);
        },
    };
    const wrapped_proto = {
        json: function (resolver) {
            const result = proto?.json.call(this, resolver);
            result.r_type = type;
            if (!underscore_1.default.isUndefined(this.attributes))
                result.attributes = underscore_1.default.object(underscore_1.default.map(this.attributes.value, function (v) {
                    return [v.name, v.value.json(resolver)];
                }));
            return result;
        },
    };
    return function (v, attrs) {
        class RObjectImpl extends RObject {
            constructor() {
                super(type, v, attrs);
            }
        }
        Object.setPrototypeOf(RObjectImpl.prototype, wrapped_proto);
        return new RObjectImpl();
    };
};
exports.default = make_basic;
