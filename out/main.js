/**
 * main script is in charge of loading content, initiating all game states, then setting initial state
 * Everything else should be handled by the GameState's code (states module)
 */
//import { Vector } from "./modules/engine/util/vector.js";
import { load } from "./modules/engine/load.js";
import { ConveyorBelt, SlowConveyorNode, FastConveyorNode, SuperConveyorNode, ItemDetails, TILE_SIZE } from "./modules/engine/objects/conveyor.js";
//import { AnimationSheet } from "./modules/engine/animation.js";
//import { OvalLight } from "./modules/engine/objects/light.js";
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
    SlowConveyorNode.arrows[1] = images.arrow_slow;
    SlowConveyorNode.arrows[2] = images.arrow_medium;
    SlowConveyorNode.arrows[3] = images.arrow_fast;
    let belts = [];
    // #region test belts
    let test_x = 480;
    let test_y = 48;
    const nodes1 = [];
    for (let i = 0; i < 2; i++, test_y += 48)
        nodes1.push(new SlowConveyorNode(test_x, test_y, Math.PI * 3 / 2));
    for (let i = 0; i < 2; i++, test_x += 48)
        nodes1.push(new FastConveyorNode(test_x, test_y, 0));
    for (let i = 0; i < 2; i++, test_y -= 48)
        nodes1.push(new SuperConveyorNode(test_x, test_y, Math.PI / 2));
    for (let i = 0; i < 2; i++, test_x -= 48)
        nodes1.push(new SlowConveyorNode(test_x, test_y, Math.PI));
    nodes1[0].slots[0][0].item = items.iron;
    nodes1[1].slots[0][1].item = items.iron;
    belts.push(new ConveyorBelt(nodes1));
    // #endregion
    // #region belt 1
    const nodes2 = [];
    test_x = 960;
    test_y = 48;
    for (let i = 0; i < 2; i++, test_y += 48)
        nodes2.push(new SlowConveyorNode(test_x, test_y, Math.PI * 3 / 2));
    for (let i = 0; i < 2; i++, test_x += 48)
        nodes2.push(new FastConveyorNode(test_x, test_y, 0));
    for (let i = 0; i < 3; i++, test_y += 48)
        nodes2.push(new SlowConveyorNode(test_x, test_y, Math.PI * 3 / 2));
    for (let i = 0; i < 6; i++, test_x -= 48)
        nodes2.push(new SuperConveyorNode(test_x, test_y, Math.PI));
    for (let i = 0; i < 5; i++, test_y -= 48)
        nodes2.push(new SlowConveyorNode(test_x, test_y, Math.PI / 2));
    for (let i = 0; i < 4; i++, test_x += 48)
        nodes2.push(new FastConveyorNode(test_x, test_y, 0));
    nodes2[0].slots[0][0].item = items.iron;
    nodes2[3].slots[1][1].item = items.iron;
    belts.push(new ConveyorBelt(nodes2));
    // #endregion
    // TODO: turns need to distribute slots across lanes
    var fpsElement = document.getElementById("fps");
    let frame_count = 0;
    let lastTime = performance.now();
    function update(time) {
        let deltaTime = time - lastTime;
        lastTime = time;
        ctx.fillStyle = "#333";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let x = 0; x < canvas.width; x += TILE_SIZE) {
            for (let y = 0; y < canvas.height; y += TILE_SIZE) {
            }
        }
        for (let belt of belts) {
            belt.update(deltaTime / 1000);
            belt.render(ctx);
        }
        frame_count++;
        window.requestAnimationFrame(update);
    }
    window.requestAnimationFrame(update);
    // showing/resetting FPS every second
    setInterval(() => {
        fpsElement.innerText = (frame_count).toString();
        frame_count = 0;
    }, 1000);
}
init();
// #endregion
//# sourceMappingURL=main.js.map