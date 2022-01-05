
export type KnownExceptions = 'internet' | 'proxy' | 'unexpected' | 'unkown';
export class Exception implements Error {
    //public readonly type:KnownExceptions;
    public name: string
    constructor(
        public message: string,
        public category?: KnownExceptions,
        public _name?: string,
        public data: unknown = null) {
        this.name = category || _name;

    }
    public static Throw_Deprecated(type: KnownExceptions, message: string, data: unknown = null) {
        throw new Exception(message, type, "", data);
    }
    public static Throw(message: string, category: KnownExceptions = 'unexpected', name: string = null, data: unknown = null) {
        throw new Exception(message, category, name, data);
    }
    public static create(type: KnownExceptions, message: string, data: unknown = null) {
        return new Exception(message, type, "", data);
    }

}