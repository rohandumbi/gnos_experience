import {Model} from '../core/model';
export class ProductGradeModel extends Model {
    constructor(properties) {
        super();
        this.properties = properties;
        this.projectId = properties.projectId;
        this.url = "http://localhost:4567/project/" + this.projectId + "/product/" + properties.productName + '/grades';
    }
}
