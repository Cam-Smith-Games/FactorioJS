export {};
/*
export interface LinkedObjectArgs<T, P = T, N = T> {
    prev?: LinkedObject<P, any, T>;
    next?: LinkedObject<N, T, any>;
    double?:boolean;
}
/** GameObject that is doubly linked to next/prev GameObjects of specified Type
 * Type T = class that instance has to be
 * Type P = type that previous sibling has to be (defaults to T)
 * Type N = type that next sibling has to be (defaults to T)
*
export class LinkedObject<T = any, P = T, N = T>  {

    /** instance of class T that this class is wrapped around *
    instance: T;

    prev: LinkedObject<P, any, T>;
    next: LinkedObject<N, T, any>;

     /** if true, will doubly link nodes upon linking *
    double:boolean;

    constructor(instance: T, args:LinkedObjectArgs<T, P, N>) {
        this.instance = instance;
        this.prev = args.prev;
        this.next = args.next;

        this.double = args.double ?? false;
    }
    
    linkNext(next:LinkedObject<N, any, any>) {
        this.next = next;

        // if doubly linked, linked next back to this
        if (this.next && this.double) {
            this.next.prev = this;
        }
    }

    linkPrev(prev:LinkedObject<P, any, any>) {
        this.prev = prev;

        // if doubly linked, linked next back to this
        if (this.prev && this.double) {
            this.prev.next = this;
        }
    }


    unlinkPrev(prev:LinkedObject<P,any,any>) {
        if (this.prev == prev) this.prev = null;
    }
    unlinkNext(next:LinkedObject) {
        if (this.next == next) this.next = null;
    }


}
*/
//# sourceMappingURL=linkedobject.js.map