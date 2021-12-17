import { lerp } from "./engine/util/math";
import { SLOT_SIZE } from "./objects/const";
class Transform {
    constructor(params) {
        var _a, _b, _c;
        this.pos = (_a = params.pos) !== null && _a !== void 0 ? _a : { x: 0, y: 0 };
        this.size = (_b = params.size) !== null && _b !== void 0 ? _b : { x: 1, y: 1 };
        this.angle = (_c = params.angle) !== null && _c !== void 0 ? _c : 0;
    }
    /** gets tile directly in-front of this object */
    getForward() {
        return {
            x: this.pos.x + (Math.round(Math.cos(this.angle)) * this.size.x),
            y: this.pos.y + (Math.round(Math.sin(this.angle)) * this.size.y)
        };
    }
}
class Polygon extends Transform {
    constructor(params) {
        super(params);
    }
    contains(p) {
        return (this.pos.x <= p.x &&
            p.x <= this.pos.x + this.size.x &&
            this.pos.y <= p.y &&
            p.y <= this.pos.y + this.size.y);
    }
}
class FactoryObject extends Polygon {
    constructor(params) {
        super(params);
        this.id = ++FactoryObject.NEXT_ID;
    }
    // @ts-ignore
    update(deltaTime) { }
    ;
    render(ctx) {
        // IF DEBUG
        ctx.strokeStyle = "#0f0";
        ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
    ;
    /** optional method for resetting certain things prior to re-linking */
    reset() { }
    /** link this object to other object(s) in the factory */
    // @ts-ignore 
    link(fac) { }
    ;
}
/** incremented everytime a new object is created. used to keep IDs unique */
FactoryObject.NEXT_ID = 0;
class ItemObject extends Transform {
    update(deltaTime) {
        if (this.slot && this.progress < 1) {
            this.progress += deltaTime * this.slot.speed * 5;
            // done moving -> pass to next slot
            if (this.progress >= 1 && this.slot.next && !this.slot.next.item) {
                this.slot.item = null;
                this.slot.next.item = this;
                this.progress = 0;
                this.slot = this.slot.next;
            }
            if (this.slot.next) {
                this.pos.x = lerp(this.slot.pos.x, this.slot.next.pos.x, this.progress);
                this.pos.y = lerp(this.slot.pos.y, this.slot.next.pos.y, this.progress);
            }
            else {
                this.pos = this.slot.pos;
            }
        }
    }
    render(ctx) {
        ctx.drawImage(this.item.image, this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
}
/** slot within node within belt. gets linked to another slot in the chain */
class BeltSlot extends FactoryObject {
    constructor(params) {
        params.size = { x: SLOT_SIZE, y: SLOT_SIZE };
        super(params);
    }
    reset() {
        this.angle = this.node.angle;
        this.prev = null;
        this.next = null;
        this.isCorner = false;
    }
    render(ctx) {
        // draw slot borders
        ctx.strokeStyle = this.item ? "cyan" : "white";
        ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
    /** try to link to slot within this node, if none found then try next node */
    // @ts-ignore
    link(fac) {
        let forward = this.getForward();
        let nexts = this.node.slots.filter(slot => slot.pos == forward);
        if (!nexts.length && this.node.next) {
            nexts = this.node.next.slots.filter(slot => slot.pos == forward);
        }
        if (nexts.length) {
            let next = nexts[0];
            this.next = next;
            next.prev = this;
        }
    }
}
/** node within conveyor belt that consists of 4 slots (2x2) */
class BeltNode extends FactoryObject {
    /** loop thru 2D array of node slots *
    forSlot (func: (slot:BeltSlot,x?:number,y?:number) => void) {
        for (let x = 0; x < this.slots.length; x++) {
            let col = this.slots[x];
            for (let y = 0; y < col.length; y++) {
                let slot = col[y];
                func(slot, x, y);
            }
        }
    }*/
    constructor(params) {
        super(params);
        this.slots = [];
        for (let x = 0; x < 2; x++) {
            for (let y = 0; y < 2; y++) {
                this.slots.push(new BeltSlot({
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
    }
    link(fac) {
        let forward = this.getForward();
        this.next = fac.belts.filter(b2 => b2.pos == forward)[0];
        if (this.next) {
            this.next.prev = this;
        }
    }
    linkSlots(fac) {
        for (let slot of this.slots)
            slot.link(fac);
    }
    correct() {
        let unlinked = [];
        for (let i = 0; i < this.slots.length; i++) {
            let slot = this.slots[i];
            if (!slot.prev) {
                unlinked.push([slot, i]);
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
            let sx;
            let sy;
            let angle;
            /*console.log("CORNER DETECTED: " + slot.id, {
                x: x,
                y: y,
                cos: cos,
                sin: sin
            })*/
            // horizontally oriented: make horizontal sibling point at slot
            if (Math.abs(cos) > Math.abs(sin)) {
                //console.log("a" + (x == 0 ? "a" : "b"));
                sx = x == 0 ? 1 : 0;
                sy = y;
                angle = x == 0 ? Math.PI * 3 / 2 : Math.PI / 2;
            }
            // vertically oriented: make vertical sibling point at slot
            else {
                //console.log("b" + (y == 0 ? "a" : "b"));
                sx = x;
                sy = y == 0 ? 1 : 0;
                angle = y == 0 ? Math.PI : 0;
            }
            let sibling = this.slots[(sx * sy) + sy];
            //console.log(`rotating node ${sibling.id} from ${sibling.angle.toFixed(2)} to ${angle.toFixed(2)}`);
            sibling.angle = angle;
        }
    }
}
class Factory {
    constructor() {
    }
    update(deltaTime) {
        // NOTE: update order matters hence multiple loops
        //        could also just have list of generic objects and order them by an update sequence field but that'd just be an additional field to store on every single object for not much gain
        for (let belt of this.belts)
            belt.update(deltaTime);
        for (let assembler of this.assemblers)
            assembler.update(deltaTime);
        for (let inserter of this.inserters)
            inserter.update(deltaTime);
    }
    render(ctx) {
        for (let obj of this.objects)
            obj.render(ctx);
    }
    // #region objects
    /** gets first object that intsects specified point (there should only be 1) */
    get(p) {
        for (let obj of this.objects) {
            if (obj.contains(p)) {
                return obj;
            }
        }
        return null;
    }
    /** returns boolean whether object was successfully added or not */
    add(obj) {
        let existing = this.get(obj.pos);
        if (existing)
            return false;
        // TODO
        return false;
    }
    /** returns boolean whether object was successfully removed or not */
    remove(obj) {
        let existing = this.get(obj.pos);
        if (existing)
            return false;
        // TODO
        return false;
    }
    // #endregion
    click(p, button) {
        let obj = this.get(p);
        if (obj) {
            if (button == 0) {
            }
            else if (button == 1) {
            }
            else {
            }
        }
        return false;
    }
    link() {
        for (let node of this.objects)
            node.reset();
        for (let node of this.objects)
            node.link(this);
        // after all belt nodes are linked, link their slots
        for (let belt of this.belts)
            belt.linkSlots(this);
        // detect and correct slot corners to follow belt curve
        for (let belt of this.belts)
            belt.correct();
    }
}
var factory = new Factory();
//# sourceMappingURL=interface.js.map