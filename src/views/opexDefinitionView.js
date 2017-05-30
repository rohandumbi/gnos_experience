import { View } from '../core/view';
import { OpexModel } from '../models/opexModel';
import {ExpressionModel} from '../models/expressionModel';
import {GnosModel} from '../models/gnosModel';
import {UnitModel} from '../models/unitModel';
import {ProductJoinModel} from '../models/productJoinModel';

export class OpexDefinitionView extends View{

    constructor(options) {
        super();
        this.scenario = options.scenario;
        this.projectId = options.projectId;
        if (!this.scenario) alert('select a scenario first');
        this.opexModel = new OpexModel({scenarioId: this.scenario.id});
        this.expressionModel = new ExpressionModel({projectId: this.projectId});
        this.gnosModel = new GnosModel({projectId: this.projectId});
        this.unitModel = new UnitModel({projectId: this.projectId});
        this.productJoinModel = new ProductJoinModel({projectId: this.projectId});
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

    fetchUnits() {
        var that = this;
        this.unitModel.fetch({
            success: function (data) {
                that.units = data;
                that.fetchExpressionList();
            },
            error: function (data) {
                alert('Error fetching expression list: ' + data);
            }
        })
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
                that.fetchProductJoinList();
            },
            error: function (data) {
                alert('Failed getting list of opex data.');
            }
        })
    }

    fetchProductJoinList() {
        var that = this;
        this.productJoinModel.fetch({
            success: function (data) {
                that.productJoins = data;
                that.fetchOpexList();
            },
            error: function (data) {
                alert('Error fetching opex data: ' + data);
            }
        });
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

    getExpressionByName(expressionName) {
        var expressionObject;
        this.expressions.forEach(function (expression) {
            if (expression.name === expressionName) {
                expressionObject = expression;
            }
        });
        return expressionObject;
    }

    getUnitById(fieldId) {
        var object = null;
        this.units.forEach(function (unit) {
            if (unit.id === parseInt(fieldId)) {
                object = unit;
            }
        });
        return object;
    }

    getUnitByName(unitName) {
        var object = null;
        this.units.forEach(function (unit) {
            if (unit.name === unitName) {
                object = unit;
            }
        });
        return object;
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
        if (this.scenario.timePeriod > 4) {
            this.$el.find("#datatype-grid-basic").addClass('long-grid');
        }
        this.fetchUnits();
    }

    initializeGrid(opexData) {
        var that = this;
        //var data = this.opexModel.fetch();
        var row = '';
        for (var i = 0; i < opexData.length; i++) {
            var opex = opexData[i];
            var unitName = '';
            if (opex.expressionId > 0) {//expression
                var expressionId = opex.expressionId;
                var expression = this.getExpressionById(expressionId);
                unitName = expression.name || '';
            } else {//unit
                var fieldId = opex.fieldId;
                var unit = this.getUnitById(fieldId);
                if (!unit) {
                    unitName = '';
                } else {
                    unitName = unit.name || '';
                }
            }
            row += (
                '<tr>' +
                '<td>' + opex.id + '</td>' +
                '<td>' + opex.isRevenue + '</td>' +
                '<td>' + opex.inUse + '</td>' +
                '<td>' + opex.modelId + '</td>' +
                '<td>' + unitName + '</td>' +
                '<td>' + true + '</td>'
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
                "id": function (column, row) {
                    return "<span data-opex-id='" + row.id + "'></span>"
                },
                "commands": function (column, row) {
                    return "<button type=\"button\" class=\"btn btn-xs btn-default command-edit glyphicon glyphicon-edit copy-forward\" data-row-id=\"" + row.id + "\"><span class=\"fa fa-pencil\"></span></button> ";
                },
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
                        tableRow += '<option data-identifier-type="1" data-model-id="' + model.id + '" value="">' + model.name + '</option>';
                    });

                    that.productJoins.forEach(function (productJoin) {
                        tableRow += '<option data-identifier-type="2" value="' + productJoin.name + '">' + productJoin.name + '</option>';
                    });

                    tableRow += '</select>';
                    return tableRow;
                },
                "unit": function (column, row) {
                    var unitName = '';
                    var tableRow = '';
                    unitName = row.unitName || '';
                    if (row.isRevenue.toString() === "true") {
                        tableRow = (
                            '<select class="unit">' +
                            '<option selected disabled hidden>' + unitName + '</option>'
                        );
                    } else {
                        tableRow = (
                            '<select disabled class="unit">' +
                            '<option selected disabled hidden></option>'
                        );
                    }
                    that.expressions.forEach(function (expression) {
                        tableRow += '<option data-unit-type="2" data-unit-name="' + expression.name + '">' + expression.name + '</option>';
                    });
                    that.units.forEach(function (unit) {
                        tableRow += '<option data-unit-type="1" data-unit-name="' + unit.name + '">' + unit.name + '</option>';
                    });

                    tableRow += '</select>';
                    return tableRow;
                },
                "value": function(column, row){
                    var yearlyValue = row[column.id] || row.costData[column.id]
                    return (
                        '<input style="width:80px" class="cost" data-year="' + column.id + '" type="text" value="' + yearlyValue + '"' + '>'
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

            that.grid.find('.copy-forward').click(function (event) {
                var $values = $(this).closest('tr').find('.cost');
                var firstValue = $values.first().val();
                console.log('First value: ' + $values[0]);
                $values.val(firstValue);
                $values.trigger('change');
            });

            that.grid.find('.unit').change(function (e) {
                //alert('update expression of opex index: ' + $(this).closest('tr').data('row-id') + ':' + $(this).data('expression-id'));
                var unitType = $(this).find('option:checked').data('unit-type');
                var unitName = $(this).find('option:checked').data('unit-name');
                if (parseInt(unitType) === 2) {
                    var expression = that.getExpressionByName(unitName);
                    that.updateExpressionId({index: $(this).closest('tr').data('row-id'), expressionId: expression.id});
                } else {
                    var unit = that.getUnitByName(unitName);
                    that.updateUnitId({index: $(this).closest('tr').data('row-id'), unitId: unit.id});
                }
                /*that.updateExpressionId({
                    expressionId: $(this).find(":selected").data('expression-id'),
                    index: $(this).closest('tr').data('row-id')
                 });*/
            });
            that.grid.find('.identifier').change(function (e) {
                //alert('update identifier of opex index: ' + $(this).closest('tr').data('row-id') + ':' + $(this).data('model-id'));
                var identifierType = $(this).find(":selected").data('identifier-type');
                if (identifierType === 1) {
                    that.updateModelId({
                        modelId: $(this).find(":selected").data('model-id'),
                        index: $(this).closest('tr').data('row-id')
                    });
                } else if (identifierType === 2) {
                    that.updateIdentifier({
                        identifierName: $(this).find(":selected").val(),
                        identifierType: identifierType,
                        index: $(this).closest('tr').data('row-id')
                    })
                }
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
                    $(this).closest('tr').find('.unit').val('');
                    $(this).closest('tr').find('.unit').prop("disabled", true);
                    //$(this).closest('tr').find('.expression').hide();
                } else {
                    //$(this).closest('tr').find('.expression').val('');
                    $(this).closest('tr').find('.unit').prop("disabled", false);
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

    getOpexDataById(opexId) {
        var myOpex;
        this.opexData.forEach(function (opex) {
            if (opex.id == opexId) {
                myOpex = opex;
            }
        });
        return myOpex;
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
        var opexData = this.getOpexDataById(options.index);
        opexData['unitType'] = 2;
        opexData['unitId'] = options.expressionId;
        console.log(opexData);
        this.updateOpex({opexData: opexData});
    }

    updateUnitId(options) {
        var opexData = this.getOpexDataById(options.index);
        opexData['unitType'] = 1;
        opexData['unitId'] = options.unitId;
        console.log(opexData);
        this.updateOpex({opexData: opexData});
    }

    updateModelId(options) {
        var opexData = this.getOpexDataById(options.index);
        opexData['modelId'] = options.modelId;
        var unitType = opexData.unitType;
        if (unitType === 1) {
            opexData['unitId'] = opexData.fieldId;
        } else {
            opexData['unitId'] = opexData.expressionId;
        }
        console.log(opexData);
        this.updateOpex({opexData: opexData});
    }

    updateIdentifier(options) {
        var opexData = this.getOpexDataById(options.index);
        var identifierName = options.identifierName;
        var identifierType = options.identifierType;
        //TODO update call as per new properties.
    }

    updateCostData(options) {
        var opexData = this.getOpexDataById(options.index);
        var unitType = opexData.unitType;
        if (unitType === 1) {
            opexData['unitId'] = opexData.fieldId;
        } else {
            opexData['unitId'] = opexData.expressionId;
        }
        opexData.costData = {};
        opexData.costData[options.year.toString()] = parseFloat(options.value);
        console.log(opexData);
        this.updateOpex({opexData: opexData});
    }

    updateInUse(options) {
        var opexData = this.getOpexDataById(options.index);
        opexData['inUse'] = options.inUse;
        var unitType = opexData.unitType;
        if (unitType === 1) {
            opexData['unitId'] = opexData.fieldId;
        } else {
            opexData['unitId'] = opexData.expressionId;
        }
        console.log(opexData);
        this.updateOpex({opexData: opexData});
    }

    updateIsRevenue(options) {
        var opexData = this.getOpexDataById(options.index);
        opexData['isRevenue'] = options.isRevenue;
        if (!options.isRevenue) {
            opexData["expressionId"] = 0;
        }
        var unitType = opexData.unitType;
        if (unitType === 1) {
            opexData['unitId'] = opexData.fieldId;
        } else {
            opexData['unitId'] = opexData.expressionId;
        }
        console.log(opexData);
        this.updateOpex({opexData: opexData});
    }

    addRowToGrid() {
        var that = this;
        var newOpex = {};
        newOpex['modelId'] = 0;
        newOpex['unitId'] = 0;
        newOpex['unitType'] = 1;
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
                that.trigger('reload');
                //that.opexData.push(data);
                //that.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
            },
            error: function (data) {
                alert('Error creating opex data');
            }

        });
    }

    deleteRows(rowIds) {
        var selectedRowIds = this.$el.find("#datatype-grid-basic").bootgrid("getSelectedRows");
        var that = this;
        selectedRowIds.forEach(function (selectedRowId) {
            //var deletedExpression = that.getExpressionByName(selectedRow);
            console.log(selectedRowId);
            that.opexModel.delete({
                url: 'http://localhost:4567/opexdata',
                id: selectedRowId,
                success: function (data) {
                    alert('Successfully deleted opex.');
                },
                error: function (data) {
                    alert('Failed to delete opex.');
                }
            });
        });
        this.$el.find("#datatype-grid-basic").bootgrid("remove");
    }
}
