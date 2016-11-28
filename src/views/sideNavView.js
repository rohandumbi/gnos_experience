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
                                '<li>' +
                                    '<a href="#">Datatype Mapping</a>' +
                                '</li>' +
                                '<li>' +
                                    '<a href="#">Required Field Mapping</a>' +
                                '</li>' +
                                '<li>' +
                                    '<a href="#">Expression Definition</a>' +
                                '</li>' +
                                '<li>' +
                                    '<a href="#">Reserve Display</a>' +
                                '</li>' +
                            '</ul>' +
                            '<li data-toggle="collapse" data-target="#projectOptions" class="category collapsed">' +
                                '<a href="#"><i class="fa fa-globe fa-lg"></i> Project Configuration <span class="glyphicon glyphicon-chevron-down"></span></a>' +
                            '</li>' +
                            '<ul class="sub-menu collapse" id="projectOptions">' +
                                '<li>Model Definition</li>' +
                                '<li>Material Workflow</li>' +
                                '<li>Pit Group, Dump and Stockpile</li>' +
                            '</ul>' +
                            '<li data-toggle="collapse" data-target="#scenarioOptions" class="category collapsed">' +
                                '<a href="#"><i class="fa fa-car fa-lg"></i>Scenario Configuration<span class="glyphicon glyphicon-chevron-down"></span></a>' +
                            '</li>' +
                            '<ul class="sub-menu collapse" id="scenarioOptions">' +
                                '<li>Opex</li>' +
                                '<li>Material Constraint</li>' +
                                '<li>Grade Constraint</li>' +
                                '<li>Bench Constraint</li>' +
                                '<li>Pit Dependency</li>' +
                                '<li>Dump Dependency</li>' +
                                '<li>Capex</li>' +
                                '<li>Control Screen</li>' +
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
            }
        );
        this.$el.find('.category').click(function(e){
            $(e.currentTarget).toggleClass('active');
        });
    }
}
