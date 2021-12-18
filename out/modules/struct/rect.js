export class Rectangle {
    constructor(params) {
        var _a, _b, _c, _d;
        this.pos = (_a = params.pos) !== null && _a !== void 0 ? _a : { x: 0, y: 0 };
        this.size = (_b = params.size) !== null && _b !== void 0 ? _b : { x: 1, y: 1 };
        this.angle = (_c = params.angle) !== null && _c !== void 0 ? _c : 0;
        this.scale = (_d = params.scale) !== null && _d !== void 0 ? _d : 1;
    }
    contains(p) {
        return (this.pos.x <= p.x &&
            p.x <= this.pos.x + this.size.x &&
            this.pos.y <= p.y &&
            p.y <= this.pos.y + this.size.y);
    }
    transform(ctx) {
        let center = this.getCenter();
        //ctx.globalAlpha = this.alpha;
        ctx.translate(center.x, center.y);
        //ctx.rotate(this.angle);
        ctx.scale(this.scale, this.scale);
        //ctx.strokeStyle = "rgb(0, 255, 0)";
        //ctx.strokeRect(-this.size.x/2, -this.size.y/2, this.size.x, this.size.y);
    }
    untransform(ctx) {
        let center = this.getCenter();
        ctx.scale(1 / this.scale, 1 / this.scale);
        //ctx.rotate(-this.angle);
        ctx.translate(-center.x, -center.y);
        //ctx.globalAlpha = 1
    }
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
      * @param range distance to look ahead (defaults to object width)
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