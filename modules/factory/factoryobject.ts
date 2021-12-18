import { GameObject, GameObjectParams } from "../game/gameobject.js";

export interface FactoryObjectParams extends GameObjectParams {}

export abstract class FactoryObject extends GameObject {

    /** incremented everytime a new object is created. used to keep IDs unique */
    static NEXT_ID = 0;

    /** unique identifier for this object (for debugging purposes) */
    id: number;


    constructor(params: FactoryObjectParams) {
        super(params);
        this.id = ++FactoryObject.NEXT_ID;
    }


    render(ctx: CanvasRenderingContext2D): void {
        // IF DEBUG
        ctx.strokeStyle = "#0f0";
        ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y); 
    };

    /** optional method for resetting certain things prior to re-linking */
    reset(): void {}

    /** link this object to other object(s) in the factory */
    // @ts-ignore 
    link(fac: IFactory): void {};

}

