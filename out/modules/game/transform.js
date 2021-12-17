import { Vector } from "./util/vector.js";
export class Transform {
    constructor(args = {}) {
        var _a, _b, _c, _d, _e, _f;
        this.pos = (_a = args.pos) !== null && _a !== void 0 ? _a : new Vector();
        this.size = (_b = args.size) !== null && _b !== void 0 ? _b : new Vector(64, 64);
        this.scale = (_c = args.scale) !== null && _c !== void 0 ? _c : new Vector(1, 1);
        this.angle = (_d = args.angle) !== null && _d !== void 0 ? _d : 0;
        this.alpha = (_e = args.alpha) !== null && _e !== void 0 ? _e : 1;
        this.velocity = (_f = args.velocity) !== null && _f !== void 0 ? _f : new Vector();
    }
    get forward() {
        let x = this.pos.x + (Math.round(Math.cos(this.angle)) * this.size.x);
        let y = this.pos.y + (Math.round(Math.sin(this.angle)) * this.size.y);
        return new Vector(x, y);
    }
}
export var RenderMode;
(function (RenderMode) {
    // rendering is performed relative to transform and parent transforms
    RenderMode[RenderMode["Relative"] = 0] = "Relative";
    // rendering is performed using absolute position and ignores all transforms
    RenderMode[RenderMode["Absolute"] = 1] = "Absolute";
})(RenderMode || (RenderMode = {}));
//# sourceMappingURL=transform.js.map