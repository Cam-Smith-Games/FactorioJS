import { BeltNode } from "./belt.js";
import { Inserter } from "./inserter.js";
export class Factory {
    constructor(params) {
        var _a, _b, _c, _d;
        /** remembering last angle to make belt placement a bit easier */
        this.belt_angle = 0;
        if (!params)
            params = {};
        this.belts = (_a = params.belts) !== null && _a !== void 0 ? _a : [];
        this.inserters = (_b = params.inserters) !== null && _b !== void 0 ? _b : [];
        this.assemblers = (_c = params.assemblers) !== null && _c !== void 0 ? _c : [];
        this.items = (_d = params.items) !== null && _d !== void 0 ? _d : [];
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
        this.link();
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
        for (let item of this.items)
            item.update(deltaTime);
    }
    render(ctx) {
        for (let belt of this.belts)
            belt.render(ctx);
        for (let assembler of this.assemblers)
            assembler.render(ctx);
        // sort items by y coordinate so bottom items appear on top of top ones
        // might reduce performance a bit but it gives  it a fake sense of depth
        this.items = this.items.sort((a, b) => {
            // start by sorting by z, then fall back to y
            let az = a.pos.z || 0;
            let bz = b.pos.z || 0;
            return az > bz ? 1 : bz > az ? -1 : a.pos.y > b.pos.y ? 1 : a.pos.y < b.pos.y ? -1 : 0;
        });
        for (let item of this.items)
            item.render(ctx);
        for (let inserter of this.inserters)
            inserter.render(ctx);
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
        if (obj instanceof BeltNode)
            this.belts.push(obj);
        else if (obj instanceof Inserter)
            this.inserters.push(obj);
        //else if (obj instanceof )
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
        /*
        
                // left click -> add node OR rotate existing node
        if (e.button ==  0) {
            let existingNode = factory.getNode(mouse_tile.x, mouse_tile.y);
            if (existingNode) {
                console.log("EXISTING NODE");
                if (existingNode instanceof ConveyorSlot) {
                    existingNode.conveyor.angle -= (Math.PI / 2);
                    belt_angle = existingNode.angle;
                    factory.calculate();
                }
           
            }
            else {
                let node = new FastConveyorBelt({ pos: new Vector(mouse_tile.x, mouse_tile.y), angle: belt_angle });
                factory.addNode(node);
            }


 
        }
        // middle click -> ??
        else if (e.button == 1) {
         
        }
        // right click -> remove node
        else {
            let node = factory.getNode(mouse_tile.x, mouse_tile.y);
            if (node) {
                factory.removeNode(node);
            }
        }
        
        */
    }
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
}
//# sourceMappingURL=factory.js.map