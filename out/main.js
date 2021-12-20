/**
 * main script is in charge of loading content, initiating all game states, then setting initial state
 * Everything else should be handled by the GameState's code (states module)
 */
import { load } from "./modules/load/resource.js";
import { clamp } from "./modules/util/math.js";
import { Vector } from "./modules/util/vector.js";
import { SLOT_SIZE, TILE_SIZE } from "./modules/const.js";
import { ItemDetails } from "./modules/factory/item/detail.js";
import { BeltNode, BeltSpeeds } from "./modules/factory/belt.js";
import { Factory } from "./modules/factory/factory.js";
import { Inserter, InserterSpeeds } from "./modules/factory/inserter.js";
import { AnimationSheet } from "./modules/game/animation.js";
import { ItemContainer } from "./modules/factory/container.js";
import { Assembler } from "./modules/factory/assembler.js";
import { Recipe, RecipeItem } from "./modules/factory/item/recipe.js";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
// IMPORTANT: THIS DISABLES SMOOTHING WHEN SCALING PIXELS
//            this can also be achieved by setting the CSS "image-rendering:pixelated" on the canvas
//            and not upscaling the images in the code
ctx.imageSmoothingEnabled = false;
// #region loading
async function init() {
    // #region loading / setting images
    const images = await load({
        iron: "img/items/iron_bar.png",
        iron_ore: "img/items/iron_ore.png",
        iron_helm: "img/items/iron_helm.png",
        arrow_slow: "img/arrows/arrow_slow.png",
        arrow_medium: "img/arrows/arrow_medium.png",
        arrow_fast: "img/arrows/arrow_fast.png",
        belt: "img/belts/yellow.png",
        chests: "img/containers/chests.png"
    });
    const items = {
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
    BeltNode.arrows.set(BeltSpeeds.NORMAL, images.arrow_slow);
    BeltNode.arrows.set(BeltSpeeds.FAST, images.arrow_medium);
    BeltNode.arrows.set(BeltSpeeds.SUPER, images.arrow_fast);
    Inserter.arrows.set(InserterSpeeds.NORMAL, images.arrow_slow);
    Inserter.arrows.set(InserterSpeeds.FAST, images.arrow_medium);
    Inserter.arrows.set(InserterSpeeds.SUPER, images.arrow_fast);
    ItemContainer.sheet = images.chests;
    BeltNode.sheet = new AnimationSheet({
        sheet: images.belt,
        frameSize: { x: 80, y: 80 },
        groups: {
            "horiz": {
                columns: 16,
                row: 1
            },
            "vert": {
                columns: 16,
                row: 2
            },
            "corner1": {
                columns: 16,
                row: 9
            },
            "corner2": {
                columns: 16,
                row: 10
            },
            "corner3": {
                columns: 16,
                row: 11
            },
            "corner4": {
                columns: 16,
                row: 12
            }
        }
    });
    // #endregion
    let factory = new Factory({
    //belts: belts,
    //inserters: inserters,
    //containers: [box]
    });
    // #region generating test objects
    let test_x = TILE_SIZE * 5;
    let test_y = TILE_SIZE * 3;
    for (let i = 0; i < 5; i++, test_x += TILE_SIZE)
        new BeltNode({
            factory: factory,
            pos: { x: test_x, y: test_y },
            angle: 0
        });
    test_y = TILE_SIZE * 4;
    test_x -= TILE_SIZE;
    for (let i = 0; i < 5; i++, test_x -= TILE_SIZE)
        new BeltNode({
            factory: factory,
            pos: { x: test_x, y: test_y },
            angle: Math.PI
        });
    test_y = TILE_SIZE * 5;
    test_x += TILE_SIZE;
    for (let i = 0; i < 5; i++, test_x += TILE_SIZE)
        new BeltNode({
            factory: factory,
            pos: { x: test_x, y: test_y },
            angle: 0
        });
    test_x = TILE_SIZE * 4;
    test_y = TILE_SIZE * 3;
    for (let i = 0; i < 2; i++, test_y += SLOT_SIZE * 2) {
        new Inserter({
            factory: factory,
            pos: { x: test_x, y: test_y + SLOT_SIZE },
            speed: InserterSpeeds.SUPER,
            angle: Math.PI * (i - 1)
        });
    }
    test_x = TILE_SIZE * 10.5;
    test_y = TILE_SIZE * 3;
    for (let i = 0; i < 2; i++, test_y += SLOT_SIZE * 2) {
        new Inserter({
            factory: factory,
            pos: { x: test_x, y: test_y + SLOT_SIZE },
            speed: InserterSpeeds.FAST,
            angle: Math.PI * (i - 1)
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
        }
    });
    for (let i = 0; i < 6; i++)
        in_box.addItem(items.iron_ore);
    /*new ItemContainer({
        factory: factory,
        pos: {
            x: TILE_SIZE * 11.5,
            y: TILE_SIZE * 3.5
        }
    });*/
    const recipes = {
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
    };
    new Assembler({
        factory: factory,
        recipe: recipes.iron_bar,
        pos: {
            x: TILE_SIZE * 11.5,
            y: TILE_SIZE * 3
        }
    });
    new Assembler({
        factory: factory,
        recipe: recipes.iron_helm,
        pos: {
            x: TILE_SIZE * 1.5,
            y: TILE_SIZE * 4.5
        }
    });
    factory.link();
    //nodes[1].slots[0][1].item = items.iron;
    //nodes[2].slots[1][0].item = items.iron;
    // #endregion
    const fps = document.getElementById("fps");
    let frame_count = 0;
    let lastTime = performance.now();
    function update(time) {
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
        ctx.fillRect(mouse_tile.x, mouse_tile.y, SLOT_SIZE, SLOT_SIZE);
        // #region drawing tile grid
        ctx.strokeStyle = "#000";
        for (let x = 0; x < canvas.width; x += SLOT_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += SLOT_SIZE) {
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
    const mouse = new Vector();
    let mouse_tile = new Vector();
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
        mouse_tile = mouse.roundTo(SLOT_SIZE);
    };
    document.onmousedown = (e) => {
        e.preventDefault();
        factory.click(mouse, e.button);
    };
    // #endregion
}
init();
// #endregion
//# sourceMappingURL=main.js.map