import { View } from './view';
export class MainView extends View{

    constructor(options) {
        super();
        this.projectId = options.projectId;
    }

    getHtml() {
        var htmlContent =  (
            '<div id="mainView">' +
                "Hello World Main View!! " + this.projectId +
            '</div>'
        );
        return htmlContent;
    }

    bindDomEvents() {
        var me = this;
        /*this.$el.find('.openProjectBtn').click(function() {
            me.trigger('open:project', {projectId: $(this).data('projectid')})
        });*/
    }
}
