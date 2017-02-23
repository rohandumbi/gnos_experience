import { View } from '../core/view';
import { ScenarioCollection } from '../models/scenarioCollection';

export class ScenarioDefinitionView extends View{

    constructor(options) {
        super();
        this.model = new ScenarioCollection(options);
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/scenarioDefinitionView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    getScenarioByName(scenarioName) {
        var object;
        this.data.forEach(function (scenario) {
            if (scenario.name === scenarioName) {
                object = scenario;
            }
        });
        return object;
    }

    onDomLoaded() {
        var that = this;
        this.model.fetch({
            success: function (data) {
                that.data = data;
                that.initializeGrid(data);
            },
            error: function (data) {
                alert('Could not fetch scenario list: ' + data);
            }
        });
    }

    initializeGrid(scenarios) {
        var that = this;
        //var data = this.model.fetch();
        var row = '';
        for (var i = 0; i < scenarios.length; i++) {
            var scenario = scenarios[i];
            row += (
                '<tr>' +
                '<td>' + scenario.name + '</td>' +
                '<td>' + scenario.startYear + '</td>' +
                '<td>' + scenario.timePeriod + '</td>' +
                '<td>' + scenario.discount + '</td>' +
                '</tr>'
            )
        }
        this.$el.find("#tableBody").append($(row));
        this.grid = this.$el.find("#datatype-grid-basic").bootgrid({
            rowCount: [15, 10, 20, 25],
            selection: true,
            multiSelect: true,
            rowSelect: true,
            keepSelection: true,
            formatters: {
                /*"name": function(column, row){
                    return (
                    '<input type="text" value="' + row.name + '"' + 'readonly>'
                    );
                },*/
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
                "commands": function(column, row){
                    return "<button title='Load Scenario' type=\"button\" class=\"btn btn-xs btn-default command-upload\" data-row-id=\"" + row.name + "\"><span class=\"glyphicon glyphicon-upload\"></span></button>";
                }
            }
        }).on("loaded.rs.jquery.bootgrid", function()
        {
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');

            that.grid.find(".command-upload").on("click", function(e){
                that.loadScenario($(this).data("row-id"));
            })
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
        this.trigger('loaded-scenario', this.getScenarioByName(scenarioName));
    }

    addRowToGrid() {
        var scenarioName = this.$el.find('#new_scenario_name').val();
        var startYear = this.$el.find('#start_year').val();
        var timePeriod = this.$el.find('#time_period').val();
        var discountFactor = this.$el.find('#discount_factor').val();

        if(scenarioName && startYear && timePeriod && discountFactor) {
            var newScenario = {
                name: scenarioName,
                id: -1,
                startYear: startYear,
                timePeriod: timePeriod,
                discount: discountFactor
            }
            var that = this;
            this.model.add({
                dataObject: newScenario,
                success: function (data) {
                    that.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
                    alert('Successfully created new scenario');
                },
                error: function (data) {
                    alert('Failed to create new scenario');
                }
            });
            this.$el.find('#new_scenario_name').val('');
            this.$el.find('#start_year').val('');
            this.$el.find('#time_period').val('');
            this.$el.find('#discount_factor').val('');
        }
    }

    deleteRows() {
        var selectedRows = this.$el.find("#datatype-grid-basic").bootgrid("getSelectedRows");
        var that = this;
        selectedRows.forEach(function (selectedRow) {
            var deletedScenario = that.getScenarioByName(selectedRow);
            console.log(deletedScenario);
            that.model.delete({
                url: 'http://localhost:4567/scenarios',
                id: deletedScenario.id,
                success: function (data) {
                    alert('Successfully deleted expression.');
                },
                error: function (data) {
                    alert('Failed to delete expression.' + data);
                }
            });
        });
        this.$el.find("#datatype-grid-basic").bootgrid("remove");
    }
}
