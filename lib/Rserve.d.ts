import Robj from "./Robj";
import Rsrv from "./Rsrv";
declare class Rserve {
    Rsrv: typeof Rsrv;
    Robj: typeof Robj;
    constructor();
    make_basic: (type: string, proto?: {
        json: (resolver?: ((value: any) => void) | undefined) => any;
        type?: string | undefined;
        value?: any;
        attributes?: any;
    } | undefined) => (v: any, attrs: any) => {
        type: string;
        value: any;
        attributes: any;
    };
}
export default Rserve;
