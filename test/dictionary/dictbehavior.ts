import jsc from "jsverify";
import chai from "chai";
import { Comparison, defaultCompare } from "../../dist";
import { DictEntries } from "../../dist/dictionary";

type DictFactory = <K,V>(comparison: Comparison<K>,
                         entries?: Iterable<readonly [K, V]>|readonly (readonly [K, V])[]|null) => Map<K, V>;

export function genericDictionary(name: string, factory: DictFactory): void {
    describe("Basic dictionary behavior for " + name, function() {
        it("can be constructed empty", function() {
            const newMap = factory(defaultCompare);
            chai.expect(newMap.size).to.equal(0);
        });

        it("can be constructed from a sequence", function() {
            jsc.assertForall(jsc.array(jsc.tuple([jsc.integer, jsc.string])), (entries: [key:number, value: string][]) => {
                const map = factory(defaultCompare, entries);
                // should have the same entries as a built-in Map
                const stdMap = new Map(entries);
                return map.size === stdMap.size && 
                    entries.every(([k,v]) => map.get(k) === stdMap.get(k));
            });
        });
    })
}

genericDictionary("builtin Map", <K,V>(c: Comparison<K>, es?: any) => new Map(es));