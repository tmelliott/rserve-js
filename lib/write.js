"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.write_into_view = exports.determine_size = exports.type_id = void 0;
const underscore_1 = __importDefault(require("underscore"));
const Rsrv_1 = __importDefault(require("./Rsrv"));
const error_1 = __importDefault(require("./error"));
const endian_1 = require("./endian");
underscore_1.default.mixin({
    isTypedArray: function (v) {
        if (!underscore_1.default.isObject(v))
            return false;
        return !underscore_1.default.isUndefined(v.byteLength) && !underscore_1.default.isUndefined(v.BYTES_PER_ELEMENT);
    },
});
// type_id tries to match some javascript values to Rserve value types
const type_id = function (value) {
    if (underscore_1.default.isNull(value) || underscore_1.default.isUndefined(value))
        return Rsrv_1.default.XT_NULL;
    var type_dispatch = {
        boolean: Rsrv_1.default.XT_ARRAY_BOOL,
        number: Rsrv_1.default.XT_ARRAY_DOUBLE,
        string: Rsrv_1.default.XT_ARRAY_STR, // base strings need to be array_str or R gets confused?
    };
    if (!underscore_1.default.isUndefined(type_dispatch[typeof value]))
        return type_dispatch[typeof value];
    // typed arrays
    if (underscore_1.default.isTypedArray(value))
        return Rsrv_1.default.XT_ARRAY_DOUBLE;
    // arraybuffers
    if (!underscore_1.default.isUndefined(value.byteLength) && !underscore_1.default.isUndefined(value.slice))
        return Rsrv_1.default.XT_RAW;
    // lists of strings (important for tags)
    if (underscore_1.default.isArray(value) &&
        underscore_1.default.all(value, function (el) {
            return typeof el === "string";
        }))
        return Rsrv_1.default.XT_ARRAY_STR;
    if (underscore_1.default.isArray(value) &&
        underscore_1.default.all(value, function (el) {
            return typeof el === "boolean";
        }))
        return Rsrv_1.default.XT_ARRAY_BOOL;
    // arbitrary lists
    if (underscore_1.default.isArray(value))
        return Rsrv_1.default.XT_VECTOR;
    // functions get passed as an array_str with extra attributes
    if (underscore_1.default.isFunction(value))
        return Rsrv_1.default.XT_ARRAY_STR | Rsrv_1.default.XT_HAS_ATTR;
    // objects
    if (underscore_1.default.isObject(value))
        return Rsrv_1.default.XT_VECTOR | Rsrv_1.default.XT_HAS_ATTR;
    throw new error_1.default("Value type unrecognized by Rserve: " + value);
};
exports.type_id = type_id;
// FIXME this is really slow, as it's walking the object many many times.
const determine_size = function (value, forced_type) {
    function list_size(lst) {
        return underscore_1.default.reduce(lst, function (memo, el) {
            return memo + determine_size(el);
        }, 0);
    }
    function final_size(payload_size) {
        if (payload_size > 1 << 24)
            return payload_size + 8; // large header
        else
            return payload_size + 4;
    }
    var header_size = 4, t = forced_type || type_id(value);
    switch (t & ~Rsrv_1.default.XT_LARGE) {
        case Rsrv_1.default.XT_NULL:
            return final_size(0);
        case Rsrv_1.default.XT_ARRAY_BOOL:
            if (underscore_1.default.isBoolean(value))
                return final_size(8);
            else
                return final_size((value.length + 7) & ~3);
        case Rsrv_1.default.XT_ARRAY_STR:
            if (underscore_1.default.isArray(value))
                return final_size(underscore_1.default.reduce(value, function (memo, str) {
                    // FIXME: this is a bit silly, since we'll be re-encoding this twice: once for the size and second time for the content
                    var utf8 = unescape(encodeURIComponent(str));
                    return memo + utf8.length + 1;
                }, 0));
            else {
                var utf8 = unescape(encodeURIComponent(value));
                return final_size(utf8.length + 1);
            }
        case Rsrv_1.default.XT_ARRAY_DOUBLE:
            if (underscore_1.default.isNumber(value))
                return final_size(8);
            else
                return final_size(8 * value.length);
        case Rsrv_1.default.XT_RAW:
            return final_size(4 + value.byteLength);
        case Rsrv_1.default.XT_VECTOR:
        case Rsrv_1.default.XT_LANG_NOTAG:
            return final_size(list_size(value));
        case Rsrv_1.default.XT_VECTOR | Rsrv_1.default.XT_HAS_ATTR: // a named list (that is, a js object)
            var names_size_1 = final_size("names".length + 3);
            var names_size_2 = determine_size(underscore_1.default.keys(value));
            var names_size = final_size(names_size_1 + names_size_2);
            return final_size(names_size + list_size(underscore_1.default.values(value)));
        /*        return header_size // XT_VECTOR | XT_HAS_ATTR
              + header_size // XT_LIST_TAG (attribute)
                + header_size + "names".length + 3 // length of 'names' + padding (tag as XT_SYMNAME)
                + Rserve.determine_size(_.keys(value)) // length of names
              + list_size(_.values(value)); // length of values
    */
        case Rsrv_1.default.XT_ARRAY_STR | Rsrv_1.default.XT_HAS_ATTR: // js->r ocap (that is, a js function)
            return (determine_size("0403556553") + // length of ocap nonce; that number is meaningless aside from length
                header_size + // XT_LIST_TAG (attribute)
                header_size +
                "class".length +
                3 + // length of 'class' + padding (tag as XT_SYMNAME)
                determine_size(["javascript_function"])); // length of class name
        default:
            throw new error_1.default("Internal error, can't handle type " + t);
    }
};
exports.determine_size = determine_size;
const write_into_view = function (value, array_buffer_view, forced_type, convert) {
    var size = determine_size(value, forced_type);
    var is_large = size > 16777215;
    // if (size > 16777215)
    //     throw new RserveError("Can't currently handle objects >16MB");
    var t = forced_type || type_id(value), i, current_offset, lbl;
    if (is_large)
        t = t | Rsrv_1.default.XT_LARGE;
    var read_view;
    var write_view = array_buffer_view.data_view();
    var payload_start;
    if (is_large) {
        payload_start = 8;
        write_view.setInt32(0, t + ((size - 8) << 8));
        write_view.setInt32(4, (size - 8) >>> 24);
    }
    else {
        payload_start = 4;
        write_view.setInt32(0, t + ((size - 4) << 8));
    }
    switch (t & ~Rsrv_1.default.XT_LARGE) {
        case Rsrv_1.default.XT_NULL:
            break;
        case Rsrv_1.default.XT_ARRAY_BOOL:
            if (underscore_1.default.isBoolean(value)) {
                write_view.setInt32(payload_start, 1);
                write_view.setInt8(payload_start + 4, value ? 1 : 0);
            }
            else {
                write_view.setInt32(payload_start, value.length);
                for (i = 0; i < value.length; ++i)
                    write_view.setInt8(payload_start + 4 + i, value[i] ? 1 : 0);
            }
            break;
        case Rsrv_1.default.XT_ARRAY_STR:
            if (underscore_1.default.isArray(value)) {
                var offset = payload_start;
                underscore_1.default.each(value, function (el) {
                    var utf8 = unescape(encodeURIComponent(el));
                    for (var i = 0; i < utf8.length; ++i, ++offset)
                        write_view.setUint8(offset, utf8.charCodeAt(i));
                    write_view.setUint8(offset++, 0);
                });
            }
            else {
                var utf8 = unescape(encodeURIComponent(value));
                for (i = 0; i < utf8.length; ++i)
                    write_view.setUint8(payload_start + i, utf8.charCodeAt(i));
                write_view.setUint8(payload_start + utf8.length, 0);
            }
            break;
        case Rsrv_1.default.XT_ARRAY_DOUBLE:
            if (underscore_1.default.isNumber(value))
                write_view.setFloat64(payload_start, value);
            else {
                for (i = 0; i < value.length; ++i)
                    write_view.setFloat64(payload_start + 8 * i, value[i]);
            }
            break;
        case Rsrv_1.default.XT_RAW:
            read_view = new endian_1.EndianAwareDataView(value);
            write_view.setUint32(payload_start, value.byteLength);
            for (i = 0; i < value.byteLength; ++i) {
                write_view.setUint8(payload_start + 4 + i, read_view.getUint8(i));
            }
            break;
        case Rsrv_1.default.XT_VECTOR:
        case Rsrv_1.default.XT_LANG_NOTAG:
            current_offset = payload_start;
            underscore_1.default.each(value, function (el) {
                var sz = determine_size(el);
                write_into_view(el, array_buffer_view.skip(current_offset), undefined, convert);
                current_offset += sz;
            });
            break;
        case Rsrv_1.default.XT_VECTOR | Rsrv_1.default.XT_HAS_ATTR:
            current_offset = payload_start + 8;
            underscore_1.default.each(underscore_1.default.keys(value), function (el) {
                for (var i = 0; i < el.length; ++i, ++current_offset)
                    write_view.setUint8(current_offset, el.charCodeAt(i));
                write_view.setUint8(current_offset++, 0);
            });
            write_view.setUint32(payload_start + 4, Rsrv_1.default.XT_ARRAY_STR + ((current_offset - (payload_start + 8)) << 8));
            write_view.setUint32(current_offset, Rsrv_1.default.XT_SYMNAME + (8 << 8));
            current_offset += 4;
            lbl = "names";
            for (i = 0; i < lbl.length; ++i, ++current_offset)
                write_view.setUint8(current_offset, lbl.charCodeAt(i));
            current_offset += 3;
            write_view.setUint32(payload_start, Rsrv_1.default.XT_LIST_TAG + ((current_offset - (payload_start + 4)) << 8));
            underscore_1.default.each(underscore_1.default.values(value), function (el) {
                var sz = determine_size(el);
                write_into_view(el, array_buffer_view.skip(current_offset), undefined, convert);
                current_offset += sz;
            });
            break;
        case Rsrv_1.default.XT_ARRAY_STR | Rsrv_1.default.XT_HAS_ATTR:
            var converted_function = convert(value);
            current_offset = payload_start + 8;
            var class_name = "javascript_function";
            for (i = 0; i < class_name.length; ++i, ++current_offset)
                write_view.setUint8(current_offset, class_name.charCodeAt(i));
            write_view.setUint8(current_offset++, 0);
            write_view.setUint32(8, Rsrv_1.default.XT_ARRAY_STR + ((current_offset - (payload_start + 8)) << 8));
            write_view.setUint32(current_offset, Rsrv_1.default.XT_SYMNAME + (8 << 8));
            current_offset += 4;
            lbl = "class";
            for (i = 0; i < lbl.length; ++i, ++current_offset)
                write_view.setUint8(current_offset, lbl.charCodeAt(i));
            current_offset += 3;
            write_view.setUint32(4, Rsrv_1.default.XT_LIST_TAG + ((current_offset - (payload_start + 4)) << 8));
            for (i = 0; i < converted_function.length; ++i)
                write_view.setUint8(current_offset + i, converted_function.charCodeAt(i));
            write_view.setUint8(current_offset + converted_function.length, 0);
            break;
        default:
            throw new error_1.default("Internal error, can't handle type " + t);
    }
};
exports.write_into_view = write_into_view;
