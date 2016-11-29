import { View } from './view';
import { SideNavView } from './sideNavView';
import { DataMappingView } from './dataMappingView';
import { RequiredFieldMappingView } from './requiredFieldMappingView';

export class MainView extends View{

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.initializeSideNavView();
        //this.initializeContentView();
    }

    initializeSideNavView() {
        this.sideNavView = new SideNavView();
        this.sideNavView.render();
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

    }
    initializeWorkflowDefinition(){

    }
    initializeGroupingDefinition(){

    }
    initializeOpexDefinition(){

    }
    initializeMaterialConstrainr(){

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
            case "opex":
                this.initializeOpexDefinition();
                break;
            case "material":
                this.initializeMaterialConstrainr();
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
        var htmlContent =  (
            '<div id="mainView">' +
                '<nav class="navbar navbar-default"> ' +
                    '<div class="container-fluid"> ' +
                        '<div class="navbar-header">' +
                            '<button id="toggleBtn" type="button" class="btn btn-default" aria-label="Left Align">' +
                                '<span style="color:white" class="glyphicon glyphicon-menu-hamburger" aria-hidden="true"></span>' +
                            '</button>' +
                            '<a class="navbar-brand" href="#">' +
                                '<img class="brand" alt="Brand" src="../resources/icons/brand.png">' +
                            '</a>' +
                        '</div>' +
                    '</div>' +
                '</nav>' +
                ' <div id="wrapper">' +
                    '<div id="sidebar-wrapper" class="nav-side-menu"></div>' +
                    '<div id="page-content-wrapper"></div>' +

                '</div>' +
            '</div>'
        );
        return htmlContent;
    }

    render() {
        super.render();
        this.$el.find("#sidebar-wrapper").html(this.sideNavView.$el);
        return this;
    }

    bindDomEvents() {
        var me = this;
        this.$el.find("#toggleBtn").click(function(e) {
            e.preventDefault();
            me.$el.find("#wrapper").toggleClass("toggled");
        });
        this.sideNavView.on('selected:category', (event, options)=>{
            this.initializeContentView(options.$category);
        }, this);
    }
}
