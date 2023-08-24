import Robj from "./Robj";
import Rsrv from "./Rsrv";
declare class Rserve {
    Rsrv: typeof Rsrv;
    Robj: typeof Robj;
    constructor();
}
export default Rserve;
