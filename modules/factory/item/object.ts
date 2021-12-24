import { SLOT_SIZE } from "../../const.js";
import { IFactory } from "../factory.js";
import { FactoryObject, FactoryObjectParams } from "../objects/object.js";
import { ItemDetails } from "./detail.js";

export interface ItemObjectParams extends FactoryObjectParams {
    item: ItemDetails;
}
/** physical object that contains an item detail */
export class ItemObject extends FactoryObject {


    addToFactory(factory: IFactory): void {
        factory.items.push(this);
        factory.objects.push(this);
    }

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