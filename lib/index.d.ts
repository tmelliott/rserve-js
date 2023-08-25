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
declare const Rserve: Rserve;
export default Rserve;
