import { SLOT_SIZE } from "../const.js";
import { BeltNode } from "./belt.js";
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
        this.dir = 1;
    }
    addToFactory(factory) {
        factory.inserters.push(this);
        factory.objects.push(this);
    }
    /** attempts to find belt slot at specified position *
    findBeltSlot(p:IPoint, fac:IFactory) {
        for (let belt of fac.belts) {
            for (let slot of belt.slots) {
                if (!slot.isCorner && slot.pos.x == p.x && slot.pos.y == p.y) {
                    return slot;
                }
            }
        }
        return null;
    }

    /** attempts to find assembler at specified position *
    findAssembler(p:IPoint, fac:IFactory) {
        for (let a of fac.assemblers) {
            if (a.contains(p)) {
                return a;
            }
        }
        return null;
    }*/
    reset() {
        this.input = null;
        this.next = null;
    }
    /** passing top-left and center points for different lookup strategies
     * since belt slots are only 1 slot, you can just check the coordinate directly instead of checking collisions
     * for other object types, need to check collision with center point (collision from top-left corner collides with 4 surrounding slots)
     */
    findObject(fac, p, center) {
        for (let obj of fac.objects) {
            // if belt node, zoom into slots
            if (obj instanceof BeltNode) {
                for (let slot of obj.slots) {
                    // have to ingore corner slots because they don't get used
                    if (!slot.isCorner && slot.pos.x == p.x && slot.pos.y == p.y) {
                        return slot;
                    }
                }
            }
            // if obj has "insert" property, it's an IInsertable (this could theoeretically break but shouldn't)
            // @ts-ignore
            else if ("insert" in obj && obj.contains(center)) {
                return obj;
            }
        }
        return null;
    }
    link(fac) {
        let x_offset = this.size.x / 2;
        let y_offset = this.size.y / 2;
        let front = this.getFrontTile(this.range * SLOT_SIZE);
        let front_center = {
            x: front.x + x_offset,
            y: front.y + y_offset
        };
        let back = this.getFrontTile(-this.range * SLOT_SIZE);
        let back_center = {
            x: back.x + x_offset,
            y: back.y + y_offset
        };
        this.input = this.findObject(fac, front, front_center);
        this.next = this.findObject(fac, back, back_center);
    }
    moveItem() {
        if (this.item) {
            //lerp(source.x, this.next.pos.x, this.progress);
            // lerp(source.y, this.next.pos.y, this.progress);   
            let arc_prog = this.angle + (this.progress * Math.PI);
            let cos = Math.round(Math.cos(this.angle));
            this.item.pos.x = this.pos.x + (Math.cos(arc_prog) * this.range * SLOT_SIZE * (cos == 0 ? 0.5 : 1));
            this.item.pos.y = this.pos.y + (Math.sin(arc_prog) * this.range * SLOT_SIZE * (cos == 0 ? 1 : 0.5));
        }
    }
    // TODO: inserter arms need to rotate back after progress completion
    //      i.e. add a dir flag
    //          progress -= dir until progress < 0
    onMove() {
        this.progress = 1;
        this.dir = -1;
    }
    update(deltaTime) {
        super.update(deltaTime);
        // rotating backward
        if (this.dir == -1) {
            this.progress -= deltaTime * this.speed;
            if (this.progress <= 0) {
                this.progress = 0;
                this.dir = 1;
            }
        }
        // no item -> attempt to retrieve input
        if (this.dir == 1 && !this.item && this.input) {
            this.item = this.input.retrieve();
            if (this.item) {
                this.dir = 1;
                // items that are grabbed by an inserter get rendered on top of all other items (to simulate depth)
                this.item.pos.z = 99;
                // immediately moveItem to make sure its in right spot
                this.moveItem();
            }
        }
        // item & complete -> attempt to insert output
        //if (this.item && this.progress >= 1 && this.next && this.next.insert(this.item)) {
        //    this.item.pos.z = 0;
        //   this.item = null;
        //}
    }
    render(ctx) {
        const color = Inserter.colors.get(this.speed);
        // base
        // NOTE: rendering base beneath existing pixels to prevent z-index issue with insert arms
        ctx.globalCompositeOperation = "destination-over";
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2, this.size.x / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        // arrow
        /*ctx.save();
        ctx.translate(
            this.pos.x + (this.size.x / 2) + (this.size.x / 12 * Math.cos(this.angle)),
             this.pos.y + (this.size.y / 2) + (this.size.y / 12 * Math.sin(this.angle))
        );
        ctx.rotate(this.angle);
        ctx.drawImage(Inserter.arrows.get(this.speed), -this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
        ctx.restore();*/
        ctx.beginPath();
        ctx.fillStyle = "#444";
        ctx.arc(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2, this.size.x / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();
        //ctx.fillRect(this.pos.x + this.size.x / 4, this.pos.y + this.size.y / 10, this.size.x / 2, this.size.y / 2);
        ctx.globalCompositeOperation = "source-over";
        // #endregion
        // #region input/output zones
        /*if (this.input) {
            ctx.fillStyle = "#0f05";
            ctx.fillRect(this.input.pos.x, this.input.pos.y, this.input.size.x, this.input.size.y);
        }
        if (this.next) {
            ctx.fillStyle = "#00f5";
            ctx.fillRect(this.next.pos.x, this.next.pos.y, this.next.size.x, this.next.size.y,);
        }*/
        // #endregion
        // #region arm
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 12;
        ctx.beginPath();
        let pos;
        if (this.item) {
            pos = this.item.pos;
        }
        else {
            let cos = Math.round(Math.cos(this.angle));
            let arc_prog = this.angle + (this.progress * Math.PI);
            pos = {
                x: this.pos.x + (Math.cos(arc_prog) * this.range * SLOT_SIZE * (cos == 0 ? 0.5 : 1)),
                y: this.pos.y + (Math.sin(arc_prog) * this.range * SLOT_SIZE * (cos == 0 ? 1 : 0.5))
            };
        }
        ctx.moveTo(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);
        ctx.lineTo(pos.x + SLOT_SIZE / 2, pos.y + SLOT_SIZE / 2);
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(pos.x + SLOT_SIZE / 2, pos.y + SLOT_SIZE / 2, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
        // #endregion      
    }
}
// different image for each speed
Inserter.arrows = new Map([
    [InserterSpeeds.NORMAL, null],
    [InserterSpeeds.FAST, null],
    [InserterSpeeds.SUPER, null]
]);
Inserter.colors = new Map([
    [InserterSpeeds.NORMAL, "#ffdd31"],
    [InserterSpeeds.FAST, "#5de4ff"],
    [InserterSpeeds.SUPER, "#c5fb62"]
]);
//# sourceMappingURL=inserter.js.map