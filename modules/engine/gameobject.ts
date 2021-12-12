import { ConveyorBelt } from "../objects/conveyor.js";
import { Transform, TransformArgs } from "./transform.js";

export interface GameObjectArgs extends TransformArgs {
    /** list of objects nested under this object. they will get updated/rendered with is object */
    children? : GameObject[];
    /** optional parent to auto-append this item to  */
    parent?: GameObject;
    /** funciton to call when this object is done updating and should be removed from parent */
    dispose?: (obj:GameObject) => Promise<any>|void;   

}


abstract class GameObject extends Transform {

    parent: GameObject;
    children: GameObject[];

    constructor(args:GameObjectArgs) {
        super(args);

        this.children = args.children ?? [];     
        this.parent = args.parent;
        if (this.parent) {
            this.parent.children.push(this);
        }
    }


    dispose() : void {};

    /** inner update method that is defined uniquely for each GameObject. can return true to signify that child was destroyed and should be removed from parent */
    // @ts-ignore
    _update(deltaTime:number) : boolean | void {};

    
    /** inner render method that get's transform applied to ctx */
    // @ts-ignore
    protected _render(ctx:CanvasRenderingContext2D):void {};

    /** method called after exiting ctx translation. mainly used for rendering children that aren't relatively positioned */
    // @ts-ignore
    protected _postRender(ctx:CanvasRenderingContext2D):void {
        console.log("defualt postrender", this)
    };

    public update(deltaTime:number) : boolean | void {
        this._update(deltaTime);

        if (this.children?.length) {
            for(let i = this.children.length - 1; i >- 1; i--) {
                let child = this.children[i];
                // object done updating ? remove it 
                if (child.update(deltaTime)) {
                    child.dispose();
                    this.children.splice(i, 1);
                }
            }
        }
    }

    /** wraps the inner render method in code that transforms ctx */
    public render(ctx : CanvasRenderingContext2D) {
        let x = this.pos.x + this.size.x / 2;
        let y =  this.pos.y + this.size.y / 2;

        ctx.globalAlpha = this.alpha;
        ctx.translate(x, y);     
        ctx.rotate(this.angle);
        ctx.scale(this.scale.x, this.scale.y);

        //ctx.strokeStyle = "rgb(0, 255, 0)";
        //ctx.strokeRect(-this.size.x/2, -this.size.y/2, this.size.x, this.size.y);

        //ctx.fillStyle = "yellow";
        //ctx.fillRect(-2, -2, 4, 4);

        this._render(ctx);
        //this.children.forEach(child => child.render(ctx));

        ctx.scale(1 / this.scale.x, 1 / this.scale.y);
        ctx.rotate(-this.angle);
        ctx.translate(-x, -y);
        ctx.globalAlpha = 1;

        this._postRender(ctx);
    }

      
}

/** game object that is doubly linked to sibling objects of specified type (next/prev) */
export abstract class LinkedObject<T> extends GameObject {

    prev: T;
    next: T;

    /** adds item to position grid for linking later on */
    addToGrid(grid: { [x:number]: { [y:number] : LinkedObject<T> }}) {
        let column = grid[this.pos.x];
        if (!column) column = grid[this.pos.x] = {}; 
        column[this.pos.y] = this;
    }
    
    /** finds next item given grid, position, and angle. if next is found, it gets doubly linked */
    link(grid: { [x:number]: { [y:number] : T }}) {

        // find next x/y given current position and angle
        let next_x = this.pos.x + (Math.round(Math.cos(this.angle)) * this.size.x);
        let next_y = this.pos.y + (Math.round(Math.sin(this.angle)) * this.size.y);   
             
        
        let column = grid[next_x];

        // @ts-ignore
        // if already linked, make sure to unlink
        if (this.next) this.next.prev = null;

        this.next = column ? column[next_y] : null;

        // if next is found, doubly link
        if (this.next) {

            // only doubly link conveyors, multiple inserters can share the same belt
            if (this instanceof ConveyorBelt && this.next instanceof ConveyorBelt) {
                // @ts-ignore
                this.next.prev = this;
            }
         

            console.log("MATCH FOUND: ", {
                this: this,
                next: this.next
            });
        }
        else {
            console.log("NO MATCH FOUND", {
                this: this,
                grid: grid,
                next_x: next_x,
                next_y: next_y
            });
        }
    }



}