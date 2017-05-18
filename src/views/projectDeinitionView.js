import {View} from '../core/view';
export class ProjectDefinitionView extends View {

    constructor(options) {
        super();
        this.project = options.project;
    }

    getHtml() {
        var htmlContent;
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/projectDefinitionView.html", function (data) {
                resolve(data);
            })
        });
        return promise;
    }

    onDomLoaded() {
        this.bindEvents();
        this.$el.find('#name').val(this.project.name);
        this.$el.find('#date').val(this.project.createdDate);
        this.$el.find('#descriptions').val(this.project.desc);
        this.$el.find('#present-file').val(this.project.fileName);
    }

    bindEvents() {

    }
}
