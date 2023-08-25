import _ from "underscore";

const _is_little_endian = (function () {
  var x = new ArrayBuffer(4);
  var bytes = new Uint8Array(x),
    words = new Uint32Array(x);
  bytes[0] = 1;
  if (words[0] === 1) {
    return true;
  } else if (words[0] === 16777216) {
    return false;
  } else {
    throw "we're bizarro endian, refusing to continue";
  }
})();

type DataViewMethods = {
  setInt8: (i: number, v: number) => void;
  setUint8: (i: number, v: number) => void;
  getInt8: (i: number) => number;
  getUint8: (i: number) => number;
  [key: string]: (byteOffset: number, value?: any) => any; // for dynamically added methods
};

type EndianAwareDataViewThis = {
  view: DataView;
};

const EndianAwareDataView = (function () {
  const proto: DataViewMethods = {
    setInt8: function (this: EndianAwareDataViewThis, i, v) {
      return this.view.setInt8(i, v);
    },
    setUint8: function (this: EndianAwareDataViewThis, i, v) {
      return this.view.setUint8(i, v);
    },
    getInt8: function (this: EndianAwareDataViewThis, i) {
      return this.view.getInt8(i);
    },
    getUint8: function (this: EndianAwareDataViewThis, i) {
      return this.view.getUint8(i);
    },
  };

  const setters = [
    "setInt32",
    "setInt16",
    "setUint32",
    "setUint16",
    "setFloat32",
    "setFloat64",
  ];
  const getters = [
    "getInt32",
    "getInt16",
    "getUint32",
    "getUint16",
    "getFloat32",
    "getFloat64",
  ];

  for (let i = 0; i < setters.length; ++i) {
    const name = setters[i];
    proto[name] = function (byteOffset, value) {
      return this.view[name](byteOffset, value, _is_little_endian);
    };
  }
  for (let i = 0; i < getters.length; ++i) {
    const name = getters[i];
    proto[name] = function (byteOffset) {
      return this.view[name](byteOffset, _is_little_endian);
    };
  }

  function my_dataView(
    this: { view: DataView },
    buffer: ArrayBuffer,
    byteOffset?: number,
    byteLength?: number
  ) {
    if (byteOffset === undefined) {
      // work around node.js bug https://github.com/joyent/node/issues/6051
      if (buffer.byteLength === 0) {
        this.view = {
          byteLength: 0,
          byteOffset: 0,
        } as any;
      } else this.view = new DataView(buffer);
    } else {
      this.view = new DataView(buffer, byteOffset, byteLength);
    }
  }
  my_dataView.prototype = proto;
  return my_dataView;
})();

const my_ArrayBufferView = function (b, o?: any, l?: any) {
  o = _.isUndefined(o) ? 0 : o;
  l = _.isUndefined(l) ? b.byteLength : l;
  return {
    buffer: b,
    offset: o,
    length: l,
    data_view: function () {
      return new EndianAwareDataView(
        this.buffer,
        this.offset,
        this.buffer.byteLength - this.offset
      );
    },
    make: function (ctor, new_offset, new_length) {
      new_offset = _.isUndefined(new_offset) ? 0 : new_offset;
      new_length = _.isUndefined(new_length) ? this.length : new_length;
      var element_size = ctor.BYTES_PER_ELEMENT || 1;
      var n_els = new_length / element_size;
      if ((this.offset + new_offset) % element_size != 0) {
        var view = new DataView(
          this.buffer,
          this.offset + new_offset,
          new_length
        );
        var output_buffer = new ArrayBuffer(new_length);
        var out_view = new DataView(output_buffer);
        for (var i = 0; i < new_length; ++i) {
          out_view.setUint8(i, view.getUint8(i));
        }
        return new ctor(output_buffer);
      } else {
        return new ctor(this.buffer, this.offset + new_offset, n_els);
      }
    },
    skip: function (offset) {
      return my_ArrayBufferView(
        this.buffer,
        this.offset + offset,
        this.buffer.byteLength
      );
    },
    view: function (new_offset, new_length) {
      var ofs = this.offset + new_offset;
      if (ofs + new_length > this.buffer.byteLength)
        throw new Error(
          "Rserve.my_ArrayBufferView.view: bounds error: size: " +
            this.buffer.byteLength +
            " offset: " +
            ofs +
            " length: " +
            new_length
        );
      return my_ArrayBufferView(this.buffer, ofs, new_length);
    },
  };
};

export { EndianAwareDataView, my_ArrayBufferView };
