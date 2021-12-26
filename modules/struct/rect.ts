import { IPoint } from "./point.js";


export interface RectangleParams {
    pos?: IPoint;
    size?: IPoint;
    angle?: number;
    scale?: number;

}

export class Rectangle {
 
    pos: IPoint;
    size: IPoint;
    angle: number;
    scale: number;

    constructor(params:RectangleParams) {
        this.pos = params.pos ?? { x: 0, y: 0 };
        this.size = params.size ?? { x: 1, y: 1 };
        this.angle = params.angle ?? 0;
        this.scale = params.scale ?? 1;
    }
    
    /** returns true if this rectangle contains specified point */
    contains(p: IPoint): boolean {
        // NOTE: modifying default "rectangle contains point" logic for a tile-based grid
  
        /*return (
            this.pos.x <= p.x && 
            p.x <= this.pos.x + this.size.x &&
            this.pos.y <= p.y &&
            p.y <= this.pos.y + this.size.y
        );*/

        // NOTE: slightly modified the standard "Rectangle contains point" logic here.
        //      normally everything is <=
        //      but in this case, you want top-left corner to be >=, and bottom right corner to be <
        return (
            p.x >= this.pos.x && 
            p.x < this.pos.x + this.size.x &&
            p.y >= this.pos.y &&
            p.y < this.pos.y + this.size.y
        );
    }

    /** returns true if this rectangle intersects specified rectangle */
    intersects(rect: Rectangle) {  
        return (
            this.pos.x < rect.pos.x + (rect.size.x * rect.scale) &&
            this.pos.x + (this.size.x * this.scale) > rect.pos.x &&
            this.pos.y < rect.pos.y + (rect.size.y * rect.scale) &&
            this.pos.y + (this.size.y * this.scale) > rect.pos.y
        );
    }


    /** transforms canvas for rendering this rectangle 
     * @note this used to do more, (i.e. rotating ctx by rect.angle), but some things don't actually render to match their angle (i.e. belt items always pointing upward) */
    transform(ctx:CanvasRenderingContext2D) {
        let center = this.getCenter();

        //ctx.globalAlpha = this.alpha;
        ctx.translate(center.x, center.y);
        
        //rctx.rotate(this.angle);
        ctx.scale(this.scale, this.scale);

        //ctx.strokeStyle = "rgb(0, 255, 0)";
        //ctx.strokeRect(-this.size.x/2, -this.size.y/2, this.size.x, this.size.y);


    }

    /** untransforms canvas after redenring this rectangle (should only be called after calling this.transform(ctx)) */
    untransform(ctx:CanvasRenderingContext2D) {
        let center = this.getCenter();

        ctx.scale(1 / this.scale, 1 / this.scale);
        //ctx.rotate(-this.angle);
        ctx.translate(-center.x, -center.y);
        //ctx.globalAlpha = 1
    }

    /** gets center position of this rectangle (pos represents top left corner) */
    public getCenter() : IPoint {
        return {
            x: this.pos.x + this.size.x / 2,
            y: this.pos.y + this.size.y / 2
        }
    }

    /** gets forward facing normal vector */
    public getForward() : IPoint {
        return {
            x: Math.round(Math.cos(this.angle)),
            y: Math.round(Math.sin(this.angle))
        }
    }

    /** gets tile directly in-front of this object 
      * @param range distance to look ahead (defaults to rectangle width) 
      **/
    public getFrontTile(range:number = this.size.x) {        
        let forward = this.getForward();   
        return {
            x: this.pos.x + (forward.x * range), 
            y: this.pos.y + (forward.y * range)
        };
    }

    
}