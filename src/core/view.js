export class View {

    constructor(options) {
        this._callbacks = {};
        this.$el = $('<div style="height:100%"></div>');
    }

    renderToView(model) {
        var that = this;
        var _ = require('underscore');
        var htmlPromise = this.getHtml();
        htmlPromise.then(function(html){
            var WelcomeTmpl = _.template(html);
            var $tmpl = $(WelcomeTmpl(model));
            that.$el.html($tmpl);
            //$tmpl.unwrap();
            that.onDomLoaded();
        })
        return this.$el;
    }

    getHtml() {
        var htmlContent =  ('<div></div>');
        return htmlContent;
    }

    render() {
        var model = this.model || {fetch: ()=>{}};
        this.renderToView(model.fetch());
        return this;
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
