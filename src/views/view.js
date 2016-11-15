export class View {

    constructor() {
    }

    renderToView(model) {
        var _ = require('underscore');
        var WelcomeTmpl = _.template(this.getHtml());
        var tmpl = WelcomeTmpl(model);
        this.$el = $(tmpl);
        return this.$el;
    }

    getHtml() {
        var htmlContent =  ('<div></div>');
        return htmlContent;
    }

    render() {
        var model = this.model || {fetch: ()=>{}};
        this.renderToView(model.fetch());
        this.bindDomEvents();
        return this;
    }

    bindDomEvents() {
    }

    trigger(eventName, options) {
        this.$el.trigger(eventName,[options]);
    }

    on(eventName, callback) {
        this.$el.on(eventName, function(event, options){
            callback(options);
        });
    }

    off(eventName) {
        this.$el.off(eventName);
    }
}
