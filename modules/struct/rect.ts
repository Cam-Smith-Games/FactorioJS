import { IPoint } from "./point.js";


export interface RectangleParams {
    pos?: IPoint;
    size?: IPoint;
    angle?: number;
}

export class Rectangle {
 
    pos: IPoint;
    size: IPoint;
    angle: number;

    constructor(params:RectangleParams) {
        this.pos = params.pos ?? { x: 0, y: 0 };
        this.size = params.size ?? { x: 1, y: 1 };
        this.angle = params.angle ?? 0;
    }
    
    contains(p: IPoint): boolean {
        return (
            this.pos.x <= p.x && 
            p.x <= this.pos.x + this.size.x &&
            this.pos.y <= p.y &&
            p.y <= this.pos.y + this.size.y
        );
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