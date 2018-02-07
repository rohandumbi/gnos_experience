import { View } from '../core/view';
import { ScenarioCollection } from '../models/scenarioCollection';
import {CopyScenarioOverlay} from '../overlays/copyScenarioOverlay'

export class ScenarioDefinitionView extends View{

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.model = new ScenarioCollection(options);
        this.scenario = options.scenario;
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
        var object = null;
        this.data.forEach(function (scenario) {
            if (scenario.name === scenarioName) {
                object = scenario;
            }
        });
        return object;
    }

    getScenarioById(scenarioId) {
        var object = null;
        this.data.forEach(function (scenario) {
            if (scenario.id === scenarioId) {
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
                if (that.scenario) {
                    that.$el.find('#scenario_name').val(that.scenario.name);
                }
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
                '<td>' + scenario.id + '</td>' +
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
                "commands": function(column, row){
                    var buttonLoad = "<button title='Load Scenario' type=\"button\" class=\"btn btn-xs btn-default command-upload\" data-row-id=\"" + row.id + "\"><span class=\"glyphicon glyphicon-upload\"></span></button>";
                    var buttonClone = "<button title='Clone Scenario' type=\"button\" class=\"btn btn-xs btn-default command-clone\" data-row-id=\"" + row.id + "\"><span class=\"glyphicon glyphicon-copy\"></span></button>";
                    return buttonLoad + buttonClone;
                },
                "id": function (column, row) {
                    return (
                        '<span></span>'
                    );
                },
                "name": function (column, row) {
                    return (
                        '<input data-scenario-id="' + row.id + '" class="name" style="min-width:250px" type="text" value="' + row.name + '"' + '>'
                    );
                },
                "startYear": function (column, row) {
                    return (
                        '<input data-scenario-id="' + row.id + '" class="start-year" style="min-width:250px" type="text" value="' + row.startYear + '"' + '>'
                    );
                },
                "timePeriod": function (column, row) {
                    return (
                        '<input data-scenario-id="' + row.id + '" class="time-period" style="min-width:250px" type="text" value="' + row.timePeriod + '"' + '>'
                    );
                },
                "discount": function (column, row) {
                    return (
                        '<input data-scenario-id="' + row.id + '" class="discount" style="min-width:250px" type="text" value="' + row.discount + '"' + '>'
                    );
                },
            }
        }).on("loaded.rs.jquery.bootgrid", function()
        {
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');

            that.grid.find(".command-upload").on("click", function(e){
                that.loadScenario($(this).data("row-id"));
            });
            that.grid.find(".command-clone").on("click", function (e) {
                that.cloneScenario($(this).data("row-id"));
            });
            that.grid.find(".name").change(function (event) {
                var scenarioId = $(this).data('scenario-id');
                var newName = $(this).val();
                that.updateScenarioName({scenarioId: scenarioId, name: newName});
            });
            that.grid.find(".time-period").change(function (event) {
                var scenarioId = $(this).data('scenario-id');
                var newTimePeriod = $(this).val();
                that.updateTimePeriod({scenarioId: scenarioId, timePeriod: newTimePeriod});
            });
            that.grid.find(".discount").change(function (event) {
                var scenarioId = $(this).data('scenario-id');
                var newDiscount = $(this).val();
                that.updateDiscountFactor({scenarioId: scenarioId, discount: newDiscount});
            });
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

    loadScenario(scenarioId) {
        var selectedScenario = this.getScenarioById(scenarioId);
        this.$el.find('#scenario_name').val(selectedScenario.name);
        this.trigger('loaded-scenario', selectedScenario);
    }

    cloneScenario(scenarioId) {
        this.copyScenarioOverlay = new CopyScenarioOverlay({projectId: this.projectId, scenarioId: scenarioId});
        this.copyScenarioOverlay.on('submitted', (event) => {
            this.trigger('reload');
            this.copyScenarioOverlay.close();
        });
        this.copyScenarioOverlay.show();
    }

    updateScenarioName(options) {
        var that = this;
        var scenarioId = options.scenarioId;
        var newName = options.name;
        var updatedScenario = this.getScenarioById(scenarioId);
        updatedScenario['name'] = newName;
        this.updateScenario(updatedScenario);
    }

    updateTimePeriod(options) {
        var that = this;
        var scenarioId = options.scenarioId;
        var newTimePeriod = options.timePeriod;
        var updatedScenario = this.getScenarioById(scenarioId);
        updatedScenario['timePeriod'] = newTimePeriod;
        this.updateScenario(updatedScenario);
    }

    updateDiscountFactor(options) {
        var that = this;
        var scenarioId = options.scenarioId;
        var newDiscountFactor = options.discount;
        var updatedScenario = this.getScenarioById(scenarioId);
        updatedScenario['discount'] = newDiscountFactor;
        this.updateScenario(updatedScenario);
    }

    updateScenario(scenario) {
        var that = this;
        this.model.update({
            url: 'http://localhost:4567/scenarios',
            id: scenario.id,
            dataObject: scenario,
            success: function () {
                that.$el.find('#scenario_name').val(scenario.name);
                that.trigger('loaded-scenario', scenario);
            },
            error: function () {
                alert('Error updating scenario.');
            }
        });
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
                    that.data.push(data);
                    that.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
                    //alert('Successfully created new scenario');
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
        selectedRows.forEach(function (scenarioId) {
            that.model.delete({
                url: 'http://localhost:4567/scenarios',
                id: scenarioId,
                success: function (data) {
                    //alert('Successfully deleted scenario.');
                },
                error: function (data) {
                    alert('Failed to delete scenario.' + data);
                }
            });
        });
        this.$el.find("#datatype-grid-basic").bootgrid("remove");
    }
}
