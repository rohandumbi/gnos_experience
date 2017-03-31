import {View} from '../core/view';
import {Chart} from 'chart.js';
import {ReportView} from './reportView';
export class ReportContainerView extends View {

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.scenarioId = options.scenario.id;
        this.scenario = options.scenario;
    }

    getHtml() {
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/reportContainerView.html", function (data) {
                resolve(data);
            })
        });
        return promise;
    }

    onDomLoaded() {
        this.bindEvents();
        this.loadReport();
    }

    loadReport(reportName) {
        this.reportView = new ReportView({projectId: this.projectId, scenario: this.scenario, reportName: reportName});
        this.reportView.render();
        this.$el.find('#reports').html(this.reportView.$el);
    }

    bindEvents() {
        var that = this;
        this.$el.find('ul.report-tab li').click(function (e) {
            var reportName = $(this).find("span.report-name").text();
            that.$el.find('ul.report-tab li').removeClass('active');
            $(this).addClass('active');
            that.loadReport(reportName);
        });
    }
}
