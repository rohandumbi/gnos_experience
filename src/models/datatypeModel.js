import { Model } from '../core/model';
export class DatatypeModel {
    constructor(options) {
        this.properties = options;
		this.projectId = options.projectId;
    }

    fetch(options) {
        // do some AJAX calls and return data		
		this.url = "http://localhost:4567/project/"+this.projectId+"/fields";
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
    }
}
