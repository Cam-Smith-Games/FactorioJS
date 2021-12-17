import { FactoryObject, FactoryObjectArgs } from "./factoryobject.js";
import { ItemDetails } from "./item.js";

export enum SlotState {
    /* slot aint doin shit */
    IDLE = 0,
    /* slot is currently receiving an item, cannot send or receive anything right now */
    RECEIVING = 1,
    /* slot is currently sending an item, cannot send or receive anything right now */
    SENDING = 2
}

export interface FactorySlotArgs extends FactoryObjectArgs {
    item?:ItemDetails;
}

export abstract class FactorySlot extends FactoryObject {
    
    item:ItemDetails;
    state:SlotState;

    constructor(args:FactorySlotArgs) {
        super(args);
        this.item = args.item;
        this.state = SlotState.IDLE;
    }

}