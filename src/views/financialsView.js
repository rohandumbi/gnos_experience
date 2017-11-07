import {View} from '../core/view';
import {Chart} from 'chart.js';
import {ReportView} from './reportView';
import {OpexDefinitionView} from './opexDefinitionView';
import {FixedCostDefinitionView} from './fixedCostDefinitionView';

export class FinancialsView extends View {

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.scenarioId = options.scenario.id;
        this.scenario = options.scenario;
    }

    getHtml() {
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/financialsView.html", function (data) {
                resolve(data);
            })
        });
        return promise;
    }

    onDomLoaded() {
        this.bindEvents();
        this.loadRevenue();
    }

    bindEvents() {
        var that = this;
        this.$el.find('ul.report-tab li').click(function (e) {
            var reportName = $(this).find("span.report-name").text();
            that.$el.find('ul.report-tab li').removeClass('active');
            $(this).addClass('active');
            var category = $(this).data('category');
            if (category.toString().toLowerCase() === 'revenue') {
                that.loadRevenue();
            } else if (category.toString().toLowerCase() === 'fixedcost') {
                that.loadFixedCost();
            }
        });
    }

    loadRevenue() {
        var that = this;
        this.opexDefinitionView = new OpexDefinitionView({projectId: this.projectId, scenario: this.scenario});
        this.opexDefinitionView.on('reload', function () {
            that.loadRevenue();
        });
        this.opexDefinitionView.render();
        this.$el.find("#views").html(this.opexDefinitionView.$el);
    }

    loadFixedCost() {
        if (!this.scenario) {
            alert('Select a scenario first from Scenario Definition');
            return;
        }
        this.fixedCostDefinitionView = new FixedCostDefinitionView({
            projectId: this.projectId,
            scenario: this.scenario
        });
        this.fixedCostDefinitionView.render();
        this.$el.find("#views").html(this.fixedCostDefinitionView.$el);
    }
}
