import { Transform } from "../engine/transform.js";
/** Any object within a Factory that can retrieve, store, and send items from/to another object within the Factory */
export class FactoryObject extends Transform {
    constructor(args) {
        var _a, _b;
        super(args);
        this.id = ++FactoryObject.NEXT_ID;
        this.priority = (_a = args.priority) !== null && _a !== void 0 ? _a : 99;
        this.double = (_b = args.double) !== null && _b !== void 0 ? _b : false;
    }
    dispose() { }
    ;
    // #region rendering
    /** inner render method that get's transform applied to ctx */
    // @ts-ignore
    _render(ctx) { }
    ;
    /** method called after exiting ctx translation. mainly used for rendering children that aren't relatively positioned */
    // @ts-ignore
    _postRender(ctx) { }
    ;
    /** wraps the inner render method in code that transforms ctx */
    render(ctx) {
        let x = this.pos.x + this.size.x / 2;
        let y = this.pos.y + this.size.y / 2;
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
    addRenderTask(add) {
        add(this.pos.z, ctx => this.render(ctx));
    }
    // #endregion
    // #region linking
    linkNext(next) {
        this.next = next;
        // if doubly linked, linked next back to this
        if (this.next && this.double) {
            this.next.prev = this;
        }
    }
    linkPrev(prev) {
        this.prev = prev;
        // if doubly linked, linked next back to this
        if (this.prev && this.double) {
            this.prev.next = this;
        }
    }
    unlinkPrev(prev) {
        if (this.prev == prev)
            this.prev = null;
    }
    unlinkNext(next) {
        if (this.next == next)
            this.next = null;
    }
    // #endregion
    // #region link calculation
    /** adds item to position grid for linking later on */
    add(delegate) {
        delegate(this);
    }
    /** finds next object and links to it */
    find(delegate) {
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
    correct() { }
    // optional function that can get extended by sub-classes to perform useful debug logs
    debug() {
        console.log(`[FactoryObject ${this.id}]: `, {
            prev: this.prev,
            next: this.next
        });
    }
}
/** incremented everytime a new object is created. used to keep IDs unique */
FactoryObject.NEXT_ID = 0;
//# sourceMappingURL=factoryobject.js.map