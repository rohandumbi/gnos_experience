import {Model} from '../core/model';
export class ExpitReportModel extends Model {
    constructor(properties) {
        super();
        this.properties = properties;
        this.projectId = properties.projectId;
        this.scenarioName = properties.scenarioName;
        this.url = "http://localhost:4567/project/" + this.projectId + "/report/expit";
    }
}
