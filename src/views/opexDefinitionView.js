import { View } from '../core/view';
import { ScenarioModel } from '../models/scenarioModel';
import { OpexModel } from '../models/opexModel';
import {ExpressionModel} from '../models/expressionModel';
import {GnosModel} from '../models/gnosModel';

export class OpexDefinitionView extends View{

    constructor(options) {
        super();
        this.scenario = options.scenario;
        this.projectId = options.projectId;
        if (!this.scenario) alert('select a scenario first');
        this.model = new ScenarioModel({});
        this.opexModel = new OpexModel({scenarioId: this.scenario.id});
        this.expressionModel = new ExpressionModel({projectId: this.projectId});
        this.gnosModel = new GnosModel({projectId: this.projectId});
    }

    render() {
        super.render(this.scenario);
        return this;
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/opexDefinitionView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    fetchExpressionList() {
        var that = this;
        this.expressionModel.fetch({
            success: function (data) {
                that.expressions = data;
                that.fetchModelList();
            },
            error: function (data) {
                alert('Failed getting list of models.');
            }
        });
    }

    fetchModelList() {
        var that = this;
        this.gnosModel.fetch({
            success: function (data) {
                that.models = data;
                that.fetchOpexList();
            },
            error: function (data) {
                alert('Failed getting list of opex data.');
            }
        })
    }

    fetchOpexList() {
        var that = this;
        this.opexModel.fetch({
            success: function (data) {
                that.opexData = data;
                that.initializeGrid(data);
            },
            error: function (data) {
                alert('Error fetching opex data: ' + data);
            }
        });
    }

    getExpressionById(expressionId) {
        var expressionObject;
        this.expressions.forEach(function (expression) {
            if (expression.id === parseInt(expressionId)) {
                expressionObject = expression;
            }
        });
        return expressionObject;
    }

    getModelById(modelId) {
        var modelObject;
        this.models.forEach(function (model) {
            if (model.id === parseInt(modelId)) {
                modelObject = model;
            }
        });
        return modelObject;
    }

    onDomLoaded() {
        this.fetchExpressionList();
    }

    initializeGrid(opexData) {
        var that = this;
        //var data = this.opexModel.fetch();
        var row = '';
        for (var i = 0; i < opexData.length; i++) {
            var opex = opexData[i];
            row += (
                '<tr>' +
                '<td>' + opex.isRevenue + '</td>' +
                '<td>' + opex.inUse + '</td>' +
                '<td>' + opex.modelId + '</td>' +
                '<td>' + opex.expressionId + '</td>'
            )
            //row += '<td>' + benchConstraint.inUse + '</td>';
            var scenarioStartYear = this.scenario.startYear;
            var scenarioTimePeriod = this.scenario.timePeriod;
            var costData = opex.costData;
            for (var i = 0; i < scenarioTimePeriod; i++) {
                var presentYear = scenarioStartYear + i;
                row += '<td>' + costData[presentYear.toString()] + '</td>';
            }
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
                "classification": function(column, row){
                    if(row.classification.toString() === "true"){
                        return (
                        '<select class="classification">' +
                            '<option selected disabled hidden>' + 'Revenue' + '</option>'+
                            '<option value="revenue">Revenue</option>' +
                            '<option value="pcost">PCost</option>'+
                        '</select>') ;
                    }else{
                        return (
                        '<select class="classification">' +
                        '<option selected disabled hidden>' + 'PCost' + '</option>' +
                        '<option value="revenue">Revenue</option>' +
                        '<option value="pcost">PCost</option>' +
                        '</select>') ;
                    }
                },

                "identifier": function(column, row) {
                    var model = that.getModelById(row.identifier);
                    var tableRow = (
                        '<select class="identifier" value="test">' +
                        '<option selected disabled hidden>' + model.name + '</option>'
                    );
                    that.models.forEach(function (model) {
                        tableRow += '<option data-model-id="' + model.id + '" value="model 1">' + model.name + '</option>';
                    });

                    tableRow += '</select>';
                    return tableRow;
                },
                "expression": function(column, row) {
                    var expression = that.getExpressionById(row.expression);
                    if(row.classification.toString() === "true"){
                        var tableRow = (
                            '<select class="expression" value="test">' +
                            '<option selected disabled hidden>' + expression.name + '</option>'
                        );
                        that.expressions.forEach(function (expression) {
                            tableRow += '<option data-expression-id="' + expression.id + '" value="model 1">' + expression.name + '</option>';
                        });

                        tableRow += '</select>';
                        return tableRow;
                    }else{
                        return (
                            '<select value="test">' +
                            '</select>'
                        );
                    }
                },
                "value": function(column, row){
                    return (
                        '<input class="cost" data-year="' + column.id + '" type="text" value="' + row[column.id] + '"' + '>'
                    );
                },
                "inUse": function (column, row) {
                    if (row.in_use.toString() === 'true') {
                        return (
                            '<input class="use" type="checkbox" value="' + row.in_use + '"' + 'checked  >'
                        )
                    }else{
                        return (
                            '<input class="use" type="checkbox" value="' + row.in_use + '"' + '>'
                        )
                    }
                }
            }
        }).on("loaded.rs.jquery.bootgrid", function()
        {
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');

            that.grid.find('.expression').change(function (e) {
                //alert('update expression of opex index: ' + $(this).closest('tr').data('row-id') + ':' + $(this).data('expression-id'));
                that.updateExpressionId({
                    expressionId: $(this).find(":selected").data('expression-id'),
                    index: $(this).closest('tr').data('row-id')
                });
            });
            that.grid.find('.identifier').change(function (e) {
                //alert('update identifier of opex index: ' + $(this).closest('tr').data('row-id') + ':' + $(this).data('model-id'));
                that.updateModelId({
                    modelId: $(this).find(":selected").data('model-id'),
                    index: $(this).closest('tr').data('row-id')
                })
            });
            that.grid.find('.cost').change(function (e) {
                //alert('update year of opex index: ' + $(this).data('year') + ':' + $(this).closest('tr').data('row-id') + ':' + $(this).val());
                that.updateCostData({
                    index: $(this).closest('tr').data('row-id'),
                    year: $(this).data('year'),
                    value: $(this).val()
                });
            });
            that.grid.find(".use").change(function (event) {
                var opexInUse = $(this).is(':checked');
                that.updateInUse({index: $(this).closest('tr').data('row-id'), inUse: opexInUse});
                //alert('update use of opex index: ' + $(this).closest('tr').data('row-id') + ':' + opexInUse);
                //that.upgradeExpressionGrade({name: expressionName, isGrade: expressionIsGrade});
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

    updateOpex(opexData) {
        this.opexModel.update({
            url: 'http://localhost:4567/opexdata',
            id: opexData.id,
            dataObject: opexData,
            success: function (data) {
                alert('Successfully updated.');
            },
            error: function (data) {
                alert('failed update' + data);
            }
        });
    }

    updateExpressionId(options) {
        var opexData = this.opexData[options.index];
        opexData['expressionId'] = options.expressionId;
        console.log(opexData);
        this.updateOpex(opexData);
    }

    updateModelId(options) {
        var opexData = this.opexData[options.index];
        opexData['modelId'] = options.modelId;
        console.log(opexData);
        this.updateOpex(opexData);
    }

    updateCostData(options) {
        var opexData = this.opexData[options.index];
        opexData.costData[options.year.toString()] = parseInt(options.value);
        console.log(opexData);
        this.updateOpex(opexData);
    }

    updateInUse(options) {
        var opexData = this.opexData[options.index];
        opexData['inUse'] = options.inUse;
        console.log(opexData);
        this.updateOpex(opexData);
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
