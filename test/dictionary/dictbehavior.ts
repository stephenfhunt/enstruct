import jsc from "jsverify";

export function genericDictionary(Dict: MapConstructor): void {
    describe("Basic dictionary behavior for " + Dict.toString(), function() {
        it("can be constructed empty", function() {
            const newMap = new Dict();
            jsc.assert(newMap.size === 0);
        });
    })
}