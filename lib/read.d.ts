declare function parse(msg: any): any;
declare function parse_payload(msg: any): {
    type: string;
    value: any;
} | null;
export { parse, parse_payload };
