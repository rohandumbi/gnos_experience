export class Overlay {

    constructor(options) {
        if (!options.contentUrl) {
            throw 'content url not provided';
        }
        this._callbacks = {};
        this.contentUrl = options.contentUrl;
        this.$el = $(`<div class="gnos-overlay modal animated bounceIn fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
                        <div class="gnos-overlay-doalog modal-dialog" role="document">
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
                                    <button type="button" class="btn btn-primary btn-submit">Done</button>
                                </div>
                            </div>
                        </div>
                       </div>`);
        this.$el.find('.modal-title').html(options.title);
        /*if (!options.draggable) {
            this.enableDragging();
         }*/
    }

    enableDragging() {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        var $header = this.$el.find('.modal-header');
        var elmnt = this.$el.get(0);
        $header.mousedown(e=> {
            e = e || window.event;
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            //document.onmouseup = closeDragElement;
            document.onmouseup = (e)=> {
                document.onmouseup = null;
                document.onmousemove = null;
            }
            // call a function whenever the cursor moves:
            document.onmousemove = (e)=> {
                e = e || window.event;
                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                // set the element's new position:
                elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
            };
        });
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

    close() {
        this.$el.modal('hide');
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
