/**
 * main script is in charge of loading content, initiating all game states, then setting initial state
 * Everything else should be handled by the GameState's code (states module)
 */
//import { Vector } from "./modules/engine/util/vector.js";
import { load } from "./modules/engine/load.js";
import { ConveyorBelt, ConveyorNode, ItemDetails } from "./modules/engine/objects/conveyor.js";
//import { AnimationSheet } from "./modules/engine/animation.js";
//import { OvalLight } from "./modules/engine/objects/light.js";
// #region loading
async function init() {
    const resource_paths = {
        iron: "img/items/iron.png"
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
    let belts = [];
    // #region test belts
    let test_x = 480;
    let test_y = 48;
    const nodes1 = [];
    for (let i = 0; i < 2; i++, test_y += 48)
        nodes1.push(new ConveyorNode(test_x, test_y, Math.PI * 3 / 2, null));
    for (let i = 0; i < 2; i++, test_x += 48)
        nodes1.push(new ConveyorNode(test_x, test_y, 0, null));
    for (let i = 0; i < 2; i++, test_y -= 48)
        nodes1.push(new ConveyorNode(test_x, test_y, Math.PI / 2, null));
    for (let i = 0; i < 2; i++, test_x -= 48)
        nodes1.push(new ConveyorNode(test_x, test_y, Math.PI, null));
    nodes1[0].slots[0][0].item = items.iron;
    nodes1[1].slots[0][1].item = items.iron;
    belts.push(new ConveyorBelt(nodes1));
    // #endregion
    // #region belt 1
    const nodes2 = [];
    test_x = 960;
    test_y = 48;
    for (let i = 0; i < 2; i++, test_y += 48)
        nodes2.push(new ConveyorNode(test_x, test_y, Math.PI * 3 / 2, null));
    for (let i = 0; i < 2; i++, test_x += 48)
        nodes2.push(new ConveyorNode(test_x, test_y, 0, null));
    for (let i = 0; i < 3; i++, test_y += 48)
        nodes2.push(new ConveyorNode(test_x, test_y, Math.PI * 3 / 2, null));
    for (let i = 0; i < 6; i++, test_x -= 48)
        nodes2.push(new ConveyorNode(test_x, test_y, Math.PI, null));
    for (let i = 0; i < 5; i++, test_y -= 48)
        nodes2.push(new ConveyorNode(test_x, test_y, Math.PI / 2, null));
    for (let i = 0; i < 4; i++, test_x += 48)
        nodes2.push(new ConveyorNode(test_x, test_y, 0, null));
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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