import { View } from '../core/view';
import { ScenarioModel } from '../models/scenarioModel';
import { FixedCostModel } from '../models/fixedCostModel';

export class FixedCostDefinitionView extends View{

    constructor(options) {
        super();
        this.model = new ScenarioModel({});
        this.fixedCostModel = new FixedCostModel({});
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/fixedCostDefinitionView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    onDomLoaded() {
        this.initializeGrid();
    }

    initializeGrid() {
        var that = this;
        var data = this.fixedCostModel.fetch();
        var row = '';
        for(var i=0; i<data.fixedCosts.length; i++){
            var fixedCost = data.fixedCosts[i];
            row += (
                '<tr>' +
                '<td>' + fixedCost.name + '</td>'
            )
            fixedCost.values.forEach(function(fixedCost){
                row += '<td>' + fixedCost.value + '</td>';
            });
            row += '</tr>';
        }
        this.$el.find("#tableBody").append($(row));
        this.grid = this.$el.find("#datatype-grid-basic").bootgrid({
            rowCount: [15, 10, 20, 25],
            selection: true,
            multiSelect: true,
            rowSelect: true,
            keepSelection: false,
            formatters: {
                /*"year": function(column, row){
                    return (
                    '<input type="text" value="' + row.year + '"' + 'readonly>'
                    );
                }*/
                /*"expression": function(column, row){
                    return (
                    '<select value="test">' +
                    '<option selected disabled hidden>' + row.expressionName + '</option>'+
                    '<option value="grouptext">Group By(Text)</option>' +
                    '<option value="groupnumeric">Group By(Numeric)</option>' +
                    '<option value="unit">Unit</option>' +
                    '<option value="grade">Grade</option>' +
                    '</select>') ;
                },
                "filter": function(column, row){
                    return (
                        '<input type="text" value="' + row.filter + '"' + '>'
                    );
                }*/
                /*"commands": function(column, row){
                    return "<button title='Load Scenario' type=\"button\" class=\"btn btn-xs btn-default command-upload\" data-row-id=\"" + row.name + "\"><span class=\"glyphicon glyphicon-upload\"></span></button>";
                }*/
            }
        }).on("loaded.rs.jquery.bootgrid", function()
        {
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');

            /*that.grid.find(".command-upload").on("click", function(e){
                that.loadScenario($(this).data("row-id"));
            })*/
        });
        var $addButton = $('<button type="button" class="btn btn-default" data-toggle="modal" data-target="#modelDefinitionModal"></button>');
        $addButton.append('<span class="glyphicon glyphicon-plus"></span>');

        var $removeButton = $('<button type="button" class="btn btn-default"></button>');
        $removeButton.append('<span class="glyphicon glyphicon-trash"></span>');

        this.$el.find(".actionBar").append($addButton);
        this.$el.find(".actionBar").append($removeButton);

        $removeButton.click(function(){
            that.deleteRows();
        });
        this.$el.find('#addScenario').click(function(){
            that.addRowToGrid();
        });
    }

    loadScenario(scenarioName) {
        this.$el.find('#scenario_name').val(scenarioName);
    }

    addRowToGrid() {
        var scenarioName = this.$el.find('#new_scenario_name').val();
        var startYear = this.$el.find('#start_year').val();
        var timePeriod = this.$el.find('#time_period').val();
        var discountFactor = this.$el.find('#discount_factor').val();

        if(scenarioName && startYear && timePeriod && discountFactor) {
            this.$el.find("#datatype-grid-basic").bootgrid("append", [{
                name: scenarioName,
                id: -1,
                startYear: startYear,
                timePeriod: timePeriod,
                discountFactor: discountFactor
            }]);
            //this.$el.find('#model_name').val('');
            this.$el.find('#new_scenario_name').val('');
            this.$el.find('#start_year').val('');
            this.$el.find('#time_period').val('');
            this.$el.find('#discount_factor').val('');
        }
    }

    deleteRows(rowIds) {
        this.$el.find("#datatype-grid-basic").bootgrid("remove");
    }
}
