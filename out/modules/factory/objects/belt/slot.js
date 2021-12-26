import { SLOT_SIZE } from "../../../const.js";
import { ItemMoverObject } from "../../item/mover.js";
/** slot within node within belt. gets linked to another slot in the chain */
export class BeltSlot extends ItemMoverObject {
    constructor(params) {
        params.size = { x: SLOT_SIZE, y: SLOT_SIZE };
        super(params);
        this.node = params.node;
        this.index = params.index;
    }
    /** @ts-ignore */
    addToFactory(factory) { }
    reset() {
        this.angle = this.node.angle;
        this.prev = null;
        this.next = null;
        this.isCorner = false;
    }
    /** corner slots are non-functional, so they cannot be inserted into */
    insert(source) {
        return !this.isCorner && super.insert(source);
    }
    // slot render method is only for debugging. rendering is done by node
    render(ctx) {
        super.render(ctx);
        let forward = this.getFrontTile();
        ctx.strokeStyle = "yellow";
        ctx.strokeRect(forward.x, forward.y, this.size.x, this.size.y);
        /*
      
        // draw slot borders
        ctx.strokeStyle = this.item ? "magenta" : "white";
        ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y);


        ctx.fillStyle = this.isCorner ? "black" : "#aaa";
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    
  
        // arrow
        ctx.save();
        ctx.translate(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);
        ctx.rotate(this.angle);
        ctx.globalAlpha = 0.2;
        ctx.drawImage(BeltNode.arrows.get(this.node.speed), -this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
        ctx.restore();
        

        */
        // debug: draw slot id
        ctx.fillStyle = this.item != null ? "magenta" : this.reserved ? "cyan" : "white";
        ctx.textAlign = "center";
        ctx.font = "24px Arial";
        ctx.fillText(this.id.toString(), this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2 + 8, this.size.x);
    }
    /** try to link to slot within this node, if none found then try next node */
    // @ts-ignore
    link(fac) {
        this.reserved = null;
        let forward = this.getFrontTile();
        let nexts = this.node.slots.filter(slot => slot.pos.x == forward.x && slot.pos.y == forward.y);
        // couldn't find a next slot in this node? check next node
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
//# sourceMappingURL=slot.js.map