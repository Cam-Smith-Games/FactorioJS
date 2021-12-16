import { ItemDetails } from "./item.js";
import { LinkedObject } from "../engine/linkedobject.js";
import { FactorySlot } from "./slot.js";
import { LinkedFactoryObject, LinkedFactoryObjectArgs } from "./factoryobject.js";


export interface InserterArgs extends LinkedFactoryObjectArgs<FactorySlot> {
    speed:number;
}

export class Inserter extends LinkedFactoryObject<FactorySlot> {

    // different image for each speed
    static arrows: { [speed:number]: HTMLImageElement} = {
        1: null,
        2: null,
        3: null
    };

    item:ItemDetails;

    /** number of insertions per second */
    speed:number;

    /** seconds before another insertion can occur */
    cooldown:number;
    
    constructor(args:InserterArgs) {
        args.double = false;
        super(args);
        this.speed = args.speed ?? 1;
        this.cooldown = 0;
    }


    // @ts-ignore
    update(deltaTime:number) {

    }

    _render(ctx:CanvasRenderingContext2D) {
        ctx.fillStyle = "purple";
        ctx.fillRect(-this.size.x/2, -this.size.y/2, this.size.x, this.size.y);

        ctx.strokeStyle = "white";
        ctx.strokeRect(-this.size.x/2, -this.size.y/2, this.size.x, this.size.y);
        ctx.drawImage(Inserter.arrows[this.speed], -this.size.x/2, -this.size.y/2, this.size.x, this.size.y);
 
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


    protected _postRender(ctx: CanvasRenderingContext2D): void {
        let next = this.link?.next?.instance;
        if (next) {
            ctx.strokeStyle = next.item ? "yellow" : "magenta";
            ctx.strokeRect(next.pos.x, next.pos.y, next.size.x, next.size.y);
        }   
    }


    // @ts-ignore
    calculate(slot_grid: { [x:number]: { [y:number] : LinkedObject<FactoryObject>}}) {
      
    }
}
