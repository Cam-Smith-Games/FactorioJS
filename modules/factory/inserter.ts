import { SLOT_SIZE } from "../const.js";
import { IPoint } from "../struct/point.js";
import { IFactory } from "./factory.js";
import { FactoryObject, FactoryObjectParams } from "./factoryobject.js";
import { ItemMoverObject, ItemObject } from "./item.js";


export interface IInsertable extends FactoryObject {
    /** returns an item if it any be pulled from this object */
    retrieve():ItemObject;
    /** returns true if item was successfully insertered into this object */
    insert(item:ItemObject):boolean;
}

export interface InserterParams extends FactoryObjectParams {
    range?:number;
    speed?:number;
}

export enum InserterSpeeds {
    NORMAL = 1,
    FAST = 2,
    SUPER = 4
}

export class Inserter extends ItemMoverObject {
    
    // different image for each speed
    static arrows = new Map<InserterSpeeds, HTMLImageElement>([
        [InserterSpeeds.NORMAL, null],
        [InserterSpeeds.FAST, null],
        [InserterSpeeds.SUPER, null]
    ]);

    input:IInsertable;

    /** range in slot size (not tile size) that this inserter can reach for grabbing/inserting items. defaults to 2 beacuse tile size is 2x2 slot size  */
    range:number;

    item:ItemObject;


    constructor(params:InserterParams) {
        params.size = { x: SLOT_SIZE, y: SLOT_SIZE };
        super(params);

        this.range = params.range ?? 2;
        this.speed = params.speed ?? InserterSpeeds.NORMAL;
        this.item = null;
    }


    getSource() {
        return this.input ? this.input.pos : this.pos;
    }

    /** attempts to find belt slot at specified position */
    findBeltSlot(p:IPoint, fac:IFactory) {
        for (let belt of fac.belts) {
            for (let slot of belt.slots) {
                if (slot.pos.x == p.x && slot.pos.y == p.y) {
                    return slot;
                }
            }     
        }
        return null;
    }

    /** attempts to find assembler at specified position */
    findAssembler(p:IPoint, fac:IFactory) {
        for (let a of fac.assemblers) {
            if (a.contains(p)) {
                return a;
            }
        }
        return null;
    }
    
    reset() {
        this.input = null;
        this.next = null;
    }

    link(fac:IFactory) {
        let front = this.getFrontTile(this.range * SLOT_SIZE);
        let behind = this.getFrontTile(-this.range * SLOT_SIZE);

        this.input = this.findBeltSlot(front, fac) ?? this.findAssembler(front, fac);
        this.next = this.findBeltSlot(behind, fac) ?? this.findAssembler(behind, fac);      
    }

    update(deltaTime:number) {
        super.update(deltaTime);

        // no item -> attempt to retrieve input
        if (!this.item && this.input) {
            this.item = this.input.retrieve();
        }
        // item & complete -> attempt to insert output
        if (this.item && this.progress >= 1 && this.next && this.next.insert(this.item)) {
            this.item = null;
        }
    }

    render(ctx:CanvasRenderingContext2D) {
        ctx.fillStyle = "purple";
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);

        // arrow
        ctx.save();
        ctx.translate(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);
        ctx.rotate(this.angle);
        ctx.drawImage(Inserter.arrows.get(this.speed), -this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
        ctx.restore();

        let forward = this.getFrontTile(this.range * SLOT_SIZE);
        let backward = this.getFrontTile(-this.range * SLOT_SIZE);

        //ctx.moveTo(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);
        

        ctx.fillStyle = "#0f05";
        ctx.fillRect(forward.x, forward.y, SLOT_SIZE, SLOT_SIZE);

        ctx.fillStyle = "#00f5";
        ctx.fillRect(backward.x, backward.y, SLOT_SIZE, SLOT_SIZE);

        /*ctx.fillStyle = "magenta";
        ctx.fillRect(-5, -5, 10, 10);

        ctx.lineTo(forward.x, forward.y);

        ctx.fillStyle = "#0f0";
        ctx.fillRect(-5, -5, 10, 10);


        ctx.moveTo(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);
        ctx.lineTo(backward.x, backward.y);

        ctx.fillStyle = "#00f";
        ctx.fillRect(-5, -5, 10, 10);*/


    }

}
