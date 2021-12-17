export interface IPoint {
    x:number;
    y:number;
    /** this is used for z-indexing in combination with y. if not provided, its treated as 0 */
    z?:number; 
}
