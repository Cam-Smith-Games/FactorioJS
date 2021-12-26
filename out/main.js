import { load } from "./modules/load/resource.js";
import { clamp } from "./modules/util/math.js";
import { Vector } from "./modules/util/vector.js";
import { SLOT_SIZE, TILE_SIZE } from "./modules/const.js";
import { createItems, ItemDetails } from "./modules/factory/item/detail.js";
import { BeltNode, BeltSpeeds, FastBelt, NormalBelt, SuperBelt } from "./modules/factory/objects/belt/belt.js";
import { Factory } from "./modules/factory/factory.js";
import { Inserter, InserterSpeeds } from "./modules/factory/objects/inserter.js";
import { AnimationSheet } from "./modules/game/animation.js";
import { ItemContainer } from "./modules/factory/item/container.js";
import { Assembler } from "./modules/factory/objects/assembler.js";
import { createRecipes } from "./modules/factory/item/recipe.js";
import { bindKeys } from "./modules/input/keys.js";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false; // IMPORTANT: THIS DISABLES SMOOTHING WHEN SCALING PIXELS
async function init() {
    const images = await getImages();
    setAnimations(images);
    createItems(images);
    createRecipes();
    let factory = new Factory({});
    factory.load();
    //factory.ghost = new SuperBelt({});
    //test(factory);
    // #region main update loops
    const GRID_SIZE = TILE_SIZE;
    const fps = document.getElementById("fps");
    let frame_count = 0;
    let lastTime = performance.now();
    function update(time) {
        // dividing by 1000 to convert milliseconds to seconds
        const deltaTime = (time - lastTime) / 1000;
        lastTime = time;
        factory.update(deltaTime);
        factory.render(ctx);
        frame_count++;
        window.requestAnimationFrame(update);
    }
    window.requestAnimationFrame(update);
    // showing/resetting FPS every second
    setInterval(() => {
        fps.innerText = (frame_count).toString();
        frame_count = 0;
    }, 1000);
    // #endregion
    // #region input events
    const mouse = new Vector();
    let mouse_tile = new Vector();
    /**
        @TODO hold mouse down and draw path, belt angle will adjust to follow mouse
        this would require remembering last belt position, then calculating angle from last position (if its adjacent)
    */
    canvas.oncontextmenu = (e) => e.preventDefault();
    // tracking mouse position
    canvas.onmousemove = (e) => {
        let rect = canvas.getBoundingClientRect();
        let x = (e.clientX || e.pageX) - rect.left;
        let y = (e.clientY || e.pageY) - rect.top;
        // convert to canvas coordinates (resolution vs actual size)
        x *= canvas.width / rect.width;
        y *= canvas.height / rect.height;
        mouse.x = clamp(x, 0, canvas.width);
        mouse.y = clamp(y, 0, canvas.height);
        factory.mousemove(mouse);
    };
    canvas.onmousedown = (e) => {
        e.preventDefault();
        factory.mousedown(mouse_tile, e.button);
    };
    canvas.onmouseup = (e) => {
        e.preventDefault();
        factory.mouseup(mouse, e.button);
    };
    canvas.onmouseleave = (e) => {
        e.preventDefault();
        // TODO: disable ghost when leaving?
    };
    canvas.onwheel = (e) => {
        e.preventDefault();
        factory.zoom(e.deltaY > 0 ? 1 : -1);
    };
    bindKeys({
        // R rotates factory mouse angle
        "R": () => {
            factory.rotate();
        },
        "W": () => factory.pan({ x: 0, y: -GRID_SIZE }),
        "A": () => factory.pan({ x: -GRID_SIZE, y: 0 }),
        "S": () => factory.pan({ x: 0, y: GRID_SIZE }),
        "D": () => factory.pan({ x: GRID_SIZE, y: 0 })
    });
    document.getElementById("btnSave").onclick = () => factory.save();
    document.getElementById("btnLoad").onclick = () => factory.load();
    document.getElementById("btnReset").onclick = () => reset(factory);
    // #endregion
}
/** asynchronously loads all images for the game */
async function getImages() {
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
function setAnimations(images) {
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
        frameSize: { x: 80, y: 80 },
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
init();
// called upon hitting reset button. generates a basic test factory
function reset(factory) {
    factory.clear();
    tests.TonsOfBelts(factory);
    factory.link();
    //factory.save();
    // #endregion
}
/** list of test scenarios (generates a test factory) */
const tests = {
    LoadingItems: (factory) => {
        let y = TILE_SIZE * 3;
        let in_box = new ItemContainer({
            factory: factory,
            pos: {
                x: TILE_SIZE * 2,
                y: TILE_SIZE * 3
            },
            slots: [null, null, null]
        });
        for (let i = 0; i < 5; i++)
            in_box.addItem(ItemDetails.items[0]);
        new Inserter({
            factory: factory,
            pos: {
                x: TILE_SIZE * 3,
                y: y
            },
            speed: InserterSpeeds.NORMAL,
            angle: Math.PI
        });
        for (let i = 0; i < 4; i++) {
            new FastBelt({
                factory: factory,
                pos: {
                    x: TILE_SIZE * (i + 4),
                    y: y
                },
                angle: 0
            });
        }
    },
    TonsOfBelts: (factory) => {
        let test = 1;
        for (let i = 0; i < 50; i++) {
            let y = i * TILE_SIZE;
            let box = new ItemContainer({
                factory: factory,
                pos: {
                    x: 0,
                    y: y
                },
                slots: [null, null, null]
            });
            for (let j = 0; j < 150; j++)
                box.addItem(ItemDetails.items[1]);
            for (let j = 0; j < 2; j++) {
                test++;
                if (test > 3) {
                    test = 0;
                }
                new Inserter({
                    factory: factory,
                    pos: {
                        x: TILE_SIZE * (test == 0 || test == 3 ? 1.5 : 1),
                        y: y + (j * TILE_SIZE / 2)
                    },
                    speed: InserterSpeeds.FAST,
                    angle: Math.PI
                });
            }
        }
        let x = TILE_SIZE * 2;
        let y = 0;
        let angle = 0;
        let dir = -1;
        for (let i = 0; i < 50; i++, y += TILE_SIZE) {
            angle = i % 2 == 0 ? 0 : Math.PI;
            dir *= -1;
            for (let j = 0; j < 50; j++, x += (TILE_SIZE * dir)) {
                new NormalBelt({
                    factory: factory,
                    pos: {
                        x: x,
                        y: y
                    },
                    angle: angle
                });
            }
            new NormalBelt({
                factory: factory,
                pos: {
                    x: x,
                    y: y
                },
                angle: Math.PI / 2
            });
        }
    },
    Assemblers: (factory) => {
        let test_x = TILE_SIZE * 5;
        let test_y = TILE_SIZE * 3;
        for (let i = 0; i < 5; i++, test_x += TILE_SIZE)
            new NormalBelt({
                factory: factory,
                pos: { x: test_x, y: test_y },
                angle: 0
            });
        test_y = TILE_SIZE * 4;
        test_x -= TILE_SIZE;
        for (let i = 0; i < 5; i++, test_x -= TILE_SIZE)
            new NormalBelt({
                factory: factory,
                pos: { x: test_x, y: test_y },
                angle: Math.PI
            });
        test_y = TILE_SIZE * 5;
        test_x += TILE_SIZE;
        for (let i = 0; i < 5; i++, test_x += TILE_SIZE)
            new NormalBelt({
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
                speed: InserterSpeeds.NORMAL,
                angle: Math.PI * (i - 1)
            });
        }
        test_x = TILE_SIZE * 10.5;
        test_y = TILE_SIZE * 3;
        for (let i = 0; i < 2; i++, test_y += SLOT_SIZE * 2) {
            new Inserter({
                factory: factory,
                pos: { x: test_x, y: test_y + SLOT_SIZE },
                speed: InserterSpeeds.NORMAL,
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
            },
            slots: [null, null, null]
        });
        for (let i = 0; i < 50; i++)
            in_box.addItem(ItemDetails.items[0]);
        /*new ItemContainer({
            factory: factory,
            pos: {
                x: TILE_SIZE * 11.5,
                y: TILE_SIZE * 3.5
            }
        });*/
        new Assembler({
            factory: factory,
            recipe: 0,
            pos: {
                x: TILE_SIZE * 11.5,
                y: TILE_SIZE * 3
            }
        });
        new Assembler({
            factory: factory,
            recipe: 1,
            pos: {
                x: TILE_SIZE * 1.5,
                y: TILE_SIZE * 4.5
            }
        });
        factory.ghost = new SuperBelt({});
        //nodes[1].slots[0][1].item = items.iron;
        //nodes[2].slots[1][0].item = items.iron;
    }
};
//# sourceMappingURL=main.js.map