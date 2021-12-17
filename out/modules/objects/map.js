export const TILE_SIZE = 64;
export const SLOT_SIZE = 32;
/** grid containing every conveyor node/slot in the entire map */
export class ConveyorGrid {
    constructor() {
        this.nodes = [];
        /** 2D grid mapping x/y coordinates to conveyor nodes */
        this.node_grid = {};
        /** 2D grid mapping x/y coordinates to conveyor slots */
        this.slot_grid = {};
    }
    update(deltaTime) {
        for (let node of this.nodes) {
            node.update(deltaTime);
        }
    }
    render(ctx) {
        // TODO: ensure node is on screen before rendering it
        for (let node of this.nodes) {
            node.render(ctx);
        }
    }
    addNodes(nodes) {
        for (let node of nodes) {
            this.nodes.push(node);
        }
        this.calculate();
    }
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
    addNode(node) {
        // if node exists in this spot, ignore
        if (node && !this.findNode(node.pos.x, node.pos.y)) {
            this.nodes.push(node);
            this.calculate();
        }
    }
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
    calculate() {
        console.log("----- CALCULATING BELT -----");
        // resetting grids (these are used for linking nodes/slots based on positions and angles)
        this.node_grid = {};
        this.slot_grid = {};
        for (let node of this.nodes) {
            node.addToGrid(this.node_grid);
            node.forSlot(slot => slot.addToGrid(this.slot_grid));
        }
        // linking nodes (all nodes must be linked before digging into slot logic)
        this.nodes.forEach(node => node.link(this.node_grid));
        for (let i = 0; i < this.nodes.length; i++) {
            let node = this.nodes[i];
            node === null || node === void 0 ? void 0 : node.calculate(i, this);
        }
    }
}
//# sourceMappingURL=map.js.map