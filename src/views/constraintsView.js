import {View} from '../core/view';
import {ProcessConstraintView} from './processConstraintView';
import {GradeConstraintView} from './gradeConstraintView';
import {BenchConstraintView} from './benchConstraintView';

export class ConstraintsView extends View {

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.scenarioId = options.scenario.id;
        this.scenario = options.scenario;
    }

    getHtml() {
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/constraintsView.html", function (data) {
                resolve(data);
            })
        });
        return promise;
    }

    onDomLoaded() {
        this.bindEvents();
        this.loadProcessConstraint();
    }

    bindEvents() {
        var that = this;
        this.$el.find('ul.report-tab li').click(function (e) {
            var reportName = $(this).find("span.report-name").text();
            that.$el.find('ul.report-tab li').removeClass('active');
            $(this).addClass('active');
            var category = $(this).data('category');
            if (category.toString().toLowerCase() === 'process') {
                that.loadProcessConstraint();
            } else if (category.toString().toLowerCase() === 'grade') {
                that.loadGradeConstraint();
            } else if (category.toString().toLowerCase() === 'bench') {
                that.loadBenchConstraint();
            }
        });
    }

    loadProcessConstraint() {
        var that = this;
        this.processConstraintView = new ProcessConstraintView({projectId: this.projectId, scenario: this.scenario});
        this.processConstraintView.on('reload', function () {
            that.loadProcessConstraint();
        });
        this.processConstraintView.render();
        this.$el.find("#views").html(this.processConstraintView.$el);
    }

    loadGradeConstraint() {
        var that = this;
        this.gradeConstraintView = new GradeConstraintView({projectId: this.projectId, scenario: this.scenario});
        this.gradeConstraintView.on('reload', function () {
            that.loadGradeConstraint();
        });
        this.gradeConstraintView.render();
        this.$el.find("#views").html(this.gradeConstraintView.$el);
    }

    loadBenchConstraint() {
        var that = this;
        this.benchConstraintView = new BenchConstraintView({projectId: this.projectId, scenario: this.scenario});
        this.benchConstraintView.on('reload', function () {
            that.loadBenchConstraint();
        });
        this.benchConstraintView.render();
        this.$el.find("#views").html(this.benchConstraintView.$el);
    }
}
