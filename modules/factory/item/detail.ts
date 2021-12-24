export interface ItemDetailParams {
    name: string;
    image: HTMLImageElement;
    stackSize?: number;
}
export class ItemDetails {

    public static items:Record<number,ItemDetails>;
    // less efficient dictionary of items. only used for instantiating recipes
    public static item_names:Record<string,ItemDetails>;

    private static NEXT_ID: number = 0;

    /** unique identifier for this item */
    id:number;
    image: HTMLImageElement;

    /** NOTE: name must be consistent with key in recipe dictionary */
    name: string;
    stackSize:number;

    constructor(args:ItemDetailParams) {
        this.id = ItemDetails.NEXT_ID++;
        this.name = args.name;
        this.image = args.image;
        this.stackSize = args.stackSize ?? 50;

        // store in dictionaries
        ItemDetails.items[this.id] = this;
        ItemDetails.item_names[this.name] = this;
    }
}

/** creates every item in the game (which get stored in constant dictionary for later retrieval by ID) */
export function createItems(images: Record<string,HTMLImageElement>) {
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