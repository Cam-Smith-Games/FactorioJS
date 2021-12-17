import { FactoryObject, FactoryObjectParams } from "../factory/factoryobject.js";
import { clamp } from "../util/math.js";
import { Vector } from "../util/vector.js";


// belt animation reference:
// https://codepen.io/jasonr/pen/YrzxOJ


interface AnimationParams {
    /** NOTE this is a required field on either Sheet or Animation but not both. It's only defined as optional to avoid warnings */
    sheet?: HTMLImageElement;
    /** size of each frame. currently donesn't support different sizes for each frame */
    frameSize?: Vector;
    fps?: number;
}

interface SpriteAnimParams extends AnimationParams {
    /** size of this group (can span across multiple rows/columns) */

    /** default = 1 */
    rows?: number;

    /** default = 99 */
    columns?: number;


     /** calculating start position  */
     /** pixels offset of this animation within sheet (default = 0) gets added to row/column if specified */ 
     offset?: Vector;
     /** NOTE: this starts at 1, not 0 */ 
     row?: number;
     /**  NOTE: this starts at 1, not 0 */
     column?: number; 

     /** scale multiplier that gets multiplied to size (negative values will flip) */
     scale?: Vector;
}



interface AnimationSheetArgs extends AnimationParams {
    /** list of configurations for each sprite animation */
    groups: Record<string,SpriteAnimParams>;
}

// these properties are shared by sheet and animation 
// they can get defaulted at sheet level and then optionally overriden by each individual animation
const shared_options = ["sheet", "frameSize", "fps"];

/** Group of animations for entire sprite sheet */
export class AnimationSheet {

    sheet: HTMLImageElement;
    animations: Record<string, SpriteAnimation>;

    constructor(args : AnimationSheetArgs) {

        this.sheet = args.sheet;
          
        /** @type {Object<string,SpriteAnimation>} */ 
        this.animations = {};


        Object.keys(args.groups).forEach(key => {
            
            let g = args.groups[key];
            
            // passing overridable settings down to animation configurations when not already specified
            shared_options.forEach(key => {
                // @ts-ignore
                if (!g[key]) {
                    // @ts-ignore
                    g[key] = args[key]; 
                }
            });

            this.animations[key] = new SpriteAnimation(g);
        });

    }
}

/** Single animation within a sprite sheet */
export class SpriteAnimation {
  
    sheet: HTMLImageElement;
    size: Vector;
    rows: number;
    columns: number;
    scale: Vector;
    fps: number;
    offset: Vector;

    constructor(args : SpriteAnimParams) {
        if (!args.sheet) throw "Sprite Animation Required a sheet.";
        
        this.sheet = args.sheet;
        this.size = args.frameSize ?? new Vector(64, 64);
        this.rows = args.rows ?? 1;
        this.columns = args.columns ?? 99;
        this.scale = args.scale ?? new Vector(1, 1);
        this.fps = args.fps ?? 30;

        // calculating offset given combination of pixel offset and row/column sizing
        const offset = args.offset ?? new Vector();
        const row = args.row ?? 1;
        const column = args.column ?? 1;
        this.offset = new Vector(
            offset.x + ((column-1) * this.size.x), 
            offset.y + ((row-1) * this.size.y)
        );
    }


    /** NOTE: this renders centered on (0,0). ctx needs to be transformed to appropriate position/angle prior to calling this method */
    render(ctx : CanvasRenderingContext2D, column : number, row : number) {
        let sx = clamp(this.offset.x + (column * this.size.x), 0, this.sheet.width - this.size.x);
        let sy = clamp(this.offset.y + (row * this.size.y), 0, this.sheet.height - this.size.y);
        ctx.drawImage(this.sheet, sx, sy, this.size.x, this.size.y, -this.size.x/2, -this.size.y/2, this.size.x, this.size.y);
    }

    // TODO: create function that returns animation task
    // "anim.run()" returns task

    run(args: AnimTaskParams = {}) {
        args.anim = this;
        if (!args.fps) {
            args.fps = this.fps;
        }

        return new AnimationTask(args);
    }
}


interface AnimTaskParams {
    anim? : SpriteAnimation;   
    numLoops?: number;
    fps?: number;
}

/** Task for playing a spritte animation. Can loop indefinitely or get disposed once a certain number of loops have played */
export class AnimationTask {
 
    anim: SpriteAnimation;
    /** frames per second (default = 30) */
    fps: number;
    /** seconds per frame */
    sfp: number;

    /** number of times to loop before resolving task */
    numLoops: number;
    column: number;
    row: number;

    /** everytime something wants to wait for this animation to finish, it's resolve function gets added here. 
     * When the animation is finally finished, it resolves all of these so everything can stop waiting */
    resolvers: ((value:unknown)=>void)[] = [];

    /** milliseconds spent on current frame. will advance to next frame when this exceeds mspf */
    timer:number;
    /** current loop # */
    loop:number;

    constructor(args:AnimTaskParams) {
        this.anim = args.anim;
        this.fps = args.fps ?? 30;
        this.sfp =  1 / this.fps;
        this.numLoops = args.numLoops;

        this.column = 0;
        this.row = 0;
        this.timer = 0;
        this.loop = 0;
    }

    wait() {
        // create a new promise and add it's resolve method to the resolver array
        //  when this animation is finished, it will resolve all promises that are currently waiting
        return new Promise(resolve => this.resolvers.push(resolve));
    }

    /** returns true when animation is finished (only relevant is numLoops is set) */
    update(deltaTime : number): boolean {

        this.timer += deltaTime;

        // frameTime met -> advance to next frame
        if (this.timer >= this.sfp) {
            this.timer = 0;

            this.column++;

            // reached end of column -> wrap to next row (or simply reset column if only 1 row)
            if (this.column > this.anim.columns - 1) {
                this.column = 0;
                this.row++;

                // reached end of columns and end or rows ? increment loop count 
                if (this.row > this.anim.rows - 1) {
                    this.loop++;
                    this.row = 0;
                }
            }
        }

        // numLoops is an optional field so it might be undefined
        // "number > undefined" will always be false so this would never resolve when numLoops is not specified
        let finished = this.loop >= this.numLoops;
        if (finished) {
            this.resolvers.forEach(resolve => resolve(null));
        }

        return finished;
    }

    render(ctx : CanvasRenderingContext2D) {
        this.anim.render(ctx, this.column, this.row);
    }

}


interface AnimObjectParams extends FactoryObjectParams {
    anim : AnimationTask;
}


/** stationary object that gets updated/rendered until animation is complete */
export class AnimationObject extends FactoryObject {

    anim: AnimationTask;
    
    constructor(args: AnimObjectParams) {
        super(args);
        this.anim = args.anim;
    }

    update(deltaTime : number) {
        return this.anim.update(deltaTime);
    }

    render(ctx : CanvasRenderingContext2D) {
            this.anim.render(ctx);
  
    }

    /*static Promise(args: AnimObjectParams) {
        return new Promise(resolve => {
            args.dispose = self => resolve(self);
            new AnimationObject(args);
        })
    }*/
}


