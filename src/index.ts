import _ from "underscore";

import Rsrv from "./Rsrv";
import { EndianAwareDataView, my_ArrayBufferView } from "./endian";
import Robj from "./Robj";
import RserveError from "./error";
import { parse, parse_payload } from "./read";
import { determine_size, type_id, write_into_view } from "./write";
import { create, wrap_all_ocaps, wrap_ocap } from "./ocap";

interface Rserve {
  Robj?: typeof Robj;
  Rsrv?: typeof Rsrv;
  EndianAwareDataView?: typeof EndianAwareDataView;
  my_ArrayBufferView?: typeof my_ArrayBufferView;
  RserveError?: typeof RserveError;
  parse_websocket_frame?: typeof parse;
  parse_payload?: typeof parse_payload;
  type_id?: typeof type_id;
  determine_size?: typeof determine_size;
  write_into_view?: typeof write_into_view;
  create?: typeof create;
  wrap_all_ocaps?: typeof wrap_all_ocaps;
  wrap_ocap?: typeof wrap_ocap;
}

// const Rserve = (function () {
const Rserve: Rserve = {};
Rserve.Robj = Robj;

Rserve.Rsrv = Rsrv;

Rserve.parse_websocket_frame = parse;
Rserve.parse_payload = parse_payload;

Rserve.EndianAwareDataView = EndianAwareDataView;

Rserve.my_ArrayBufferView = my_ArrayBufferView;

// ocaps
Rserve.create = create;
Rserve.wrap_all_ocaps = wrap_all_ocaps;
Rserve.wrap_ocap = wrap_ocap;

Rserve.RserveError = RserveError;

Rserve.type_id = type_id;
Rserve.determine_size = determine_size;
Rserve.write_into_view = write_into_view;

//   this.Rserve = Rserve;
// })();

export default Rserve;
