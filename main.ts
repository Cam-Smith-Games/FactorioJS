/**
 * main script is in charge of loading content, initiating all game states, then setting initial state
 * Everything else should be handled by the GameState's code (states module)
 */


//import { Vector } from "./modules/engine/util/vector.js";
import { load } from "./modules/engine/load.js";
import { ConveyorGrid, SlowConveyor, FastConveyor, SuperConveyor, ItemDetails, TILE_SIZE, SLOT_SIZE } from "./modules/engine/objects/conveyor.js";
import { clamp } from "./modules/engine/util/math.js";
import { Vector } from "./modules/engine/util/vector.js";
//import { AnimationSheet } from "./modules/engine/animation.js";
//import { OvalLight } from "./modules/engine/objects/light.js";



// #region loading

async function init() {
    const resource_paths : Record<string,string> = {
        iron: "img/items/iron.png",
        arrow_slow: "img/arrows/arrow_slow.png",
        arrow_medium: "img/arrows/arrow_medium.png",
        arrow_fast: "img/arrows/arrow_fast.png"
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

    SlowConveyor.arrows[1] = images.arrow_slow;
    SlowConveyor.arrows[2] = images.arrow_medium;
    SlowConveyor.arrows[3] = images.arrow_fast;

    let belt = new ConveyorGrid();

    // #region test belts

    let test_x = TILE_SIZE;
    let test_y = TILE_SIZE;

    const nodes:SlowConveyor[] = [];
    
    for (let i=0; i<2; i++, test_y += TILE_SIZE) nodes.push(new SlowConveyor(test_x, test_y, Math.PI * 3/2));
    for (let i=0; i<2; i++, test_x += TILE_SIZE) nodes.push(new FastConveyor(test_x, test_y, 0));
    for (let i=0; i<2; i++, test_y -= TILE_SIZE) nodes.push(new SuperConveyor(test_x, test_y, Math.PI / 2));
    for (let i=0; i<2; i++, test_x -= TILE_SIZE) nodes.push(new SlowConveyor(test_x, test_y, Math.PI));
    
    nodes[0].slots[0][0].item = items.iron;
    nodes[1].slots[0][1].item = items.iron;
        
    // #endregion

    // #region belt 1
    test_x = TILE_SIZE*10;
    test_y = TILE_SIZE;
    
    for (let i=0; i<2; i++, test_y += TILE_SIZE) nodes.push(new SlowConveyor(test_x, test_y, Math.PI * 3/2));
    for (let i=0; i<2; i++, test_x += TILE_SIZE) nodes.push(new FastConveyor(test_x, test_y, 0));
    for (let i=0; i<3; i++, test_y += TILE_SIZE) nodes.push(new SlowConveyor(test_x, test_y, Math.PI * 3/2));
    for (let i=0; i<6; i++, test_x -= TILE_SIZE) nodes.push(new SuperConveyor(test_x, test_y, Math.PI));
    for (let i=0; i<5; i++, test_y -= TILE_SIZE) nodes.push(new SlowConveyor(test_x, test_y, Math.PI / 2));
    for (let i=0; i<4; i++, test_x += TILE_SIZE) nodes.push(new FastConveyor(test_x, test_y, 0));

    nodes[9].slots[0][0].item = items.iron;
    nodes[12].slots[1][1].item = items.iron;
       
    belt.addNodes(nodes);
    // #endregion
    
    // TODO: turns need to distribute slots across lanes
    
    var fpsElement = document.getElementById("fps");
    
    let frame_count = 0;
    let lastTime = performance.now();
    function update(time:number) {    
        let deltaTime = time - lastTime;
        lastTime = time;


        ctx.fillStyle = "#333";
        ctx.fillRect(0, 0, canvas.width, canvas.height);


        ctx.fillStyle = "#aaa3";
        ctx.fillRect(mouse_tile.x, mouse_tile.y, TILE_SIZE, TILE_SIZE);

        // #region drawing tile grid
        ctx.strokeStyle  = "#444";
        for (let x=0; x < canvas.width; x += TILE_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y=0; y<canvas.height; y+= TILE_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        //#endregion

        // updating / drawing belts    
        belt.update(deltaTime / 1000);
        belt.render(ctx);
    
        frame_count++;
        window.requestAnimationFrame(update);
    }
    
    
    
    window.requestAnimationFrame(update);

    // showing/resetting FPS every second
    setInterval(() => {
        fpsElement.innerText = (frame_count).toString();
        frame_count = 0;
    }, 1000);
    

    const mouse = new Vector();
    let mouse_tile = new Vector();

    /** remembering last angle to make belt placement easier */
    let belt_angle = 0;

    document.oncontextmenu = (e) => e.preventDefault();
    document.onmousemove = (e) => {
        let rect = canvas.getBoundingClientRect();
        let x = (e.clientX || e.pageX) - rect.left;
        let y = (e.clientY || e.pageY) - rect.top;

        // convert to canvas coordinates (resolution vs actual size)
        x *= canvas.width / rect.width;
        y *= canvas.height / rect.height;

        mouse.x = clamp(x, 0, canvas.width);
        mouse.y = clamp(y, 0, canvas.height);

        mouse_tile = mouse.roundTo(TILE_SIZE);
    };
    document.onmousedown = (e) => {

        e.preventDefault();

        // left click -> add node OR rotate existing node
        if (e.button ==  0) {
            let existingNode = belt.findNode(mouse_tile.x, mouse_tile.y);
            if (existingNode) {
                existingNode.angle -= (Math.PI / 2);
                belt_angle = existingNode.angle;
                belt.calculate();
            }
            else {
                let node = new FastConveyor(mouse_tile.x, mouse_tile.y, belt_angle);
                belt.addNode(node);
            }
 
        }
        // middle click -> 
        else if (e.button == 1) {
         
        }
        // right click -> remove node
        else {
            let node = belt.findNode(mouse_tile.x, mouse_tile.y);
            if (node) {
                belt.removeNode(node);
            }
        }

    }
}

init();




// #endregion


