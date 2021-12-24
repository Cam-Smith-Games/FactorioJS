import { ItemDetails } from "./detail.js";
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
        this.id = Recipe.NEXT_ID++;
        this.inputs = args.inputs;
        this.output = args.output;
        this.duration = args.duration;
        // store in dictionary
        Recipe.recipes[this.id] = this;
    }
}
Recipe.NEXT_ID = 0;
/** sets constant dictionary of all recipes in the game */
export function createRecipes() {
    Recipe.recipes = {};
    new Recipe({
        inputs: [
            new RecipeItem({
                item: ItemDetails.item_names["Iron Ore"],
                quantity: 1
            })
        ],
        output: new RecipeItem({
            item: ItemDetails.item_names["Iron Bar"],
            quantity: 1
        }),
        duration: 5
    });
    new Recipe({
        inputs: [
            new RecipeItem({
                item: ItemDetails.item_names["Iron Bar"],
                quantity: 1
            })
        ],
        output: new RecipeItem({
            item: ItemDetails.item_names["Iron Helm"],
            quantity: 1
        }),
        duration: 10
    });
}
//# sourceMappingURL=recipe.js.map