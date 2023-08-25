interface RserveError extends Error {
    status_code: number;
}
declare const RserveError: {
    (this: RserveError, message: string, status_code?: number): void;
    prototype: any;
};
export default RserveError;
