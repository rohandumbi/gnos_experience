export class GnosModel {
    constructor(properties) {
        this.properties = properties;
        this.projectId = properties.projectId;
    }

    fetch(options) {
        // do some AJAX calls and return data
        this.url = "http://localhost:4567/project/" + this.projectId + "/models";
        $.ajax({
            url: this.url,
            type: 'GET',
            success: function (data) {
                options.success(JSON.parse(data));
            },
            error: function (data) {
                options.error(JSON.parse(data));
            }
        });
    }
}
