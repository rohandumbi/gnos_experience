import { View } from '../core/view';
import { SideNavView } from './sideNavView';
import { DataMappingView } from './dataMappingView';
import { RequiredFieldMappingView } from './requiredFieldMappingView';
import { ExpressionDefinitionView } from './expressionDefinitionView';
import { WorkflowView } from './workflowView';
import { PitGroupView } from './pitGroupView';
import { ModelDefinitionView } from './modelDefinitionView';
import { ScenarioDefinitionView } from './scenarioDefinitionView';
import { FixedCostDefinitionView } from './fixedCostDefinitionView';
import { ProcessConstraintView } from './processConstraintView';
import { GradeConstraintView } from './gradeConstraintView';
import { BenchConstraintView } from './benchConstraintView';
import {PitDependencyView} from './pitDependencyView';
import {DumpDependencyView} from './dumpDependencyView';
import { OpexDefinitionView } from './opexDefinitionView';
import { CapexCollectionView } from './capexCollectionView';

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

    initializeScenarioDefinition() {
        var that = this;
        this.scenarioDefinitionView = new ScenarioDefinitionView({projectId: this.projectId});
        this.scenarioDefinitionView.render();
        this.$el.find("#page-content-wrapper").html(this.scenarioDefinitionView.$el);
        this.scenarioDefinitionView.on('loaded-scenario', function (scenario) {
            that.scenario = scenario;
        });
    }
    initializeOpexDefinition(){
        this.opexDefinitionView = new OpexDefinitionView({projectId: this.projectId, scenario: this.scenario});
        this.opexDefinitionView.render();
        this.$el.find("#page-content-wrapper").html(this.opexDefinitionView.$el);
    }
    initializeFixedCostDefinition(){
        this.fixedCostDefinitionView = new FixedCostDefinitionView({scenario: this.scenario});
        this.fixedCostDefinitionView.render();
        this.$el.find("#page-content-wrapper").html(this.fixedCostDefinitionView.$el);
    }
    initializeMaterialConstraint(){
        this.processConstraintView = new ProcessConstraintView({scenario: this.scenario});
        this.processConstraintView.render();
        this.$el.find("#page-content-wrapper").html(this.processConstraintView.$el);
    }
    initializeGradeConstraint(){
        this.gradeConstraintView = new GradeConstraintView({scenario: this.scenario});
        this.gradeConstraintView.render();
        this.$el.find("#page-content-wrapper").html(this.gradeConstraintView.$el);
    }
    initializeBenchConstraint(){
        this.benchConstraintView = new BenchConstraintView({projectId: this.projectId, scenario: this.scenario});
        this.benchConstraintView.render();
        this.$el.find("#page-content-wrapper").html(this.benchConstraintView.$el);
    }

    initializePitDependency() {
        this.pitDependencyView = new PitDependencyView({projectId: this.projectId, scenario: this.scenario});
        this.pitDependencyView.render();
        this.$el.find("#page-content-wrapper").html(this.pitDependencyView.$el);
    }

    initializeDumpDependency() {
        this.dumpDependencyView = new DumpDependencyView({projectId: this.projectId, scenario: this.scenario});
        this.dumpDependencyView.render();
        this.$el.find("#page-content-wrapper").html(this.dumpDependencyView.$el);
    }
    initializeCapexConstraint(){
        this.capexCollectionView = new CapexCollectionView({scenario: this.scenario});
        this.capexCollectionView.render();
        this.$el.find("#page-content-wrapper").html(this.capexCollectionView.$el);
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
            case "grouping":
                this.initializeGroupingDefinition();
                break;
            case "scenario_definition":
                this.initializeScenarioDefinition();
                break;
            case "opex":
                this.initializeOpexDefinition();
                break;
            case "fixed_cost":
                this.initializeFixedCostDefinition();
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
        this.sideNavView.on('selected:category', (options)=>{
            this.initializeContentView(options.$category);
        }, this);
    }
}
