import {Model} from '../core/model';
export class ScenarioCollection extends Model {
    constructor(properties) {
        super();
        this.properties = properties;
        this.projectId = properties.projectId;
        this.url = "http://localhost:4567/project/" + this.projectId + "/scenarios";
    }
}
