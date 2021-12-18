import { Rectangle, RectangleParams } from "../struct/rect.js";

export interface GameObjectParams extends RectangleParams {}
export abstract class GameObject extends Rectangle {
    constructor(params:GameObjectParams) {
        super(params);
    }

    abstract render(ctx:CanvasRenderingContext2D) : void;

    /** @param deltaTime time since last frame (in seconds) */
    // @ts-ignore
    update(deltaTime: number): void {};
}
