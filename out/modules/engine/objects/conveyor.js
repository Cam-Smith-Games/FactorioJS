import { lerp } from "../util/math.js";
export const TILE_SIZE = 48;
export const SLOT_SIZE = 24;
class LinkedTransform {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
    }
    /** adds item to position grid for linking later on */
    addToGrid(grid) {
        let column = grid[this.x];
        if (!column)
            column = grid[this.x] = {};
        column[this.y] = this;
    }
    /** finds next item given grid, position, and angle. if next is found, it gets doubly linked */
    link(grid, tileSize) {
        let next_x = this.x + (Math.round(Math.cos(this.angle)) * tileSize);
        let next_y = this.y - (Math.round(Math.sin(this.angle)) * tileSize);
        let next_grid_column = grid[next_x];
        this.next = next_grid_column ? next_grid_column[next_y] : null;
        if (this.next) {
            // @ts-ignore
            this.next.prev = this;
            console.log("MATCH FOUND: ", {
                this: this,
                next: this.next
            });
        }
        else {
            console.log("NO MATCH FOUND", {
                this: this,
                grid: grid
            });
        }
    }
}
export class ConveyorBelt {
    constructor(nodes) {
        /** 2D grid mapping x/y coordinates to node */
        this.node_grid = {};
        /** 2D grid mapping x/y coordinates to slot */
        this.slot_grid = {};
        this.nodes = nodes;
        this.calculate();
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
    calculate() {
        console.log("----- CALCULATING BELT -----");
        // resetting grids (these are used for linking nodes/slots based on positions and angles)
        this.slot_grid = {};
        for (let node of this.nodes) {
            node.addToGrid(this.node_grid);
            for (let row of node.slots) {
                for (let slot of row) {
                    slot.addToGrid(this.slot_grid);
                }
            }
        }
        // linking nodes (all nodes must be linked before digging into slot logic)
        this.nodes.forEach(node => node.link(this.node_grid, TILE_SIZE));
        for (let i = 0; i < this.nodes.length; i++) {
            let node = this.nodes[i];
            // #region DETERMINING INDIVIDUAL SLOT ANGLES BASED ON CURVES
            // TODO: i feel like there's a more mathametical way to do this... i'm doing it somewhat manually
            let slot_angles = [node.angle, node.angle, node.angle, node.angle];
            if (node.prev) {
                let prev_cos = Math.cos(node.prev.angle);
                let prev_sin = Math.sin(node.prev.angle);
                let this_cos = Math.cos(node.angle);
                let this_sin = Math.sin(node.angle);
                /*console.log({
                    prev_angle: node.prev.angle,
                    prev_cos: prev_cos,
                    prev_sin: prev_sin,
                    this_cos: this_cos,
                    this_sin: this_sin
                });*/
                if (prev_sin > this_sin) {
                    // right -> down (0 -> 270) (cos 1 -> cos 0  | sin 0 -> sin -1)
                    if (prev_cos > this_cos) {
                        if (prev_sin > 0) {
                            console.log("UP -> LEFT");
                            slot_angles[3] = Math.PI / 2; // bottom right = 90
                        }
                        else {
                            console.log("RIGHT -> DOWN");
                            slot_angles[0] = 0; // top left = 0
                        }
                    }
                    else if (prev_cos < this_cos) {
                        // left -> down (180 -> 270) (cos -1 -> cos 0 | sin 0 -> sin -1)
                        if (prev_cos < 0) {
                            console.log("LEFT -> DOWN");
                            slot_angles[1] = Math.PI; // top right = 180 
                        }
                        else {
                            console.log("UP -> RIGHT");
                            slot_angles[2] = Math.PI / 2; // bottom left = 90 
                        }
                    }
                }
                else if (prev_sin < this_sin) {
                    // right -> up (0 -> 90) (cos 1 -> cos 0  | sin 0 -> sin 1)
                    if (prev_cos > this_cos) {
                        if (prev_cos > 0) {
                            console.log("RIGHT -> UP");
                            slot_angles[2] = 0; // bottom left = 90
                        }
                        else {
                            console.log("DOWN -> LEFT");
                            slot_angles[1] = Math.PI * 3 / 2; // top right = 270
                        }
                    }
                    // left -> up (180 -> 90) (cos -1 -> cos 0 | sin 0 -> sin 1)
                    else if (prev_cos < this_cos) {
                        if (prev_sin < 0) {
                            console.log("RIGHT -> DOWN");
                            slot_angles[0] = Math.PI * 3 / 2; // top left = 270
                        }
                        else {
                            console.log("LEFT -> UP");
                            slot_angles[3] = Math.PI; // bottom right = 180
                        }
                    }
                }
            }
            // #endregion
            node === null || node === void 0 ? void 0 : node.calculate(i, slot_angles, this);
        }
    }
}
class ConveyorNode extends LinkedTransform {
    constructor(x, y, angle, speed) {
        super(x, y, angle);
        this.speed = 1;
        this.index = -1;
        this.speed = speed;
        this.slots = [];
        // generating empty slots
        for (let y = 0; y < 2; y++) {
            let row = [];
            for (let x = 0; x < 2; x++) {
                let slot_x = this.x + (x * SLOT_SIZE);
                let slot_y = this.y + (y * SLOT_SIZE);
                row.push(new ConveyorSlot(slot_x, slot_y, 0, this));
            }
            this.slots.push(row);
        }
    }
    update(deltaTime) {
        //console.log("updating node... ", this.slots);
        for (let row of this.slots) {
            for (let slot of row) {
                slot.update(deltaTime);
            }
        }
    }
    render(ctx) {
        ctx.strokeStyle = "green";
        ctx.strokeRect(this.x, this.y, TILE_SIZE, TILE_SIZE);
        ctx.save();
        ctx.translate(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2);
        ctx.rotate(-this.angle);
        ctx.drawImage(ConveyorNode.arrows[this.speed], -TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
        ctx.restore();
        //ctx.fillStyle = "red";
        //ctx.textAlign = "center";
        //ctx.font = "24px Arial";
        //ctx.fillText(this.index.toString(), this.x + TILE_SIZE/2, this.y + TILE_SIZE/2 + 8, TILE_SIZE);
        this.forSlot(slot => slot.render(ctx));
    }
    /** loop thru 2D array of node slots */
    forSlot(func) {
        for (let row of this.slots) {
            for (let slot of row) {
                func(slot);
            }
        }
    }
    calculate(index, slot_angles, belt) {
        this.index = index;
        console.log(`----- CALCULATING NODE ${this.index} -----`);
        console.log(slot_angles);
        // NOTE: all angles must be set before linking (hence 2 separate loops)
        let i = 0;
        this.forSlot(slot => {
            slot.id = this.index + " (" + slot.x + "," + slot.y + ")";
            slot.angle = slot_angles[i++];
        });
        this.forSlot(slot => slot.link(belt.slot_grid, SLOT_SIZE));
    }
}
// different image for each speed
ConveyorNode.arrows = {
    1: null,
    2: null,
    3: null
};
export class SlowConveyorNode extends ConveyorNode {
    constructor(x, y, angle) {
        super(x, y, angle, 1);
    }
}
export class FastConveyorNode extends ConveyorNode {
    constructor(x, y, angle) {
        super(x, y, angle, 2);
    }
}
export class SuperConveyorNode extends ConveyorNode {
    constructor(x, y, angle) {
        super(x, y, angle, 3);
    }
}
class ConveyorSlot extends LinkedTransform {
    constructor(x, y, angle, node) {
        super(x, y, angle);
        /** inverted percentage (1-0) of move animation */
        // i.e. when moving from slot to slot, move_remaining is immediately set to 1.
        //      as the move is animated, it gets decremented deltaTime*speed, towards 0
        //      when move_remaining > 0, its moving, when move_remaining <= 0, it's not moving
        this.move_remaining = 0;
        this.node = node;
    }
    update(deltaTime) {
        // next slot available -> move
        if (this.item && this.next && this.move_remaining <= 0 && !this.next.item && this.next.move_remaining <= 0) {
            /*console.log("MOVING ITEM FROM TO", {
                item: this.item.name,
                from: this.id,
                to: this.next?.id
            });*/
            this.move_remaining = 1;
        }
        if (this.move_remaining > 0) {
            // TODO: this needs to be based on belt speed, not a static number
            this.move_remaining -= deltaTime * this.node.speed * 5;
            if (this.move_remaining <= 0) {
                this.move_remaining = 0;
                this.next.item = this.item;
                this.next.move_remaining = 0;
                this.item = null;
            }
        }
        /*if (!this.next) {
            console.log(this.index + " has no next");
        }*/
    }
    render(ctx) {
        //ctx.strokeStyle = this.item ? "cyan" : "gray";
        //ctx.strokeRect(this.x, this.y, SLOT_SIZE, SLOT_SIZE);
        if (this.item) {
            let x, y;
            if (this.move_remaining > 0) {
                x = lerp(this.x, this.next.x, 1 - this.move_remaining);
                y = lerp(this.y, this.next.y, 1 - this.move_remaining);
            }
            else {
                x = this.x;
                y = this.y;
            }
            ctx.drawImage(this.item.image, x, y, SLOT_SIZE, SLOT_SIZE);
        }
    }
}
export class ItemDetails {
    constructor(name, image) {
        this.name = name;
        this.image = image;
    }
}
//# sourceMappingURL=conveyor.js.map