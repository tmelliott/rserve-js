type Proto = {
    json: (resolver?: (value: any) => void) => any;
    type?: string;
    value?: any;
    attributes?: any;
};
declare const make_basic: (type: string, proto?: Proto) => (v: any, attrs: any) => {
    type: string;
    value: any;
    attributes: any;
};
export default make_basic;
