export class Overlay {

    constructor(options) {
        if (!options.contentUrl) {
            throw 'content url not provided';
        }
        this._callbacks = {};
        this.$el = $('<div class="gnos-overlay"><a href="javascript:void(0)" class="closebtn">&times;</a><div class="gnos-overlay-content"></div></div>');
        this.$el.click(this.close);
        this.contentUrl = options.contentUrl;
    }

    show(model) {
        this.getHtml()
            .then((html)=> {
                var _ = require('underscore');
                var template = _.template(html);
                var $template = $(template(model));
                this.$el.find('.gnos-overlay-content').html($template);
                this.$el.width('100%');
                this.onDomLoaded();

            })
            .catch((err)=> {
                throw 'count not retrieve: ' + this.contentUrl;
            });
    }

    close(event) {
        alert('should close');
        this.$el.width('100%');
    }

    getHtml() {
        var promise = new Promise(function (resolve, reject) {
            $.get(this.contentUrl, function (data) {
                resolve(data);
            })
        });
        return promise;
    }


    onDomLoaded() {
    }

    trigger(eventName, options) {
        if (this._callbacks[eventName]) {
            this._callbacks[eventName].fire(options);
        }
    }

    on(eventName, callback) {
        if (!this._callbacks[eventName]) {
            this._callbacks[eventName] = $.Callbacks();
        }
        this._callbacks[eventName].add(callback);
    }

    off(eventName) {
        //this.$el.off(eventName);
        if (!this._callbacks[eventName]) {
            return;
        }
        this._callbacks[eventName].remove();
    }
}
