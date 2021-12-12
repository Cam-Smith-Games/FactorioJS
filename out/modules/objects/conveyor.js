import { LinkedObject } from "../engine/gameobject.js";
import { lerp } from "../engine/util/math.js";
import { Vector } from "../engine/util/vector.js";
import { SLOT_SIZE } from "./const.js";
export class Conveyor extends LinkedObject {
    constructor(args) {
        var _a;
        super(args);
        this.id = ++Conveyor.NEXT_ID;
        this.speed = (_a = args.speed) !== null && _a !== void 0 ? _a : 1;
        this.slots = [];
    }
    _postRender(ctx) {
        this.forSlot(slot => slot.render(ctx));
    }
    /** loop thru 2D array of node slots */
    forSlot(func) {
        for (let row of this.slots) {
            for (let slot of row) {
                func(slot);
            }
        }
    }
}
Conveyor.NEXT_ID = 0;
export class ConveyorBelt extends Conveyor {
    constructor(args) {
        super(args);
        // generating empty slots
        for (let y = 0; y < 2; y++) {
            let row = [];
            for (let x = 0; x < 2; x++) {
                let slot = new ConveyorBeltSlot({
                    pos: new Vector(this.pos.x + (x * SLOT_SIZE), this.pos.y + (y * SLOT_SIZE)),
                    size: new Vector(SLOT_SIZE, SLOT_SIZE),
                    speed: this.speed,
                    parent: this
                });
                row.push(slot);
            }
            this.slots.push(row);
        }
    }
    _render(ctx) {
        ctx.strokeStyle = "white";
        ctx.strokeRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
        ctx.drawImage(ConveyorBelt.arrows[this.speed], -this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
        /*ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "24px Arial";

        ctx.rotate(-this.angle);
        ctx.fillText(this.index.toString(), 0, 8, this.size.x);
        ctx.rotate(this.angle);
        */
    }
    calculate(slot_grid) {
        // #region DETERMINING INDIVIDUAL SLOT ANGLES BASED ON CURVES
        // TODO: i feel like there's a more mathametical way to do this... i'm doing it somewhat manually
        let slot_angles = [this.angle, this.angle, this.angle, this.angle];
        if (this.prev && this.prev instanceof ConveyorBelt) {
            let prev_cos = Math.cos(this.prev.angle);
            let prev_sin = Math.sin(this.prev.angle);
            let this_cos = Math.cos(this.angle);
            let this_sin = Math.sin(this.angle);
            /*console.log({
                prev_angle: node.prev.angle,
                prev_cos: prev_cos,
                prev_sin: prev_sin,
                this_cos: this_cos,
                this_sin: this_sin
            });*/
            if (prev_sin > this_sin) {
                // right -> down (0 -> 270) (cos 1 -> cos 0  | sin 0 -> sin -1)
                if (prev_cos > this_cos) {
                    if (prev_sin > 0) {
                        console.log("DOWN -> LEFT");
                        slot_angles[1] = Math.PI / 2; // bottom right = 90
                    }
                    else {
                        console.log("RIGHT -> DOWN");
                        slot_angles[2] = 0; // top left = 0
                    }
                }
                else if (prev_cos < this_cos) {
                    // left -> down (180 -> 270) (cos -1 -> cos 0 | sin 0 -> sin -1)
                    if (prev_cos < 0) {
                        console.log("LEFT -> UP");
                        slot_angles[3] = Math.PI; // top right = 180 
                    }
                    else {
                        console.log("UP -> RIGHT");
                        slot_angles[0] = Math.PI / 2; // bottom left = 90 
                    }
                }
            }
            else if (prev_sin < this_sin) {
                // right -> up (0 -> 90) (cos 1 -> cos 0  | sin 0 -> sin 1)
                if (prev_cos > this_cos) {
                    if (prev_cos > 0) {
                        console.log("RIGHT -> DOWN");
                        slot_angles[0] = 0; // bottom left = 90
                    }
                    else {
                        console.log("UP -> LEFT");
                        slot_angles[3] = Math.PI * 3 / 2; // top right = 270
                    }
                }
                // left -> up (180 -> 90) (cos -1 -> cos 0 | sin 0 -> sin 1)
                else if (prev_cos < this_cos) {
                    if (prev_sin < 0) {
                        console.log("UP -> RIGHT");
                        slot_angles[2] = Math.PI * 3 / 2; // top left = 270
                    }
                    else {
                        console.log("LEFT -> DOWN");
                        slot_angles[1] = Math.PI; // bottom right = 180
                    }
                }
            }
        }
        // #endregion
        console.log(`----- CALCULATING NODE ${this.id} -----`);
        console.log(slot_angles);
        // NOTE: all angles must be set before linking (hence 2 separate loops)
        let i = 0;
        this.forSlot(slot => {
            //slot.id = this.index + " (" + slot.pos.x + "," + slot.pos.y + ")";
            slot.angle = slot_angles[i++];
        });
        this.forSlot(slot => slot.link(slot_grid));
    }
}
// different image for each speed
ConveyorBelt.arrows = {
    1: null,
    2: null,
    3: null
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
        args.speed = 3;
        super(args);
    }
}
/** slot within conveyor belt that actually holds items (each conveyor node is 2x2 slots) */
export class ConveyorSlot extends LinkedObject {
    constructor(args) {
        var _a;
        super(args);
        /** inverted percentage (1-0) of move animation */
        // i.e. when moving from slot to slot, move_remaining is immediately set to 1.
        //      as the move is animated, it gets decremented deltaTime*speed, towards 0
        //      when move_remaining > 0, its moving, when move_remaining <= 0, it's not moving
        this.move_remaining = 0;
        this.reserved = false;
        this.receive_frame = 0;
        this.speed = (_a = args.speed) !== null && _a !== void 0 ? _a : 1;
        this.id = ++ConveyorSlot.NEXT_SLOT_ID;
    }
    // overriding parent render to be absolute positioned (ignoring parent position because it makes the slot_grid easier by not having to calculate world coordinates for every single slot)
    render(ctx) {
        // draw slot borders
        ctx.strokeStyle = this.item ? "cyan" : "gray";
        ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        // debug: draw slot ID
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "24px Arial";
        ctx.fillText(this.id.toString(), this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2 + 8, this.size.x);
    }
    canReceive() {
        return !this.item && !this.reserved && this.move_remaining <= 0;
    }
    /** when slot receives it an item, "receiving" is set to true for a single frame. this gives inserters 1 frame to grab items before the next conveyor slot reserves it */
    canSend(receiving) {
        return receiving == (this.receive_frame < 2) && this.item && this.move_remaining <= 0;
    }
}
ConveyorSlot.NEXT_SLOT_ID = 0;
class ConveyorBeltSlot extends ConveyorSlot {
    _update(deltaTime) {
        this.receive_frame++;
        // next slot available -> move
        if (this.next && this.canSend(false) && this.next.canReceive()) {
            console.log(`[CONVEYOR SLOT]: BEGIN PASS ${this.id} to ${this.next.id}...`);
            this.move_remaining = 1;
            this.next.reserved = true;
        }
        // IMPORTANT: this needs to be an else if so an inserter can grab this during the 1 frame delay before it gets grabbed by next belt slot
        else if (this.move_remaining > 0) {
            this.move_remaining -= deltaTime * this.speed * 5;
            if (this.move_remaining <= 0) {
                console.log(`[CONVEYOR SLOT]: END PASS ${this.id} to ${this.next.id}...`, {
                    from: this,
                    to: this.next
                });
                this.move_remaining = 0;
                this.next.reserved = false;
                this.next.item = this.item;
                this.next.receive_frame = 0;
                this.item = null;
            }
        }
        /*if (!this.next) {
            console.log(this.index + " has no next");
        }*/
    }
    /** NOTE: this overrides outer render method. slots are not positioned relative to their parent */
    render(ctx) {
        super.render(ctx);
        if (this.item) {
            let x, y;
            if (this.move_remaining > 0) {
                x = lerp(this.pos.x, this.next.pos.x, 1 - this.move_remaining);
                y = lerp(this.pos.y, this.next.pos.y, 1 - this.move_remaining);
            }
            else {
                x = this.pos.x;
                y = this.pos.y;
            }
            ctx.drawImage(this.item.image, x, y, this.size.x, this.size.y);
        }
    }
}
//# sourceMappingURL=conveyor.js.map