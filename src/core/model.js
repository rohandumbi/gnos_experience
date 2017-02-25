export class Model {
    constructor(options) {
        //this.url = options.url;
    }

    fetch(options) {
        // do AJAX GET calls and return data
        var url = options.url || this.url;
        if (!url) {
            alert('Location of Project endpoints not avaiable.');
        }
        $.ajax({
            url: url,
            type: 'GET',
            success: function(data){
                options.success(JSON.parse(data));
            },
            error: function(data) {
                options.error(JSON.parse(data));
            }
        });
    }

    add(options) {
        var url = options.url || this.url;
        if (!url) {
            alert('Location of Project endpoints not avaiable.');
        }
        var data = JSON.stringify(options.dataObject);
        $.ajax({
            url: url,
            type: "POST",
            data: data,
            success: function(data){
                options.success(data);
            },
            error: function(data) {
                options.error(data);
            },
            dataType: 'json'
        });
    }

	update(options) {
        var url = options.url || this.url;
        if (!url) {
            alert('Location of Project endpoints not avaiable.');
        }
        if (options.id) {
            url += '/' + options.id;
        }
        var data = JSON.stringify(options.dataObject);
        $.ajax({
            url: url,
            type: "PUT",
            data: data,
            success: function(data){
                options.success(data);
            },
            error: function(data) {
                options.error(data);
            },
            dataType: 'json'
        });
    }

    delete(options) {
        var url = options.url || this.url;
        if (!url) {
            alert('Location of Project endpoints not avaiable.');
        }
        $.ajax({
            url: url + '/' + options.id,
            type: 'DELETE',
            success: options.success || $.noop,
            error: options.error || $.noop
        });
    }
}
