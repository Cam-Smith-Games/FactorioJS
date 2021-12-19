import { TILE_SIZE } from "../const.js";
import { FactoryObject } from "./factoryobject.js";
import { ItemObject } from "./item.js";
class ContainerSlot {
}
/** object that can contain items
 * @todo this will be abstract, different size chests will implement it
*/
export class ItemContainer extends FactoryObject {
    constructor(args) {
        var _a;
        args.size = { x: TILE_SIZE, y: TILE_SIZE };
        super(args);
        this.factory = args.factory;
        this.numSlots = (_a = args.numSlots) !== null && _a !== void 0 ? _a : 10;
        this.slots = [];
        for (let i = 0; i < this.numSlots; i++) {
            this.slots.push(new ContainerSlot());
        }
    }
    addToFactory(factory) {
        factory.containers.push(this);
        factory.objects.push(this);
    }
    // TODO: retrieve will probably pass a quantity since stack inserts will be able to grab multiple at a time
    retrieve() {
        for (let slot of this.slots) {
            if (slot.item && slot.quantity > 0) {
                let obj = new ItemObject({
                    pos: { x: this.pos.x, y: this.pos.y },
                    item: slot.item,
                    factory: this.factory
                });
                if (--slot.quantity <= 0) {
                    slot.item = null;
                    slot.quantity = 0;
                }
                return obj;
            }
        }
        return null;
    }
    /** this is the same as IInsertable.insert except it takes an ItemDetails instead of a physical ItemObject */
    addItem(item) {
        // pass 1: check for slots that already contain this item and can fit more quantity
        for (let slot of this.slots) {
            if (slot.item == item && slot.quantity < slot.item.stackSize) {
                slot.quantity++;
                return true;
            }
        }
        // pass 2: look for first empty slot 
        for (let slot of this.slots) {
            if (!slot.item) {
                slot.item = item;
                slot.quantity = 1;
                return true;
            }
        }
        return false;
    }
    insert(item) {
        // pass 1: check for slots that already contain this item and can fit more quantity
        for (let slot of this.slots) {
            if (slot.item == item.item && slot.quantity < slot.item.stackSize) {
                slot.quantity++;
                this.factory.removeItem(item);
                this.factory.removeObject(item);
                return true;
            }
        }
        // pass 2: look for first empty slot 
        for (let slot of this.slots) {
            if (!slot.item) {
                slot.item = item.item;
                slot.quantity = 1;
                this.factory.removeItem(item);
                this.factory.removeObject(item);
                return true;
            }
        }
        return false;
    }
    render(ctx) {
        ctx.drawImage(ItemContainer.sheet, 160, 192, 32, 32, this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
}
//# sourceMappingURL=container.js.map