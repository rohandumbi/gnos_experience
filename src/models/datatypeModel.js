import { Model } from '../core/model';
export class DatatypeModel extends Model {
    constructor(options) {
        super();
        this.properties = options;
		this.projectId = options.projectId;
        this.url = "http://localhost:4567/project/" + this.projectId + "/fields";
    }

    /*fetch(options) {
     // do some AJAX calls and return data
        $.ajax({
            url: this.url,
            type: 'GET',
            success: function(data){
                options.success(JSON.parse(data));
            },
            error: function(data) {
                options.error(JSON.parse(data));
            }
        });
     }*/
}
