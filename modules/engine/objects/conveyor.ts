
/*export interface IUpdatable {
    /** if truthy value is returned, remove from parent (item died) *
    update(deltaTime:number) : boolean | void;
}
export interface IRenderable {
    render(ctx:CanvasRenderingContext2D) : void;
}

interface IGameObject {

    /** if truthy value is returned, remove from parent (item died) *
    update(deltaTime:number) : boolean | void;

    render(ctx:CanvasRenderingContext2D) : void;

}

interface IBeltObject extends IGameObject {
    /** recalculates linked lists of the belt system *
    recalculate() : void;
}*/

import { lerp } from "../util/math.js";

const TILE_SIZE = 48;
const SLOT_SIZE = 24;


export class ConveyorBelt {
    nodes: ConveyorNode[];

    /** 2D grid mapping x/y coordinates to node */
    node_grid: { [x:number]: { [y:number] : ConveyorNode }}  = {};

    /** 2D grid mapping x/y coordinates to slot */
    slot_grid: { [x:number]: { [y:number] : ConveyorSlot }}  = {};

    constructor(nodes:ConveyorNode[]) {
        this.nodes = nodes;
    }

    update(deltaTime:number) {
        for (let node of this.nodes) {
            node.update(deltaTime);
        }
    }

    render(ctx:CanvasRenderingContext2D) {
        // TODO: ensure node is on screen before rendering it
        for (let node of this.nodes) {
            node.render(ctx);
        }
    }


    recalculate() {
        console.log("----- CALCULATING BELT -----");

        // resetting slot grid (this is used for choosing next slot for each slot based on individual slot angles)
        this.slot_grid = {};
        for (let node of this.nodes) {

            let node_grid_column = this.node_grid[node.x];
            if (!node_grid_column) { 
                node_grid_column = this.node_grid[node.x] = {};
            }
            node_grid_column[node.y] = node;

            for (let row of node.slots) {
                for (let slot of row) {
                    let slot_grid_column = this.slot_grid[slot.x];
                    if (!slot_grid_column) {
                        slot_grid_column = this.slot_grid[slot.x] = {};
                    }
                    slot_grid_column[slot.y] = slot;
                }
            }
        }


        for (let node of this.nodes) {
            let next_x = node.x + (Math.round(Math.cos(node.angle)) * TILE_SIZE);
            let next_y = node.y - (Math.round(Math.sin(node.angle)) * TILE_SIZE);        
            let next_grid_column = this.node_grid[next_x];
            node.next = next_grid_column ? next_grid_column[next_y] : null;
            if (node.next) node.next.prev = node;
        }

        for (let i=0; i<this.nodes.length; i++) {
            let node = this.nodes[i];

 
            // #region DETERMINING INDIVIDUAL SLOT ANGLES BASED ON CURVES

            // TODO: i feel like there's a more mathametical way to do this... i'm doing it somewhat manually
            let slot_angles = [node.angle, node.angle, node.angle, node.angle]; 
            
            if (node.prev) {

                let prev_cos = Math.cos(node.prev.angle);
                let prev_sin = Math.sin(node.prev.angle);
                let this_cos = Math.cos(node.angle);
                let this_sin = Math.sin(node.angle);

                console.log({
                    prev_angle: node.prev.angle,
                    prev_cos: prev_cos,
                    prev_sin: prev_sin,
                    this_cos: this_cos,
                    this_sin: this_sin
                });

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
                    // left -> down (180 -> 270) (cos -1 -> cos 0 | sin 0 -> sin -1)
                    else if (prev_cos < this_cos) {
                        console.log("LEFT -> DOWN");
                        slot_angles[1] = Math.PI; // top right = 180 
                    }
                }
                else if (prev_sin < this_sin) {
                    // right -> up (0 -> 90) (cos 1 -> cos 0  | sin 0 -> sin 1)
                    if (prev_cos > this_cos) {
                        console.log("RIGHT -> UP");
                        slot_angles[2] = 0; // bottom left = 90
                    }
                    // left -> up (180 -> 90) (cos -1 -> cos 0 | sin 0 -> sin 1)
                    else if (prev_cos < this_cos) {
                        if (prev_sin < 0) {
                            console.log("RIGHT -> DOWN");
                            slot_angles[0] = Math.PI * 3/2; // top left = 270
                        }
                        else {
                            console.log("LEFT -> UP");
                            slot_angles[3] = Math.PI; // bottom right = 180
                        }
                    }
                }   
            }
            // #endregion
          
            node?.recalculate(i, slot_angles, this);
        }
    }
}

export class ConveyorNode { 
    x:number;
    y:number;
    angle:number;
    
    prev:ConveyorNode;
    next:ConveyorNode;
    slots:ConveyorSlot[][];

    index:number = -1;

    constructor(x:number, y:number, angle:number, next:ConveyorNode) {
        this.x = x;
        this.y = y;
        this.angle = angle; 
        this.next = next;

        this.slots = [];
        for (let y = 0; y < 2; y++) {
            let row:ConveyorSlot[] = [];
            for (let x = 0; x < 2; x++) {
                let slot_x = this.x + (x * SLOT_SIZE);
                let slot_y = this.y + (y * SLOT_SIZE);
                row.push(new ConveyorSlot(slot_x, slot_y));
            }
            this.slots.push(row);
        }
    }

    update(deltaTime:number) {
        for (let row of this.slots) {
            for (let slot of row) {
                slot?.update(deltaTime);
            }
        }
    }

    render(ctx:CanvasRenderingContext2D) {

        ctx.strokeStyle = "green";
        ctx.strokeRect(this.x, this.y, TILE_SIZE, TILE_SIZE);

        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.font = "24px Arial";
        ctx.fillText(this.index.toString(), this.x + TILE_SIZE/2, this.y + TILE_SIZE/2 + 8, TILE_SIZE);

        for (let row of this.slots) {
            for (let slot of row) {
                slot.render(ctx);
            }
        }
    }

    recalculate(index:number, slot_angles:number[], belt:ConveyorBelt) {
        this.index = index;

        console.log(`----- CALCULATING NODE ${this.index} -----`);

        console.log(slot_angles);

        let i = 0;
        for (let row of this.slots) {
            for (let slot of row) {
                
                slot.angle = slot_angles[i];
                let next_x = slot.x + (Math.round(Math.cos(slot.angle)) * SLOT_SIZE);
                let next_y = slot.y - (Math.round(Math.sin(slot.angle)) * SLOT_SIZE);        
                
                console.log(`(${slot.x}, ${slot.y}) (angle = ${slot.angle}) -> (${next_x}, ${next_y}))`)
                let grid_column = belt.slot_grid[next_x];
                if (grid_column) {
                    slot.next = grid_column[next_y];
                } else {
                    slot.next = null;
                }

                slot.id = this.index + " (" + slot.x + "," + slot.y + ")";

                //console.log("SLOT " + slot.id + " NEXT = [" + next_x + ", " + next_y + "]" );
                i++;
            }
        }
    }


    getSlotCoordinates() {
        // converting world coordinates to slot coordinates
        //  multiplying by 2 because each conveyor node is 2x2
        return {
            x: (this.x / TILE_SIZE) * 2,
            y: (this.y / TILE_SIZE) * 2
        }; 
    }

}



class ConveyorSlot {
    x:number;
    y:number;
    angle:number;

    node:ConveyorNode;
    next:ConveyorSlot;
    item:ItemDetails;


    /** inverted percentage (1-0) of move animation */
    // i.e. when moving from slot to slot, move_remaining is immediately set to 1.
    //      as the move is animated, it gets decremented deltaTime*speed, towards 0
    //      when move_remaining > 0, its moving, when move_remaining <= 0, it's not moving
    move_remaining:number = 0;

    id:string;

    constructor(x:number, y:number) {
        this.x = x;
        this.y = y;
    }

    update(deltaTime:number) {

        
        if (this.move_remaining > 0) {
            // TODO: speed should be determines by belt speed, not hard-coded
            this.move_remaining -= deltaTime / 100;       
            if (this.move_remaining < 0) {
                //console.log("clamping to 0");
                this.move_remaining = 0;
            }        

            /*console.log("move_remaining: ", {
                move_remaining: this.move_remaining,
                deltaTime: deltaTime
            });*/
        }

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
            this.move_remaining -= deltaTime / 100;

            if (this.move_remaining <= 0) {
                console.log("DONE MOVING");
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

    render(ctx:CanvasRenderingContext2D) {

        ctx.strokeStyle = this.item ? "cyan" : "gray";
        ctx.strokeRect(this.x, this.y, SLOT_SIZE, SLOT_SIZE);

        if (this.item) {
 
            
            let x:number, y:number;
           // if (this.move_remaining > 0) {
            //    x = lerp(this.x, this.next.x, 1-this.move_remaining);
            //    y = lerp(this.y, this.next.y, 1-this.move_remaining);
           // } 
            //else {
                x = this.x;
                y = this.y;
            //}

            ctx.drawImage(this.item.image, x, y, SLOT_SIZE, SLOT_SIZE);

        }
    }

}




/** this is not actually an instance of an item, it's an object containing all information about a partificular item */
export class ItemDetails {
    image: HTMLImageElement;
    name: string;

    constructor(name:string, image:HTMLImageElement) {
        this.name = name;
        this.image = image;
    }
}
/*


class ConveyorBelt
    linked list of conveyornodes



*/
// list of coordinate "nodes"
//  items travel from node a to b to c
//  each node stores x/y, 