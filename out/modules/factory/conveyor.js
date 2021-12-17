import { lerp } from "../engine/util/math.js";
import { Vector } from "../engine/util/vector.js";
import { SLOT_SIZE, TILE_SIZE } from "./const.js";
import { FactoryObject } from "./factoryobject.js";
import { FactorySlot, SlotState } from "./slot.js";
export class ConveyorBelt extends FactoryObject {
    constructor(args) {
        var _a;
        args.size = new Vector(TILE_SIZE, TILE_SIZE);
        super(args);
        this.speed = (_a = args.speed) !== null && _a !== void 0 ? _a : 1;
        this.slots = [];
        // generating empty slots
        let i = 0;
        for (let y = 0; y < 2; y++) {
            let row = [];
            for (let x = 0; x < 2; x++) {
                args.pos = new Vector(this.pos.x + (x * SLOT_SIZE), this.pos.y + (y * SLOT_SIZE));
                row.push(new ConveyorSlot({
                    conveyor: this,
                    index: i++,
                    pos: args.pos,
                    size: new Vector(SLOT_SIZE, SLOT_SIZE),
                    speed: this.speed
                }));
            }
            this.slots.push(row);
        }
    }
    update(deltaTime) {
        this.forSlot(slot => slot.update(deltaTime));
    }
    /*_render(ctx:CanvasRenderingContext2D) {
        
        //ctx.strokeStyle = "red";
        //ctx.strokeRect(-this.size.x/2, -this.size.y/2, this.size.x, this.size.y);
        //ctx.drawImage(ConveyorBelt.arrows[this.speed], -this.size.x/2, -this.size.y/2, this.size.x, this.size.y);

        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "24px Arial";

        ctx.rotate(-this.angle);
        ctx.fillText(this.id.toString(), 0, 8, this.size.x);
        ctx.rotate(this.angle);
    
    }*/
    _postRender(ctx) {
        this.forSlot(slot => slot.render(ctx));
    }
    /** loop thru 2D array of node slots */
    forSlot(func) {
        for (let x = 0; x < this.slots.length; x++) {
            let col = this.slots[x];
            for (let y = 0; y < col.length; y++) {
                let slot = col[y];
                func(slot, x, y);
            }
        }
    }
    /** @override conveyor belts don't get added to grid, their slots do instead */
    add(delegate) {
        this.forSlot(slot => delegate(slot));
    }
    /** @override conveyor belts don't link to anything, their slots do instead */
    find(delegate) {
        this.forSlot(slot => slot.find(delegate));
    }
    // when adding render task, be sure to add all children
    addRenderTask(add) {
        super.addRenderTask(add);
        this.forSlot(slot => slot.addRenderTask(add));
    }
    debug() {
        super.debug();
        this.forSlot(slot => slot.debug());
    }
    // reset slot angles to belt angle so belt.calculate can determine belt angles from slot angles (confusing to explain)
    reset() {
        super.reset();
        this.forSlot(slot => slot.reset());
    }
    // 1. initialize all slot angles to parent belt angle
    // 2. calculate everything like normal (no special logic)
    // 3. go back and fix the corner pieces
    //      for each belt, if only ONE slot didn't get a "prev", then you know its a corner piece
    //      to determine which slot to correct:
    correct() {
        let unlinked = [];
        this.forSlot((slot, x, y) => {
            if (!slot.prev) {
                unlinked.push([slot, x, y]);
            }
        });
        // if only 1 of the 4 slots was unlinked, its a corner piece that needs to get corrected
        if (unlinked.length == 1) {
            let first = unlinked[0];
            let slot = first[0];
            let x = first[1];
            let y = first[2];
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
            let sibling = this.slots[sx][sy];
            //console.log(`rotating node ${sibling.id} from ${sibling.angle.toFixed(2)} to ${angle.toFixed(2)}`);
            sibling.angle = angle;
        }
    }
}
// different image for each speed
ConveyorBelt.arrows = {
    1: null,
    2: null,
    4: null
};
// #region belt speeds
export class SlowConveyorBelt extends ConveyorBelt {
    constructor(args) {
        args.speed = 1;
        super(args);
    }
}
export class FastConveyorBelt extends ConveyorBelt {
    constructor(args) {
        args.speed = 2;
        super(args);
    }
}
export class SuperConveyorBelt extends ConveyorBelt {
    constructor(args) {
        args.speed = 8;
        super(args);
    }
}
/** slot within conveyor belt that actually holds items (each conveyor node is 2x2 slots) */
export class ConveyorSlot extends FactorySlot {
    constructor(args) {
        var _a;
        args.double = true;
        args.priority = 2;
        super(args);
        this.index = args.index;
        this.receive_frame = 0;
        this.speed = (_a = args.speed) !== null && _a !== void 0 ? _a : 1;
        this.conveyor = args.conveyor;
        this.isCorner = false;
        this.move_remaining = 0;
    }
    update(deltaTime) {
        if (this.receive_frame > 0) {
            this.receive_frame--;
            if (this.receive_frame <= 0) {
                this.state = SlotState.IDLE;
            }
        }
        if (this.item && this.state == SlotState.IDLE) {
            let next = this.next;
            if (next instanceof ConveyorSlot &&
                ((next === null || next === void 0 ? void 0 : next.state) == SlotState.SENDING || ((next === null || next === void 0 ? void 0 : next.state) == SlotState.IDLE && next.receive_frame <= 0 && !next.item))) {
                //console.log(`[CONVEYOR SLOT]: BEGIN PASS ${this.id} to ${next.id}...`);
                this.move_remaining = 1;
                this.state = SlotState.SENDING;
            }
        }
        else if (this.state == SlotState.SENDING) {
            this.move_remaining -= deltaTime * this.speed * 5;
            if (this.move_remaining <= 0) {
                let next = this.next;
                /*console.log(`[CONVEYOR SLOT]: END PASS ${this.id} to ${next.id}...`, {
                    from: this.id,
                    to: next?.id
                });*/
                if (next instanceof ConveyorSlot && next.state == SlotState.IDLE) {
                    next.state = SlotState.RECEIVING;
                    next.item = this.item;
                    next.receive_frame = 2;
                    this.move_remaining = 0;
                    this.state = SlotState.IDLE;
                    this.item = null;
                }
            }
        }
    }
    // overriding parent render to be absolute positioned (ignoring parent position because it makes the slot_grid easier by not having to calculate world coordinates for every single slot)
    /** NOTE: this overrides outer render method. slots are not positioned relative to their parent */
    render(ctx) {
        // draw slot borders
        ctx.strokeStyle = this.item ? "cyan" : "white";
        ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        /*ctx.fillStyle = "#777";

        if (this.isCorner) {

            let cos = Math.abs(Math.cos(this.angle));
            let sin = Math.abs(Math.sin(this.angle));
            ctx.fillStyle = cos > sin ? "magenta" : cos < sin ? "cyan" : "yellow";




            // cos > sin
            // cos = sin
            // sin > cos

            let offset = ConveyorSlot.CORNER_OFFSETS[this.index];
            let cx =  this.pos.x + offset.x;
            let cy = this.pos.y + offset.y;

            let start = this.angle - Math.PI / 2; //this.angle - Math.PI;
            let end = this.angle; //this.angle - Math.PI / 2;

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, this.size.x, start, end, false);
            ctx.fill();
            ctx.closePath();
        }
        else {
            ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        }
        */
        ctx.fillStyle = this.isCorner ? "magenta" : "#444";
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        // arrow
        ctx.save();
        ctx.translate(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);
        ctx.rotate(this.angle);
        ctx.drawImage(ConveyorBelt.arrows[this.speed], -this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
        ctx.restore();
        // debug: draw slot id
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.font = "24px Arial";
        ctx.fillText(this.index.toString(), this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2 + 8, this.size.x);
    }
    renderItem(ctx) {
        if (this.item) {
            let x = this.pos.x;
            let y = this.pos.y;
            if (this.move_remaining > 0) {
                let next = this.next;
                if (next) {
                    x = lerp(this.pos.x, next.pos.x, 1 - this.move_remaining);
                    y = lerp(this.pos.y, next.pos.y, 1 - this.move_remaining);
                }
            }
            ctx.drawImage(this.item.image, x, y, this.size.x, this.size.y);
        }
    }
    addRenderTask(add) {
        add(1, ctx => this.render(ctx));
        add(2, ctx => this.renderItem(ctx));
    }
    reset() {
        super.reset();
        this.isCorner = false;
        this.angle = this.conveyor.angle;
    }
}
/** maps slot index to rotation offset for rendering corners. This offset represents the difference between top left and inner-most corner */
ConveyorSlot.CORNER_OFFSETS = [
    new Vector(SLOT_SIZE, SLOT_SIZE),
    new Vector(0, SLOT_SIZE),
    new Vector(SLOT_SIZE, SLOT_SIZE),
    new Vector(0, 0)
];
//# sourceMappingURL=conveyor.js.map