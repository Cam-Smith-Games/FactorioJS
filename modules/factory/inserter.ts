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

    moveItem() {
        if (this.item) {
            //lerp(source.x, this.next.pos.x, this.progress);
            // lerp(source.y, this.next.pos.y, this.progress);   
            let arc_prog = this.angle + (this.progress * Math.PI);
            this.item.pos.x = this.pos.x - (Math.cos(arc_prog) * this.range * SLOT_SIZE);
            this.item.pos.y = this.pos.y + (Math.sin(arc_prog) * this.range * SLOT_SIZE);             
        }
    }
    

    update(deltaTime:number) {
        super.update(deltaTime);

        // no item -> attempt to retrieve input
        if (!this.item && this.input) {
            this.item = this.input.retrieve();
            if (this.item) {
                // items that are grabbed by an inserter get rendered on top of all other items (to simulate depth)
                this.item.pos.z = 99;
            }
        }
        // item & complete -> attempt to insert output
        //if (this.item && this.progress >= 1 && this.next && this.next.insert(this.item)) {
        //    this.item.pos.z = 0;
         //   this.item = null;
        //}
    }

    render(ctx:CanvasRenderingContext2D) {
        // base
        // NOTE: rendering base beneath existing pixels to prevent z-index issue with insert arms
        ctx.globalCompositeOperation = "destination-over";

        // arrow
        ctx.save();
        ctx.translate(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);
        ctx.rotate(this.angle);
        ctx.drawImage(Inserter.arrows.get(this.speed), -this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
        ctx.restore();
     
        ctx.beginPath();
        ctx.fillStyle = "#444";
        ctx.arc(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2, this.size.x / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        //ctx.fillRect(this.pos.x + this.size.x / 4, this.pos.y + this.size.y / 10, this.size.x / 2, this.size.y / 2);


        ctx.globalCompositeOperation = "source-over";
        // #endregion


        // #region input/output zones
        if (this.input) {
            ctx.fillStyle = "#0f05";
            ctx.fillRect(this.input.pos.x, this.input.pos.y, SLOT_SIZE, SLOT_SIZE);
        }
        if (this.next) {
            ctx.fillStyle = "#00f5";
            ctx.fillRect(this.next.pos.x, this.next.pos.y, SLOT_SIZE, SLOT_SIZE);
        }
        // #endreigon

        // arm
        if (this.item) {
            ctx.save();
            ctx.strokeStyle = "yellow";
            ctx.lineWidth = 12;
            ctx.beginPath();
            ctx.moveTo(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);
            ctx.lineTo(this.item.pos.x + this.item.size.x / 2, this.item.pos.y + this.item.size.y / 2);
            ctx.stroke();
            ctx.closePath();

            ctx.restore();
        }


    }

}
