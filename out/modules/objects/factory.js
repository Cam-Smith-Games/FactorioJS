/*
    this is the master class that manages all factory components
    (i.e. conveyor belts, inserters, etc)

    all nodes within factory inherit from the "Conveyor" class
        - definition of conveyor is "something that transports something"
        - everything transports objects: belts, inserts, assemblers

*/
import { ConveyorBelt } from "./conveyor.js";
import { Inserter } from "./inserter.js";
export class Factory {
    constructor() {
        /** list of all nodes (ALL types) */
        this.nodes = [];
        this.belts = [];
        this.inserters = [];
        /** 2D grid mapping x/y coordinates to conveyor nodes */
        this.node_grid = {};
        /** 2D grid mapping x/y coordinates to conveyor slots */
        this.slot_grid = {};
    }
    update(deltaTime) {
        // inserters get updated before belts so they can grab an item before it starts moving to next slot
        for (let inserter of this.inserters)
            inserter.update(deltaTime);
        for (let belt of this.belts)
            belt.update(deltaTime);
    }
    render(ctx) {
        // TODO: ensure node is on screen before rendering it
        for (let node of this.nodes) {
            node.render(ctx);
        }
    }
    // #region editing nodes (add, remove, rotate)
    rotateNode(x, y) {
        let node = this.findNode(x, y);
        if (node) {
            node.angle += Math.PI / 2;
            this.calculate();
        }
    }
    findNode(x, y) {
        let column = this.node_grid[x];
        return column ? column[y] : null;
    }
    // #region adding nodes
    _addNode(node) {
        this.nodes.push(node);
        if (node instanceof ConveyorBelt) {
            this.belts.push(node);
        }
        else if (node instanceof Inserter) {
            this.inserters.push(node);
        }
    }
    addNode(node) {
        // if node exists in this spot, ignore
        if (node && !this.findNode(node.pos.x, node.pos.y)) {
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
            node.forSlot(slot => {
                if (slot.next && slot.move_remaining > 0) {
                    slot.next.reserved = false;
                }
            });
            if (node.next) {
                node.next.prev = null;
            }
            if (node.prev) {
                // important: in the rare case where u remove a node thats being transitioned to: need to cancel the move or else a null reference will occur
                node.prev.forSlot(slot => {
                    slot.move_remaining = 0;
                    slot.next = null;
                });
                node.prev.next = null;
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
        console.log("----- CALCULATING BELT -----");
        // resetting grids (these are used for linking nodes/slots based on positions and angles)
        this.node_grid = {};
        this.slot_grid = {};
        for (let node of this.nodes) {
            node.addToGrid(this.node_grid);
            node.forSlot(slot => slot.addToGrid(this.slot_grid));
        }
        for (let node of this.nodes)
            node.link(this.node_grid);
        for (let node of this.nodes)
            node === null || node === void 0 ? void 0 : node.calculate(this.slot_grid);
    }
}
//# sourceMappingURL=factory.js.map