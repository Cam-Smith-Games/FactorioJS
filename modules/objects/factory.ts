/*
    this is the master class that manages all factory components
    (i.e. conveyor belts, inserters, etc)

    all nodes within factory inherit from the "Conveyor" class
        - definition of conveyor is "something that transports something" 
        - everything transports objects: belts, inserts, assemblers

*/

import { RenderTask } from "../engine/gameobject.js";
import { LinkedObject } from "../engine/linkedobject.js";
import { FactoryObject, LinkedFactoryObject} from "./factoryobject.js";


// need a separation between container and slots...
// going to add/remove/rotate by belt, not by slot
// same goes for inserts, etc

export class Factory {
    // TODO: nodes list will be belts, inserters, etc, NOT slots
    // when calculating, an "addToGrid" delegate is passed around, which allows belts to add their slots to grid
    // 

    /** 2D grid mapping x/y coordinates to all objects (makes linking easier, and is recaclulated everytime any adjustments are made) */
    grid: { [x:number]: { [y:number] : LinkedFactoryObject }}  = {};

    /** list of parent level factory objects */
    nodes: LinkedFactoryObject[] = [];
    
    /** list of render tasks that get sorted by z-index. This is used for rendering things in appropriate order */
    renderTasks:RenderTask[];

    /** @todo big FactoryArgs interface for instantiating entire factory from JSON (which gets loaded from local storage or cookie etc */
    constructor() {
        this.renderTasks = [];


        // binding functions so "this" is always the factory even passed outside
        this.addToGrid = this.addToGrid.bind(this);
        this.getNext = this.getNext.bind(this);
        this.addRenderTask = this.addRenderTask.bind(this);
    }
    update(deltaTime:number) {
        // update everything, then order them by z-index for drawing in appropriate order
        //let tasks:RenderTask[] = [];
        for (let node of this.nodes) node.update(deltaTime);
    }

    render(ctx:CanvasRenderingContext2D) {
        //for (let node of this.nodes) node.render(ctx);
        for (let task of this.renderTasks) task.render(ctx);
    }

    // #region editing nodes (add, remove, rotate)
    rotateNode(x:number, y:number) {
        let node = this.getNode(x,y);
        if (node) {
            node.angle += Math.PI / 2;
            this.calculate();
        }
    }

    getNode(x:number, y:number) : LinkedFactoryObject {
        let column = this.grid[x];
        return column ? column[y] : null;
    }

    // #region adding
    private _addNode(node:LinkedFactoryObject) {
        this.nodes.push(node);
    }
    addNode(node:LinkedFactoryObject) {
        // if node exists in this spot, ignore
        if (node && !this.getNode(node.pos.x, node.pos.y)) {
            this._addNode(node);
            this.calculate();
        }
    }


    addNodes(nodes:LinkedFactoryObject[]) {
        for (let node of nodes) {
          this._addNode(node);
        }
        this.calculate();
    }
    // #endregion

    removeNode(node:LinkedFactoryObject) {
        if (node) {

            // make sure we cancel any slot reservations if this slot was in the middle of a transition
            //node.forSlot(slot => {
            //    if (slot.next && slot.move_remaining > 0) {
            //        slot.next.reserved = false;
            //    }
            //})

            // unlink
            for (let n of this.nodes) {
                if (n.link) {
                    n.link.unlinkNext(node.link);
                    n.link.unlinkPrev(node.link);
                }
            }
            
            let index = this.nodes.indexOf(node);
            if (index > -1) {
                this.nodes.splice(index, 1);
                this.calculate();           
            }
            else {
                console.log("node not found to remove");
            }
        }
    }
    // #endregion



    calculate() {
        console.log("----- CALCULATING FACTORY -----");

        // ordering objects by priority (objects with higher priority get updated/rendered first)
        //   TOOD: might want to separate update and render priorities?
        this.nodes = this.nodes.sort((a,b) => a.priority > b.priority ? 1 : a.priority < b.priority ? -1 : 0);

        // resetting grid then using it
        // NOTE: these need to be separate loops. need to add all to grid before linking, and need to link all before calculating
        this.grid = {};

        for (let node of this.nodes) node.reset();
        for (let node of this.nodes) node.add(this.addToGrid);
        for (let node of this.nodes) node.find(this.getNext);

        //console.log("PRE-CORRECTION: ");
        //for (let node of this.nodes) node.debug();

        for (let node of this.nodes) node.correct();

        //console.log("POST-CORRECTION: ");
        //for (let node of this.nodes) node.debug();

        for (let node of this.nodes) node.find(this.getNext);

        // reset render tasks, recursively add render tasks, then order by z-index
        this.renderTasks = [];
        for (let node of this.nodes) node.addRenderTask(this.addRenderTask);
        this.renderTasks = this.renderTasks.sort((a,b) => a.z > b.z ? 1 : b.z > a.z ? -1 : 0);
        //console.log("RENDER TASKS: ", this.renderTasks);
    }

    /** adds render task to the queue (once complete, these tasks will get ordered by z so they get rendered in correct order) */
    /** @note conveyor slots have to draw their background and item separately or else the item will end up behind the next slot's background when animating */
    addRenderTask(z:number, render: (ctx:CanvasRenderingContext2D) => void) {
        this.renderTasks.push({
            z: z,
            render: render
        });
    }

    /** adds item to position grid for linking later on */
    addToGrid(node:LinkedFactoryObject) {
        let column = this.grid[node.pos.x];
        if (!column) column = this.grid[node.pos.x] = {}; 
        column[node.pos.y] = node;
    }
    

    /** finds next item given grid, position, and angle. if next is found, it gets doubly linked */
    link(node:LinkedFactoryObject) {   
        let next = this.getNext(node);
        node.link.linkNext(next?.link);   
    }

    /** finds next item on grid */
    getNext(node:LinkedFactoryObject) {
        // find next x/y given current position and angle
        let inst = node?.link?.instance;
        let x = inst.pos.x + (Math.round(Math.cos(inst.angle)) * inst.size.x);
        let y = inst.pos.y + (Math.round(Math.sin(inst.angle)) * inst.size.y);                  
        let next = this.getNode(x, y);
        
        if (next) {
            console.log(`${node.id} %cMATCH FOUND: `, 'color:green', {
                node: node,
                next: next
            });
        }
        else {
            console.log(`${node.id} %cNO MATCH FOUND`, 'color:red', {
                node: node,
                grid: this.grid,
                next_x: x,
                next_y: y
            });
        }

        return next;
    }

    getPrev(node:LinkedObject<FactoryObject>) {
        // find next x/y given current position and angle
        let inst = node.instance;
        let x = inst.pos.x - (Math.round(Math.cos(inst.angle)) * inst.size.x);
        let y = inst.pos.y - (Math.round(Math.sin(inst.angle)) * inst.size.y);                  
        return this.getNode(x, y);
    }
    
}