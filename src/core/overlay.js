export class Overlay {

    constructor(options) {
        if (!options.contentUrl) {
            throw 'content url not provided';
        }
        this._callbacks = {};
        this.contentUrl = options.contentUrl;
        this.$el = $(`<div class="modal animated bounceIn fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                    <h4 class="modal-title"></h4>
                                </div>
                                <div class="modal-body" style="height:85%;"></div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-default btn-close" data-dismiss="modal">Close</button>
                                    <button type="button" class="btn btn-primary btn-submit" data-dismiss="modal">Done</button>
                                </div>
                            </div>
                        </div>
                       </div>`);
        this.$el.find('.modal-title').html(options.title);

    }

    show(model) {
        this.getHtml()
            .then((html)=> {
                var _ = require('underscore');
                var template = _.template(html);
                var $template = $(template(model));
                $('body').append(this.$el);
                this.$el.find('.modal-body').html($template);
                this.$el.modal();
                this.onDomLoaded();

            })
            .catch((err)=> {
                throw 'count not retrieve: ' + this.contentUrl;
            });
    }

    getHtml() {
        var promise = new Promise((resolve, reject) => {
            $.get(this.contentUrl, function (data) {
                resolve(data);
            })
        });
        return promise;
    }


    onDomLoaded() {
        this.$el.find('.btn-close').click((e) => {
            this.trigger('closed');
        });
        this.$el.find('.btn-submit').click((e) => {
            this.trigger('submitted');
        });
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
