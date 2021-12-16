/** GameObject that is doubly linked to next/prev GameObjects of specified Type
 * Type T = class that instance has to be
 * Type P = type that previous sibling has to be (defaults to T)
 * Type N = type that next sibling has to be (defaults to T)
*/
export class LinkedObject {
    constructor(instance, args) {
        var _a;
        this.instance = instance;
        this.prev = args.prev;
        this.next = args.next;
        this.double = (_a = args.double) !== null && _a !== void 0 ? _a : false;
    }
    linkNext(next) {
        this.next = next;
        // if doubly linked, linked next back to this
        if (this.next && this.double) {
            this.next.prev = this;
        }
    }
    linkPrev(prev) {
        this.prev = prev;
        // if doubly linked, linked next back to this
        if (this.prev && this.double) {
            this.prev.next = this;
        }
    }
    unlinkPrev(prev) {
        if (this.prev == prev)
            this.prev = null;
    }
    unlinkNext(next) {
        if (this.next == next)
            this.next = null;
    }
}
//# sourceMappingURL=linkedobject.js.map