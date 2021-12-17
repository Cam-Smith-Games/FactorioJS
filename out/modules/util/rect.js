export class Rectangle {
    constructor(params) {
        var _a, _b, _c;
        this.pos = (_a = params.pos) !== null && _a !== void 0 ? _a : { x: 0, y: 0 };
        this.size = (_b = params.size) !== null && _b !== void 0 ? _b : { x: 1, y: 1 };
        this.angle = (_c = params.angle) !== null && _c !== void 0 ? _c : 0;
    }
    contains(p) {
        return (this.pos.x <= p.x &&
            p.x <= this.pos.x + this.size.x &&
            this.pos.y <= p.y &&
            p.y <= this.pos.y + this.size.y);
    }
    /** gets tile directly in-front of this object */
    getForward() {
        return {
            x: this.pos.x + (Math.round(Math.cos(this.angle)) * this.size.x),
            y: this.pos.y + (Math.round(Math.sin(this.angle)) * this.size.y)
        };
    }
}
//# sourceMappingURL=rect.js.map