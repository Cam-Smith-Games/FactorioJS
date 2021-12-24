/**
 * main script is in charge of loading content, initiating all game states, then setting initial state
 * Everything else should be handled by the GameState's code (states module)
 */


import { load } from "./modules/load/resource.js";
import { clamp } from "./modules/util/math.js";
import { Vector } from "./modules/util/vector.js";
import { SLOT_SIZE, TILE_SIZE } from "./modules/const.js";
import { ItemDetails } from "./modules/factory/item/detail.js";
import { BeltNode, BeltSpeeds, SuperBelt } from "./modules/factory/objects/belt/belt.js";
import { Factory } from "./modules/factory/factory.js";
import { Inserter, InserterSpeeds } from "./modules/factory/objects/inserter.js";
import { AnimationSheet } from "./modules/game/animation.js";
import { ContainerSlot, ItemContainer } from "./modules/factory/item/container.js";
import { Assembler } from "./modules/factory/objects/assembler.js";
import { Recipe, RecipeItem } from "./modules/factory/item/recipe.js";
import { bindKeys } from "./modules/input/keys.js";

const canvas = <HTMLCanvasElement>document.getElementById("canvas")
const ctx = canvas.getContext("2d");
// IMPORTANT: THIS DISABLES SMOOTHING WHEN SCALING PIXELS
//            this can also be achieved by setting the CSS "image-rendering:pixelated" on the canvas
//            and not upscaling the images in the code
ctx.imageSmoothingEnabled = false;

// #region loading
async function init() {

    const images = await getImages();
    setAnimations(images);
    const items = getItems(images);
    const recipes = getRecipes(items);

    let factory = new Factory({});

    // #region generating test objects
    let test_x = TILE_SIZE * 5;
    let test_y = TILE_SIZE * 3;

    for (let i=0; i<5; i++, test_x += TILE_SIZE) 
        new SuperBelt({
            factory: factory, 
            pos: { x: test_x, y: test_y },
             angle: 0 
        });
    
    test_y = TILE_SIZE * 4;
    test_x -= TILE_SIZE;
    for (let i=0; i<5; i++, test_x -= TILE_SIZE) 
        new SuperBelt({
            factory: factory,
            pos: { x: test_x, y: test_y },
            angle: Math.PI 
        });

    test_y = TILE_SIZE * 5;
    test_x += TILE_SIZE;

    for (let i=0; i<5; i++, test_x += TILE_SIZE) 
        new SuperBelt({
            factory: factory, 
            pos: { x: test_x, y: test_y },
            angle: 0 
        });



    test_x = TILE_SIZE * 4;
    test_y = TILE_SIZE * 3;
    for(let i=0; i<2; i++, test_y += SLOT_SIZE*2) {
        new Inserter({
            factory: factory,
            pos: { x: test_x, y: test_y + SLOT_SIZE },
            speed: InserterSpeeds.SUPER,
            angle: Math.PI * (i-1)
        });
    }

    test_x = TILE_SIZE * 10.5;
    test_y = TILE_SIZE * 3;

    for(let i=0; i<2; i++, test_y += SLOT_SIZE*2) {
        new Inserter({
            factory: factory,
            pos: { x: test_x, y: test_y + SLOT_SIZE },
            speed: InserterSpeeds.FAST,
            angle: Math.PI * (i-1)
        });
    }
    

    new Inserter({
        factory: factory,
        pos: { x: TILE_SIZE * 4, y: test_y + SLOT_SIZE },
        speed: InserterSpeeds.NORMAL,
        angle: Math.PI
    });

   let in_box = new ItemContainer({
        factory: factory,
        pos: {
            x: TILE_SIZE * 2.5,
            y: TILE_SIZE * 3.5
        },
        slots: [new ContainerSlot(), new ContainerSlot(), new ContainerSlot()]
    });

    for (let i = 0; i < 50; i++) in_box.addItem(items.iron_ore);

    /*new ItemContainer({
        factory: factory,
        pos: {
            x: TILE_SIZE * 11.5,
            y: TILE_SIZE * 3.5
        }
    });*/

    new Assembler({
        factory:factory,
        recipe: recipes.iron_bar,
        pos: {
            x: TILE_SIZE * 11.5,
            y: TILE_SIZE * 3
        }
    })

    new Assembler({
        factory:factory,
        recipe: recipes.iron_helm,
        pos: {
            x: TILE_SIZE * 1.5,
            y: TILE_SIZE * 4.5
        }
    })

    factory.link();

    factory.ghost = new SuperBelt({});

    
    //nodes[1].slots[0][1].item = items.iron;
    //nodes[2].slots[1][0].item = items.iron;

    // #endregion

    const GRID_SIZE = TILE_SIZE;

    const fps = document.getElementById("fps");
    let frame_count = 0;
    let lastTime = performance.now();
    function update(time:number) {    
        // dividing by 1000 to convert milliseconds to seconds
        const deltaTime = (time - lastTime) / 1000;
        lastTime = time;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // updating / drawing belts    
        factory.update(deltaTime);
        factory.render(ctx);

        ctx.globalCompositeOperation = "destination-over";

        // hovered tile
        ctx.lineWidth = 1;
        ctx.fillStyle = "#aaa3";
        ctx.fillRect(mouse_tile.x, mouse_tile.y, GRID_SIZE, GRID_SIZE);

        // #region drawing tile grid
        ctx.strokeStyle  = "#000";
        for (let x=0; x < canvas.width; x += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y=0; y<canvas.height; y+= GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        //#endregion

        // background
        ctx.fillStyle = "#3d3712";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.globalCompositeOperation = "source-over";

        frame_count++;
        window.requestAnimationFrame(update);
    }
    window.requestAnimationFrame(update);


    // showing/resetting FPS every second
    setInterval(() => {
        fps.innerText = (frame_count).toString();
        frame_count = 0;
    }, 1000);
    
    // #region input events
    const mouse:Vector = new Vector();
    let mouse_tile:Vector = new Vector();
    /**
        @TODO hold mouse down and draw path, belt angle will adjust to follow mouse 
        this would require remembering last belt position, then calculating angle from last position (if its adjacent)
    */
    document.oncontextmenu = (e) => e.preventDefault();
    // tracking mouse position
    document.onmousemove = (e) => {
        let rect = canvas.getBoundingClientRect();
        let x = (e.clientX || e.pageX) - rect.left;
        let y = (e.clientY || e.pageY) - rect.top;

        // convert to canvas coordinates (resolution vs actual size)
        x *= canvas.width / rect.width;
        y *= canvas.height / rect.height;

        mouse.x = clamp(x, 0, canvas.width);
        mouse.y = clamp(y, 0, canvas.height);

        mouse_tile = mouse.roundTo(GRID_SIZE);

        factory.mousemove(mouse_tile);
    };
    document.onmousedown = (e) => {
        e.preventDefault();
        factory.mousedown(mouse_tile, e.button);
    }
    document.onmouseup = (e) => {
        e.preventDefault();
        factory.mouseup(mouse_tile, e.button);
    }
    bindKeys({
        // R rotates factory mouse angle
        "R": () => {
            factory.rotate();
        }

    })
    // #endregion
}

/** asynchronously loads all images for the game */
async function getImages () {
    return await load({
        iron: "img/items/iron_bar.png",
        iron_ore: "img/items/iron_ore.png",
        iron_helm: "img/items/iron_helm.png",
        arrow_slow: "img/arrows/arrow_slow.png",
        arrow_medium: "img/arrows/arrow_medium.png",
        arrow_fast: "img/arrows/arrow_fast.png",
        belt: "img/belts/yellow.png",
        chests: "img/containers/chests.png"
    });
}

/** sets static images/animations on different classes given the full list of images */
function setAnimations(images: Record<string, HTMLImageElement>) {
    
    // setting images / animations
    BeltNode.arrows.set(BeltSpeeds.NORMAL, images.arrow_slow);
    BeltNode.arrows.set(BeltSpeeds.FAST, images.arrow_medium);
    BeltNode.arrows.set(BeltSpeeds.SUPER, images.arrow_fast);

    Inserter.arrows.set(InserterSpeeds.NORMAL, images.arrow_slow);
    Inserter.arrows.set(InserterSpeeds.FAST, images.arrow_medium);
    Inserter.arrows.set(InserterSpeeds.SUPER, images.arrow_fast);

    ItemContainer.sheet = images.chests;

    BeltNode.sheet = new AnimationSheet({
        sheet: images.belt,
        frameSize: { x:80, y:80 },      
        groups: {
            "horiz": {
                columns: 16,
                row: 1,
                scale: { x: 1.25, y: 1.25 }
            },
            "vert": {
                columns: 16,
                row: 2,
                scale: { x: 1.25, y: 1.25 }
            },
            "corner1": {
                columns: 16,
                row: 9,
                scale: { x: 1.25, y: 1.25 }
            },
            "corner2": {
                columns: 16,
                row: 10,
                scale: { x: 1.25, y: 1.25 }
            },
            "corner3": {
                columns: 16,
                row: 11,
                scale: { x: 1.25, y: 1.25 }
            },
            "corner4": {
                columns: 16,
                row: 12,
                scale: { x: 1.25, y: 1.25 }
            }
        }
    });
   
}

/** retrieves constant dictionaryuof all items in the game */
function getItems(images: Record<string,HTMLImageElement>) {
   return {
            iron_bar: new ItemDetails({
                name: "Iron Bar",
                image: images.iron
            }),
            iron_ore: new ItemDetails({
                name: "Iron Ore",
                image: images.iron_ore
            }),
            iron_helm: new ItemDetails({
                name: "Iron Helm",
                image: images.iron_helm
            })
    };
}

/** retrieves constant dictionary of all recipes in the game */
function getRecipes(items: Record<string, ItemDetails>) {
    return {
        iron_bar: new Recipe({
            inputs: [
                new RecipeItem({
                    item: items.iron_ore,
                    quantity: 1
                })
            ],
            output: new RecipeItem({
                item: items.iron_bar,
                quantity: 1
            }),
            duration: 5
        }),
        iron_helm: new Recipe({
            inputs: [
                new RecipeItem({
                    item: items.iron_bar,
                    quantity: 1
                })
            ],
            output: new RecipeItem({
                item: items.iron_helm,
                quantity: 1
            }),
            duration: 10
        })
    }
}

init();
// #endregion