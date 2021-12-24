import { lerp } from "../../util/math.js";
import { FactoryObject, FactoryObjectParams } from "../object.js";
import { IInsertable } from "../inserter.js";
import { ItemObject } from "./object.js";

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

    /** when another ItemMover starts moving an item to this object, it reserves this spot so another object doesn't start moving here at the same time */
    reserved:ItemMoverObject;

    constructor(params:ItemMoverParams) {
        super(params);
        this.speed = params.speed ?? 1;
        this.progress = 0;
    }

    /** returns an ItemObject if it could be successfully retrieved */
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


    reserve(source: ItemMoverObject) {
        // can only reserve empty slots
        if (this.item) return false;

        if (!this.reserved) {
            this.reserved = source;
            return true;
        }      
        return this.reserved == source;     
    }
    
    /** returns true if item was successfully inserted */
    insert(source:ItemMoverObject) {
        if (!this.item && source == this.reserved) {
            this.reserved = null;
            this.item = source.item;
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
            this.item.pos.x = this.next ? lerp(this.pos.x, this.next.pos.x, this.progress) : this.pos.x;
            this.item.pos.y = this.next ? lerp(this.pos.y, this.next.pos.y, this.progress) : this.pos.y;                
        }
    }

    /** optional function to call when item is done moving */
    onMove() {}

    update(deltaTime:number) {
        if (this.item) {    
 
            if (this.next && this.next.reserve(this)) {        
                this.progress = Math.min(1, this.progress + (deltaTime * this.speed));
                this.moveItem();
                
                if (this.progress >= 1 && this.next.insert(this)) {
                    // reset item's z-index (insert arm sets z-index so the item appears above everything else)
                    this.item.pos.z = undefined;
                    this.item = null;
                    this.progress = 0;
                    this.onMove();
                }
            }     
            else {
                this.progress = 0;
                this.moveItem();
                //this.item.pos.x = this.pos.x;
                //this.item.pos.y = this.pos.y;
            }
        }        
    }

}