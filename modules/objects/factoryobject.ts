import { Transform, TransformArgs } from "../engine/transform.js";

export interface FactoryObjectArgs extends TransformArgs  {
    priority?:number;
    double?:boolean;
}
/** Any object within a Factory that can retrieve, store, and send items from/to another object within the Factory */
export abstract class FactoryObject extends Transform { 

    /** incremented everytime a new object is created. used to keep IDs unique */
    static NEXT_ID = 0;
    /** unique identifier for this object (for debugging) */
    id:number;

    /** Determines order within main Factory update loop. For example, inserters need to be updated before conveyor belts so that they can grab an item before the next conveyor belt takes it.*/
    priority:number;

    prev:FactoryObject;
    next:FactoryObject;
    double:boolean;

    constructor(args:FactoryObjectArgs) {
        super(args);
        this.id = ++FactoryObject.NEXT_ID;
        this.priority = args.priority ?? 99;
        this.double = args.double ?? false;
    }
    
    dispose() : void {};

    /** inner update method that is defined uniquely for each GameObject. can return true to signify that child was destroyed and should be removed from parent */
    abstract update(deltaTime:number) : boolean | void;

    
    // #region rendering
    /** inner render method that get's transform applied to ctx */
    // @ts-ignore
    protected _render(ctx:CanvasRenderingContext2D):void {};

    /** method called after exiting ctx translation. mainly used for rendering children that aren't relatively positioned */
    // @ts-ignore
    protected _postRender(ctx:CanvasRenderingContext2D):void {};


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
 
    addRenderTask(add: (z:number, render: (ctx:CanvasRenderingContext2D) => void) => void) {
        add(this.pos.z, ctx => this.render(ctx));
    }
    // #endregion

    // #region linking
    linkNext(next:FactoryObject) {
        this.next = next;
        
        // if doubly linked, linked next back to this
        if (this.next && this.double) {
            this.next.prev = this;
        }
    }

    linkPrev(prev:FactoryObject) {
        this.prev = prev;

        // if doubly linked, linked next back to this
        if (this.prev && this.double) {
            this.prev.next = this;
        }
    }


    unlinkPrev(prev:FactoryObject) {
        if (this.prev == prev) this.prev = null;
    }
    unlinkNext(next:FactoryObject) {
        if (this.next == next) this.next = null;
    }
    // #endregion

    // #region link calculation
    /** adds item to position grid for linking later on */
    add(delegate: (node:FactoryObject) => void) {
        delegate(this);
    }
    

    /** finds next object and links to it */
    find(delegate: (node:FactoryObject) => FactoryObject) {
        let next = delegate(this);
        this.linkNext(next);
    }

    
    /** method for resetting an object prior to factory calculation 
     * @example before adding belts to grid, their slot angles get reset to belt angle so that the belts can determine their orientation correctly */
    reset() {
        this.prev = null;
        this.next = null;
    }

    /** optional overridable method for fixing an object after calculation
     * @example after calculating all belt slots, corners will not be linked appropriately. a second pass will fix the corners */
    correct() {}


     // optional function that can get extended by sub-classes to perform useful debug logs
     debug() { 
        console.log(`[FactoryObject ${this.id}]: `, {
            prev: this.prev,
            next: this.next
        });
     }

    // #endregion
}



