import { ContainerSlot } from "./container.js";
import { IFactory } from "./factory.js";
import { FactoryObject, FactoryObjectParams } from "./object.js";
import { IInsertable } from "./inserter.js";
import { ItemObject } from "./item/object.js";
import { Recipe } from "./item/recipe.js";
import { TILE_SIZE } from "../const.js";
import { ItemMoverObject } from "./item/mover.js";



export interface AssemblerParams extends FactoryObjectParams {
    recipe:Recipe;
    speed?:number;
}
export class Assembler extends FactoryObject implements IInsertable {

    recipe:Recipe;
    /** multiplier that gets applied to selected recipe duration for determining how long a single craft takes */
    speed:number;
    /** timer used to track current craft progress */
    timer:number;


    /** dictionary mapping item ID to a ContainerSlot */
    inputs:Record<number,ContainerSlot>;

    /** output slot */
    // TODO: future recipes might output a physical object and a fluid side-by-side, might need an extra output for that
    output:ContainerSlot;

    /** true when currently crafting */
    crafting:boolean;


    factory:IFactory;

    constructor(args:AssemblerParams) {
        args.size = {
            x: TILE_SIZE * 2,
            y: TILE_SIZE * 2
        };
        super(args);

        this.speed = args.speed ?? 1;
        this.timer = 0;
        this.crafting = false;
        
        this.setRecipe(args.recipe);

        this.factory = args.factory;
        this.factory.assemblers.push(this);
        this.factory.objects.push(this);
    }

    /** set recipe and instantiate input/output slots */
    setRecipe(recipe:Recipe) {
        this.recipe = recipe;
        this.inputs = {};
        for (let input of this.recipe.inputs)  {
            this.inputs[input.item.id] = new ContainerSlot({
                item: input.item
            });
        }
        this.output = new ContainerSlot({
            item: recipe.output.item
        });
    }

    protected addToFactory(factory: IFactory): void {
        factory.assemblers.push(this);
    }

    retrieve(): ItemObject {
        if (this.output.quantity > 0) {
            this.output.quantity--;
            let obj = new ItemObject({
                factory: this.factory,
                item: this.output.item
            });
            return obj;
        }
        return null;
    }

    reserve(from: ItemMoverObject) {   
        return from.item.item.id in this.inputs;
    }
   
    insert(source: ItemMoverObject): boolean {

        // ensure item is part of this recipe
        if (source.item.item.id in this.inputs) {
            let slot = this.inputs[source.item.item.id];
            // if space available -> add
            if (slot.quantity < slot.item.stackSize) {
                slot.quantity++;

                this.factory.removeItem(source.item);
                this.factory.removeObject(source.item);

                return true;
            }
        }

        return false;
    }


    canCraft() {
        if (!this.recipe) return false;

        for (let input of this.recipe.inputs) {
            // no input slot found ? nope
            if (!(input.item.id in this.inputs)) return false;
            let slot = this.inputs[input.item.id];
            // slot found and not enough quantity ? nope
            if (slot.quantity < input.quantity) return false;
        }
        return true;
    }

    update(deltaTime:number) {
        if (this.recipe) {
            // not crafting -> look for available inputs   
            if (!this.crafting) {
                if (this.canCraft()) {
                    // decrement quantities
                    for (let input of this.recipe.inputs) {
                        let slot = this.inputs[input.item.id];
                        slot.quantity -= input.quantity;
                    }
                    this.crafting = true;
                    this.timer = 0;
                }            
            }
            // crafting -> increment timer until finished
            else {
                this.timer += deltaTime;

                // finished crafting?
                if (this.timer >= this.recipe.duration * this.speed) {
                    // output space available?
                    if (this.output.quantity + this.recipe.output.quantity < this.recipe.output.item.stackSize) {
                        // add to ouput and finish crafting
                        this.output.quantity += this.recipe.output.quantity;
                        this.crafting = false;
                    }
                }
            }     
   
        }

    }

    render(ctx:CanvasRenderingContext2D) {
        super.render(ctx);
    }
}

