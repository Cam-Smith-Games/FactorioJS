import { Assembler } from "./objects/assembler.js";
import { BeltNode, FastBelt, NormalBelt, SuperBelt } from "./objects/belt/belt.js";
import { ItemContainer } from "./item/container.js";
import { Inserter } from "./objects/inserter.js";
import { ItemObject } from "./item/object.js";
import { Rectangle } from "../struct/rect.js";
import { SLOT_SIZE, TILE_SIZE } from "../const.js";
import { Vector } from "../util/vector.js";
import { roundTo } from "../util/math.js";
export class Factory {
    constructor(params) {
        var _a, _b, _c, _d, _e;
        if (!params)
            params = {};
        this.belts = (_a = params.belts) !== null && _a !== void 0 ? _a : [];
        this.inserters = (_b = params.inserters) !== null && _b !== void 0 ? _b : [];
        this.assemblers = (_c = params.assemblers) !== null && _c !== void 0 ? _c : [];
        this.items = (_d = params.items) !== null && _d !== void 0 ? _d : [];
        this.containers = (_e = params.containers) !== null && _e !== void 0 ? _e : [];
        this.objects = [];
        for (let belt of this.belts) {
            this.objects.push(belt);
            for (let slot of belt.slots) {
                if (slot.item) {
                    this.items.push(slot.item);
                }
            }
        }
        for (let assembler of this.assemblers)
            this.objects.push(assembler);
        for (let inserter of this.inserters)
            this.objects.push(inserter);
        for (let item of this.items)
            this.objects.push(item);
        for (let con of this.containers)
            this.objects.push(con);
        this.mouse = {
            screenPos: { x: 0, y: 0 },
            down: false,
            dragged: false,
            prev: { x: 0, y: 0 },
            pos: new Vector(),
            hover: null,
            angle: 0
        };
        this.viewport = new Rectangle({
            pos: { x: 0, y: 0 },
            size: { x: 1920, y: 1080 }
        });
        this.link();
    }
    /**
     * @param obj object to test for collision
     * @param items (optional) if provided, ItemObjects will be allowed to collide, and added to this array. This is for belts, which consume items upon collision instead of rejecting placement
     */
    intersects(o, items) {
        for (let obj of this.objects) {
            if (obj.intersects(o)) {
                return true;
            }
        }
        // items array provided, check for any items that intersect as well (belts will consume items they're placed on)
        if (items) {
            for (let item of this.items) {
                if (item.intersects(o)) {
                    items.push(item);
                }
            }
        }
        return false;
    }
    update(deltaTime) {
        // TODO: move mouse hold logic to a setInterval loop outside
        //  i.e. main.ts "setInterval(30fps) -> factory.mousemove"
        //      don't need to repeat mouse item lookups at 120fps, just a waste of processing
        if (this.ghost) {
            this.ghost.setPosition({
                x: this.mouse.pos.x,
                y: this.mouse.pos.y
            });
            // update ghost: move to mouse and check for collision
            this.ghost.update(deltaTime);
            // mouse down while not hovering something -> attempt to place 
            if (this.mouse.down && !this.mouse.hover) {
                // placed successfully ? delete ghost
                let placed = this.ghost.place(this);
                if (placed) {
                    // TODO: toolbar class
                    //          decrement from selection quantity, if <= 0, clear slot and set ghost to null
                    this.ghost = new SuperBelt({
                        pos: {
                            x: this.mouse.pos.x,
                            y: this.mouse.pos.y
                        },
                        angle: Number(this.mouse.angle)
                    });
                }
            }
        }
        else if (this.mouse.down) {
            // dragging mouse over belt -> update angle to match current angle
            if (this.mouse.hover instanceof BeltNode) {
                if (this.mouse.hover.angle != this.mouse.angle) {
                    this.mouse.hover.angle = Number(this.mouse.angle);
                    this.link();
                }
            }
        }
        // NOTE: update order matters hence multiple loops
        //        could also just have list of generic objects and order them by an update sequence field 
        //          but that'd just be an additional field to store on every single object and constantly sort on for not much gain
        for (let belt of this.belts)
            belt.update(deltaTime);
        for (let assembler of this.assemblers)
            assembler.update(deltaTime);
        for (let inserter of this.inserters)
            inserter.update(deltaTime);
        for (let item of this.items)
            item.update(deltaTime);
        for (let con of this.containers)
            con.update(deltaTime);
    }
    render(ctx) {
        ctx.save();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.scale(1 / this.viewport.scale, 1 / this.viewport.scale);
        ctx.translate(-this.viewport.pos.x, -this.viewport.pos.y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#0f0";
        ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.strokeStyle = "#f00";
        ctx.strokeRect(this.viewport.pos.x, this.viewport.pos.y, ctx.canvas.width * this.viewport.scale, ctx.canvas.height * this.viewport.scale);
        for (let belt of this.belts)
            if (this.viewport.intersects(belt))
                belt.render(ctx);
        for (let assembler of this.assemblers)
            if (this.viewport.intersects(assembler))
                assembler.render(ctx);
        for (let con of this.containers)
            if (this.viewport.intersects(con))
                con.render(ctx);
        // sort items by y coordinate so bottom items appear in front
        // might reduce performance a bit but it gives  it a fake sense of depth
        this.items
            .filter(item => this.viewport.intersects(item))
            .sort((a, b) => {
            // start by sorting by z, then fall back to y
            let az = a.pos.z || 0;
            let bz = b.pos.z || 0;
            return az > bz ? 1 : bz > az ? -1 : a.pos.y > b.pos.y ? 1 : a.pos.y < b.pos.y ? -1 : 0;
        })
            .forEach(item => item.render(ctx));
        for (let inserter of this.inserters)
            if (this.viewport.intersects(inserter))
                inserter.render(ctx);
        if (this.ghost) {
            this.ghost.renderGhost(ctx);
        }
        // TEST: render slot mouse collisions
        /*if (this.mouse.pos) {
            for (let belt of this.belts) {
                for(let slot of belt.slots) {
                    if (slot.contains(this.mouse.pos)) {
                        slot.render(ctx);
                    }
                }
            }
        }*/
        ctx.globalCompositeOperation = "destination-over";
        // hovered tile
        const GRID_SIZE = TILE_SIZE;
        ctx.lineWidth = 1;
        ctx.fillStyle = "#aaa3";
        ctx.fillRect(this.mouse.pos.x, this.mouse.pos.y, GRID_SIZE, GRID_SIZE);
        // #region drawing tile grid lines
        let view_width = ctx.canvas.width * this.viewport.scale;
        let view_height = ctx.canvas.height * this.viewport.scale;
        ctx.strokeStyle = "#000";
        for (let x = this.viewport.pos.x; x < this.viewport.pos.x + view_width; x += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, this.viewport.pos.y);
            ctx.lineTo(x, this.viewport.pos.y + view_height);
            ctx.stroke();
        }
        for (let y = this.viewport.pos.y; y < this.viewport.pos.y + view_height; y += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(this.viewport.pos.x, y);
            ctx.lineTo(this.viewport.pos.x + view_width, y);
            ctx.stroke();
        }
        //#endregion
        // background
        ctx.fillStyle = "#3d3712";
        ctx.fillRect(this.viewport.pos.x, this.viewport.pos.y, view_width, view_height);
        ctx.globalCompositeOperation = "source-over";
        //ctx.translate(this.viewport.pos.x, this.viewport.pos.y);
        //ctx.scale(this.viewport.scale, this.viewport.scale);
        ctx.restore();
    }
    // #region objects
    /** gets first object that intersects specified point (there should only be 1) */
    get(p) {
        for (let obj of this.objects.concat(this.items)) {
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
        if (obj instanceof ItemObject)
            this.items.push(obj);
        else {
            if (obj instanceof BeltNode)
                this.belts.push(obj);
            else if (obj instanceof Inserter)
                this.inserters.push(obj);
            else if (obj instanceof Assembler)
                this.assemblers.push(obj);
            else if (obj instanceof ItemContainer)
                this.containers.push(obj);
            else
                return false;
        }
        return true;
    }
    removeItem(item) {
        let index = this.items.indexOf(item);
        if (index > -1) {
            this.items.splice(index, 1);
            return true;
        }
        return false;
    }
    removeObject(obj) {
        let index = this.objects.indexOf(obj);
        if (index > -1) {
            this.objects.splice(index, 1);
            return true;
        }
        return false;
    }
    /** removes item from array if it exists */
    _remove(obj, arr) {
        let index = arr.indexOf(obj);
        if (index > -1) {
            arr.splice(index, 1);
            return true;
        }
        return false;
    }
    /** returns boolean whether object was successfully removed or not */
    remove(obj) {
        // ItemObjects only exist in items array and not the objects array
        if (obj instanceof ItemObject)
            return this._remove(obj, this.items);
        // these objects exist in both object array and their own typed array
        if (this.removeObject(obj)) {
            if (obj instanceof BeltNode)
                return this._remove(obj, this.belts);
            if (obj instanceof Inserter)
                return this._remove(obj, this.inserters);
            if (obj instanceof Assembler)
                return this._remove(obj, this.assemblers);
            if (obj instanceof ItemContainer)
                return this._remove(obj, this.containers);
        }
        return false;
    }
    // #endregion
    link() {
        for (let node of this.objects)
            node.reset();
        for (let belt of this.belts)
            belt.link(this);
        for (let belt of this.belts)
            belt.linkSlots(this);
        for (let belt of this.belts)
            belt.correct();
        for (let inserter of this.inserters)
            inserter.link(this);
    }
    // #region input events
    // when R is pressed, rotate angle of selection and mouse or just mouse
    rotate() {
        if (this.ghost) {
            this.ghost.rotate(Math.PI / 2);
            this.mouse.angle = Number(this.ghost.angle);
        }
        else if (this.mouse.hover instanceof BeltNode) {
            this.mouse.hover.rotate(Math.PI / 2);
            this.mouse.angle = Number(this.mouse.hover.angle);
            this.link();
        }
        else {
            this.mouse.angle += Math.PI / 2;
        }
    }
    mousemove(p) {
        this.mouse.screenPos = p;
        this.mouse.pos = p
            .multiply(this.viewport.scale)
            .add(new Vector(this.viewport.pos.x, this.viewport.pos.y))
            .roundTo(TILE_SIZE);
        if (this.mouse.down) {
            this.mouse.dragged = true;
        }
        if (!this.ghost) {
            let obj = this.get(this.mouse.pos);
            if (this.mouse.hover != obj) {
                if (this.mouse.hover) {
                    this.mouse.hover.onMouseLeave();
                }
                this.mouse.hover = obj;
                if (this.mouse.hover) {
                    this.mouse.hover.onMouseEnter();
                }
            }
        }
    }
    // @ts-ignore
    mousedown(p, button) {
        if (button == 0) {
            this.mouse.down = true;
            this.mouse.dragged = false;
        }
    }
    mouseup(p, button) {
        // converting position to a slot position (as opposed to a tile possition)
        //      because SLOT_SIZE is currently the smallest an item can be.
        //      if rounded to TILE_POSITION, you could only click items/slots in top left corner of each tile
        let pos = p.multiply(this.viewport.scale)
            .add(new Vector(this.viewport.pos.x, this.viewport.pos.y))
            .roundTo(SLOT_SIZE);
        // click object only if not dragging or if not left click
        if (button != 0 || !this.mouse.dragged) {
            let obj = this.get(pos);
            if (obj) {
                obj.onClick(button, this);
            }
            // no existing node in this slot, attempt to place selected item
            else {
            }
        }
        if (button == 0) {
            this.mouse.down = false;
            this.mouse.dragged = false;
        }
    }
    pan(d) {
        // zooming farther out (larger scale) increases the amount that gets panned
        //  then round to nearest tile to stay aligned with grid
        this.viewport.pos.x = roundTo(this.viewport.pos.x + (d.x * this.viewport.scale), TILE_SIZE);
        this.viewport.pos.y = roundTo(this.viewport.pos.y + (d.y * this.viewport.scale), TILE_SIZE);
    }
    zoom(dir) {
        // farther out = larger scale (inverted)
        //   i.e. zoom out -> viewport rect gets larger, but everything gets rendered smaller
        this.viewport.scale = Math.min(5, Math.max(0.5, this.viewport.scale + dir / 10));
    }
    // #endregion
    save() {
        let save = [];
        // NOTE: only saving ItemObjects with no parent
        //          this is beacuse the item objects that have a parent will get nested within their parent's save params
        for (let obj of this.objects.concat(this.items.filter(i => !i.parent))) {
            let prm = obj.save();
            save.push(prm);
        }
        console.log(save);
        localStorage.setItem("save", JSON.stringify(save));
        return save;
    }
    clear() {
        this.objects = [];
        this.items = [];
        this.inserters = [];
        this.belts = [];
        this.assemblers = [];
        this.items = [];
        this.containers = [];
        this.link();
    }
    load() {
        let json = localStorage.getItem("save");
        if (!json) {
            console.error("No save found");
            return;
        }
        let save = JSON.parse(json);
        console.log("LOADING FROM: ", save);
        this.clear();
        for (let obj of save) {
            if (obj.className in classMap) {
                obj.factory = this;
                classMap[obj.className](obj);
            }
            else {
                console.error(`[Class Loader] Attempted to load an invalid type: "${obj.className}"`);
            }
        }
        this.link();
    }
}
// i feel like there's gotta be a better way to do this...
//  need to instantiate a class given it's class name
const classMap = {
    "NormalBelt": (args) => new NormalBelt(args),
    "FastBelt": (args) => new FastBelt(args),
    "SuperBelt": (args) => new SuperBelt(args),
    "Inserter": (args) => new Inserter(args),
    "ItemContainer": (args) => new ItemContainer(args),
    "Assembler": (args) => new Assembler(args),
    "ItemObject": (args) => new ItemObject(args)
};
//# sourceMappingURL=factory.js.map