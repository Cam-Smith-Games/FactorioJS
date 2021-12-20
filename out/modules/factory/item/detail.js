export class ItemDetails {
    constructor(args) {
        var _a;
        this.id = ItemDetails.NEXT_ID++;
        this.name = args.name;
        this.image = args.image;
        this.stackSize = (_a = args.stackSize) !== null && _a !== void 0 ? _a : 50;
    }
}
ItemDetails.NEXT_ID = 0;
//# sourceMappingURL=detail.js.map