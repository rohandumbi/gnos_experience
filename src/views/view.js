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
        this.renderToView(this.model.fetch());
        this.bindDomEvents();
        return this;
    }

    bindDomEvents() {
    }
}
