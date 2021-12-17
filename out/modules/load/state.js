/*
    This module is for saving/loading game state to/from JSON
*/
// TODO: might want multiple save files, ability to name save states?
export function save(obj) {
    let json = JSON.stringify(obj);
    window.localStorage.setItem("save", json);
}
/** retrieve json from storage, then casts it to specified type */
export function load() {
    let json = window.localStorage.getItem("save");
    let obj;
    try {
        obj = JSON.parse(json);
    }
    catch (_a) {
        obj = null;
    }
    return obj;
}
//# sourceMappingURL=state.js.map