/**
 * @description Quicksort Demo
 * @param {Array<number>} arr
 * @returns {Array<number>} result
 */
export function sort(arr: Array<number>): Array<number> {
    // length < 1 don't need sort
    if (arr.length < 1) return arr;

    // find middle index
    let mid = Math.floor(arr.length / 2);

    // get middle value
    let temp = arr.splice(mid, 1)[0];

    let left = [];
    let right = [];

    for (var i = 0; i < arr.length; i++) {
        if (arr[i] < temp) {
            left.push(arr[i]);
        } else if (arr[i] >= temp) {
            right.push(arr[i]);
        }
    }

    // recursive and return the result
    return sort(left).concat(temp, sort(right));
}
