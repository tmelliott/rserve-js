import Robj from "./Robj";
import Rsrv from "./Rsrv";
import make_basic from "./make_basic";

class Rserve {
  Rsrv: typeof Rsrv;
  Robj: typeof Robj;

  constructor() {
    this.Rsrv = Rsrv;
    this.Robj = Robj;
  }

  make_basic = make_basic;
}

export default Rserve;
