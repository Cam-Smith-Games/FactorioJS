import { SLOT_SIZE, TILE_SIZE } from "../const.js";
import { AnimationObject } from "../game/animation.js";
import { ItemMoverObject } from "./item.js";
export var BeltSpeeds;
(function (BeltSpeeds) {
    BeltSpeeds[BeltSpeeds["NORMAL"] = 4] = "NORMAL";
    BeltSpeeds[BeltSpeeds["FAST"] = 8] = "FAST";
    BeltSpeeds[BeltSpeeds["SUPER"] = 16] = "SUPER";
})(BeltSpeeds || (BeltSpeeds = {}));
/** node within conveyor belt that consists of 4 slots (2x2) */
export class BeltNode extends AnimationObject {
    constructor(params) {
        var _a;
        params.anim = BeltNode.sheet.animations["vert"];
        params.size = { x: TILE_SIZE, y: TILE_SIZE };
        super(params);
        this.speed = (_a = params.speed) !== null && _a !== void 0 ? _a : BeltSpeeds.NORMAL;
        // generating slots
        this.slots = [];
        let i = 0;
        for (let y = 0; y < 2; y++) {
            for (let x = 0; x < 2; x++) {
                this.slots.push(new BeltSlot({
                    factory: params.factory,
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
    }
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
        //for (let slot of this.slots) slot.render(ctx);
        //ctx.fillStyle = "#222"; //this.isCorner ? "magenta" : "#444";
        //ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        super.render(ctx);
        // arrow
        /*ctx.save();
        ctx.translate(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);
        ctx.rotate(this.angle);
        ctx.globalAlpha = 0.8;
        ctx.drawImage(BeltNode.arrows.get(this.speed), -this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
        ctx.restore();*/
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
        // doing some voodoo here because the sprite sheet is goofy and not set up for my rotations at all
        /** determines which row of the sprite sheet gets used */
        let anim;
        /** determines whether to flip horizontally, vertically, or neither */
        let scale;
        // if only 1 of the 4 slots was unlinked, its a corner piece that needs to get corrected
        if (unlinked.length == 1) {
            // converting flat index to x/y
            let slot = unlinked[0];
            let x = slot.index % 2;
            let y = slot.index > 1 ? 1 : 0;
            slot.isCorner = true;
            if (slot.item) {
                slot.item = null;
            }
            let cos = Math.cos(slot.angle);
            let sin = Math.sin(slot.angle);
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
}
BeltNode.corner_anims = [
    ["corner1", "corner3"],
    ["corner3", "corner1"]
];
// different image for each speed
BeltNode.arrows = new Map([
    [BeltSpeeds.NORMAL, null],
    [BeltSpeeds.FAST, null],
    [BeltSpeeds.SUPER, null]
]);
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
    insert(item) {
        return !this.isCorner && super.insert(item);
    }
    // slot render method is only for debugging. rendering is done by node
    render(ctx) {
        // draw slot borders
        //ctx.strokeStyle = this.item ? "magenta" : "white";
        //ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y); 
        ctx.fillStyle = this.isCorner ? "black" : "#aaa";
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
        ctx.fillText(this.index.toString(), this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2 + 8, this.size.x);
    }
    /** try to link to slot within this node, if none found then try next node */
    // @ts-ignore
    link(fac) {
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
//# sourceMappingURL=belt.js.map