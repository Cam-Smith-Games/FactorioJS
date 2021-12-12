import { Vector } from "./util/vector.js";

export interface TransformArgs {
    pos?: Vector;
    offset?: Vector;
    /** base size without scaling. default = 64x64 */
    size?: Vector;
    /** scale multiplier that gets multiplied to size (negative values will flip) */
    scale?: Vector;
    angle?: number;
    alpha?: number;

    velocity?: Vector;
}


export abstract class Transform {
    pos: Vector;
    size: Vector;
    scale: Vector;
    angle: number;
    alpha: number;
    velocity: Vector;

    constructor(args : TransformArgs = {}) {
        this.pos = args.pos ?? new Vector();
        this.size = args.size ?? new Vector(64, 64);
        this.scale = args.scale ?? new Vector(1, 1);
        this.angle = args.angle ?? 0;
        this.alpha = args.alpha ?? 1;
        this.velocity = args.velocity ?? new Vector();
    }

}

export enum RenderMode {
    // rendering is performed relative to transform and parent transforms
    Relative = 0,
    // rendering is performed using absolute position and ignores all transforms
    Absolute = 1
}