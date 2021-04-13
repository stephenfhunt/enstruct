export enum ComparisonResult {
    LESS = -1,
    EQUAL = 0,
    GREATER = 1
};

export type Comparison<T> = (left: T, right: T)=>ComparisonResult;

export function defaultCompare<T>(left: T, right: T): ComparisonResult {
    if (left < right) return -1;
    else if (left === right) return 0;
    else return 1;
}