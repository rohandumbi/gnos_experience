import { View } from './view';
//import { LoginModel } from '../models/loginModel';
export class SideNavView extends View{

    constructor(options) {
        super();
        //this.model = new LoginModel({});
    }

    getHtml() {
        var htmlContent =  (
                '<div class="menu-list">' +
                        '<ul id="menu-content" class="menu-content collapse">' +
                            '<li  data-toggle="collapse" data-target="#variables" class="category collapsed">' +
                                '<a href="#">' +
                                    '<i class="fa fa-gift fa-lg"></i>Variable Definition<span class="glyphicon glyphicon-chevron-down"></span>' +
                                '</a>' +
                            '</li>' +
                            '<ul class="sub-menu collapse" id="variables">' +
                                '<li data-category="datatype">Datatype Mapping</li>' +
                                '<li data-category="requiredField">Required Field Mapping</li>' +
                                '<li data-category="expression">Expression Definition</li>' +
                                '<li data-category="reserve">Reserve Display</li>' +
                            '</ul>' +
                            '<li data-toggle="collapse" data-target="#projectOptions" class="category collapsed">' +
                                '<a href="#"><i class="fa fa-globe fa-lg"></i> Project Configuration <span class="glyphicon glyphicon-chevron-down"></span></a>' +
                            '</li>' +
                            '<ul class="sub-menu collapse" id="projectOptions">' +
                                '<li data-category="model">Model Definition</li>' +
                                '<li data-category="workflow">Material Workflow</li>' +
                                '<li data-category="grouping">Pit Group, Dump and Stockpile</li>' +
                            '</ul>' +
                            '<li data-toggle="collapse" data-target="#scenarioOptions" class="category collapsed">' +
                                '<a href="#"><i class="fa fa-car fa-lg"></i>Scenario Configuration<span class="glyphicon glyphicon-chevron-down"></span></a>' +
                            '</li>' +
                            '<ul class="sub-menu collapse" id="scenarioOptions">' +
                                '<li data-category="opex">Opex</li>' +
                                '<li data-category="material">Material Constraint</li>' +
                                '<li data-category="grade">Grade Constraint</li>' +
                                '<li data-category="bench">Bench Constraint</li>' +
                                '<li data-category="pit">Pit Dependency</li>' +
                                '<li data-category="dump">Dump Dependency</li>' +
                                '<li data-category="capex">Capex</li>' +
                                '<li data-category="control">Control Screen</li>' +
                            '</ul>' +
                            '<li data-toggle="collapse" data-target="#reports" class="category collapsed">' +
                                '<a href="#"><i class="fa fa-car fa-lg"></i>Reports<span class="glyphicon glyphicon-chevron-down"></span></a>' +
                            '</li>' +
                            '<ul class="sub-menu collapse" id="reports">' +
                                '<li>Report 1</li>' +
                                '<li>Report 2</li>' +
                                '<li>Report 3</li>' +
                            '</ul>' +
                        '</ul>' +
                '</div>'
        );
        return htmlContent;
    }

    bindDomEvents() {
        var me = this;
        this.$el.find('.sub-menu > li').click(function(e){
                me.$el.find('.sub-menu > li').removeClass('active');
                $(e.currentTarget).addClass('active');
                me.trigger('selected:category', {$category:$(e.currentTarget)});
            }
        );
        this.$el.find('.category').click(function(e){
            $(e.currentTarget).toggleClass('active');
        });
    }
}
