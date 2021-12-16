import { GameObject } from "../engine/gameobject.js";
import { LinkedObject } from "../engine/linkedobject.js";
/** Any object within a Factory that can retrieve, store, and send items from/to another object within the Factory */
export class FactoryObject extends GameObject {
    constructor(args) {
        var _a;
        super(args);
        this.id = ++FactoryObject.NEXT_ID;
        this.priority = (_a = args.priority) !== null && _a !== void 0 ? _a : 99;
    }
}
/** incremented everytime a new object is created. used to keep IDs unique */
FactoryObject.NEXT_ID = 0;
export class LinkedFactoryObject extends FactoryObject {
    constructor(args) {
        super(args);
        this.link = new LinkedObject(this, args);
    }
    /** adds item to position grid for linking later on */
    add(delegate) {
        delegate(this);
    }
    /** finds next object and links to it */
    find(delegate) {
        let next = delegate(this);
        this.link.linkNext(next === null || next === void 0 ? void 0 : next.link);
    }
    /** method for resetting an object prior to factory calculation
     * @example before adding belts to grid, their slot angles get reset to belt angle so that the belts can determine their orientation correctly */
    reset() {
        this.link.prev = null;
        this.link.next = null;
    }
    /** optional overridable method for fixing an object after calculation
     * @example after calculating all belt slots, corners will not be linked appropriately. a second pass will fix the corners */
    correct() { }
    // optional function that can get extended by sub-classes to perform useful debug logs
    debug() {
        var _a, _b, _c, _d;
        console.log(`[FactoryObject ${this.id}]: `, {
            prev: (_b = (_a = this.link) === null || _a === void 0 ? void 0 : _a.prev) === null || _b === void 0 ? void 0 : _b.instance,
            next: (_d = (_c = this.link) === null || _c === void 0 ? void 0 : _c.next) === null || _d === void 0 ? void 0 : _d.instance
        });
    }
}
//# sourceMappingURL=factoryobject.js.map