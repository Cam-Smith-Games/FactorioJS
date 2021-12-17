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
}
//# sourceMappingURL=gameobject.js.map