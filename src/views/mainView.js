import { View } from '../core/view';
import { SideNavView } from './sideNavView';
import { DataMappingView } from './dataMappingView';
import { RequiredFieldMappingView } from './requiredFieldMappingView';
import { ExpressionDefinitionView } from './expressionDefinitionView';
import { WorkflowView } from './workflowView';
import { PitGroupView } from './pitGroupView';
import {DumpDefinitionView} from './dumpDefinitionView';
import {StockpileDefinitionView} from './stockpileDefinitionView';
import { ModelDefinitionView } from './modelDefinitionView';
import { ScenarioDefinitionView } from './scenarioDefinitionView';
import { ProcessConstraintView } from './processConstraintView';
import { GradeConstraintView } from './gradeConstraintView';
import { BenchConstraintView } from './benchConstraintView';
import {PitDependencyView} from './pitDependencyView';
import {DumpDependencyView} from './dumpDependencyView';
import { CapexCollectionView } from './capexCollectionView';
import {TruckParamView} from './truckParamView'
import {ControlScreenView} from './controlScreenView'
import {CycletimeMappingView} from './cycletimeMappingView'
import {ReportContainerView} from './reportContainerView'
import {FinancialsView} from './financialsView'

export class MainView extends View{

    constructor(options) {
        super();
        this.projectId = options.projectId;
        //this.initializeSideNavView();
        //this.initializeContentView();
    }

    initializeSideNavView() {
        this.sideNavView = new SideNavView();
        this.sideNavView.render();
        this.$el.find("#sidebar-wrapper").html(this.sideNavView.$el);
    }

    initializeDatatypeDefinition(){
        this.dataMappingView = new DataMappingView({projectId: this.projectId});
        this.dataMappingView.render();
        this.$el.find("#page-content-wrapper").html(this.dataMappingView.$el);
    }
    initializeRequiredFieldDefinition(){
        this.requiredFieldMappingView = new RequiredFieldMappingView({projectId: this.projectId});
        this.requiredFieldMappingView.render();
        this.$el.find("#page-content-wrapper").html(this.requiredFieldMappingView.$el);
    }
    initializeExpressionDefinition(){
        var that = this;
        this.expressionDefinitionView = new ExpressionDefinitionView({projectId: this.projectId});
        this.expressionDefinitionView.render();
        this.$el.find("#page-content-wrapper").html(this.expressionDefinitionView.$el);
    }
    initializeReserveDefinition(){

    }
    initializeModelDefinition(){
        this.modelDefinitionView = new ModelDefinitionView({projectId: this.projectId});
        this.modelDefinitionView.render();
        this.$el.find("#page-content-wrapper").html(this.modelDefinitionView.$el);
    }
    initializeWorkflowDefinition(){
        this.workflowView = new WorkflowView({projectId: this.projectId});
        this.workflowView.render();
        this.$el.find("#page-content-wrapper").html(this.workflowView.$el);
    }
    initializeGroupingDefinition(){
        this.pitGroupView = new PitGroupView({projectId: this.projectId});
        this.pitGroupView.render();
        this.$el.find("#page-content-wrapper").html(this.pitGroupView.$el);
    }

    initializeDumpDefinition() {
        this.dumpDefinitionView = new DumpDefinitionView({projectId: this.projectId});
        this.dumpDefinitionView.render();
        this.$el.find("#page-content-wrapper").html(this.dumpDefinitionView.$el);
    }

    initializeStockpileDefinition() {
        this.stockpileDefinitionView = new StockpileDefinitionView({projectId: this.projectId});
        this.stockpileDefinitionView.render();
        this.$el.find("#page-content-wrapper").html(this.stockpileDefinitionView.$el);
    }

    initializeTruckParamter() {
        this.truckParamView = new TruckParamView({projectId: this.projectId});
        this.truckParamView.render();
        this.$el.find("#page-content-wrapper").html(this.truckParamView.$el);
    }

    initializeCycletimeMappingView() {
        var that = this;
        if (this.cycletimeMappingView) {
            this.cycletimeMappingView = null;
        }
        this.cycletimeMappingView = new CycletimeMappingView({projectId: this.projectId});
        this.cycletimeMappingView.on('reload', function () {
            that.initializeCycletimeMappingView();
        });
        this.cycletimeMappingView.render();
        this.$el.find("#page-content-wrapper").html(this.cycletimeMappingView.$el);
    }

    initializeScenarioDefinition() {
        var that = this;
        this.scenarioDefinitionView = new ScenarioDefinitionView({projectId: this.projectId, scenario: this.scenario});
        this.scenarioDefinitionView.render();
        this.$el.find("#page-content-wrapper").html(this.scenarioDefinitionView.$el);
        this.scenarioDefinitionView.on('loaded-scenario', function (scenario) {
            that.scenario = scenario;
        });
    }

    initializeFinancials() {
        var that = this;
        if (!this.scenario) {
            alert('Select a scenario first from Scenario Definition');
            return;
        }
        this.financialsView = new FinancialsView({projectId: this.projectId, scenario: this.scenario});
        this.financialsView.render();
        this.$el.find("#page-content-wrapper").html(this.financialsView.$el);
    }

    initializeMaterialConstraint(){
        if (!this.scenario) {
            alert('Select a scenario first from Scenario Definition');
            return;
        }
        this.processConstraintView = new ProcessConstraintView({projectId: this.projectId, scenario: this.scenario});
        this.processConstraintView.render();
        this.$el.find("#page-content-wrapper").html(this.processConstraintView.$el);
    }
    initializeGradeConstraint(){
        if (!this.scenario) {
            alert('Select a scenario first from Scenario Definition');
            return;
        }
        this.gradeConstraintView = new GradeConstraintView({projectId: this.projectId, scenario: this.scenario});
        this.gradeConstraintView.render();
        this.$el.find("#page-content-wrapper").html(this.gradeConstraintView.$el);
    }
    initializeBenchConstraint(){
        if (!this.scenario) {
            alert('Select a scenario first from Scenario Definition');
            return;
        }
        this.benchConstraintView = new BenchConstraintView({projectId: this.projectId, scenario: this.scenario});
        this.benchConstraintView.render();
        this.$el.find("#page-content-wrapper").html(this.benchConstraintView.$el);
    }

    initializePitDependency() {
        if (!this.scenario) {
            alert('Select a scenario first from Scenario Definition');
            return;
        }
        this.pitDependencyView = new PitDependencyView({projectId: this.projectId, scenario: this.scenario});
        this.pitDependencyView.render();
        this.$el.find("#page-content-wrapper").html(this.pitDependencyView.$el);
    }

    initializeDumpDependency() {
        if (!this.scenario) {
            alert('Select a scenario first from Scenario Definition');
            return;
        }
        this.dumpDependencyView = new DumpDependencyView({projectId: this.projectId, scenario: this.scenario});
        this.dumpDependencyView.render();
        this.$el.find("#page-content-wrapper").html(this.dumpDependencyView.$el);
    }
    initializeCapexConstraint(){
        if (!this.scenario) {
            alert('Select a scenario first from Scenario Definition');
            return;
        }
        this.capexCollectionView = new CapexCollectionView({projectId: this.projectId, scenario: this.scenario});
        this.capexCollectionView.render();
        this.$el.find("#page-content-wrapper").html(this.capexCollectionView.$el);
    }
	initializeControlScreen(){
        if (!this.scenario) {
            alert('Select a scenario first from Scenario Definition');
            return;
        }
        this.controlScreenView = new ControlScreenView({projectId: this.projectId, scenario: this.scenario});
        this.controlScreenView.render();
        this.$el.find("#page-content-wrapper").html(this.controlScreenView.$el);
    }

    initializeReportContainerView() {
        if (!this.scenario) {
            alert('Select a scenario first from Scenario Definition');
            return;
        }
        this.reportContainerView = new ReportContainerView({projectId: this.projectId, scenario: this.scenario});
        this.reportContainerView.render();
        this.$el.find("#page-content-wrapper").html(this.reportContainerView.$el);
    }


    initializeContentView($el) {
        console.log($el);
        var category = $el.data("category");
        switch(category){
            case "datatype":
                this.initializeDatatypeDefinition();
                break;
            case "requiredField":
                this.initializeRequiredFieldDefinition();
                break;
            case "expression":
                this.initializeExpressionDefinition();
                break;
            case "reserve":
                this.initializeReserveDefinition();
                break;
            case "model":
                this.initializeModelDefinition();
                break;
            case "workflow":
                this.initializeWorkflowDefinition();
                break;
            case "pit_grouping":
                this.initializeGroupingDefinition();
                break;
            case "dump_definition":
                this.initializeDumpDefinition();
                break;
            case "stockpile_definition":
                this.initializeStockpileDefinition();
                break;
            case "scenario_definition":
                this.initializeScenarioDefinition();
                break;
            case "financials":
                this.initializeFinancials();
                break;
            case "material":
                this.initializeMaterialConstraint();
                break;
            case "grade":
                this.initializeGradeConstraint();
                break;
            case "bench":
                this.initializeBenchConstraint();
                break;
            case "pit-dependency":
                this.initializePitDependency();
                break;
            case "dump":
                this.initializeDumpDependency();
                break;
            case "capex":
                this.initializeCapexConstraint();
                break;
            case "truck_param":
                this.initializeTruckParamter();
                break;
            case "cycle_time":
                this.initializeCycletimeMappingView();
                break;
			case "control":
                this.initializeControlScreen();
                break;
            case "reports":
                this.initializeReportContainerView();
                break;
        }
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/mainView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    onDomLoaded() {
        this.initializeSideNavView();
        this.bindEvents();
    }

    bindEvents() {
        var that = this;
        this.$el.find("#toggleBtn").click(function(e) {
            e.preventDefault();
            that.$el.find("#wrapper").toggleClass("toggled");
        });
        this.$el.find(".brand").click(function (e) {
            e.preventDefault();
            //that.$el.find("#wrapper").toggleClass("toggled");
            that.trigger('open:dashboard');
        });
        this.sideNavView.on('selected:category', (options)=>{
            this.initializeContentView(options.$category);
        }, this);
    }
}
