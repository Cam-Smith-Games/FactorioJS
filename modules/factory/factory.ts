import { IMap } from "../struct/map.js";
import { IPoint } from "../struct/point.js";
import { Assembler, AssemblerParams } from "./objects/assembler.js";
import { BeltNode, BeltNodeParams, FastBelt, NormalBelt, SuperBelt } from "./objects/belt/belt.js";
import { ItemContainer, ItemContainerParams } from "./item/container.js";
import { FactoryObject, FactoryObjectParams } from "./objects/object.js";
import { Inserter, InserterParams } from "./objects/inserter.js";
import { ItemObject, ItemObjectParams } from "./item/object.js";
import { IGhostable } from "./item/ghost.js";


/** this interface has to be separate from the class to prevent circular dependency issues (2 things can't import eachother) */
export interface IFactory {
    inserters: Inserter[];
    belts: BeltNode[];
    assemblers: Assembler[];
    items:ItemObject[];
    containers: ItemContainer[];
    objects: FactoryObject[];
    ghost: IGhostable;
    mouse: Mouse;

    intersects(obj:FactoryObject, items?:ItemObject[]):boolean;

    removeItem(item:ItemObject): boolean;
    removeObject(item:FactoryObject): boolean;
    remove(obj:FactoryObject): boolean;
    link(): void;

}

export interface Mouse {
    
    /** true when mouse is currently held down */
    down:boolean,
    /** true when mouse is moved while mouse is down (used to distinguish a mouse click from a mouse drag) */
    dragged:boolean,
    /** prev tile position (used to calculate next belt angle when drawing a chain of belts) */
    prev:IPoint,
    /** current tile position of mouse (regardless of whether it's down or not) */
    pos:IPoint,
    /** currently hovered object */
    hover:FactoryObject,
    /** angle that next item will be placed at */
    angle:number
    
}

export interface FactoryParams {
    inserters?: Inserter[];
    belts?: BeltNode[];
    assemblers?: Assembler[];
    items?: ItemObject[];
    containers?: ItemContainer[];
}


export class Factory implements IMap<FactoryObject>, IFactory {

    inserters: Inserter[];
    belts: BeltNode[];
    assemblers: Assembler[];
    items: ItemObject[];
    containers:ItemContainer[];
    ghost: IGhostable;
    mouse: Mouse;

    /** flat list of generic objects used for collision (this consists of all lists above except items) */
    objects: FactoryObject[];


    /** remembering last angle to make belt placement a bit easier */
    lastPlacement:IPoint;

    
    constructor(params?:FactoryParams) {
        if (!params) params = {};

        this.belts = params.belts ?? [];
        this.inserters = params.inserters ?? [];
        this.assemblers = params.assemblers ?? [];
        this.items = params.items ?? [];
        this.containers = params.containers ?? [];

        this.objects = [];
        for (let belt of this.belts) {
            this.objects.push(belt);
            for (let slot of belt.slots) {
                if (slot.item) {
                    this.items.push(slot.item)
                }
            }
        }
        for (let assembler of this.assemblers)  this.objects.push(assembler);
        for (let inserter of this.inserters)  this.objects.push(inserter); 
        for (let item of this.items) this.objects.push(item);
        for (let con of this.containers) this.objects.push(con);

        this.mouse = {
            down: false,
            dragged: false,
            prev: { x: 0, y: 0 },
            pos: { x: 0, y: 0 },
            hover: null,
            angle: 0
        };

        this.link();
    }


    /**
     * @param obj object to test for collision
     * @param items (optional) if provided, ItemObjects will be allowed to collide, and added to this array. This is for belts, which consume items upon collision instead of rejecting placement
     */
    intersects(o:FactoryObject, items?:ItemObject[]):boolean {
        for (let obj of this.objects) {
            if (obj.intersects(o)) {
                return true;
            }
        }

        // items array provided, check for any items that intersect as well (belts will consume items they're placed on)
        if (items) {
            for (let item of this.items) {
                if (item.intersects(o)) {
                    items.push(item)
                }
            }
        } 
  
        return false;
    }

    update(deltaTime: number): void {     
        
        // TODO: move mouse hold logic to a setInterval loop outside
        //  i.e. main.ts "setInterval(30fps) -> factory.mousemove"
        //      don't need to repeat mouse item lookups at 120fps, just a waste of processing

        if (this.ghost) {
            this.ghost.setPosition(this.mouse.pos);

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
        //        could also just have list of generic objects and order them by an update sequence field but that'd just be an additional field to store on every single object and constantly sort on for not much gain
        for (let belt of this.belts) belt.update(deltaTime);
        for (let assembler of this.assemblers) assembler.update(deltaTime);
        for (let inserter of this.inserters) inserter.update(deltaTime); 
        for (let item of this.items) item.update(deltaTime);
        for (let con of this.containers) con.update(deltaTime);
    }

    render(ctx: CanvasRenderingContext2D): void {
        for (let belt of this.belts) belt.render(ctx);
        for (let assembler of this.assemblers) assembler.render(ctx);
        for (let con of this.containers) con.render(ctx);

        // sort items by y coordinate so bottom items appear in front
        // might reduce performance a bit but it gives  it a fake sense of depth
        this.items = this.items.sort((a,b) => {
            // start by sorting by z, then fall back to y
            let az = a.pos.z || 0;
            let bz = b.pos.z || 0;
            return az > bz ? 1 : bz > az ? -1 : a.pos.y > b.pos.y ? 1 : a.pos.y < b.pos.y ? -1 : 0
        });
        for (let item of this.items) item.render(ctx);
        for (let inserter of this.inserters) inserter.render(ctx); 


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
    }

    // #region objects
    /** gets first object that intersects specified point (there should only be 1) */
    get(p:IPoint): FactoryObject {
        for (let obj of this.objects) {
            if (obj.contains(p)) {
                return obj;
            }
        }
        return null;
    }

    /** returns boolean whether object was successfully added or not */
    add(obj: FactoryObject): boolean {
        let existing = this.get(obj.pos);
        if (existing) return false;

        if (obj instanceof ItemObject) this.items.push(obj);
        else {
            if (obj instanceof BeltNode) this.belts.push(obj);
            else if (obj instanceof Inserter) this.inserters.push(obj);
            else if (obj instanceof Assembler) this.assemblers.push(obj);
            else if (obj instanceof ItemContainer) this.containers.push(obj);  
            else return false;  
        }

        return true;
    }



    removeItem(item:ItemObject) {
        let index = this.items.indexOf(item);
        if (index > -1) {
            this.items.splice(index, 1);
            return true;
        }
        return false;
    }
    removeObject(obj:FactoryObject) {
        let index = this.objects.indexOf(obj);
        if (index > -1) {
            this.objects.splice(index, 1);
            return true;
        }
        return false;
    }

    /** removes item from array if it exists */
    private _remove(obj:any, arr:any[]) {
        let index = arr.indexOf(obj);
        if (index > -1) {
            arr.splice(index,  1);
            return true;
        }
        return false;
    }
    /** returns boolean whether object was successfully removed or not */
    remove(obj: FactoryObject): boolean {
        if (this.removeObject(obj)) {
            if (obj instanceof ItemObject) this._remove(obj, this.items);
            else {
                if (obj instanceof BeltNode) this._remove(obj, this.belts);
                else if (obj instanceof Inserter) this._remove(obj, this.inserters);
                else if (obj instanceof Assembler) this._remove(obj, this.assemblers);
                else if (obj instanceof ItemContainer) this._remove(obj, this.containers);
                else return false;  
            }
            return true;
        }
        return false;
    }
    // #endregion



    link() {
        for (let node of this.objects) node.reset();

        for (let belt of this.belts) belt.link(this);
        for (let belt of this.belts) belt.linkSlots(this);
        for (let belt of this.belts) belt.correct();

        for (let inserter of this.inserters) inserter.link(this);


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
    mousemove(p:IPoint) {
        this.mouse.pos = p;
        if (this.mouse.down) {
            this.mouse.dragged = true;
        }

        if (!this.ghost) {
            let obj = this.get(p);
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
    mousedown(p:IPoint, button: number) {
        if (button == 0) {
            this.mouse.down = true;
            this.mouse.dragged = false;
        }
    }

    mouseup(p:IPoint, button:number) {  

        // click object only if not dragging or if not left click
        if (button != 0 || !this.mouse.dragged) {
            let obj = this.get(p);
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


    // #endregion


    save() {
        
        let save:FactoryObjectParams[] = [];
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
        this.assemblers =[];
        this.items = [];
        this.containers =[];

        this.link();
    }
    load() {
  
        let json = localStorage.getItem("save");
    
        if (!json) { 
            console.error("No save found");
            return;
        }

        let save = <FactoryObjectParams[]>JSON.parse(json);
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
const classMap: Record<string, (args:FactoryObjectParams) => FactoryObject> = {
    "NormalBelt": (args:BeltNodeParams) => new NormalBelt(args),
    "FastBelt": (args:BeltNodeParams) => new FastBelt(args),
    "SuperBelt": (args:BeltNodeParams) => new SuperBelt(args),
    "Inserter": (args:InserterParams) => new Inserter(args),
    "ItemContainer": (args:ItemContainerParams) => new ItemContainer(args),
    "Assembler": (args:AssemblerParams) => new Assembler(args),
    "ItemObject": (args:ItemObjectParams) => new ItemObject(args)
};

   