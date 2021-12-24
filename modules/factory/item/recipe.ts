import { ItemDetails } from "./detail.js";


export interface RecipeItemParams {
    item:ItemDetails;
    quantity?:number;
}
/** Any item that exists within a Recipe (either an input or output) */
export class RecipeItem {
    item:ItemDetails;
    quantity:number;

    constructor(args:RecipeItemParams) {
        this.item = args.item;
        this.quantity = args.quantity ?? 1;
    }
}

export interface RecipeParams {
    inputs:RecipeItem[];
    output:RecipeItem;
    duration:number;
}
/** Used for crafting items. Takes any number of inputs/outputs and a baseline duration to craft */
export class Recipe {

    public static recipes: Record<number,Recipe>;
   
    private static NEXT_ID: number = 0;

    /** unique identifier for this item */
    id:number;

    inputs:RecipeItem[];
    output:RecipeItem;
    duration:number;

    constructor(args:RecipeParams) {
        this.id = Recipe.NEXT_ID++;

        this.inputs = args.inputs;
        this.output = args.output;
        this.duration = args.duration;

        // store in dictionary
        Recipe.recipes[this.id] = this;
    }
}


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
