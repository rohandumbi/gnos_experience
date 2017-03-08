import {Model} from '../core/model';
export class FieldsModel extends Model {
    constructor(options) {
        super();
        this.properties = options;
        this.projectId = options.projectId;
        this.url = "http://localhost:4567/project/" + this.projectId + "/fields";
    }
}
