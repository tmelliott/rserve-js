"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const make_basic_1 = __importDefault(require("./make_basic"));
const underscore_1 = __importDefault(require("underscore"));
const Robj = {
    null: function (attributes) {
        return {
            type: "null",
            value: null,
            attributes: attributes,
            json: function () {
                return null;
            },
        };
    },
    clos: function (formals, body, attributes) {
        return {
            type: "clos",
            value: { formals: formals, body: body },
            attributes: attributes,
            json: function () {
                throw "json() unsupported for type clos";
            },
        };
    },
    vector: (0, make_basic_1.default)("vector", {
        json: function (resolver) {
            var values = underscore_1.default.map(this.value, function (x) {
                return x.json(resolver);
            });
            if (underscore_1.default.isUndefined(this.attributes)) {
                return values;
            }
            else {
                // FIXME: there is no reason why names should be the first or only
                //        attribute, so the code should really look
                //        for "names" and not cry if it doesn't exist
                if (this.attributes.value[0].name == "names") {
                    var keys = this.attributes.value[0].value.value;
                    var result = {};
                    underscore_1.default.each(keys, function (key, i) {
                        result[key] = values[i];
                    });
                    return result;
                }
                // FIXME: how can we pass other important attributes
                //        like "class" ?
                return values;
            }
        },
    }),
    symbol: (0, make_basic_1.default)("symbol", {
        json: function () {
            return this.value;
        },
    }),
    list: (0, make_basic_1.default)("list"),
    lang: (0, make_basic_1.default)("lang", {
        json: function (resolver) {
            var values = underscore_1.default.map(this.value, function (x) {
                return x.json(resolver);
            });
            if (underscore_1.default.isUndefined(this.attributes)) {
                return values;
            }
            else {
                // FIXME: lang doens't have "names" attribute since
                //        names are sent as tags (langs are pairlists)
                //        so this seems superfluous (it is dangerous
                //        if lang ever had attributes since there is
                //        no reason to fail in that case)
                if (this.attributes.value[0].name != "names")
                    throw "expected names here";
                var keys = this.attributes.value[0].value.value;
                var result = {};
                underscore_1.default.each(keys, function (key, i) {
                    result[key] = values[i];
                });
                return result;
            }
        },
    }),
    tagged_list: (0, make_basic_1.default)("tagged_list", {
        json: function (resolver) {
            function classify_list(list) {
                if (underscore_1.default.all(list, function (elt) {
                    return elt.name === null;
                })) {
                    return "plain_list";
                }
                else if (underscore_1.default.all(list, function (elt) {
                    return elt.name !== null;
                })) {
                    return "plain_object";
                }
                else
                    return "mixed_list";
            }
            var list = this.value.slice(1);
            switch (classify_list(list)) {
                case "plain_list":
                    return underscore_1.default.map(list, function (elt) {
                        return elt.value.json(resolver);
                    });
                case "plain_object":
                    return underscore_1.default.object(underscore_1.default.map(list, function (elt) {
                        return [elt.name, elt.value.json(resolver)];
                    }));
                case "mixed_list":
                    return list;
                default:
                    throw "Internal Error";
            }
        },
    }),
    tagged_lang: (0, make_basic_1.default)("tagged_lang", {
        json: function (resolver) {
            var pair_vec = underscore_1.default.map(this.value, function (elt) {
                return [elt.name, elt.value.json(resolver)];
            });
            return pair_vec;
        },
    }),
    vector_exp: (0, make_basic_1.default)("vector_exp"),
    int_array: (0, make_basic_1.default)("int_array", {
        json: function () {
            if (this.attributes &&
                this.attributes.type === "tagged_list" &&
                this.attributes.value[0].name === "levels" &&
                this.attributes.value[0].value.type === "string_array") {
                var levels = this.attributes.value[0].value.value;
                var arr = underscore_1.default.map(this.value, function (factor) {
                    return levels[factor - 1];
                });
                arr.levels = levels;
                return arr;
            }
            else {
                if (this.value.length === 1)
                    return this.value[0];
                else
                    return this.value;
            }
        },
    }),
    double_array: (0, make_basic_1.default)("double_array", {
        json: function () {
            if (this.value.length === 1 && underscore_1.default.isUndefined(this.attributes))
                return this.value[0];
            else
                return this.value;
        },
    }),
    string_array: (0, make_basic_1.default)("string_array", {
        json: function (resolver) {
            if (this.value.length === 1) {
                if (underscore_1.default.isUndefined(this.attributes))
                    return this.value[0];
                if (this.attributes.value[0].name === "class" &&
                    this.attributes.value[0].value.value.indexOf("javascript_function") !== -1)
                    return resolver && resolver(this.value[0]);
                return this.value;
            }
            else
                return this.value;
        },
    }),
    bool_array: (0, make_basic_1.default)("bool_array", {
        json: function () {
            if (this.value.length === 1 && underscore_1.default.isUndefined(this.attributes))
                return this.value[0];
            else
                return this.value;
        },
    }),
    raw: (0, make_basic_1.default)("raw", {
        json: function () {
            if (this.value.length === 1 && underscore_1.default.isUndefined(this.attributes))
                return this.value[0];
            else
                return this.value;
        },
    }),
    string: (0, make_basic_1.default)("string", {
        json: function () {
            return this.value;
        },
    }),
};
exports.default = Robj;
