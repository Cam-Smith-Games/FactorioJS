import { FactoryObject } from "./factoryobject.js";
import { IInsertable } from "./inserter.js";
import { IRecipe, ItemDetails, ItemObject } from "./item.js";

export interface IContainerSlot {
    item: ItemDetails,
    quantity: number
}
export interface IContainer {
    slots: IContainerSlot[];
    numSlots: number;
}
export class Assembler extends FactoryObject implements IContainer, IInsertable {
    retrieve(): ItemObject {
        throw new Error("Method not implemented.");
    }
    // @ts-ignore
    insert(item: ItemObject): boolean {
        throw new Error("Method not implemented.");
    }

    slots: IContainerSlot[];
    numSlots: number;
    recipe:IRecipe;
    /** multiplier that gets applied to selected recipe duration for determining how long a single craft takes */
    speed:number;
    /** number between 0 (speed*recipe.duration) */
    progress:number;


}

