import { SLOT_SIZE } from "../../const.js";
import { FactoryObject } from "../objects/object.js";
import { ItemDetails } from "./detail.js";
/** physical object that contains an item detail */
export class ItemObject extends FactoryObject {
    constructor(params) {
        params.size = { x: SLOT_SIZE, y: SLOT_SIZE };
        super(params);
        this.item = ItemDetails.items[params.item];
        this.parent = params.parent;
    }
    save() {
        let prm = super.save();
        prm.item = this.item.id;
        return prm;
    }
    addToFactory(factory) {
        factory.items.push(this);
    }
    render(ctx) {
        ctx.drawImage(this.item.image, this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
}
//# sourceMappingURL=object.js.map