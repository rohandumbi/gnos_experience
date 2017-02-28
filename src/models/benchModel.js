import {Model} from '../core/model';
export class BenchModel extends Model {
    constructor(properties) {
        super();
        this.properties = properties;
        this.projectId = properties.projectId;
        this.pitId = properties.pitId;
        this.url = "http://localhost:4567/project/" + this.projectId + "/pit/" + this.pitId + '/benches';
    }
}
