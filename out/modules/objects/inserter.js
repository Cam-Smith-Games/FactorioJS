import { LinkedFactoryObject } from "./factoryobject.js";
export class Inserter extends LinkedFactoryObject {
    constructor(args) {
        var _a;
        args.double = false;
        super(args);
        this.speed = (_a = args.speed) !== null && _a !== void 0 ? _a : 1;
        this.cooldown = 0;
    }
    // @ts-ignore
    update(deltaTime) {
    }
    _render(ctx) {
        ctx.fillStyle = "purple";
        ctx.fillRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
        ctx.strokeStyle = "white";
        ctx.strokeRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
        ctx.drawImage(Inserter.arrows[this.speed], -this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
    }
    /*canReceive(): boolean {
        return super.canReceive() && this.cooldown <= 0;
    }*/
    /*_update(deltaTime:number) {

        if (this.prev && this.cooldown == 0) {
            // TODO: stack inserters will be able to grab from multiple slots before setting cooldown
            let done = false;
            this.prev.forSlot(slot => {
                if (!done && slot.item && !slot.move_remaining) {
                    this.item = slot.item;
                    slot.item = null;
                    this.cooldown = 1/this.speed;
                    done = true;
                }
            })
     
        }

        if (this.cooldown > 0) {
            this.cooldown = Math.max(0, this.cooldown - deltaTime);
        }
    }*/
    /*_update(deltaTime:number) {
        
        if (this.cooldown > 0) {
            this.cooldown = Math.max(0, this.cooldown - deltaTime);
        }

        let can_send = this.next?.canSend(true);
        let can_receive = this.canReceive();
        //console.log({
        //    can_send: can_send,
        //    can_receive: can_receive
        //});

        if (this.next?.item) {
            console.log(`[INSERT SLOT]: Attempting ${this.id} to ${this.next}`, {
                can_send: can_send,
                can_receive: can_receive
            });
        }

        if (can_send && can_receive) {
                   
            // TODO: stack inserters will be able to grab from multiple slots before setting cooldown
            console.log("yoink");
            this.item = this.next.item;
            this.next.item = null;
            this.cooldown = 1/this.speed;

        }

  
    }*/
    _postRender(ctx) {
        var _a, _b;
        let next = (_b = (_a = this.link) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.instance;
        if (next) {
            ctx.strokeStyle = next.item ? "yellow" : "magenta";
            ctx.strokeRect(next.pos.x, next.pos.y, next.size.x, next.size.y);
        }
    }
    // @ts-ignore
    calculate(slot_grid) {
    }
}
// different image for each speed
Inserter.arrows = {
    1: null,
    2: null,
    3: null
};
//# sourceMappingURL=inserter.js.map