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
const resource_paths : Record<string,string> = {
    iron: "img/items/iron.png"
};
const canvas = <HTMLCanvasElement>document.getElementById("canvas")
const ctx = canvas.getContext("2d");

// IMPORTANT: THIS DISABLES SMOOTHING WHEN SCALING PIXELS
//            this can also be achieved by setting the CSS "image-rendering:pixelated" on the canvas
//            and not upscaling the images in the code
ctx.imageSmoothingEnabled = false;

const images = await load(resource_paths);


const items = {
    iron: new ItemDetails ("Iron Bar", images.iron)
};

const nodes:ConveyorNode[] = [];

//for (let i=0; i<10; i++) {
//    nodes.push(new ConveyorNode(480 + i*48, 48, 0, null));
//}
//nodes.push(new ConveyorNode(480 + 432, 96, Math.PI * 3/2, null));

for (let i=0; i<2; i++) {
    nodes.push(new ConveyorNode(480, 48 * (i+2), Math.PI * 3/2, null));
}
for (let i=0; i<2; i++) {
    nodes.push(new ConveyorNode(480 + 48*(i), 192, 0, null));
}


for (let i=0; i<2; i++) {
    nodes.push(new ConveyorNode(576, 192 - (i * 48), Math.PI / 2, null));
}

for (let i=0; i<2; i++) {
    nodes.push(new ConveyorNode(576 - (i * 48), 96, Math.PI, null));
}



nodes[0].slots[0][0].item = items.iron;
nodes[1].slots[0][1].item = items.iron;/*
nodes[0].slots[1][0].item = items.iron;
nodes[0].slots[1][1].item = items.iron;

nodes[1].slots[0][0].item = items.iron;
nodes[1].slots[0][1].item = items.iron;
nodes[1].slots[1][0].item = items.iron;
nodes[1].slots[1][1].item = items.iron;

nodes[2].slots[0][0].item = items.iron;
nodes[3].slots[0][0].item = items.iron;*/



const belt = new ConveyorBelt(nodes);
belt.recalculate();

console.log(belt);

// TODO: turns need to distribute slots across lanes

var fpsElement = document.getElementById("fps");

let frame_count = 0;
let lastTime:number;
function update(time:number) {
    if (!lastTime) lastTime = time;

    let deltaTime = time - lastTime;

    //let now = new Date().getTime();
    //let deltaTime = (now - lastFrame ) * 100;
    //lastFrame = now;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    belt.update(deltaTime / 1000);
    belt.render(ctx);

    frame_count++;
    window.requestAnimationFrame(update);

}



window.requestAnimationFrame(update);

setInterval(() => {
    fpsElement.innerText = (frame_count).toString();
    frame_count = 0;
}, 1000);


// if sin(angle) != 0, next slot = slot[x, y + sin(angle)]

// #endregion