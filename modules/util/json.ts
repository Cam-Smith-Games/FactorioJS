
export interface ISerializable<T> {
    /** constructor should take the same params that getParams() returns */
    new (args:T): ISerializable<T>;
    /** returns params for recreating this object from JSON */
    getParams():T;
}