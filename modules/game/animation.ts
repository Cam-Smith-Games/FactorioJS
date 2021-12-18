import { FactoryObject, FactoryObjectParams } from "../factory/factoryobject.js";
import { IPoint } from "../struct/point.js";
import { Rectangle } from "../struct/rect.js";
import { clamp } from "../util/math.js";


// belt animation reference:
// https://codepen.io/jasonr/pen/YrzxOJ


interface AnimationParams {
    /** NOTE this is a required field on either Sheet or Animation but not both. It's only defined as optional to avoid warnings */
    sheet?: HTMLImageElement;
    /** size of each frame. currently donesn't support different sizes for each frame */
    frameSize?: IPoint;
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
     offset?: IPoint;
     /** NOTE: this starts at 1, not 0 */ 
     row?: number;
     /**  NOTE: this starts at 1, not 0 */
     column?: number; 

     /** scale multiplier that gets multiplied to size (negative values will flip) */
     scale?: IPoint;
}



interface AnimSheetParams extends AnimationParams {
    /** list of configurations for each sprite animation */
    groups: Record<string,SpriteAnimParams>;
}

// these properties are shared by sheet and animation 
// they can get defaulted at sheet level and then optionally overriden by each individual animation
const shared_options = ["sheet", "frameSize", "fps"];

/** group of animations for entire sprite sheet */
export class AnimationSheet {

    sheet: HTMLImageElement;
    animations: Record<string, SpriteAnimation>;

    constructor(args : AnimSheetParams) {

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

/** single animation within a sprite sheet */
export class SpriteAnimation {
  
    sheet: HTMLImageElement;
    frameSize: IPoint;

    /** number of rows */
    rows: number;
    /** number of columns */
    columns: number;
    /** currnet column */
    column:number;
    /** current row */
    row: number;

    /** offset within specified row/column (some retards make sprite sheets as complicated to render as possible by offsetting everything instead of just making them consistent rows) */
    offset: IPoint;

    scale: IPoint;

    /** milliseconds spent on current frame. will advance to next frame when this exceeds mspf */
    timer:number;



    /** frames per second (default = 30) */
    private fps: number;
    /** seconds per frame */
    private sfp: number;

    /** only storing these for copy() */
    readonly input_row:number;
    readonly input_column:number;

    constructor(args : SpriteAnimParams) {
        if (!args.sheet) throw "Sprite Animation Required a sheet.";
        

        this.sheet = args.sheet;

        this.frameSize = args.frameSize ?? { x: 64, y: 64 };
        this.rows = args.rows ?? 1;
        this.columns = args.columns ?? 99;
        this.fps = args.fps ?? 30;
        this.scale = args.scale ?? { x: 1, y: 1};

        // calculating offset given combination of pixel offset and row/column sizing
        const offset = args.offset ?? { x: 0, y: 0 };
        this.input_row = args.row ?? 1;
        this.input_column = args.column ?? 1;
        this.offset = {
            x: offset.x + ((this.input_column-1) * this.frameSize.x), 
            y: offset.y + ((this.input_row-1) * this.frameSize.y)
        };

        this.setFPS(args.fps)

        this.timer = 0;
        this.row = 0;
        this.column = 0;
    }

    setFPS(fps:number) {
        this.fps = fps ?? 30;
        this.sfp = 1 / this.fps;
    }

    copy() {
        return new SpriteAnimation({
            sheet: this.sheet,
            frameSize: this.frameSize,
            rows: this.rows,
            columns: this.columns,
            row: this.input_row,
            column: this.input_column,
            fps: this.fps
        })
    }


    update(deltaTime : number) {

        this.timer += deltaTime;

        // frameTime met -> advance to next frame
        if (this.timer >= this.sfp) {

            // if going super fast, some frames will need to be skipped
            let diff = this.timer - this.sfp;
            let skipFrames = Math.floor(diff / this.sfp);

            this.timer = 0;

            this.column += 1 + skipFrames;

            // reached end of column -> wrap to next row (or simply reset column if only 1 row)
            if (this.column > this.columns - 1) {
                this.column = 0;
                this.row++;

                // reached end of columns and end or rows ? reset
                if (this.row > this.rows - 1) {
                    this.row = 0;
                }
            }
        }

    }

    /** render specified sprite on specified rect */
    render(ctx : CanvasRenderingContext2D, rect: Rectangle) {
        
        let sx = clamp(this.offset.x + (this.column * this.frameSize.x), 0, this.sheet.width - this.frameSize.x);
        let sy = clamp(this.offset.y + (this.row * this.frameSize.y), 0, this.sheet.height - this.frameSize.y);
        
        
        rect.transform(ctx);
        ctx.scale(this.scale.x, this.scale.y);
        ctx.drawImage(this.sheet, 
            sx, sy, this.frameSize.x, this.frameSize.y,
            -rect.size.x / 2, -rect.size.y / 2, rect.size.x, rect.size.y
        );
        ctx.scale(1 / this.scale.x, 1 / this.scale.y);
        rect.untransform(ctx);

    }

}



export interface AnimObjectParams extends FactoryObjectParams {
    anim? : SpriteAnimation;
}

/** object that contains an animation and updates/renders it every frame */
export class AnimationObject extends FactoryObject {

    anim: SpriteAnimation;
    
    constructor(args: AnimObjectParams) {
        super(args);
        this.anim = args.anim;
    }

    update(deltaTime : number) {
        super.update(deltaTime);
        this.anim.update(deltaTime);
    }

    render(ctx : CanvasRenderingContext2D) {
        this.anim.render(ctx, this);
    }

}