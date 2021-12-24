import { GameObject } from "../../game/gameobject.js";
export class FactoryObject extends GameObject {
    constructor(params) {
        super(params);
        this.id = ++FactoryObject.NEXT_ID;
        if (params.factory) {
            this.addToFactory(params.factory);
        }
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
    /** some classes do extra things when rotating (i.e. belts need to reset their animation and/or update what they're linked to) */
    rotate(amount) {
        this.angle += amount;
    }
    /** some classes do extra things when moving (i.e. belts need to update their slot positions) */
    setPosition(p) {
        this.pos.x = p.x;
        this.pos.y = p.y;
    }
    // #region optional input events (unique to each implemtation)
    onMouseEnter() {
        //console.log("MOUSE ENTER: ", this);
    }
    onMouseLeave() {
        //console.log("MOUSE LEAVE: ", this);
    }
    onClick(button, fac) {
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
}
/** incremented everytime a new object is created. used to keep IDs unique */
FactoryObject.NEXT_ID = 0;
//# sourceMappingURL=object.js.map