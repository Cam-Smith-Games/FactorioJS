import { IMap } from "../struct/map.js";
import { IPoint } from "../struct/point.js";
import { Assembler } from "./assembler.js";
import { BeltNode } from "./belt.js";
import { FactoryObject } from "./factoryobject.js";
import { Inserter } from "./inserter.js";
import { ItemObject } from "./item.js";

/** this interface has to be separate from the class to prevent circular dependency issues (2 things can't import eachother) */
export interface IFactory {
    inserters: Inserter[];
    belts: BeltNode[];
    assemblers: Assembler[];
}

export interface FactoryParams {
    inserters?: Inserter[];
    belts?: BeltNode[];
    assemblers?: Assembler[];
    items?: ItemObject[]
}

export class Factory implements IMap<FactoryObject>, IFactory {

    inserters: Inserter[];
    belts: BeltNode[];
    assemblers: Assembler[];
    items: ItemObject[];


    /** flat list of generic objects used for collision (this consists of all lists above) */
    objects: FactoryObject[];


    /** remembering last angle to make belt placement a bit easier */
    belt_angle = 0;
    

    constructor(params?:FactoryParams) {
        if (!params) params = {};

        this.belts = params.belts ?? [];
        this.inserters = params.inserters ?? [];
        this.assemblers = params.assemblers ?? [];
        this.items = params.items ?? [];

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

        this.link();
    }


    update(deltaTime: number): void {
        // NOTE: update order matters hence multiple loops
        //        could also just have list of generic objects and order them by an update sequence field but that'd just be an additional field to store on every single object for not much gain
        for (let belt of this.belts) belt.update(deltaTime);
        for (let assembler of this.assemblers) assembler.update(deltaTime);
        for (let inserter of this.inserters) inserter.update(deltaTime); 
        for (let item of this.items) item.update(deltaTime);
    }

    render(ctx: CanvasRenderingContext2D): void {
        for (let belt of this.belts) belt.render(ctx);
        for (let assembler of this.assemblers) assembler.render(ctx);
        for (let inserter of this.inserters) inserter.render(ctx); 

        // sort items by y coordinate so bottom items appear on top of top ones
        // might reduce performance a bit but it gives  it a fake sense of depth
        this.items = this.items.sort((a,b) => a.pos.y > b.pos.y ? 1 : a.pos.y < b.pos.y ? -1 : 0);
        for (let item of this.items) item.render(ctx);
    }

    // #region objects
    /** gets first object that intsects specified point (there should only be 1) */
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

        if (obj instanceof BeltNode) this.belts.push(obj);
        else if (obj instanceof Inserter) this.inserters.push(obj);
        //else if (obj instanceof )

        return false;
    }

    /** returns boolean whether object was successfully removed or not */
    remove(obj: FactoryObject): boolean {
        let existing = this.get(obj.pos);
        if (existing) return false;

        // TODO

        return false;
    }
    // #endregion

    click(p:IPoint, button: number): boolean {
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
        for (let node of this.objects) node.reset();
        for (let node of this.objects) node.link(this);

        for (let belt of this.belts) belt.linkSlots(this);
        for (let belt of this.belts) belt.correct(this);
    }

}

