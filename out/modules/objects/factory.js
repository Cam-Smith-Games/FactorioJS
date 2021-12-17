/*
    this is the master class that manages all factory components
    (i.e. conveyor belts, inserters, etc)

    all nodes within factory inherit from the "Conveyor" class
        - definition of conveyor is "something that transports something"
        - everything transports objects: belts, inserts, assemblers

*/
export class Factory {
    /** @todo big FactoryArgs interface for instantiating entire factory from JSON (which gets loaded from local storage or cookie etc */
    constructor() {
        // TODO: nodes list will be belts, inserters, etc, NOT slots
        // when calculating, an "addToGrid" delegate is passed around, which allows belts to add their slots to grid
        // 
        /** 2D grip mapping x/y coordinates to outmost objects (i.e. selectable containers, NOT slots) */
        this.objects = {};
        /** 2D grid mapping x/y coordinates to inner-most objects (makes linking easier, and is recaclulated everytime any adjustments are made) */
        this.grid = {};
        /** list of parent level factory objects */
        this.nodes = [];
        this.renderTasks = [];
        // binding functions so "this" is always the factory even passed outside
        this.addToGrid = this.addToGrid.bind(this);
        this.getNext = this.getNext.bind(this);
        this.addRenderTask = this.addRenderTask.bind(this);
    }
    update(deltaTime) {
        // update everything, then order them by z-index for drawing in appropriate order
        //let tasks:RenderTask[] = [];
        for (let node of this.nodes)
            node.update(deltaTime);
    }
    render(ctx) {
        //for (let node of this.nodes) node.render(ctx);
        for (let task of this.renderTasks)
            task.render(ctx);
    }
    // #region editing nodes (add, remove, rotate)
    rotateNode(x, y) {
        let node = this.getNode(x, y);
        if (node) {
            node.angle += Math.PI / 2;
            this.calculate();
        }
    }
    getNode(x, y) {
        let column = this.grid[x];
        return column ? column[y] : null;
    }
    // #region adding
    _addNode(node) {
        this.nodes.push(node);
    }
    addNode(node) {
        // if node exists in this spot, ignore
        if (node && !this.getNode(node.pos.x, node.pos.y)) {
            this._addNode(node);
            this.calculate();
        }
    }
    addNodes(nodes) {
        for (let node of nodes) {
            this._addNode(node);
        }
        this.calculate();
    }
    // #endregion
    removeNode(node) {
        if (node) {
            // make sure we cancel any slot reservations if this slot was in the middle of a transition
            //node.forSlot(slot => {
            //    if (slot.next && slot.move_remaining > 0) {
            //        slot.next.reserved = false;
            //    }
            //})
            // unlink
            for (let n of this.nodes) {
                n.unlinkNext(node);
                n.unlinkPrev(node);
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
        this.nodes = this.nodes.sort((a, b) => a.priority > b.priority ? 1 : a.priority < b.priority ? -1 : 0);
        // resetting grid then using it
        // NOTE: these need to be separate loops. need to add all to grid before linking, and need to link all before calculating
        this.grid = {};
        for (let node of this.nodes)
            node.reset();
        for (let node of this.nodes)
            node.add(this.addToGrid);
        for (let node of this.nodes)
            node.find(this.getNext);
        //console.log("PRE-CORRECTION: ");
        //for (let node of this.nodes) node.debug();
        for (let node of this.nodes)
            node.correct();
        //console.log("POST-CORRECTION: ");
        //for (let node of this.nodes) node.debug();
        for (let node of this.nodes)
            node.find(this.getNext);
        // reset render tasks, recursively add render tasks, then order by z-index
        this.renderTasks = [];
        for (let node of this.nodes)
            node.addRenderTask(this.addRenderTask);
        this.renderTasks = this.renderTasks.sort((a, b) => a.z > b.z ? 1 : b.z > a.z ? -1 : 0);
        //console.log("RENDER TASKS: ", this.renderTasks);
    }
    /** adds render task to the queue (once complete, these tasks will get ordered by z so they get rendered in correct order) */
    /** @note conveyor slots have to draw their background and item separately or else the item will end up behind the next slot's background when animating */
    addRenderTask(z, render) {
        this.renderTasks.push({
            z: z,
            render: render
        });
    }
    /** adds item to position grid for linking later on */
    addToGrid(node) {
        let column = this.grid[node.pos.x];
        if (!column)
            column = this.grid[node.pos.x] = {};
        column[node.pos.y] = node;
    }
    /** finds next item given grid, position, and angle. if next is found, it gets doubly linked */
    link(node) {
        let next = this.getNext(node);
        node.linkNext(next);
    }
    /** finds next item on grid */
    getNext(node) {
        // find next x/y given current position and angle
        let x = node.pos.x + (Math.round(Math.cos(node.angle)) * node.size.x);
        let y = node.pos.y + (Math.round(Math.sin(node.angle)) * node.size.y);
        let next = this.getNode(x, y);
        /*if (next) {
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
         }*/
        return next;
    }
    getPrev(node) {
        // find next x/y given current position and angle
        let x = node.pos.x - (Math.round(Math.cos(node.angle)) * node.size.x);
        let y = node.pos.y - (Math.round(Math.sin(node.angle)) * node.size.y);
        return this.getNode(x, y);
    }
}
//# sourceMappingURL=factory.js.map