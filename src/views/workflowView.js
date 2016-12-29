import { View } from './view';
export class WorkflowView extends View{

    constructor(options) {
        super();
    }

    getHtml() {
        var htmlContent =  (
            '<div id="workflowView">' +
                'Hello World' +
            '</div>'
        );
        return htmlContent;
    }

    bindDomEvents() {

    }
}
