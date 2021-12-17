import { SLOT_SIZE } from "../const.js";
import { ItemMoverObject } from "./item.js";
export var InserterSpeeds;
(function (InserterSpeeds) {
    InserterSpeeds[InserterSpeeds["NORMAL"] = 1] = "NORMAL";
    InserterSpeeds[InserterSpeeds["FAST"] = 2] = "FAST";
    InserterSpeeds[InserterSpeeds["SUPER"] = 4] = "SUPER";
})(InserterSpeeds || (InserterSpeeds = {}));
export class Inserter extends ItemMoverObject {
    constructor(params) {
        var _a, _b;
        params.size = { x: SLOT_SIZE, y: SLOT_SIZE };
        super(params);
        this.range = (_a = params.range) !== null && _a !== void 0 ? _a : 2;
        this.speed = (_b = params.speed) !== null && _b !== void 0 ? _b : InserterSpeeds.NORMAL;
        this.item = null;
    }
    getSource() {
        return this.input ? this.input.pos : this.pos;
    }
    /** attempts to find belt slot at specified position */
    findBeltSlot(p, fac) {
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
    findAssembler(p, fac) {
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
    link(fac) {
        var _a, _b;
        let front = this.getFrontTile(this.range * SLOT_SIZE);
        let behind = this.getFrontTile(-this.range * SLOT_SIZE);
        this.input = (_a = this.findBeltSlot(front, fac)) !== null && _a !== void 0 ? _a : this.findAssembler(front, fac);
        this.next = (_b = this.findBeltSlot(behind, fac)) !== null && _b !== void 0 ? _b : this.findAssembler(behind, fac);
    }
    update(deltaTime) {
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
    render(ctx) {
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
// different image for each speed
Inserter.arrows = new Map([
    [InserterSpeeds.NORMAL, null],
    [InserterSpeeds.FAST, null],
    [InserterSpeeds.SUPER, null]
]);
//# sourceMappingURL=inserter.js.map