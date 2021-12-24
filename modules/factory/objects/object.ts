import { GameObject, GameObjectParams } from "../../game/gameobject.js";
import { IPoint } from "../../struct/point.js";
import { IFactory } from "../factory.js";

export interface FactoryObjectParams extends GameObjectParams {
    /** if factory is provided, object will automatically be added to factory. Otherwise, it will be added later (i.e. IGhostable.place when user places with mouse) */
    factory?: IFactory
}

export abstract class FactoryObject extends GameObject {

    /** incremented everytime a new object is created. used to keep IDs unique */
    private static NEXT_ID = 0;

    /** unique identifier for this object (for debugging purposes) */
    id: number;
    
    static size:IPoint;

    constructor(params: FactoryObjectParams) {
        super(params);
        this.id = ++FactoryObject.NEXT_ID;

        if (params.factory) {
            this.addToFactory(params.factory);
        }
    }

    
    abstract addToFactory(factory:IFactory):void;

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


    /** some classes do extra things when rotating (i.e. belts need to reset their animation and/or update what they're linked to) */
    rotate(amount:number) {
        this.angle += amount;
    }

    /** some classes do extra things when moving (i.e. belts need to update their slot positions) */
    setPosition(p:IPoint) {
        this.pos.x = p.x;
        this.pos.y = p.y;
    }

    // #region optional input events (unique to each implemtation)
    onMouseEnter(): void {
        //console.log("MOUSE ENTER: ", this);
    }
    onMouseLeave(): void {
        //console.log("MOUSE LEAVE: ", this);
    }
    onClick(button:number, fac:IFactory): void {
        /*console.log("CLICKED: ", {
            object: this,
            button: button,
            fac: fac
        });*/

        // LEFT -> rotate
        if (button == 0) {
            //this.angle -= Math.PI / 2;
            this.angle = fac.mouse.angle;
        }
        // RIGHT -> delete
        else if (button == 2) {
            fac.remove(this);
            console.log("DELETE");
        }

        fac.link();
    }
    // #endregion

}

