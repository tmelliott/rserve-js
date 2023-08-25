interface RserveError extends Error {
  status_code: number;
}

const RserveError = function (
  this: RserveError,
  message: string,
  status_code?: number
) {
  this.name = "RserveError";
  this.message = message;
  this.status_code = status_code || 0;
};

RserveError.prototype = Object.create(Error);
RserveError.prototype.constructor = RserveError;

export default RserveError;
