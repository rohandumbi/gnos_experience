import { View } from '../core/view';
import { SideNavView } from './sideNavView';
import { DataMappingView } from './dataMappingView';
import { RequiredFieldMappingView } from './requiredFieldMappingView';
import { WorkflowView } from './workflowView';
import { ModelDefinitionView } from './modelDefinitionView';

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

    }

    initializeScenarioDefinition() {

    }
    initializeOpexDefinition(){

    }
    initializeMaterialConstraint(){

    }
    initializeGradeConstraint(){

    }
    initializeBenchConstraint(){

    }
    initializeDumpConstraint(){

    }
    initializeCapexConstraint(){

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
