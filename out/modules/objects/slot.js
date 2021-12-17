import { FactoryObject } from "./factoryobject.js";
export var SlotState;
(function (SlotState) {
    /* slot aint doin shit */
    SlotState[SlotState["IDLE"] = 0] = "IDLE";
    /* slot is currently receiving an item, cannot send or receive anything right now */
    SlotState[SlotState["RECEIVING"] = 1] = "RECEIVING";
    /* slot is currently sending an item, cannot send or receive anything right now */
    SlotState[SlotState["SENDING"] = 2] = "SENDING";
})(SlotState || (SlotState = {}));
export class FactorySlot extends FactoryObject {
    constructor(args) {
        super(args);
        this.item = args.item;
        this.state = SlotState.IDLE;
    }
}
//# sourceMappingURL=slot.js.map