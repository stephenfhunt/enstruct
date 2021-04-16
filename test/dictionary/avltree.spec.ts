import jsc = require("jsverify");
import chai from "chai";
import {AvlTree} from "../../dist/dictionary/avltree";
import {genericDictionary} from "./dictbehavior";
import { defaultCompare } from "../../dist";

describe("AVL Tree", function() {
    genericDictionary("AVL Tree", (comp, es) => new AvlTree(comp, es));

    it("is iterated in comparison order of the keys", function () {
        jsc.assertForall(jsc.array(jsc.tuple([jsc.integer, jsc.string])), (entries: [key: number, value: string][]) => {
            const map = new AvlTree(defaultCompare, entries);

            let lastKey = Number.MIN_SAFE_INTEGER;

            for (const [key] of map) {
                chai.assert(key >= lastKey);
                lastKey = key;
            }

            lastKey = Number.MIN_SAFE_INTEGER;
            for (const [key] of map.entries()) {
                chai.assert(key >= lastKey);
                lastKey = key;
            }

            lastKey = Number.MIN_SAFE_INTEGER;
            for (const key of map.keys()) {
                chai.assert(key >= lastKey);
                lastKey = key;
            }

            return true;
        });
    });

    it("is always balanced", function() {
        jsc.assertForall(jsc.array(jsc.tuple([jsc.integer, jsc.string])), (entries: [key: number, value: string][]) => {
            const map = new AvlTree(defaultCompare, entries);
            chai.expect(map.balanced).to.be.true;

            for (let [k] of entries) {
                map.delete(k);
                chai.expect(map.balanced).to.be.true;
            }

            return true;
        });
    });

});