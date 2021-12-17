import { IPoint } from "./point.js";
import { Rectangle } from "./rect.js";

export interface IMap <T extends Rectangle> {
    objects: T[]
    add(p:T): boolean;
    remove(p:T): boolean;
    /** iterate through list of polygons, return first one that insercts with point 
     * @note would be more efficient to store objects in a grid structure to quickly grab objects by index. however, this requires bringing recuyrsively passiong all child objects to top level grid.
     * @note not worth the optimization beacuse this only gets called on click, not every frame 
    */
    get(p:IPoint): T;
}
