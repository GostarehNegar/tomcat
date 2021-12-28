
export type KnownExceptions = 'internet' | 'proxy' | 'unexpected';
export class Exception {
    //public readonly type:KnownExceptions;
    constructor(
        public readonly type: KnownExceptions,
        public message: string,
        public data: unknown = null) {
    }
    public static Throw(type: KnownExceptions, message: string, data: unknown = null) {
        throw new Exception(type, message, data);
    }
    public static create(type: KnownExceptions, message: string, data: unknown = null) {
        return new Exception(type, message, data);
    }

}