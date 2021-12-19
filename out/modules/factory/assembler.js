import { FactoryObject } from "./factoryobject.js";
export class Assembler extends FactoryObject {
    addToFactory(factory) {
        factory.assemblers.push(this);
    }
    retrieve() {
        throw new Error("Method not implemented.");
    }
    // @ts-ignore
    insert(item) {
        throw new Error("Method not implemented.");
    }
}
//# sourceMappingURL=assembler.js.map