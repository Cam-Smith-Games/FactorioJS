import { SLOT_SIZE } from "../../const.js";
import { IFactory } from "../factory.js";
import { FactoryObject, FactoryObjectParams } from "../objects/object.js";
import { ItemDetails } from "./detail.js";
import { ItemMoverObject } from "./mover.js";

export interface ItemObjectParams extends FactoryObjectParams {
    parent:ItemMoverObject;
    item: number;
}
/** physical object that contains an item detail */
export class ItemObject extends FactoryObject {

    parent:ItemMoverObject;
    item: ItemDetails;

    constructor(params:ItemObjectParams) {
        params.size = { x: SLOT_SIZE, y: SLOT_SIZE };
        super(params);
        this.item = ItemDetails.items[params.item];
        this.parent = params.parent;
    }

    save() {
        let prm = <ItemObjectParams>super.save();
        prm.item = this.item.id;
        return prm;
    }

    addToFactory(factory: IFactory): void {
        factory.items.push(this);
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.item.image, this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
}