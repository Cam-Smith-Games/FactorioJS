import { FactoryObject } from "../factory/objects/object.js";
import { clamp } from "../util/math.js";
// these properties are shared by sheet and animation 
// they can get defaulted at sheet level and then optionally overriden by each individual animation
const shared_options = ["sheet", "frameSize", "fps"];
/** group of animations for entire sprite sheet */
export class AnimationSheet {
    constructor(args) {
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
    constructor(args) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!args.sheet)
            throw "Sprite Animation Required a sheet.";
        this.sheet = args.sheet;
        this.frameSize = (_a = args.frameSize) !== null && _a !== void 0 ? _a : { x: 64, y: 64 };
        this.rows = (_b = args.rows) !== null && _b !== void 0 ? _b : 1;
        this.columns = (_c = args.columns) !== null && _c !== void 0 ? _c : 99;
        this.fps = (_d = args.fps) !== null && _d !== void 0 ? _d : 30;
        this.scale = (_e = args.scale) !== null && _e !== void 0 ? _e : { x: 1, y: 1 };
        // calculating offset given combination of pixel offset and row/column sizing
        const offset = (_f = args.offset) !== null && _f !== void 0 ? _f : { x: 0, y: 0 };
        this.input_row = (_g = args.row) !== null && _g !== void 0 ? _g : 1;
        this.input_column = (_h = args.column) !== null && _h !== void 0 ? _h : 1;
        this.offset = {
            x: offset.x + ((this.input_column - 1) * this.frameSize.x),
            y: offset.y + ((this.input_row - 1) * this.frameSize.y)
        };
        this.setFPS(args.fps);
        this.timer = 0;
        this.row = 0;
        this.column = 0;
    }
    setFPS(fps) {
        this.fps = fps !== null && fps !== void 0 ? fps : 30;
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
        });
    }
    update(deltaTime) {
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
    render(ctx, rect) {
        let sx = clamp(this.offset.x + (this.column * this.frameSize.x), 0, this.sheet.width - this.frameSize.x);
        let sy = clamp(this.offset.y + (this.row * this.frameSize.y), 0, this.sheet.height - this.frameSize.y);
        rect.transform(ctx);
        ctx.scale(this.scale.x, this.scale.y);
        ctx.drawImage(this.sheet, sx, sy, this.frameSize.x, this.frameSize.y, -rect.size.x / 2, -rect.size.y / 2, rect.size.x, rect.size.y);
        ctx.scale(1 / this.scale.x, 1 / this.scale.y);
        rect.untransform(ctx);
    }
}
/** object that contains an animation and updates/renders it every frame */
export class AnimationObject extends FactoryObject {
    constructor(args) {
        super(args);
        this.anim = args.anim;
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.anim.update(deltaTime);
    }
    render(ctx) {
        this.anim.render(ctx, this);
    }
}
//# sourceMappingURL=animation.js.map