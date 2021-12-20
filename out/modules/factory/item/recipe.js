/** Any item that exists within a Recipe (either an input or output) */
export class RecipeItem {
    constructor(args) {
        var _a;
        this.item = args.item;
        this.quantity = (_a = args.quantity) !== null && _a !== void 0 ? _a : 1;
    }
}
/** Used for crafting items. Takes any number of inputs/outputs and a baseline duration to craft */
export class Recipe {
    constructor(args) {
        this.inputs = args.inputs;
        this.output = args.output;
        this.duration = args.duration;
    }
}
//# sourceMappingURL=recipe.js.map