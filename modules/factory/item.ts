import { SLOT_SIZE } from "../const.js";
import { lerp } from "../util/math.js";
import { BeltSlot } from "./belt.js";
import { FactoryObject, FactoryObjectParams } from "./factoryobject.js";
import { IInsertable } from "./inserter.js";

export class ItemDetails {
    image: HTMLImageElement;
    name: string;

    constructor(name:string, image:HTMLImageElement) {
        this.name = name;
        this.image = image;
    }
}

/** @todo recipes will be attached to assemblers for determining what they input/output. probably going to hard-code a big static dictionary of recipes */
export interface IRecipe {
    inputs:ItemDetails[];
    outputs:ItemDetails[];
    duration:number;
}


// #region item object
export interface ItemObjectParams extends FactoryObjectParams {
    item: ItemDetails;
    slot?: BeltSlot;
}
/** physical object that contains an item detail */
export class ItemObject extends FactoryObject {

    item: ItemDetails;

    constructor(params:ItemObjectParams) {
        params.size = { x: SLOT_SIZE, y: SLOT_SIZE };
        super(params);
        this.item = params.item;
    }

    /*update(deltaTime: number): void {
        if (this.slot && this.progress < 1) {
            this.progress = Math.min(1, this.progress + (deltaTime * this.slot.node.speed / 2));

            if (this.slot.next) {
                this.pos.x = lerp(this.slot.pos.x, this.slot.next.pos.x, this.progress);
                this.pos.y = lerp(this.slot.pos.y, this.slot.next.pos.y, this.progress);
            }
            else if (this.slot) {
                this.pos = this.slot.pos;
                this.pos = this.pos;
            } 
        }

        // done moving -> pass to next slot
        if (this.progress >= 1 && this.slot.next && !this.slot.next.item) {
            this.slot.item = null;
            this.slot.next.item = this;
            this.progress = 0;

            this.slot = this.slot.next;
        }

    }*/

    render(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.item.image, this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
}
// #endregion


// #region item mover
export interface ItemMoverParams extends FactoryObjectParams {
    speed?:number;
}
/** these objects move items to their next location */
export abstract class ItemMoverObject extends FactoryObject implements IInsertable {
    /** current item being moved */
    item:ItemObject;
    /** determines speed that objects are moved  */
    speed:number;
    /** current move progress (0 to 1) */
    progress:number;
    /** item to move towards and insert upon progress completion */
    next:IInsertable;

    constructor(params:ItemMoverParams) {
        super(params);
        this.speed = params.speed ?? 1;
        this.progress = 0;
    }

    retrieve() {
        // NOTE: once progress > 50% (closer to destination than source), can no longer send item
        //       the item will look like it belongs to the next slot, when in reality its still in this slot, so it shouldn't be retrievable
        if (this.item && this.progress < 0.5) {
            let item = this.item;
            this.item = null;
            this.progress = 0;
            return item;
        }
        return null;
    }
    
    insert(item:ItemObject) {
        // only accepting item if theres a next destination
        if (!this.item) {
            this.item = item;
            this.item.pos.x = this.pos.x;
            this.item.pos.y = this.pos.y;
            this.progress = 0;
            return true;
        }
        return false;
    }

    /** moves item from point A to point B
     * @note this can be overriden (inserters move along an arc, while defualt is a straight path)
     */
    moveItem() {
        if (this.item) {
            this.item.pos.x = lerp(this.pos.x, this.next.pos.x, this.progress);
            this.item.pos.y = lerp(this.pos.y, this.next.pos.y, this.progress);                
        }
    }


    update(deltaTime:number) {
        if (this.item) {    
 
            if (this.next) {        
                this.progress = Math.min(1, this.progress + (deltaTime * this.speed));
                this.moveItem();
                
                if (this.progress >= 1 && this.next.insert(this.item)) {
                    // reset item's z-index (insert arm sets z-index so the item appears above everything else)
                    this.item.pos.z = undefined;
                    this.item = null;
                    this.progress = 0;
                }
            }     
            else {
                this.progress = 0;
                this.item.pos.x = this.pos.x;
                this.item.pos.y = this.pos.y;
            }
        }        
    }

}
// #endreigon
