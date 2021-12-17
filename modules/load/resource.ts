/*
    This module is for loading resources (images, audio files, videos, etc)

    -   Because resources are loaded asynchronoussly, i use promises to wait for all images to load before returning
    -   For tracking load progress, you can do XHR request then set the image src to blob from the resulting byte array but for some reason this results in broken image sometimes...
    
*/

/** 
 * @param urls maps image name to file url 
 * @param callback function that gets passed resulting resource map
 */
export function loadImages (urls: Record<string,string>, callback: (map: Map<string,HTMLImageElement>) => void) {
    const promises = 
        Object.keys(urls)
        .map(name => new Promise<[string,HTMLImageElement]>(resolve => {
            let img = new Image();
            img.onload = () => resolve([name, img]);
            img.onprogress = img.onloadstart = function(e) {
                console.log("progress:" , e);
            }
            img.src = urls[name];
        }));

    Promise.all(promises).then(tuples => callback(new Map(tuples)));
}


export function loadImage(url:string, progress: (e: ProgressEvent<EventTarget>) => void){
    return new Promise<HTMLImageElement>(resolve => {

        let img = new Image();
        let request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onprogress = progress;
        request.onloadstart = progress;
        request.onload = function() {
            console.log(this);
            img.src = window.URL.createObjectURL(
                new Blob([this.response])
            );
            resolve(img);
        };
        request.send();
    });
 
};


// TODO: allow loading sounds/videos (urls will need a type property, or parse extension but thats extra)

/**
 * This method loads all images specified by (name->url) map
 * It tracks load progress of all images simultaneously and returns the result via callback once all have been loaded
 * @param urls maps image name to file url 
*/
export async function load(urls: Record<string,string>) {

    const keys = Object.keys(urls);
    const result: Record<string,HTMLImageElement> = {};

 

    await Promise.all(keys.map(name => new Promise<void>((resolve,_) => {
        const img = new Image();
        img.onload = function() {
            result[name] = img;
            resolve();
        }
        img.src = urls[name];
    })));

    return result;
}

/**
 * This method loads all images specified by (name->url) map
 * It tracks load progress of all images simultaneously and returns the result via callback once all have been loaded
 * @param urls maps image name to file url 
*
export async function load(urls: Record<string,string>) {

    const keys = Object.keys(urls);
    const progress = new Map(keys.map(key => [key,  { loaded: 0, total: 0 }]));
    const $progress = 
        $("<div id='load'><progress></progress></div>")
        .appendTo("body")
        .find("progress");

    function update() {
        let agg = { loaded: 0, total: 0 };
        for (let val of progress.values()) {
            agg.loaded += val.loaded;
            agg.total += val.total;
        }
        $progress.attr({
            "value": agg.loaded,
            "max": agg.total
        });    
    }

    const result: Record<string,HTMLImageElement> = {};

    const promises = keys.map(async name => {
        const prog = progress.get(name);
        const img = await loadImage(urls[name], function (e) {
            prog.loaded = e.loaded;
            prog.total = e.total;
            console.log(prog);
            update();
        });
        result[name] = img;
    });

    await Promise.all(promises);
    $progress.parent().remove();
    return result;
}*/