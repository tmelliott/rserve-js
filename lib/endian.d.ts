type DataViewMethods = {
    setInt8: (i: number, v: number) => void;
    setUint8: (i: number, v: number) => void;
    getInt8: (i: number) => number;
    getUint8: (i: number) => number;
    [key: string]: (byteOffset: number, value?: any) => any;
};
declare const EndianAwareDataView: {
    (this: {
        view: DataView;
    }, buffer: ArrayBuffer, byteOffset?: number, byteLength?: number): void;
    prototype: DataViewMethods;
};
declare const my_ArrayBufferView: (b: any, o?: any, l?: any) => {
    buffer: any;
    offset: any;
    length: any;
    data_view: () => any;
    make: (ctor: any, new_offset: any, new_length: any) => any;
    skip: (offset: any) => any;
    view: (new_offset: any, new_length: any) => any;
};
export { EndianAwareDataView, my_ArrayBufferView };
