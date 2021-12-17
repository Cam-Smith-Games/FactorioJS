// by default, javascript modulo operator doesn't handle negatives
/** by default, javascript modulo operator doesn't handle negatives */
export const mod = (num, mod) => ((num % mod) + mod) % mod;
/** rounds to nearest multiple of x */
export const roundTo = (num, x) => Math.round(num / x) * x;
/** rounds DOWN to nearest multiple of x */
export const floorTo = (num, x) => Math.floor(num / x) * x;
/** rounds UP to nearest multiple of x */
export const ceilTo = (num, x) => Math.ceil(num / x) * x;
/** clamps number between min and max value */
export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
export const sum = (nums) => nums.reduce((s, total) => total + s, 0);
export const avg = (nums) => sum(nums) / nums.length;
export const min = (nums) => Math.min.apply(Math, nums);
export const max = (nums) => Math.max.apply(Math, nums);
/** linear interpolate between 2 values (NOTE: amount is 0-1) */
export const lerp = (start, end, amt) => (1 - amt) * start + amt * end;
//# sourceMappingURL=math.js.map