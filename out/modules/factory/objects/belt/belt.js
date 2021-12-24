import { SLOT_SIZE, TILE } from "../../../const.js";
import { AnimationObject } from "../../../game/animation.js";
import { roundTo } from "../../../util/math.js";
import { Vector } from "../../../util/vector.js";
import { BeltSlot } from "./slot.js";
export var BeltSpeeds;
(function (BeltSpeeds) {
    BeltSpeeds[BeltSpeeds["NORMAL"] = 3.7] = "NORMAL";
    BeltSpeeds[BeltSpeeds["FAST"] = 7.4] = "FAST";
    BeltSpeeds[BeltSpeeds["SUPER"] = 14.8] = "SUPER";
})(BeltSpeeds || (BeltSpeeds = {}));
/** node within conveyor belt that consists of 4 slots (2x2) */
export class BeltNode extends AnimationObject {
    constructor(args, speed) {
        //params.anim = BeltNode.sheet.animations["vert"];
        args.size = TILE;
        super(args);
        this.speed = speed;
        // generating slots
        this.slots = [];
        let i = 0;
        for (let y = 0; y < 2; y++) {
            for (let x = 0; x < 2; x++) {
                this.slots.push(new BeltSlot({
                    factory: args.factory,
                    index: i++,
                    speed: this.speed,
                    node: this,
                    pos: {
                        x: this.pos.x + (x * SLOT_SIZE),
                        y: this.pos.y + (y * SLOT_SIZE)
                    }
                }));
            }
        }
        this.setAnimation();
    }
    // #reghion ghost
    renderGhost(ctx) {
        // TODO: make red if colliding
        this.render(ctx);
    }
    place(fac) {
        // TODO: check for collisions: add fac.isColliding(rect) method
        let items = [];
        let intersects = fac.intersects(this, items);
        if (!intersects) {
            if (items.length) {
                for (let item of items) {
                    // determine which slot to put item in...
                    let offset = new Vector(roundTo(item.pos.x - this.pos.x, SLOT_SIZE) / SLOT_SIZE, roundTo(item.pos.y - this.pos.y, SLOT_SIZE) / SLOT_SIZE);
                    let i = (offset.y * 2) + offset.x;
                    this.slots[i].item = item;
                }
            }
            this.addToFactory(fac);
            fac.link();
            return true;
        }
        return false;
    }
    // #endregion
    addToFactory(factory) {
        factory.belts.push(this);
        factory.objects.push(this);
    }
    reset() {
        this.prev = null;
        this.next = null;
        for (let slot of this.slots)
            slot.reset();
    }
    link(fac) {
        let forward = this.getFrontTile();
        this.next = fac.belts.filter(b2 => b2.pos.x == forward.x && b2.pos.y == forward.y)[0];
        if (this.next) {
            this.next.prev = this;
        }
    }
    update(deltaTime) {
        super.update(deltaTime);
        for (let slot of this.slots)
            slot.update(deltaTime);
    }
    render(ctx) {
        //ctx.fillStyle = "#222"; //this.isCorner ? "magenta" : "#444";
        //ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        super.render(ctx);
        //let forward = this.getFrontTile();
        //ctx.strokeStyle = "orange";
        //ctx.strokeRect(forward.x, forward.y, TILE.x, TILE.y);
        // arrow
        /*ctx.save();
        ctx.translate(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);
        ctx.rotate(this.angle);
        ctx.globalAlpha = 0.8;
        ctx.drawImage(BeltNode.arrows.get(this.speed), -this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
        ctx.restore();*/
        //for (let slot of this.slots) slot.render(ctx);
    }
    linkSlots(fac) {
        for (let slot of this.slots)
            slot.link(fac);
    }
    /** find any corners and fix them */
    correct() {
        // CORNER FIXING LOGIC:
        //      a corner is a node where only 1 of the 4 slots was left unlinked
        //      remove the piece that wasn't linked, then link its adjacent siblings instead
        //      this means that corner slots are ignored, and a corner node is actually 3 slots instead of 4
        //      this not only helps the path look more curvey, it also speeds up the outer line by 33% to help a bit with the inner-vs-outer speed difference
        let unlinked = [];
        for (let i = 0; i < this.slots.length; i++) {
            let slot = this.slots[i];
            if (!slot.prev) {
                //console.log("UNLINKED: " + slot.id);
                unlinked.push(slot);
            }
        }
        // if only 1 of the 4 slots was unlinked, its a corner piece that needs to get corrected
        this.setAnimation(unlinked.length == 1 ? unlinked[0] : null);
    }
    setAnimation(cornerSlot) {
        /** determines which row of the sprite sheet gets used */
        let anim;
        /** determines whether to flip horizontally, vertically, or neither */
        let scale;
        // doing some voodoo here because the sprite sheet is goofy and not set up for my rotations at all
        if (cornerSlot) {
            // converting flat index to x/y
            let x = cornerSlot.index % 2;
            let y = cornerSlot.index > 1 ? 1 : 0;
            cornerSlot.isCorner = true;
            if (cornerSlot.item) {
                cornerSlot.item = null;
            }
            let cos = Math.cos(cornerSlot.angle);
            let sin = Math.sin(cornerSlot.angle);
            let sx1;
            let sy1;
            let sx2;
            let sy2;
            // horizontally oriented: make vertical sibling point at slot
            if (Math.abs(cos) > Math.abs(sin)) {
                //console.log("a" + (x == 0 ? "a" : "b"));
                sx1 = x;
                sy1 = y == 0 ? 1 : 0;
                sx2 = x == 0 ? 1 : 0;
                sy2 = y;
                scale = {
                    x: [[false, true],
                        [false, true]][y][x] ? -1 : 1,
                    y: 1
                };
                anim = [
                    ["corner4", "corner4"],
                    ["corner2", "corner2"]
                ][y][x];
            }
            // vertically oriented: make horizontal sibling point at slot
            else {
                //console.log("b" + (y == 0 ? "a" : "b"));      
                sx1 = x == 0 ? 1 : 0;
                sy1 = y;
                sx2 = x;
                sy2 = y == 0 ? 1 : 0;
                scale = {
                    x: 1,
                    y: [[true, false],
                        [false, true]][y][x] ? -1 : 1
                };
                anim = [
                    ["corner1", "corner3"],
                    ["corner1", "corner3"]
                ][y][x];
            }
            // converting x/y to flat index [0-3]
            let si1 = (sy1 * 2) + sx1;
            let si2 = (sy2 * 2) + sx2;
            let prev = this.slots[si1];
            let next = this.slots[si2];
            // slow down the outer corner since it's moving a larger distance than other slots
            prev.speed = this.speed;
            prev.next = next;
            next.prev = prev;
            //console.log(`rotating node ${sibling.id} from ${sibling.angle.toFixed(2)} to ${angle.toFixed(2)}`);
            //sibling.angle = angle;
            //sibling.link(fac);
        }
        else {
            let cos = Math.cos(this.angle);
            let sin = Math.sin(this.angle);
            let horiz = Math.abs(cos) > Math.abs(sin);
            scale = {
                x: horiz && cos < 0 ? -1 : 1,
                y: !horiz && sin > 0 ? -1 : 1
            };
            anim = horiz ? "horiz" : "vert";
        }
        this.anim = BeltNode.sheet.animations[anim].copy();
        scale.x *= 1.25;
        scale.y *= 1.25;
        this.anim.scale = scale;
        this.anim.setFPS(20 * this.speed);
    }
    rotate(amount) {
        super.rotate(amount);
        for (let slot of this.slots)
            slot.rotate(amount);
        this.setAnimation();
    }
    setPosition(p) {
        super.setPosition(p);
        let i = 0;
        for (let y = 0; y < 2; y++) {
            for (let x = 0; x < 2; x++) {
                this.slots[i++].pos = {
                    x: this.pos.x + (x * SLOT_SIZE),
                    y: this.pos.y + (y * SLOT_SIZE)
                };
            }
        }
    }
}
// different image for each speed
BeltNode.arrows = new Map([
    [BeltSpeeds.NORMAL, null],
    [BeltSpeeds.FAST, null],
    [BeltSpeeds.SUPER, null]
]);
// #region belt implementations
export class NormalBelt extends BeltNode {
    constructor(args) {
        super(args, BeltSpeeds.NORMAL);
    }
}
export class FastBelt extends BeltNode {
    constructor(args) {
        super(args, BeltSpeeds.FAST);
    }
}
export class SuperBelt extends BeltNode {
    constructor(args) {
        super(args, BeltSpeeds.SUPER);
    }
}
// #endregion
// #region Ghosts
// #endregion
//# sourceMappingURL=belt.js.map