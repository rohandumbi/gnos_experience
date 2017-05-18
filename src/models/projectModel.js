import { Model } from '../core/model';
export class ProjectModel extends Model {
    constructor(options) {
        super(options);
        this.url = 'http://localhost:4567/projects';
    }
}
