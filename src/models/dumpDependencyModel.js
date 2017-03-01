import {Model} from '../core/model';
export class DumpDependencyModel extends Model {
    constructor(properties) {
        super()
        this.properties = properties;
        this.url = "http://localhost:4567/scenario/" + this.properties.scenario.id + '/dumpdependencies';
    }
}
