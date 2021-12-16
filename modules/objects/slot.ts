import { LinkedFactoryObject, LinkedFactoryObjectArgs } from "./factoryobject.js";
import { ItemDetails } from "./item.js";

export enum SlotState {
    /* slot aint doin shit */
    IDLE = 0,
    /* slot is currently receiving an item, cannot send or receive anything right now */
    RECEIVING = 1,
    /* slot is currently sending an item, cannot send or receive anything right now */
    SENDING = 2
}

export interface FactorySlotArgs<T extends FactorySlot<any> = FactorySlot<any>> extends LinkedFactoryObjectArgs<T> {
    item?:ItemDetails;
}

export abstract class FactorySlot<T extends FactorySlot<any> = FactorySlot<any>> extends LinkedFactoryObject<T> {
    
    item:ItemDetails;
    state:SlotState;

    constructor(args:FactorySlotArgs<T>) {
        super(args);
        this.item = args.item;
        this.state = SlotState.IDLE;
    }

     

}