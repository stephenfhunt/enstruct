import jsc from "jsverify";
import chai from "chai";
import { Comparison, defaultCompare } from "../../dist";

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
                    entries.every(([k]) => map.get(k) === stdMap.get(k));
            });
        });

        it("can delete entries", function() {
            jsc.assertForall(jsc.array(jsc.tuple([jsc.integer, jsc.string])), (entries: [key: number, value: string][]) => {
                const map = factory(defaultCompare, entries);                    
                const mapKeys = Array.from(map.keys());
                let good = true;
                while (mapKeys.length > 0) { 
                    const k: number = mapKeys.shift() as number; // can't be undefined because of the while condition
                    map.delete(k);
                    good &&= !map.has(k);
                    good &&= mapKeys.every(k => map.has(k));
                }

                good &&= map.size === 0;
                return good;
            });

        });

        it("can be iterated", function() {
            jsc.assertForall(jsc.array(jsc.tuple([jsc.integer, jsc.string])), (entries: [key:number, value: string][]) => {
                const map = factory(defaultCompare, entries);

                let good = true;

                for (const [key, value] of map) {
                    good &&= entries.some(([k,v]) => key === k && value === v);
                }

                for (const [key, value] of map.entries()) {
                    good &&= entries.some(([k,v]) => key === k && value === v);
                }

                for (const key of map.keys()) {
                    good &&= entries.some(([k,v]) => key === k);
                }

                for (const value of map.values()) {
                    good &&= entries.some(([k,v]) => value === v);
                }

                map.forEach((value, key) => {
                    good &&= entries.some(([k, v]) => key === k && value === v);
                });

                return good;
            });
        });
    })
}

genericDictionary("builtin Map", <K,V>(c: Comparison<K>, es?: any) => new Map(es));