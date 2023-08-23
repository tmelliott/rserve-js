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
    vector: (v: any, attrs: any) => {
        type: string;
        value: any;
        attributes: any;
    };
    symbol: (v: any, attrs: any) => {
        type: string;
        value: any;
        attributes: any;
    };
    list: (v: any, attrs: any) => {
        type: string;
        value: any;
        attributes: any;
    };
    lang: (v: any, attrs: any) => {
        type: string;
        value: any;
        attributes: any;
    };
    tagged_list: (v: any, attrs: any) => {
        type: string;
        value: any;
        attributes: any;
    };
    tagged_lang: (v: any, attrs: any) => {
        type: string;
        value: any;
        attributes: any;
    };
    vector_exp: (v: any, attrs: any) => {
        type: string;
        value: any;
        attributes: any;
    };
    int_array: (v: any, attrs: any) => {
        type: string;
        value: any;
        attributes: any;
    };
    double_array: (v: any, attrs: any) => {
        type: string;
        value: any;
        attributes: any;
    };
    string_array: (v: any, attrs: any) => {
        type: string;
        value: any;
        attributes: any;
    };
    bool_array: (v: any, attrs: any) => {
        type: string;
        value: any;
        attributes: any;
    };
    raw: (v: any, attrs: any) => {
        type: string;
        value: any;
        attributes: any;
    };
    string: (v: any, attrs: any) => {
        type: string;
        value: any;
        attributes: any;
    };
};
export default Robj;
