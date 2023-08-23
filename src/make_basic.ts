import _ from "underscore";

type Proto = {
  // 'json' is a function that takes an optional resolver function and returns the value
  json: (resolver?: (value: any) => void) => any;
  type?: string;
  value?: any;
  attributes?: any;
};

class RObject {
  type: string;
  value: any;
  attributes: any;

  constructor(type: string, value: any, attributes: any) {
    this.type = type;
    this.value = value;
    this.attributes = attributes;
  }
}

const make_basic = (type: string, proto?: Proto) => {
  proto = proto || {
    json: function () {
      throw new Error("json() unsupported for type " + this.type);
    },
  };

  const wrapped_proto: Proto = {
    json: function (resolver) {
      const result = proto?.json.call(this, resolver);
      result.r_type = type;
      if (!_.isUndefined(this.attributes))
        result.attributes = _.object(
          _.map(this.attributes.value, function (v) {
            return [v.name, v.value.json(resolver)];
          })
        );
      return result;
    },
  };

  return function (v: any, attrs: any) {
    class RObjectImpl extends RObject {
      constructor() {
        super(type, v, attrs);
      }
    }
    Object.setPrototypeOf(RObjectImpl.prototype, wrapped_proto);

    return new RObjectImpl();
  };
};

export default make_basic;
