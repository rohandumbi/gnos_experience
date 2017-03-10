import {Model} from '../core/model';
export class GradeModel extends Model {
    constructor(properties) {
        super();
        this.properties = properties;
        this.projectId = properties.projectId;
        this.url = "http://localhost:4567/project/" + this.projectId + "/fields?datatype=4";
    }
}
