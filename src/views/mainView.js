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
        //console.log("there there");
        this.dataMappingView = new DataMappingView();
        this.dataMappingView.render();
        this.$el.find("#page-content-wrapper").html(this.dataMappingView.$el);
    }
    initializeRequiredFieldDefinition(){
        this.requiredFieldMappingView = new RequiredFieldMappingView();
        this.requiredFieldMappingView.render();
        this.$el.find("#page-content-wrapper").html(this.requiredFieldMappingView.$el);
    }
    initializeExpressionDefinition(){
        this.expressionDefinitionView = new ExpressionDefinitionView();
        this.expressionDefinitionView.render();
        this.$el.find("#page-content-wrapper").html(this.expressionDefinitionView.$el);
    }
    initializeReserveDefinition(){

    }
    initializeModelDefinition(){
        this.modelDefinitionView = new ModelDefinitionView();
        this.modelDefinitionView.render();
        this.$el.find("#page-content-wrapper").html(this.modelDefinitionView.$el);
    }
    initializeWorkflowDefinition(){
        this.workflowView = new WorkflowView();
        this.workflowView.render();
        this.$el.find("#page-content-wrapper").html(this.workflowView.$el);
    }
    initializeGroupingDefinition(){
        this.pitGroupView = new PitGroupView({});
        this.pitGroupView.render();
        this.$el.find("#page-content-wrapper").html(this.pitGroupView.$el);
    }

    initializeScenarioDefinition() {
        this.scenarioDefinitionView = new ScenarioDefinitionView();
        this.scenarioDefinitionView.render();
        this.$el.find("#page-content-wrapper").html(this.scenarioDefinitionView.$el);
    }
    initializeOpexDefinition(){
        this.opexDefinitionView = new OpexDefinitionView();
        this.opexDefinitionView.render();
        this.$el.find("#page-content-wrapper").html(this.opexDefinitionView.$el);
    }
    initializeFixedCostDefinition(){
        this.fixedCostDefinitionView = new FixedCostDefinitionView();
        this.fixedCostDefinitionView.render();
        this.$el.find("#page-content-wrapper").html(this.fixedCostDefinitionView.$el);
    }
    initializeMaterialConstraint(){
        this.processConstraintView = new ProcessConstraintView({});
        this.processConstraintView.render();
        this.$el.find("#page-content-wrapper").html(this.processConstraintView.$el);
    }
    initializeGradeConstraint(){
        this.gradeConstraintView = new GradeConstraintView({});
        this.gradeConstraintView.render();
        this.$el.find("#page-content-wrapper").html(this.gradeConstraintView.$el);
    }
    initializeBenchConstraint(){
        this.benchConstraintView = new BenchConstraintView();
        this.benchConstraintView.render();
        this.$el.find("#page-content-wrapper").html(this.benchConstraintView.$el);
    }
    initializeDumpConstraint(){

    }
    initializeCapexConstraint(){
        this.capexCollectionView = new CapexCollectionView();
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
            case "dump":
                this.initializeDumpConstraint();
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
