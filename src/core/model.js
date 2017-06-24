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
            error: function (xhr, textStatus, errorThrown) {
                //options.error(JSON.parse(data));
                if (xhr.status === 0) {
                    alert('Service not available ');
                } else {
                    alert(textStatus + ": " + xhr.responseText);
                }
                //options.error(xhr, textStatus, errorThrown);
            },
            statusCode: {
                401: function (response) {
                    // Only if your server returns a 403 status code can it come in this block. :-)
                    alert("Error 401");
                },
                400: function (response) {
                    // Only if your server returns a 403 status code can it come in this block. :-)
                    alert("Error 400");
                }
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
            error: function (xhr, textStatus, errorThrown) {
                if (xhr.status === 0) {
                    alert('Service not available ');
                } else {
                    alert(textStatus + ": " + xhr.responseText);
                }
            },
            statusCode: {
                401: function (response) {
                    // Only if your server returns a 403 status code can it come in this block. :-)
                    alert("Error 401");
                },
                400: function (response) {
                    // Only if your server returns a 403 status code can it come in this block. :-)
                    alert("Error 400");
                }
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
            error: function (xhr, textStatus, errorThrown) {
                if (xhr.status === 0) {
                    alert('Service not available ');
                } else {
                    alert(textStatus + ": " + xhr.responseText);
                }
            },
            statusCode: {
                401: function (response) {
                    // Only if your server returns a 403 status code can it come in this block. :-)
                    alert("Error 401");
                },
                400: function (response) {
                    // Only if your server returns a 403 status code can it come in this block. :-)
                    alert("Error 400");
                }
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
            error: function (xhr, textStatus, errorThrown) {
                if (xhr.status === 0) {
                    alert('Service not available ');
                } else {
                    alert(textStatus + ": " + xhr.responseText);
                }
            },
            statusCode: {
                401: function (response) {
                    // Only if your server returns a 403 status code can it come in this block. :-)
                    alert("Error 401");
                },
                400: function (response) {
                    // Only if your server returns a 403 status code can it come in this block. :-)
                    alert("Error 400");
                }
            }
        });
    }
}
