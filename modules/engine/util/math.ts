
// by default, javascript modulo operator doesn't handle negatives
/** by default, javascript modulo operator doesn't handle negatives */
export const mod = (num:number, mod:number) => ((num % mod) + mod) % mod;

/** rounds to nearest multiple of x */
export const roundTo = (num:number, x:number) => Math.round(num / x) * x;

 /** rounds DOWN to nearest multiple of x */
export const floorTo = (num:number, x:number) => Math.floor(num / x) * x;

/** rounds UP to nearest multiple of x */
export const ceilTo = (num:number, x:number) => Math.ceil(num / x) * x;

/** clamps number between min and max value */
export const clamp = (num:number,min:number,max:number) => Math.min(Math.max(num, min), max);

export const sum  = (nums:number[]) => nums.reduce((s, total) => total + s, 0); 
export const avg = (nums:number[]) => sum(nums) / nums.length;
export const min = (nums:number[]) => Math.min.apply(Math, nums);
export const max = (nums:number[]) => Math.max.apply(Math, nums);



/** linear interpolate between 2 values (NOTE: amount is 0-1) */
export const lerp = (start:number, end:number, amt:number) => (1-amt) * start + amt*end;

