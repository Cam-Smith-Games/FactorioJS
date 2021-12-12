import { Vector } from "../engine/util/vector.js";
import { Conveyor, ConveyorSlot } from "./conveyor.js";
import { SLOT_SIZE } from "./const.js";
export class Inserter extends Conveyor {
    constructor(args) {
        super(args);
        /** number of insertions per second */
        this.speed = 1;
        /** seconds before another insertion can occur */
        this.cooldown = 0;
        // generating empty slots
        for (let y = 0; y < 2; y++) {
            let row = [];
            for (let x = 0; x < 2; x++) {
                let slot = new InserterSlot({
                    pos: new Vector(this.pos.x + (x * SLOT_SIZE), this.pos.y + (y * SLOT_SIZE)),
                    size: new Vector(SLOT_SIZE, SLOT_SIZE),
                    angle: Math.PI,
                    parent: this,
                    speed: this.speed
                });
                row.push(slot);
            }
            this.slots.push(row);
        }
    }
    _render(ctx) {
        ctx.fillStyle = "purple";
        ctx.fillRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
        ctx.strokeStyle = "white";
        ctx.strokeRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
        ctx.drawImage(Inserter.arrows[this.speed], -this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
    }
    _update(deltaTime) {
        if (this.prev && this.cooldown == 0) {
            // TODO: stack inserters will be able to grab from multiple slots before setting cooldown
            let done = false;
            this.prev.forSlot(slot => {
                if (!done && slot.item && !slot.move_remaining) {
                    this.item = slot.item;
                    slot.item = null;
                    this.cooldown = 1 / this.speed;
                    done = true;
                }
            });
        }
        if (this.cooldown > 0) {
            this.cooldown = Math.max(0, this.cooldown - deltaTime);
        }
    }
    // @ts-ignore
    calculate(slot_grid) {
        this.forSlot(slot => slot.link(slot_grid));
    }
}
// different image for each speed
Inserter.arrows = {
    1: null,
    2: null,
    3: null
};
export class InserterSlot extends ConveyorSlot {
    constructor(args) {
        var _a;
        super(args);
        this.speed = (_a = args.speed) !== null && _a !== void 0 ? _a : 1;
        this.cooldown = 0;
    }
    canReceive() {
        return super.canReceive() && this.cooldown <= 0;
    }
    _update(deltaTime) {
        var _a, _b;
        if (this.cooldown > 0) {
            this.cooldown = Math.max(0, this.cooldown - deltaTime);
        }
        let can_send = (_a = this.next) === null || _a === void 0 ? void 0 : _a.canSend(true);
        let can_receive = this.canReceive();
        //console.log({
        //    can_send: can_send,
        //    can_receive: can_receive
        //});
        if ((_b = this.next) === null || _b === void 0 ? void 0 : _b.item) {
            console.log(`[INSERT SLOT]: Attempting ${this.id} to ${this.next}`, {
                can_send: can_send,
                can_receive: can_receive
            });
        }
        if (can_send && can_receive) {
            // TODO: stack inserters will be able to grab from multiple slots before setting cooldown
            console.log("yoink");
            this.item = this.next.item;
            this.next.item = null;
            this.cooldown = 1 / this.speed;
        }
    }
    _postRender(ctx) {
        if (this.next) {
            ctx.strokeStyle = this.next.item ? "yellow" : "magenta";
            ctx.strokeRect(this.next.pos.x, this.next.pos.y, this.next.size.x, this.next.size.y);
        }
    }
}
//# sourceMappingURL=inserter.js.map