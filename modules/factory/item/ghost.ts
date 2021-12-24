import { IFactory } from "../factory";
import { FactoryObject } from "../objects/object";


/** any FactoryObject that can be placed in the factory */
export interface IGhostable extends FactoryObject {
    renderGhost(ctx:CanvasRenderingContext2D):void;
    place(fac:IFactory):boolean;
}

