export enum ComparisonResult {
    LESS = -1,
    EQUAL = 0,
    GREATER = 1
};

export type Comparison<T> = (left: T, right: T)=>ComparisonResult;

export function defaultCompare<T>(left: T, right: T): ComparisonResult {
    if (left < right) return ComparisonResult.LESS;
    else if (left === right) return ComparisonResult.EQUAL;
    else return ComparisonResult.GREATER;
}