/*
    I originally planned for GameObject to be super powerful:
    - all child GameObjects get updated/rendered from their parent
    - all GameObjects have both world coordinates and local coordinates relative to their parent

    The issue with local/world coordinates is that:
        a. requires complicated recursive matrix bullshit to calculate world coordinates from a child thats multiple levels deep
            - it's not as simple as adding parent position and recursing. rotating and scaling totally fucks everything up
        b. ends up making things more complicated because some things are within context of local space while others are within context of world space


    When theres a million sprites on the screen, i dont want eac hone to have to do recursive math to get it's world coordinate everytime
    Therefore, all coordinates will be world coordinates for now

*/
import { Transform } from "./transform.js";
/** Any object within a game that has a Transform and the ability to be updated/rendered.
  * Optional Type T: Limit what types of children this object can have (Default = generic GameObject) */
export class GameObject extends Transform {
    constructor(args) {
        var _a;
        super(args);
        this.children = (_a = args.children) !== null && _a !== void 0 ? _a : [];
        //this.parent = args.parent;
        //if (this.parent) {
        //    this.parent.children.push(this);
        //}
    }
    dispose() {
        this.children.forEach(child => child.dispose());
    }
    ;
    /** inner render method that get's transform applied to ctx */
    // @ts-ignore
    _render(ctx) { }
    ;
    /** method called after exiting ctx translation. mainly used for rendering children that aren't relatively positioned */
    // @ts-ignore
    _postRender(ctx) {
        console.log("defualt postrender", this);
    }
    ;
    /*public update(deltaTime:number) : boolean | void {
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
    }*/
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
}
//# sourceMappingURL=gameobject.js.map