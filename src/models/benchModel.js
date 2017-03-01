import {Model} from '../core/model';
export class BenchModel extends Model {
    constructor(properties) {
        super();
        this.properties = properties;
        this.projectId = properties.projectId;
        this.pitNo = properties.pitNo;
        this.url = "http://localhost:4567/project/" + this.projectId + "/pit/" + this.pitNo + '/benches';
    }
}
