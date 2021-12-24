export class ItemDetails {
    constructor(args) {
        var _a;
        this.id = ItemDetails.NEXT_ID++;
        this.name = args.name;
        this.image = args.image;
        this.stackSize = (_a = args.stackSize) !== null && _a !== void 0 ? _a : 50;
        // store in dictionaries
        ItemDetails.items[this.id] = this;
        ItemDetails.item_names[this.name] = this;
    }
}
ItemDetails.NEXT_ID = 0;
/** creates every item in the game (which get stored in constant dictionary for later retrieval by ID) */
export function createItems(images) {
    ItemDetails.items = {};
    ItemDetails.item_names = {};
    new ItemDetails({
        name: "Iron Ore",
        image: images.iron_ore
    });
    new ItemDetails({
        name: "Iron Bar",
        image: images.iron
    });
    new ItemDetails({
        name: "Iron Helm",
        image: images.iron_helm
    });
}
//# sourceMappingURL=detail.js.map