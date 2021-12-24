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

    intersects(rect: Rectangle) {  
        var int = (
            this.pos.x < rect.pos.x + rect.size.x &&
            this.pos.x + this.size.x > rect.pos.x &&
            this.pos.y < rect.pos.y + rect.size.y &&
            this.size.y + this.pos.y > rect.pos.y
        );

        if (int) {

        }
        return int;
    }


    transform(ctx:CanvasRenderingContext2D) {
        let center = this.getCenter();

        //ctx.globalAlpha = this.alpha;
        ctx.translate(center.x, center.y);
        
        //rctx.rotate(this.angle);
        ctx.scale(this.scale, this.scale);

        //ctx.strokeStyle = "rgb(0, 255, 0)";
        //ctx.strokeRect(-this.size.x/2, -this.size.y/2, this.size.x, this.size.y);


    }

    untransform(ctx:CanvasRenderingContext2D) {
        let center = this.getCenter();

        ctx.scale(1 / this.scale, 1 / this.scale);
        //ctx.rotate(-this.angle);
        ctx.translate(-center.x, -center.y);
        //ctx.globalAlpha = 1
    }

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
      * @param range distance to look ahead (defaults to object width) 
      **/
    public getFrontTile(range:number = this.size.x) {        
        let forward = this.getForward();   
        return {
            x: this.pos.x + (forward.x * range), 
            y: this.pos.y + (forward.y * range)
        };
    }

    
}