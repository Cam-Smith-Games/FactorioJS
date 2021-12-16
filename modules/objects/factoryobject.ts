import { GameObject, GameObjectArgs } from "../engine/gameobject.js";
import { LinkedObject, LinkedObjectArgs } from "../engine/linkedobject.js";



export interface FactoryObjectArgs<T extends FactoryObject<any>> extends GameObjectArgs<T> {
    priority?:number;
    offTheGrid?:boolean;
}
/** Any object within a Factory that can retrieve, store, and send items from/to another object within the Factory */
export abstract class FactoryObject<T extends FactoryObject<any>> extends GameObject<FactoryObject<any>> { 

    /** incremented everytime a new object is created. used to keep IDs unique */
    static NEXT_ID = 0;
    /** unique identifier for this object (for debugging) */
    id:number;

    /** Determines order within main Factory update loop. For example, inserters need to be updated before conveyor belts so that they can grab an item before the next conveyor belt takes it.*/
    priority:number;

    constructor(args:FactoryObjectArgs<T>) {
        super(args);
        this.id = ++FactoryObject.NEXT_ID;
        this.priority = args.priority ?? 99;
    }

}



/**
 * Type T = class that instance has to be
 * Type P = type that previous sibling has to be (defaults to T)
 * Type N = type that next sibling has to be (defaults to T)
 */
 export interface LinkedFactoryObjectArgs<
    T extends FactoryObject<any>,
    P extends FactoryObject<any> = T, 
    N extends FactoryObject<any> = T,
    C extends FactoryObject<any> = T
> extends LinkedObjectArgs<T,P,N>, FactoryObjectArgs<C> {}

 export abstract class LinkedFactoryObject<
    T extends FactoryObject<any> = FactoryObject<any>,
    P extends FactoryObject<any> = T, 
    N extends FactoryObject<any> = T, 
    C extends FactoryObject<any> = T
> extends FactoryObject<C> {
     
     link:LinkedObject<T, P, N>;
  
     constructor(args:LinkedFactoryObjectArgs<T,P,N,C>) {
         super(args);
         this.link = new LinkedObject<any, P, N> (this, args);
     }


    /** adds item to position grid for linking later on */
    add(delegate: (node:LinkedFactoryObject) => void) {
        delegate(this);
    }
    

    /** finds next object and links to it */
    find(delegate: (node:LinkedFactoryObject) => LinkedFactoryObject) {
        let next = delegate(this);
        this.link.linkNext(next?.link);
    }


    
    
    /** method for resetting an object prior to factory calculation 
     * @example before adding belts to grid, their slot angles get reset to belt angle so that the belts can determine their orientation correctly */
    reset() {
        this.link.prev = null;
        this.link.next = null;
    }

    /** optional overridable method for fixing an object after calculation
     * @example after calculating all belt slots, corners will not be linked appropriately. a second pass will fix the corners */
    correct() {}


     // optional function that can get extended by sub-classes to perform useful debug logs
     debug() { 
        console.log(`[FactoryObject ${this.id}]: `, {
            prev: this.link?.prev?.instance,
            next: this.link?.next?.instance
        });
     }

 }
 