import { TILE_SIZE } from "../const.js";
import { IFactory } from "./factory.js";
import { FactoryObject, FactoryObjectParams } from "./factoryobject.js";
import { IInsertable } from "./inserter.js";
import { ItemDetails, ItemObject } from "./item.js";

export interface IContainerSlot {
    item: ItemDetails,
    quantity: number
}
export interface IContainer {
    slots: IContainerSlot[];
    numSlots: number;
}


export interface ItemContainerParams extends FactoryObjectParams {
    numSlots?: number;
}

class ContainerSlot implements IContainerSlot {
    item: ItemDetails;
    quantity: number;
}

/** object that can contain items 
 * @todo this will be abstract, different size chests will implement it
*/
export class ItemContainer extends FactoryObject implements IContainer, IInsertable {

    protected addToFactory(factory: IFactory): void {
        factory.containers.push(this);
        factory.objects.push(this);
    }

    static sheet:HTMLImageElement;

    numSlots: number;
    slots: IContainerSlot[];

    private factory:IFactory;

    constructor(args:ItemContainerParams) {
        args.size = { x: TILE_SIZE, y: TILE_SIZE };
        super(args);

        this.factory = args.factory;
        this.numSlots = args.numSlots ?? 10;

        this.slots = [];
        for (let i=0; i < this.numSlots; i++) {
            this.slots.push(new ContainerSlot());
        }
    }

    // TODO: retrieve will probably pass a quantity since stack inserts will be able to grab multiple at a time
    retrieve(): ItemObject {
        for(let slot of this.slots) {
            if(slot.item && slot.quantity > 0) {


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
    addItem(item: ItemDetails): boolean {
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


    insert(item: ItemObject): boolean {
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

    render(ctx:CanvasRenderingContext2D) {
        ctx.drawImage(ItemContainer.sheet,
             160, 192, 32, 32,
             this.pos.x, this.pos.y, this.size.x, this.size.y
        )
    }


}