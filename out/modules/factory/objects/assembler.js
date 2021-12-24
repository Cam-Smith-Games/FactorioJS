import { ContainerSlot } from "../item/container.js";
import { FactoryObject } from "./object.js";
import { ItemObject } from "../item/object.js";
import { Recipe } from "../item/recipe.js";
import { TILE_SIZE } from "../../const.js";
export class Assembler extends FactoryObject {
    constructor(args) {
        var _a;
        args.size = {
            x: TILE_SIZE * 2,
            y: TILE_SIZE * 2
        };
        super(args);
        this.speed = (_a = args.speed) !== null && _a !== void 0 ? _a : 1;
        this.timer = 0;
        this.crafting = false;
        this.setRecipe(args.recipe);
        this.factory = args.factory;
    }
    save() {
        var _a;
        let prm = super.save();
        prm.speed = this.speed;
        prm.recipe = (_a = this.recipe) === null || _a === void 0 ? void 0 : _a.id;
        return prm;
    }
    /** set recipe and instantiate input/output slots */
    setRecipe(recipeID) {
        let recipe = Recipe.recipes[recipeID];
        this.recipe = recipe;
        this.inputs = {};
        for (let input of this.recipe.inputs) {
            this.inputs[input.item.id] = new ContainerSlot({
                item: input.item.id
            });
        }
        this.output = new ContainerSlot({
            item: recipe.output.item.id
        });
    }
    addToFactory(factory) {
        factory.assemblers.push(this);
        factory.objects.push(this);
    }
    retrieve(from) {
        if (this.output.quantity > 0) {
            this.output.quantity--;
            let obj = new ItemObject({
                factory: this.factory,
                item: this.output.item.id,
                parent: from
            });
            return obj;
        }
        return null;
    }
    reserve(from) {
        return from.item.item.id in this.inputs;
    }
    insert(source) {
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
        if (!this.recipe)
            return false;
        for (let input of this.recipe.inputs) {
            // no input slot found ? nope
            if (!(input.item.id in this.inputs))
                return false;
            let slot = this.inputs[input.item.id];
            // slot found and not enough quantity ? nope
            if (slot.quantity < input.quantity)
                return false;
        }
        return true;
    }
    update(deltaTime) {
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
    render(ctx) {
        super.render(ctx);
    }
}
//# sourceMappingURL=assembler.js.map