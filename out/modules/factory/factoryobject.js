import { GameObject } from "../game/gameobject.js";
export class FactoryObject extends GameObject {
    constructor(params) {
        super(params);
        this.id = ++FactoryObject.NEXT_ID;
        this.addToFactory(params.factory);
    }
    render(ctx) {
        // IF DEBUG
        ctx.strokeStyle = "#0f0";
        ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
    ;
    /** optional method for resetting certain things prior to re-linking */
    reset() { }
    /** link this object to other object(s) in the factory */
    // @ts-ignore 
    link(fac) { }
    ;
}
/** incremented everytime a new object is created. used to keep IDs unique */
FactoryObject.NEXT_ID = 0;
//# sourceMappingURL=factoryobject.js.map