import { View } from '../core/view';
import { OpexModel } from '../models/opexModel';
import {ExpressionModel} from '../models/expressionModel';
import {GnosModel} from '../models/gnosModel';

export class OpexDefinitionView extends View{

    constructor(options) {
        super();
        this.scenario = options.scenario;
        this.projectId = options.projectId;
        if (!this.scenario) alert('select a scenario first');
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
            var scenarioStartYear = this.scenario.startYear;
            var scenarioTimePeriod = this.scenario.timePeriod;
            var costData = opex.costData;
            for (var j = 0; j < scenarioTimePeriod; j++) {
                var presentYear = scenarioStartYear + j;
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
                    if (row.isRevenue.toString() === "true") {
                        return (
                        '<select class="classification">' +
                            '<option selected disabled hidden>' + 'Revenue' + '</option>'+
                        '<option data-revenue="true" value="revenue">Revenue</option>' +
                        '<option data-revenue="false" value="pcost">PCost</option>' +
                        '</select>') ;
                    }else{
                        return (
                        '<select class="classification">' +
                        '<option selected disabled hidden>' + 'PCost' + '</option>' +
                        '<option data-revenue="true" value="revenue">Revenue</option>' +
                        '<option data-revenue="false" value="pcost">PCost</option>' +
                        '</select>') ;
                    }
                },

                "identifier": function(column, row) {
                    var model = that.getModelById(row.modelId);
                    var modelName = '';
                    if (model && model.name) {
                        modelName = model.name;
                    }
                    var tableRow = (
                        '<select class="identifier" value="test">' +
                        '<option selected disabled hidden>' + modelName + '</option>'
                    );
                    that.models.forEach(function (model) {
                        tableRow += '<option data-model-id="' + model.id + '" value="model 1">' + model.name + '</option>';
                    });

                    tableRow += '</select>';
                    return tableRow;
                },
                "expression": function(column, row) {
                    var expression = that.getExpressionById(row.expressionId);
                    var expressionName;
                    var tableRow = '';
                    if (expression && expression.name) {
                        expressionName = expression.name;
                        tableRow = (
                            '<select class="expression" value="test">' +
                            '<option selected disabled hidden>' + expressionName + '</option>'
                        );
                    }else{
                        expressionName = '';
                        tableRow = (
                            '<select disabled class="expression" value="test">' +
                            '<option selected disabled hidden>' + expressionName + '</option>'
                        );
                    }
                    that.expressions.forEach(function (expression) {
                        tableRow += '<option data-expression-id="' + expression.id + '" value="model 1">' + expression.name + '</option>';
                    });

                    tableRow += '</select>';
                    return tableRow;
                },
                "value": function(column, row){
                    var yearlyValue = row[column.id] || row.costData[column.id]
                    return (
                        '<input class="cost" data-year="' + column.id + '" type="text" value="' + yearlyValue + '"' + '>'
                    );
                },
                "inUse": function (column, row) {
                    if (row.inUse.toString() === 'true') {
                        return (
                            '<input class="use" type="checkbox" value="' + row.inUse + '"' + 'checked  >'
                        )
                    }else{
                        return (
                            '<input class="use" type="checkbox" value="' + row.inUse + '"' + '>'
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
                that.updateInUse({
                    index: $(this).closest('tr').data('row-id'),
                    inUse: opexInUse
                });
            });

            that.grid.find('.classification').change(function (e) {
                var index = $(this).closest('tr').data('row-id');
                var isRevenue = ($(this).find(":selected").data('revenue').toString() === "true");
                if (!isRevenue) {
                    $(this).closest('tr').find('.expression').val('');
                    $(this).closest('tr').find('.expression').prop("disabled", true);
                    //$(this).closest('tr').find('.expression').hide();
                } else {
                    //$(this).closest('tr').find('.expression').val('');
                    $(this).closest('tr').find('.expression').prop("disabled", false);
                    //$(this).closest('tr').find('.expression').show();
                }
                that.updateIsRevenue({index: index, isRevenue: isRevenue});
            });
        });
        var $addButton = $('<button id="addOpex" type="button" class="btn btn-default" data-toggle="modal"></button>');
        $addButton.append('<span class="glyphicon glyphicon-plus"></span>');

        var $removeButton = $('<button type="button" class="btn btn-default"></button>');
        $removeButton.append('<span class="glyphicon glyphicon-trash"></span>');

        this.$el.find(".actionBar").append($addButton);
        this.$el.find(".actionBar").append($removeButton);

        $removeButton.click(function(){
            that.deleteRows();
        });
        $addButton.click(function () {
            that.addRowToGrid();
        });
    }

    updateOpex(options) {
        this.opexModel.update({
            url: 'http://localhost:4567/opexdata',
            id: options.opexData.id,
            dataObject: options.opexData,
            success: function (data) {
                alert('Successfully updated.');
                if (options.success) options.success(data);
            },
            error: function (data) {
                alert('failed update' + data);
                if (options.success) options.error(data);
            }
        });
    }

    updateExpressionId(options) {
        var opexData = this.opexData[options.index];
        opexData['expressionId'] = options.expressionId;
        console.log(opexData);
        this.updateOpex({opexData: opexData});
    }

    updateModelId(options) {
        var opexData = this.opexData[options.index];
        opexData['modelId'] = options.modelId;
        console.log(opexData);
        this.updateOpex({opexData: opexData});
    }

    updateCostData(options) {
        var opexData = this.opexData[options.index];
        opexData.costData[options.year.toString()] = parseInt(options.value);
        console.log(opexData);
        this.updateOpex({opexData: opexData});
    }

    updateInUse(options) {
        var opexData = this.opexData[options.index];
        opexData['inUse'] = options.inUse;
        console.log(opexData);
        this.updateOpex({opexData: opexData});
    }

    updateIsRevenue(options) {
        var opexData = this.opexData[options.index];
        opexData['isRevenue'] = options.isRevenue;
        if (!options.isRevenue) {
            opexData["expressionId"] = 0;
        }
        console.log(opexData);
        this.updateOpex({opexData: opexData});
    }

    loadScenario(scenarioName) {
        this.$el.find('#scenario_name').val(scenarioName);
    }

    addRowToGrid() {
        var that = this;
        var newOpex = {};
        newOpex['modelId'] = 0;
        newOpex['expressionId'] = 0;
        newOpex['inUse'] = true;
        newOpex['isRevenue'] = true;
        //newOpex['costData'] = {};
        var costData = {}
        var startYear = this.scenario.startYear;
        var timePeriod = this.scenario.timePeriod;
        for (var i = 0; i < timePeriod; i++) {
            var presentYear = startYear + i;
            costData[presentYear.toString()] = 0;
        }
        newOpex['costData'] = costData;
        console.log(newOpex);
        this.opexModel.add({
            dataObject: newOpex,
            success: function (data) {
                alert('added new data');
                that.opexData.push(data);
                that.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
            },
            error: function (data) {
                alert('Error creating opex data');
            }

        });
    }

    deleteRows(rowIds) {
        this.$el.find("#datatype-grid-basic").bootgrid("remove");
    }
}
