/**
 * main script is in charge of loading content, initiating all game states, then setting initial state
 * Everything else should be handled by the GameState's code (states module)
 */
import { load } from "./modules/load/resource.js";
import { clamp } from "./modules/util/math.js";
import { Vector } from "./modules/util/vector.js";
import { SLOT_SIZE, TILE_SIZE } from "./modules/const.js";
import { ItemDetails, ItemObject } from "./modules/factory/item.js";
import { BeltNode, BeltSpeeds } from "./modules/factory/belt.js";
import { Factory } from "./modules/factory/factory.js";
import { Inserter, InserterSpeeds } from "./modules/factory/inserter.js";
// #region loading
async function init() {
    const resource_paths = {
        iron: "img/items/iron.png",
        arrow_slow: "img/arrows/arrow_slow.png",
        arrow_medium: "img/arrows/arrow_medium.png",
        arrow_fast: "img/arrows/arrow_fast.png"
    };
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    // IMPORTANT: THIS DISABLES SMOOTHING WHEN SCALING PIXELS
    //            this can also be achieved by setting the CSS "image-rendering:pixelated" on the canvas
    //            and not upscaling the images in the code
    ctx.imageSmoothingEnabled = false;
    const images = await load(resource_paths);
    const items = {
        iron: new ItemDetails("Iron Bar", images.iron)
    };
    BeltNode.arrows.set(BeltSpeeds.NORMAL, images.arrow_slow);
    BeltNode.arrows.set(BeltSpeeds.FAST, images.arrow_medium);
    BeltNode.arrows.set(BeltSpeeds.SUPER, images.arrow_fast);
    Inserter.arrows.set(InserterSpeeds.NORMAL, images.arrow_slow);
    Inserter.arrows.set(InserterSpeeds.FAST, images.arrow_medium);
    Inserter.arrows.set(InserterSpeeds.SUPER, images.arrow_fast);
    // #region test belts
    let test_x = TILE_SIZE * 3;
    let test_y = TILE_SIZE * 3;
    const belts = [];
    for (let i = 0; i < 2; i++, test_y += TILE_SIZE)
        belts.push(new BeltNode({ pos: { x: test_x, y: test_y }, angle: Math.PI / 2 }));
    for (let i = 0; i < 2; i++, test_x += TILE_SIZE)
        belts.push(new BeltNode({ pos: { x: test_x, y: test_y }, angle: 0 }));
    for (let i = 0; i < 2; i++, test_y += TILE_SIZE)
        belts.push(new BeltNode({ pos: { x: test_x, y: test_y }, angle: Math.PI / 2 }));
    for (let i = 0; i < 2; i++, test_x += TILE_SIZE)
        belts.push(new BeltNode({ pos: { x: test_x, y: test_y }, angle: 0 }));
    for (let i = 0; i < 2; i++, test_y -= TILE_SIZE)
        belts.push(new BeltNode({ pos: { x: test_x, y: test_y }, angle: Math.PI * 3 / 2 }));
    for (let i = 0; i < 2; i++, test_x += TILE_SIZE)
        belts.push(new BeltNode({ pos: { x: test_x, y: test_y }, angle: 0 }));
    for (let i = 0; i < 2; i++, test_y -= TILE_SIZE)
        belts.push(new BeltNode({ pos: { x: test_x, y: test_y }, angle: Math.PI * 3 / 2 }));
    for (let i = 0; i < 2; i++, test_x -= TILE_SIZE)
        belts.push(new BeltNode({ pos: { x: test_x, y: test_y }, angle: Math.PI }));
    for (let i = 0; i < 2; i++, test_y -= TILE_SIZE)
        belts.push(new BeltNode({ pos: { x: test_x, y: test_y }, angle: Math.PI * 3 / 2 }));
    for (let i = 0; i < 2; i++, test_x -= TILE_SIZE)
        belts.push(new BeltNode({ pos: { x: test_x, y: test_y }, angle: Math.PI }));
    for (let i = 0; i < 2; i++, test_y += TILE_SIZE)
        belts.push(new BeltNode({ pos: { x: test_x, y: test_y }, angle: Math.PI / 2 }));
    for (let i = 0; i < 2; i++, test_x -= TILE_SIZE)
        belts.push(new BeltNode({ pos: { x: test_x, y: test_y }, angle: Math.PI }));
    //belts[10].slots[1].insert(new ItemObject({ item: items.iron }));
    for (let i = 0; i < 10; i++) {
        let belt = belts[i];
        for (let slot of belt.slots) {
            slot.insert(new ItemObject({
                item: items.iron
            }));
        }
    }
    let inserters = [];
    test_x = TILE_SIZE * 7;
    test_y = TILE_SIZE * 4;
    for (let i = 0; i < 4; i++, test_x += SLOT_SIZE) {
        inserters.push(new Inserter({
            pos: { x: test_x, y: test_y },
            angle: Math.PI / 2
        }));
    }
    let factory = new Factory({
        belts: belts,
        inserters: inserters
    });
    //nodes[1].slots[0][1].item = items.iron;
    //nodes[2].slots[1][0].item = items.iron;
    // #endregion
    const fps = document.getElementById("fps");
    let frame_count = 0;
    let lastTime = performance.now();
    function update(time) {
        const deltaTime = (time - lastTime) / 1000;
        lastTime = time;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // updating / drawing belts    
        factory.update(deltaTime);
        factory.render(ctx);
        ctx.globalCompositeOperation = "destination-over";
        // background
        ctx.fillStyle = "#325428";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // hovered tile
        ctx.fillStyle = "#aaa3";
        ctx.fillRect(mouse_tile.x, mouse_tile.y, SLOT_SIZE, SLOT_SIZE);
        // #region drawing tile grid
        /*ctx.strokeStyle  = "#000";
        for (let x=0; x < canvas.width; x += SLOT_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y=0; y<canvas.height; y+= SLOT_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }*/
        //#endregion
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