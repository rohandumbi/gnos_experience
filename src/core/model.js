export class Model {
    constructor(options) {
        //this.url = options.url;
    }

    fetch(options) {
        // do AJAX GET calls and return data
        if(!this.url) {
            alert('Location of Project endpoints not avaiable.');
        }
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
