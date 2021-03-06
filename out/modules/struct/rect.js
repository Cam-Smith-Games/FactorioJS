export class Rectangle {
    constructor(params) {
        var _a, _b, _c, _d;
        this.pos = (_a = params.pos) !== null && _a !== void 0 ? _a : { x: 0, y: 0 };
        this.size = (_b = params.size) !== null && _b !== void 0 ? _b : { x: 1, y: 1 };
        this.angle = (_c = params.angle) !== null && _c !== void 0 ? _c : 0;
        this.scale = (_d = params.scale) !== null && _d !== void 0 ? _d : 1;
    }
    /** returns true if this rectangle contains specified point */
    contains(p) {
        // NOTE: modifying default "rectangle contains point" logic for a tile-based grid
        /*return (
            this.pos.x <= p.x &&
            p.x <= this.pos.x + this.size.x &&
            this.pos.y <= p.y &&
            p.y <= this.pos.y + this.size.y
        );*/
        // NOTE: slightly modified the standard "Rectangle contains point" logic here.
        //      normally everything is <=
        //      but in this case, you want top-left corner to be >=, and bottom right corner to be <
        return (p.x >= this.pos.x &&
            p.x < this.pos.x + this.size.x &&
            p.y >= this.pos.y &&
            p.y < this.pos.y + this.size.y);
    }
    /** returns true if this rectangle intersects specified rectangle */
    intersects(rect) {
        return (this.pos.x < rect.pos.x + (rect.size.x * rect.scale) &&
            this.pos.x + (this.size.x * this.scale) > rect.pos.x &&
            this.pos.y < rect.pos.y + (rect.size.y * rect.scale) &&
            this.pos.y + (this.size.y * this.scale) > rect.pos.y);
    }
    /** transforms canvas for rendering this rectangle
     * @note this used to do more, (i.e. rotating ctx by rect.angle), but some things don't actually render to match their angle (i.e. belt items always pointing upward) */
    transform(ctx) {
        let center = this.getCenter();
        //ctx.globalAlpha = this.alpha;
        ctx.translate(center.x, center.y);
        //rctx.rotate(this.angle);
        ctx.scale(this.scale, this.scale);
        //ctx.strokeStyle = "rgb(0, 255, 0)";
        //ctx.strokeRect(-this.size.x/2, -this.size.y/2, this.size.x, this.size.y);
    }
    /** untransforms canvas after redenring this rectangle (should only be called after calling this.transform(ctx)) */
    untransform(ctx) {
        let center = this.getCenter();
        ctx.scale(1 / this.scale, 1 / this.scale);
        //ctx.rotate(-this.angle);
        ctx.translate(-center.x, -center.y);
        //ctx.globalAlpha = 1
    }
    /** gets center position of this rectangle (pos represents top left corner) */
    getCenter() {
        return {
            x: this.pos.x + this.size.x / 2,
            y: this.pos.y + this.size.y / 2
        };
    }
    /** gets forward facing normal vector */
    getForward() {
        return {
            x: Math.round(Math.cos(this.angle)),
            y: Math.round(Math.sin(this.angle))
        };
    }
    /** gets tile directly in-front of this object
      * @param range distance to look ahead (defaults to rectangle width)
      **/
    getFrontTile(range = this.size.x) {
        let forward = this.getForward();
        return {
            x: this.pos.x + (forward.x * range),
            y: this.pos.y + (forward.y * range)
        };
    }
}
//# sourceMappingURL=rect.js.map