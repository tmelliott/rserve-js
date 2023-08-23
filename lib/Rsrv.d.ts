declare const Rsrv: {
    PAR_TYPE: (x: number) => number;
    PAR_LEN: (x: number) => number;
    PAR_LENGTH: (x: number) => number;
    par_parse: (x: number) => number[];
    SET_PAR: (ty: number, len: number) => number;
    CMD_STAT: (x: number) => number;
    SET_STAT: (x: number, s: number) => number;
    IS_OOB_SEND: (x: number) => boolean;
    IS_OOB_MSG: (x: number) => boolean;
    OOB_USR_CODE: (x: number) => number;
    CMD_RESP: number;
    RESP_OK: number;
    RESP_ERR: number;
    OOB_SEND: number;
    OOB_MSG: number;
    ERR_auth_failed: number;
    ERR_conn_broken: number;
    ERR_inv_cmd: number;
    ERR_inv_par: number;
    ERR_Rerror: number;
    ERR_IOerror: number;
    ERR_notOpen: number;
    ERR_accessDenied: number;
    ERR_unsupportedCmd: number;
    ERR_unknownCmd: number;
    ERR_data_overflow: number;
    ERR_object_too_big: number;
    ERR_out_of_mem: number;
    ERR_ctrl_closed: number;
    ERR_session_busy: number;
    ERR_detach_failed: number;
    ERR_disabled: number;
    ERR_unavailable: number;
    ERR_cryptError: number;
    ERR_securityClose: number;
    CMD_login: number;
    CMD_voidEval: number;
    CMD_eval: number;
    CMD_shutdown: number;
    CMD_switch: number;
    CMD_keyReq: number;
    CMD_secLogin: number;
    CMD_OCcall: number;
    CMD_openFile: number;
    CMD_createFile: number;
    CMD_closeFile: number;
    CMD_readFile: number;
    CMD_writeFile: number;
    CMD_removeFile: number;
    CMD_setSEXP: number;
    CMD_assignSEXP: number;
    CMD_detachSession: number;
    CMD_detachedVoidEval: number;
    CMD_attachSession: number;
    CMD_ctrl: number;
    CMD_ctrlEval: number;
    CMD_ctrlSource: number;
    CMD_ctrlShutdown: number;
    CMD_setBufferSize: number;
    CMD_setEncoding: number;
    CMD_SPECIAL_MASK: number;
    CMD_serEval: number;
    CMD_serAssign: number;
    CMD_serEEval: number;
    DT_INT: number;
    DT_CHAR: number;
    DT_DOUBLE: number;
    DT_STRING: number;
    DT_BYTESTREAM: number;
    DT_SEXP: number;
    DT_ARRAY: number;
    DT_LARGE: number;
    XT_NULL: number;
    XT_INT: number;
    XT_DOUBLE: number;
    XT_STR: number;
    XT_LANG: number;
    XT_SYM: number;
    XT_BOOL: number;
    XT_S4: number;
    XT_VECTOR: number;
    XT_LIST: number;
    XT_CLOS: number;
    XT_SYMNAME: number;
    XT_LIST_NOTAG: number;
    XT_LIST_TAG: number;
    XT_LANG_NOTAG: number;
    XT_LANG_TAG: number;
    XT_VECTOR_EXP: number;
    XT_VECTOR_STR: number;
    XT_ARRAY_INT: number;
    XT_ARRAY_DOUBLE: number;
    XT_ARRAY_STR: number;
    XT_ARRAY_BOOL_UA: number;
    XT_ARRAY_BOOL: number;
    XT_RAW: number;
    XT_ARRAY_CPLX: number;
    XT_UNKNOWN: number;
    XT_LARGE: number;
    XT_HAS_ATTR: number;
    BOOL_TRUE: number;
    BOOL_FALSE: number;
    BOOL_NA: number;
    GET_XT: (x: number) => number;
    GET_DT: (x: number) => number;
    HAS_ATTR: (x: number) => boolean;
    IS_LARGE: (x: number) => boolean;
    status_codes: {
        65: string;
        66: string;
        67: string;
        68: string;
        69: string;
        70: string;
        71: string;
        72: string;
        73: string;
        74: string;
        75: string;
        76: string;
        77: string;
        78: string;
        80: string;
        81: string;
        97: string;
        98: string;
        99: string;
        100: string;
    };
};
export default Rsrv;
