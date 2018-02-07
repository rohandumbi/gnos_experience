import {Overlay} from '../core/overlay';
export class ExportProjectOverlay extends Overlay {
    constructor(options) {
        if (!options.project) {
            throw 'This overlay needs project info.'
        }
        var contentUrl = '../content/exportProjectOverlay.html';
        var overlayTitle = 'Export Project';
        var mergedOptions = $.extend(options, {contentUrl: contentUrl, title: overlayTitle});
        super(mergedOptions);
        this.project = options.project;
    }

    onDomLoaded() {
        this.bindEvents();
    }

    bindEvents() {
        this.$el.find('.btn-close').click((e) => {
            this.trigger('closed');
        });
        this.$el.find('.btn-submit').click((e) => {
            this.exportProject()
        });
    }

    exportProject() {
        var exportedName = this.$el.find('#exportedProjectName').val() || this.project.name;
        var req = new XMLHttpRequest();
        req.open("GET", 'http://localhost:4567/projects/' + this.project.id + '/export?exportedname=' + exportedName, true);
        req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        req.responseType = "blob";

        req.onload = (event) => {
            var blob = req.response;
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = exportedName + ".data";
            link.click();
            this.close();
            this.trigger('submitted');
        };
        req.onerror = (data) => {
            this.close();
            alert(data);
        }
        req.send()
    }
}
