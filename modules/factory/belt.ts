import { SLOT_SIZE, TILE_SIZE } from "../const.js";
import { LinkedObject } from "../struct/link.js";
import { IFactory } from "./factory.js";
import { FactoryObject, FactoryObjectParams } from "./factoryobject.js";
import { IInsertable } from "./inserter.js";
import { ItemMoverObject, ItemMoverParams } from "./item.js";



export enum BeltSpeeds {
    NORMAL = 4,
    FAST = 2,
    SUPER = 4
}

interface BeltNodeParams extends FactoryObjectParams {
    speed?:number;
}

/** node within conveyor belt that consists of 4 slots (2x2) */
export class BeltNode extends FactoryObject implements LinkedObject<BeltNode> {

    // different image for each speed
    static arrows = new Map<BeltSpeeds, HTMLImageElement>([
        [BeltSpeeds.NORMAL, null],
        [BeltSpeeds.FAST, null],
        [BeltSpeeds.SUPER, null]
    ]);

    prev:BeltNode;
    next:BeltNode;

    speed:number;
    slots:BeltSlot[];


    constructor(params:BeltNodeParams) {
        params.size = { x: TILE_SIZE, y: TILE_SIZE };
        super(params);
        
        this.speed = params.speed ?? BeltSpeeds.NORMAL;

        this.slots = [];
        for (let y = 0; y < 2; y++) {
            for(let x = 0; x < 2; x++) {
                this.slots.push(new BeltSlot({
                    speed: this.speed,
                    node: this,
                    pos: {
                        x: this.pos.x + (x * SLOT_SIZE),
                        y: this.pos.y + (y * SLOT_SIZE)
                    }
                }));
            }
 
        }
    }

    reset() {
        this.prev = null;
        this.next = null;
        for (let slot of this.slots) slot.reset();
    }

    link(fac:IFactory) {
        let forward = this.getFrontTile();
        this.next = fac.belts.filter(b2 => b2.pos.x == forward.x && b2.pos.y == forward.y)[0];
        if (this.next) {
            this.next.prev = this;
        }
    }

    update(deltaTime:number) {
        for (let slot of this.slots) slot.update(deltaTime);
    }
    
    render(ctx:CanvasRenderingContext2D) {
        super.render(ctx);
        for (let slot of this.slots) slot.render(ctx);
    }

    linkSlots(fac:IFactory) {
        for (let slot of this.slots) slot.link(fac);
    }

    correct(fac:IFactory) {
        let unlinked: [BeltSlot,number][] = [];

        for (let i = 0; i<this.slots.length; i++) {
            let slot = this.slots[i];
            if (!slot.prev) {
                //console.log("UNLINKED: " + slot.id);
                unlinked.push([slot,i]);
            }
        }

        // if only 1 of the 4 slots was unlinked, its a corner piece that needs to get corrected
        if (unlinked.length == 1) {

            let first = unlinked[0];
            let slot = first[0];
            let i = first[1];
            let x = i % 2;
            let y = i > 1 ? 1 : 0;

            slot.isCorner = true;

            let cos = Math.cos(slot.angle);
            let sin = Math.sin(slot.angle);
    
            let sx:number;
            let sy:number;
            let angle:number;

            /*console.log("CORNER DETECTED: " + slot.id, {
                x: x,
                y: y,
                cos: cos,
                sin: sin
            })*/

            // horizontally oriented: make vertical sibling point at slot
            if (Math.abs(cos) > Math.abs(sin)) {
                //console.log("a" + (x == 0 ? "a" : "b"));
                sx = x;
                sy = y == 0 ? 1 : 0;
                angle = y == 0 ? Math.PI * 3 / 2 : Math.PI / 2;
            }
            // vertically oriented: make horizontal sibling point at slot
            else {
                //console.log("b" + (y == 0 ? "a" : "b"));      
                sx = x == 0 ? 1 : 0;
                sy = y;  
                angle = x == 0 ? Math.PI : 0;
            }

            let si = (sy * 2) + sx;

            let sibling = this.slots[si];
            //console.log(`rotating node ${sibling.id} from ${sibling.angle.toFixed(2)} to ${angle.toFixed(2)}`);
            sibling.angle = angle;
            sibling.link(fac);
        }

  
    }

}



// #region slot




export interface BeltSlotParams extends ItemMoverParams {
    node:BeltNode;
}

/** slot within node within belt. gets linked to another slot in the chain */
export class BeltSlot extends ItemMoverObject implements LinkedObject<BeltSlot>, IInsertable {

    node: BeltNode;

    prev: BeltSlot;
    next: BeltSlot;

    /** this is mainly just for debugging right now, might determine something later (like make item path curve a bit etc) */
    isCorner:boolean;

    
    constructor(params:BeltSlotParams) {
        params.size = { x: SLOT_SIZE, y: SLOT_SIZE };
        super(params);  
        this.node = params.node;
    }

    reset() {        
        this.angle = this.node.angle;
        this.prev = null;
        this.next = null; 
        this.isCorner = false;
    }


    render(ctx: CanvasRenderingContext2D): void {
       
        // draw slot borders
        ctx.strokeStyle = this.item ? "magenta" : "white";
        ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y); 

        ctx.fillStyle = "#222"; //this.isCorner ? "magenta" : "#444";
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
            
        // arrow
        ctx.save();
        ctx.translate(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);
        ctx.rotate(this.angle);
        ctx.globalAlpha = 0.2;
        ctx.drawImage(BeltNode.arrows.get(this.node.speed), -this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
        ctx.restore();
        
        // debug: draw slot id
        ctx.fillStyle = this.item != null ? "magenta" : "white";
        ctx.textAlign = "center";
        ctx.font = "24px Arial";
        ctx.fillText(this.id.toString(), this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2 + 8, this.size.x);
        
    }

    /** try to link to slot within this node, if none found then try next node */
    // @ts-ignore
    link(fac:IFactory) {
        let forward = this.getFrontTile();
        let nexts = this.node.slots.filter(slot => slot.pos.x == forward.x && slot.pos.y == forward.y);
        if (!nexts.length && this.node.next) {
            nexts = this.node.next.slots.filter(slot => slot.pos.x == forward.x && slot.pos.y == forward.y);
        }
        if (nexts.length) {
            let next = nexts[0];
            this.next = next;
            next.prev = this;

            //console.log(`SLOT LINKED: ${this.id} => ${this.next.id}`)
        }
    }

    getSource() { return this.pos; }

}
// #endregion