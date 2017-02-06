import { Model } from '../core/model';
export class DashboardModel extends Model{
    constructor(options) {
        super(options);
        this.url = 'http://localhost:4567/projects';
    }
}
