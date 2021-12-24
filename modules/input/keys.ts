//const keys: Record<string,boolean> = {};
//window.addEventListener("keydown", e => keys[e.key.toUpperCase()] = true);
//window.addEventListener("keyup", e => delete keys[e.key.toUpperCase()]);


/**
 * takes a key binding map to execute specified funcitons whne specified keys are currently pressed
 * @param {Record<string,()=>void)>} map object mapping key to a function to run when it's pressed 
 * @note keys should be upper case
 * @todo how to handle ctrl/shift/alt modifiers?
 */
export function bindKeys(map: Record<string,()=>void>) {
    // TODO

    // ALSO: how to handle key combos? i.e. ctrl+key? split by "+" or something?

    window.addEventListener("keydown", e => {
        let key = e.key.toUpperCase();
        if (key in map) {
            map[key]();
        }
    })

}