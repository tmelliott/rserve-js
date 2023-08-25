"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse_payload = exports.parse = void 0;
const underscore_1 = __importDefault(require("underscore"));
const Robj_1 = __importDefault(require("./Robj"));
const Rsrv_1 = __importDefault(require("./Rsrv"));
const endian_1 = require("./endian");
const error_1 = __importDefault(require("./error"));
function read(m) {
    let handlers = {};
    function lift(f, amount) {
        return function (attributes, length) {
            return [f.call(that, attributes, length), amount || length];
        };
    }
    function bind(m, f) {
        return function (attributes, length) {
            var t = m.call(that, attributes, length);
            var t2 = f(t[0])(attributes, length - t[1]);
            return [t2[0], t[1] + t2[1]];
        };
    }
    function unfold(f) {
        return function (attributes, length) {
            var result = [];
            var old_length = length;
            while (length > 0) {
                var t = f.call(that, attributes, length);
                result.push(t[0]);
                length -= t[1];
            }
            return [result, old_length];
        };
    }
    function decodeRString(s) {
        // R encodes NA as a string containing just 0xff
        if (s.length === 1 && s.charCodeAt(0) === 255)
            return null;
        // UTF-8 to UTF-16
        // http://monsur.hossa.in/2012/07/20/utf-8-in-javascript.html
        // also, we don't want to lose the value when reporting an error in decoding
        try {
            return decodeURIComponent(escape(s));
        }
        catch (xep) {
            throw new Error("Invalid UTF8: " + s);
        }
    }
    const that0 = {
        offset: 0,
        data_view: m.make(endian_1.EndianAwareDataView),
        msg: m,
        //////////////////////////////////////////////////////////////////////
        read_int: function () {
            var old_offset = this.offset;
            this.offset += 4;
            return this.data_view.getInt32(old_offset);
        },
        read_string: function (length) {
            // FIXME SLOW
            var result = "";
            while (length--) {
                var c = this.data_view.getInt8(this.offset++);
                if (c)
                    result = result + String.fromCharCode(c);
            }
            return decodeRString(result);
        },
        read_stream: function (length) {
            var old_offset = this.offset;
            this.offset += length;
            return this.msg.view(old_offset, length);
        },
        read_int_vector: function (length) {
            var old_offset = this.offset;
            this.offset += length;
            return this.msg.make(Int32Array, old_offset, length);
        },
        read_double_vector: function (length) {
            var old_offset = this.offset;
            this.offset += length;
            return this.msg.make(Float64Array, old_offset, length);
        },
        //////////////////////////////////////////////////////////////////////
        // these are members of the reader monad
        read_null: lift(function (a, l) {
            return Robj_1.default.null(a);
        }),
        read_unknown: lift(function (a, l) {
            this.offset += l;
            return Robj_1.default.null(a);
        }),
        read_string_array: function (attributes, length) {
            var a = this.read_stream(length).make(Uint8Array);
            var result = [];
            let current_str = "";
            for (var i = 0; i < a.length; ++i)
                if (a[i] === 0) {
                    current_str = decodeRString(current_str) || "";
                    result.push(current_str);
                    current_str = "";
                }
                else {
                    current_str = current_str + String.fromCharCode(a[i]);
                }
            return [Robj_1.default.string_array(result, attributes), length];
        },
        read_bool_array: function (attributes, length) {
            var l2 = this.read_int();
            var s = this.read_stream(length - 4);
            var a = underscore_1.default.map(s.make(Uint8Array).subarray(0, l2), function (v) {
                return v ? true : false;
            });
            return [Robj_1.default.bool_array(a, attributes), length];
        },
        read_raw: function (attributes, length) {
            var l2 = this.read_int();
            var s = this.read_stream(length - 4);
            var a = new Uint8Array(s.make(Uint8Array).subarray(0, l2)).buffer;
            return [Robj_1.default.raw(a, attributes), length];
        },
        read_sexp: function () {
            var d = this.read_int();
            var _ = Rsrv_1.default.par_parse(d);
            var t = _[0], l = _[1];
            var total_read = 4;
            var attributes = undefined;
            if (Rsrv_1.default.IS_LARGE(t)) {
                var extra_length = this.read_int();
                total_read += 4;
                l += extra_length * Math.pow(2, 24);
                t &= ~64;
            }
            if (t & Rsrv_1.default.XT_HAS_ATTR) {
                t = t & ~Rsrv_1.default.XT_HAS_ATTR;
                var attr_result = this.read_sexp();
                attributes = attr_result[0];
                total_read += attr_result[1];
                l -= attr_result[1];
            }
            if (handlers[t] === undefined) {
                throw new error_1.default("Unimplemented " + t, -1);
            }
            else {
                var result = handlers[t].call(this, attributes, l);
                return [result[0], total_read + result[1]];
            }
        },
        read_clos: undefined,
    };
    const that = that0;
    that.read_clos = bind(that.read_sexp, function (formals) {
        return bind(that.read_sexp, function (body) {
            return lift(function (a, l) {
                return Robj_1.default.clos(formals, body, a);
            }, 0);
        });
    });
    that.read_list = unfold(that.read_sexp);
    function read_symbol_value_pairs(lst) {
        var result = [];
        for (var i = 0; i < lst.length; i += 2) {
            var value = lst[i], tag = lst[i + 1];
            if (tag.type === "symbol") {
                result.push({ name: tag.value, value: value });
            }
            else {
                result.push({ name: null, value: value });
            }
        }
        return result;
    }
    that.read_list_tag = bind(that.read_list, function (lst) {
        return lift(function (attributes, length) {
            var result = read_symbol_value_pairs(lst);
            return Robj_1.default.tagged_list(result, attributes);
        }, 0);
    });
    that.read_lang_tag = bind(that.read_list, function (lst) {
        return lift(function (attributes, length) {
            var result = read_symbol_value_pairs(lst);
            return Robj_1.default.tagged_lang(result, attributes);
        }, 0);
    });
    function xf(f, g) {
        return bind(f, function (t) {
            return lift(function (a, l) {
                return g(t, a);
            }, 0);
        });
    }
    that.read_vector = xf(that.read_list, Robj_1.default.vector);
    that.read_list_no_tag = xf(that.read_list, Robj_1.default.list);
    that.read_lang_no_tag = xf(that.read_list, Robj_1.default.lang);
    that.read_vector_exp = xf(that.read_list, Robj_1.default.vector_exp);
    function sl(f, g) {
        return lift(function (a, l) {
            return g(f.call(that, l), a);
        });
    }
    that.read_symname = sl(that.read_string, Robj_1.default.symbol);
    that.read_int_array = sl(that.read_int_vector, Robj_1.default.int_array);
    that.read_double_array = sl(that.read_double_vector, Robj_1.default.double_array);
    handlers[Rsrv_1.default.XT_NULL] = that.read_null;
    handlers[Rsrv_1.default.XT_UNKNOWN] = that.read_unknown;
    handlers[Rsrv_1.default.XT_VECTOR] = that.read_vector;
    handlers[Rsrv_1.default.XT_CLOS] = that.read_clos;
    handlers[Rsrv_1.default.XT_SYMNAME] = that.read_symname;
    handlers[Rsrv_1.default.XT_LIST_NOTAG] = that.read_list_no_tag;
    handlers[Rsrv_1.default.XT_LIST_TAG] = that.read_list_tag;
    handlers[Rsrv_1.default.XT_LANG_NOTAG] = that.read_lang_no_tag;
    handlers[Rsrv_1.default.XT_LANG_TAG] = that.read_lang_tag;
    handlers[Rsrv_1.default.XT_VECTOR_EXP] = that.read_vector_exp;
    handlers[Rsrv_1.default.XT_ARRAY_INT] = that.read_int_array;
    handlers[Rsrv_1.default.XT_ARRAY_DOUBLE] = that.read_double_array;
    handlers[Rsrv_1.default.XT_ARRAY_STR] = that.read_string_array;
    handlers[Rsrv_1.default.XT_ARRAY_BOOL] = that.read_bool_array;
    handlers[Rsrv_1.default.XT_RAW] = that.read_raw;
    handlers[Rsrv_1.default.XT_STR] = sl(that.read_string, Robj_1.default.string);
    return that;
}
var incomplete_ = [], incomplete_header_ = null, msg_bytes_ = 0, remaining_ = 0;
function clear_incomplete() {
    incomplete_ = [];
    incomplete_header_ = null;
    remaining_ = 0;
    msg_bytes_ = 0;
}
function parse(msg) {
    var result = {};
    if (incomplete_.length) {
        result.header = incomplete_header_;
        incomplete_.push(msg);
        remaining_ -= msg.byteLength;
        if (remaining_ < 0) {
            result.ok = false;
            result.message =
                "Messages add up to more than expected length: got " +
                    (msg_bytes_ - remaining_) +
                    ", expected " +
                    msg_bytes_;
            clear_incomplete();
            return result;
        }
        else if (remaining_ === 0) {
            var complete_msg = new ArrayBuffer(msg_bytes_), array = new Uint8Array(complete_msg), offset = 0;
            incomplete_.forEach(function (frame, i) {
                array.set(new Uint8Array(frame), offset);
                offset += frame.byteLength;
            });
            if (offset !== msg_bytes_) {
                result.ok = false;
                result.message =
                    "Internal error - frames added up to " +
                        offset +
                        " not " +
                        msg_bytes_;
                clear_incomplete();
                return result;
            }
            clear_incomplete();
            msg = complete_msg;
        }
        else {
            result.ok = true;
            result.incomplete = true;
            return result;
        }
    }
    var header = new Int32Array(msg, 0, 4);
    var resp = header[0] & 16777215, status_code = header[0] >>> 24;
    var length = header[1], length_high = header[3];
    var msg_id = header[2];
    result.header = [resp, status_code, msg_id];
    if (length_high) {
        result.ok = false;
        result.message = "rserve.js cannot handle messages larger than 4GB";
        return result;
    }
    var full_msg_length = length + 16; // header length + data length
    if (full_msg_length > msg.byteLength) {
        incomplete_.push(msg);
        incomplete_header_ = header;
        msg_bytes_ = full_msg_length;
        remaining_ = msg_bytes_ - msg.byteLength;
        result.header = header;
        result.ok = true;
        result.incomplete = true;
        return result;
    }
    if (resp === Rsrv_1.default.RESP_ERR) {
        result.ok = false;
        result.status_code = status_code;
        result.message =
            "ERROR FROM R SERVER: " +
                (Rsrv_1.default.status_codes[status_code] || status_code) +
                " " +
                result.header[0] +
                " " +
                result.header[1] +
                " " +
                msg.byteLength +
                " " +
                msg;
        return result;
    }
    if (!(resp === Rsrv_1.default.RESP_OK || Rsrv_1.default.IS_OOB_SEND(resp) || Rsrv_1.default.IS_OOB_MSG(resp))) {
        result.ok = false;
        result.message =
            "Unexpected response from Rserve: " +
                resp +
                " status: " +
                Rsrv_1.default.status_codes[status_code];
        return result;
    }
    try {
        result.payload = parse_payload(msg);
        result.ok = true;
    }
    catch (e) {
        result.ok = false;
        result.message = e.message;
    }
    return result;
}
exports.parse = parse;
function parse_payload(msg) {
    var payload = (0, endian_1.my_ArrayBufferView)(msg, 16, msg.byteLength - 16);
    if (payload.length === 0)
        return null;
    var reader = read(payload);
    var d = reader.read_int();
    var _ = Rsrv_1.default.par_parse(d);
    var t = _[0], l = _[1];
    if (Rsrv_1.default.IS_LARGE(t)) {
        var more_length = reader.read_int();
        l += more_length * Math.pow(2, 24);
        if (l > Math.pow(2, 32)) {
            // resist the 1 << 32 temptation here!
            // total_length is greater than 2^32.. bail out because of node limits
            // even though in theory we could go higher than that.
            throw new Error("Payload too large: " + l + " bytes");
        }
        t &= ~64;
    }
    if (t === Rsrv_1.default.DT_INT) {
        return { type: "int", value: reader.read_int() };
    }
    else if (t === Rsrv_1.default.DT_STRING) {
        return { type: "string", value: reader.read_string(l) };
    }
    else if (t === Rsrv_1.default.DT_BYTESTREAM) {
        // NB this returns a my_ArrayBufferView()
        return { type: "stream", value: reader.read_stream(l) };
    }
    else if (t === Rsrv_1.default.DT_SEXP) {
        _ = reader.read_sexp();
        var sexp = _[0], l2 = _[1];
        return { type: "sexp", value: sexp };
    }
    else
        throw new error_1.default("Bad type for parse? " + t + " " + l, -1);
}
exports.parse_payload = parse_payload;
