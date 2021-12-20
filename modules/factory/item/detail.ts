export interface ItemDetailParams {
    name: string;
    image: HTMLImageElement;
    stackSize?: number;
}
export class ItemDetails {
    private static NEXT_ID: number = 0;

    /** unique identifier for this item */
    id:number;
    image: HTMLImageElement;
    name: string;
    stackSize:number;

    constructor(args:ItemDetailParams) {
        this.id = ItemDetails.NEXT_ID++;
        this.name = args.name;
        this.image = args.image;
        this.stackSize = args.stackSize ?? 50;

    }
}

