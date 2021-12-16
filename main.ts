/**
 * main script is in charge of loading content, initiating all game states, then setting initial state
 * Everything else should be handled by the GameState's code (states module)
 */


import { load } from "./modules/engine/load/resource.js";
import { SlowConveyorBelt, FastConveyorBelt, SuperConveyorBelt, ConveyorBelt } from "./modules/objects/conveyor.js";
import { clamp } from "./modules/engine/util/math.js";
import { Vector } from "./modules/engine/util/vector.js";
import { Inserter } from "./modules/objects/inserter.js";
import { ItemDetails } from "./modules/objects/item.js";
import { Factory } from "./modules/objects/factory.js";
import { TILE_SIZE } from "./modules/objects/const.js";



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

    SlowConveyorBelt.arrows[1] = images.arrow_slow;
    SlowConveyorBelt.arrows[2] = images.arrow_medium;
    SlowConveyorBelt.arrows[8] = images.arrow_fast;

    Inserter.arrows[1] = images.arrow_slow;
    Inserter.arrows[2] = images.arrow_medium;
    Inserter.arrows[3] = images.arrow_fast;

    let factory = new Factory();

    // #region test belts

    let test_x = TILE_SIZE * 3;
    let test_y = TILE_SIZE * 3;

    const nodes:ConveyorBelt[] = [];
    
    for (let i=0; i<2; i++, test_y += TILE_SIZE) nodes.push(new SuperConveyorBelt({ pos: new Vector(test_x, test_y), angle: Math.PI/2 }));
    for (let i=0; i<2; i++, test_x += TILE_SIZE) nodes.push(new SuperConveyorBelt({ pos: new Vector(test_x, test_y), angle: 0 }));
    for (let i=0; i<2; i++, test_y += TILE_SIZE) nodes.push(new SuperConveyorBelt({ pos: new Vector(test_x, test_y), angle: Math.PI / 2 }));
    for (let i=0; i<2; i++, test_x += TILE_SIZE) nodes.push(new SuperConveyorBelt({ pos: new Vector(test_x, test_y), angle: 0}));
    for (let i=0; i<2; i++, test_y -= TILE_SIZE) nodes.push(new SuperConveyorBelt({ pos: new Vector(test_x, test_y), angle: Math.PI * 3 / 2 }));
    for (let i=0; i<2; i++, test_x += TILE_SIZE) nodes.push(new SuperConveyorBelt({ pos: new Vector(test_x, test_y), angle: 0 }));
    for (let i=0; i<2; i++, test_y -= TILE_SIZE) nodes.push(new SuperConveyorBelt({ pos: new Vector(test_x, test_y), angle: Math.PI * 3 / 2 }));
    for (let i=0; i<2; i++, test_x -= TILE_SIZE) nodes.push(new SuperConveyorBelt({ pos: new Vector(test_x, test_y), angle: Math.PI }));
    for (let i=0; i<2; i++, test_y -= TILE_SIZE) nodes.push(new SuperConveyorBelt({ pos: new Vector(test_x, test_y), angle: Math.PI * 3 / 2 }));
    for (let i=0; i<2; i++, test_x -= TILE_SIZE) nodes.push(new SuperConveyorBelt({ pos: new Vector(test_x, test_y), angle: Math.PI }));
    for (let i=0; i<2; i++, test_y += TILE_SIZE) nodes.push(new SuperConveyorBelt({ pos: new Vector(test_x, test_y), angle: Math.PI / 2 }));
    for (let i=0; i<2; i++, test_x -= TILE_SIZE) nodes.push(new SuperConveyorBelt({ pos: new Vector(test_x, test_y), angle: Math.PI }));

    //nodes[0].slots[0][1].item = items.iron;
    //nodes[0].slots[1][1].item = items.iron;

    /*let i = 0;
    for (let node of nodes) {
        node.forSlot(slot => {
            if (++i % 3 == 0) {
                slot.item = items.iron;
            }
        });
    }*/

    nodes[0].slots[0][0].item = items.iron;
    nodes[1].slots[0][1].item = items.iron;
    nodes[2].slots[1][0].item = items.iron;

    /*for (let i = 0; i < 22; i++) {
        let node = nodes[i];
        node.forSlot(slot => {
            slot.item = items.iron;
        });
    }*/

    /*
    test_x = TILE_SIZE;
    test_y = TILE_SIZE * 5;
        
    for (let i=0; i<1; i++, test_y += TILE_SIZE) nodes.push(new SlowConveyor({ pos: new Vector(test_x, test_y), angle: 0 }));
    for (let i=0; i<1; i++, test_x += TILE_SIZE) nodes.push(new FastConveyor({ pos: new Vector(test_x, test_y), angle: Math.PI * 3/2 }));
    for (let i=0; i<1; i++, test_y -= TILE_SIZE) nodes.push(new SuperConveyor({ pos: new Vector(test_x, test_y), angle: Math.PI }));
    for (let i=0; i<1; i++, test_x -= TILE_SIZE) nodes.push(new SlowConveyor({ pos: new Vector(test_x, test_y), angle: Math.PI / 2 }));
    
    // @ts-ignore
    nodes[4].slots[0][1].item = items.iron;
    // @ts-ignore
    nodes[4].slots[1][1].item = items.iron;
        

    test_x = TILE_SIZE*10;
    test_y = TILE_SIZE;
    
    for (let i=0; i<2; i++, test_y += TILE_SIZE) nodes.push(new SlowConveyor({ pos: new Vector(test_x, test_y), angle: Math.PI / 2 }));
    for (let i=0; i<2; i++, test_x += TILE_SIZE) nodes.push(new FastConveyor({ pos: new Vector(test_x, test_y), angle:  0 }));
    for (let i=0; i<3; i++, test_y += TILE_SIZE) nodes.push(new SlowConveyor({ pos: new Vector(test_x, test_y), angle: Math.PI / 2 }));
    for (let i=0; i<6; i++, test_x -= TILE_SIZE) nodes.push(new SuperConveyor({ pos: new Vector(test_x, test_y), angle: Math.PI }));
    for (let i=0; i<5; i++, test_y -= TILE_SIZE) nodes.push(new SlowConveyor({ pos: new Vector(test_x, test_y), angle: Math.PI * 3 / 2 }));
    for (let i=0; i<4; i++, test_x += TILE_SIZE) nodes.push(new FastConveyor({ pos: new Vector(test_x, test_y), angle: 0 }));

    // @ts-ignore
    nodes[12].slots[0][0].item = items.iron;  
    // @ts-ignore
    nodes[12].slots[1][0].item = items.iron;
    */

   /*
    var inserter  = new Inserter({
        pos: new Vector(TILE_SIZE * 3, 64),
        size: new Vector(64, 64),
        angle: Math.PI,
        speed: 1
    });
    nodes.push(inserter);*/

    factory.addNodes(nodes);
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
        factory.update(deltaTime / 1000);
        factory.render(ctx);

        frame_count++;
        window.requestAnimationFrame(update);
    }
    

    window.requestAnimationFrame(update);

    // showing/resetting FPS every second
    setInterval(() => {
        fpsElement.innerText = (frame_count).toString();
        frame_count = 0;
    }, 1000);
    



    // #region input events

    const mouse = new Vector();
    let mouse_tile = new Vector();

    /** remembering last angle to make belt placement a bit easier */
    let belt_angle = 0;
    
    /*
        @TODO hold mouse down and draw path, belt angle will adjust to follow mouse 
        this would require remembering last belt position, then calculating angle from last position (if its adjacent)
    */

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
            let existingNode = factory.getNode(mouse_tile.x, mouse_tile.y);
            if (existingNode) {
                existingNode.angle -= (Math.PI / 2);
                belt_angle = existingNode.angle;
                factory.calculate();
            }
            else {
                let node = new FastConveyorBelt({ pos: new Vector(mouse_tile.x, mouse_tile.y), angle: belt_angle });
                factory.addNode(node);
            }


 
        }
        // middle click -> ??
        else if (e.button == 1) {
         
        }
        // right click -> remove node
        else {
            let node = factory.getNode(mouse_tile.x, mouse_tile.y);
            if (node) {
                factory.removeNode(node);
            }
        }

    }
    // #endregion
}

init();




// #endregion


