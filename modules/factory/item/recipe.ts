import { ItemDetails } from "./detail";


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
    inputs:RecipeItem[];
    output:RecipeItem;
    duration:number;

    constructor(args:RecipeParams) {
        this.inputs = args.inputs;
        this.output = args.output;
        this.duration = args.duration;
    }
}


