declare const Robj: {
    null: (attributes: any) => {
        type: string;
        value: null;
        attributes: any;
        json: () => null;
    };
    clos: (formals: any, body: any, attributes: any) => {
        type: string;
        value: {
            formals: any;
            body: any;
        };
        attributes: any;
        json: () => never;
    };
    vector: (v: any, attrs: any) => any;
    symbol: (v: any, attrs: any) => any;
    list: (v: any, attrs: any) => any;
    lang: (v: any, attrs: any) => any;
    tagged_list: (v: any, attrs: any) => any;
    tagged_lang: (v: any, attrs: any) => any;
    vector_exp: (v: any, attrs: any) => any;
    int_array: (v: any, attrs: any) => any;
    double_array: (v: any, attrs: any) => any;
    string_array: (v: any, attrs: any) => any;
    bool_array: (v: any, attrs: any) => any;
    raw: (v: any, attrs: any) => any;
    string: (v: any, attrs: any) => any;
};
export default Robj;
