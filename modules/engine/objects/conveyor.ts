import { lerp } from "../util/math.js";

export const TILE_SIZE = 64;
export const SLOT_SIZE = 32;


class Transform {
    x:number;
    y:number;
    width:number;
    height:number;
    angle:number;

    constructor(x:number, y:number, angle:number) {
        this.x = x;
        this.y = y;
        this.angle = angle;
    }
}

/** transform that is doubly linked to sibling items (next/prev) */
class LinkedTransform<T> extends Transform {

    prev: T;
    next: T;

    /** adds item to position grid for linking later on */
    addToGrid(grid: { [x:number]: { [y:number] : LinkedTransform<T> }}) {
        let column = grid[this.x];
        if (!column) column = grid[this.x] = {}; 
        column[this.y] = this;
    }
    
    /** finds next item given grid, position, and angle. if next is found, it gets doubly linked */
    link(grid: { [x:number]: { [y:number] : T }}, tileSize:number) {
        let next_x = this.x + (Math.round(Math.cos(this.angle)) * tileSize);
        let next_y = this.y - (Math.round(Math.sin(this.angle)) * tileSize);   
             
        let column = grid[next_x];
        this.next = column ? column[next_y] : null;
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


/** grid containing every conveyor node/slot in the entire map */
export class ConveyorGrid {
    nodes: Conveyor[] = [];

    /** 2D grid mapping x/y coordinates to conveyor nodes */
    node_grid: { [x:number]: { [y:number] : Conveyor }}  = {};

    /** 2D grid mapping x/y coordinates to conveyor slots */
    slot_grid: { [x:number]: { [y:number] : ConveyorSlot }}  = {};

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

    addNodes(nodes:Conveyor[]) {
        for (let node of nodes) {
            this.nodes.push(node);
        }
        this.calculate();
    }

    rotateNode(x:number, y:number) {
        let node = this.findNode(x,y);
        if (node) {
            node.angle += Math.PI / 2;
            this.calculate();
        }
    }

    findNode(x:number, y:number) {
        let column = this.node_grid[x];
        return column ? column[y] : null;
    }

    addNode(node:Conveyor) {
        // if node exists in this spot, ignore
        if (node && !this.findNode(node.x,node.y)) {
            this.nodes.push(node);
            this.calculate();
        }
    }

    removeNode(node:Conveyor) {
        if (node) {

            // make sure we cancel any slot reservations if this slot was in the middle of a transition
            node.forSlot(slot => {
                if (slot.next && slot.move_remaining > 0) {
                    slot.next.reserved = false;
                } 
            })
            
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

            for (let row of node.slots) {
                for (let slot of row) {
                    slot.addToGrid(this.slot_grid);
                }
            }
        }

        // linking nodes (all nodes must be linked before digging into slot logic)
        this.nodes.forEach(node => node.link(this.node_grid, TILE_SIZE));

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
                            slot_angles[1] = Math.PI * 3/2; // top right = 270
                        }
                
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
          
            node?.calculate(i, slot_angles, this);
        }
    }
}


abstract class Conveyor extends LinkedTransform<Conveyor> { 

    // different image for each speed
    static arrows: { [speed:number]: HTMLImageElement} = {
        1: null,
        2: null,
        3: null
    };

    slots:ConveyorSlot[][];
    speed:number = 1;
    index:number = -1;

    constructor(x:number, y:number, angle:number, speed:number) {
        super(x, y, angle);

        this.speed = speed;

        this.slots = [];

        // generating empty slots
        for (let y = 0; y < 2; y++) {
            let row:ConveyorSlot[] = [];
            for (let x = 0; x < 2; x++) {
                let slot_x = this.x + (x * SLOT_SIZE);
                let slot_y = this.y + (y * SLOT_SIZE);
                row.push(new ConveyorSlot(slot_x, slot_y, 0, this));
            }
            this.slots.push(row);
        }
    }

    update(deltaTime:number) {
        //console.log("updating node... ", this.slots);
        
        for (let row of this.slots) {
            for (let slot of row) {
                slot.update(deltaTime);
            }
        }
    }

    render(ctx:CanvasRenderingContext2D) {

        ctx.strokeStyle = "white";
        ctx.strokeRect(this.x, this.y, TILE_SIZE, TILE_SIZE);

        ctx.save();
        ctx.translate(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2);
        ctx.rotate(-this.angle);
        ctx.drawImage(Conveyor.arrows[this.speed], -TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
        ctx.restore();

        //ctx.fillStyle = "red";
        //ctx.textAlign = "center";
        //ctx.font = "24px Arial";
        //ctx.fillText(this.index.toString(), this.x + TILE_SIZE/2, this.y + TILE_SIZE/2 + 8, TILE_SIZE);

        this.forSlot(slot => slot.render(ctx));
    }

    /** loop thru 2D array of node slots */
    forSlot (func: (slot:ConveyorSlot) => void) {
        for (let row of this.slots) {
            for (let slot of row) {
                func(slot);
            }
        }
    }

    calculate(index:number, slot_angles:number[], belt:ConveyorGrid) {
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

export class SlowConveyor extends Conveyor {
    constructor(x:number, y:number, angle:number) {
        super(x, y, angle, 1);
    }
}
export class FastConveyor extends Conveyor {
    constructor(x:number, y:number, angle:number) {
        super(x, y, angle, 2);
    }
}
export class SuperConveyor extends Conveyor {
    constructor(x:number, y:number, angle:number) {
        super(x, y, angle, 3);
    }
}


/** slot within conveyor belt that actually holds items (each conveyor node is 2x2 slots) */
class ConveyorSlot extends LinkedTransform<ConveyorSlot> {

    node:Conveyor;
    item:ItemDetails;

    /** this gets set to true when an item is transitioning to this slot */
    // this is important for preventing multiple sources from animation multiple items to same slot
    // its a rare scenario, but has happened when moving belts around
    reserved:boolean = false;

    constructor(x:number,y:number,angle:number,node:Conveyor) {
        super(x,y,angle);
        this.node = node;
    }

    /** inverted percentage (1-0) of move animation */
    // i.e. when moving from slot to slot, move_remaining is immediately set to 1.
    //      as the move is animated, it gets decremented deltaTime*speed, towards 0
    //      when move_remaining > 0, its moving, when move_remaining <= 0, it's not moving
    move_remaining:number = 0;

    id:string;

    update(deltaTime:number) {

        // next slot available -> move
        if (this.item && this.next && !this.next.reserved && this.move_remaining <= 0 && !this.next.item && this.next.move_remaining <= 0) {
            /*console.log("MOVING ITEM FROM TO", {
                item: this.item.name,
                from: this.id,
                to: this.next?.id
            });*/
            this.move_remaining = 1;
            this.next.reserved = true;
        }

        if (this.move_remaining > 0) {
            // TODO: this needs to be based on belt speed, not a static number
            this.move_remaining -= deltaTime * this.node.speed * 5;

            if (this.move_remaining <= 0) {
                this.move_remaining = 0;
                this.next.reserved = false;
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

        //ctx.strokeStyle = this.item ? "cyan" : "gray";
        //ctx.strokeRect(this.x, this.y, SLOT_SIZE, SLOT_SIZE);

        if (this.item) {
 
            
            let x:number, y:number;
            if (this.move_remaining > 0) {
                x = lerp(this.x, this.next.x, 1-this.move_remaining);
                y = lerp(this.y, this.next.y, 1-this.move_remaining);
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
    image: HTMLImageElement;
    name: string;

    constructor(name:string, image:HTMLImageElement) {
        this.name = name;
        this.image = image;
    }
}
