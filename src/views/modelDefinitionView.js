import { View } from '../core/view';
import { GnosModel } from '../models/gnosModel';
import {ExpressionModel} from '../models/expressionModel';
import {UnitModel} from '../models/unitModel';

export class ModelDefinitionView extends View{

    constructor(options) {
        super();
        var that = this;
        this.projectId = options.projectId;
        this.model = new GnosModel({projectId: this.projectId});
        this.expressionModel = new ExpressionModel({projectId: this.projectId});
        this.unitModel = new UnitModel({projectId: this.projectId});
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get("../content/modelDefinitionView.html", function (data) {
                resolve(data);
            })
        });
        return promise;
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

    getUnitById(fieldId) {
        var object = null;
        this.units.forEach(function (unit) {
            if (unit.id === parseInt(fieldId)) {
                object = unit;
            }
        });
        return object;
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

    getUnitByName(unitName) {
        var object = null;
        this.units.forEach(function (unit) {
            if (unit.name === unitName) {
                object = unit;
            }
        });
        return object;
    }

    getModelByName(modelName) {
        var modelObject = null;
        this.modelData.forEach(function (model) {
            if (model.name === modelName) {
                modelObject = model;
            }
        });
        return modelObject;
    }

    fetchUnits() {
        var that = this;
        this.unitModel.fetch({
            success: function (data) {
                that.units = data;
                that.fetchExpressions();
            },
            error: function (data) {
                alert('Error fetching expression list: ' + data);
            }
        })
    }

    fetchExpressions() {
        var that = this;
        this.expressionModel.fetch({
            success: function (data) {
                that.expressions = data;
                that.fetchModels();
            },
            error: function (data) {
                alert('Error fetching expression list: ' + data);
            }
        })
    }

    fetchModels() {
        var that = this;
        this.model.fetch({
            success: function (data) {
                that.modelData = data;
                var tableRow = (
                    '<select id="expression_name" class="expression_name form-control" value="test">'
                );
                that.expressions.forEach(function (expression) {
                    tableRow += '<option data-unit-type="2" data-unit-name="' + expression.name + '" data-unit-id="' + expression.id + '">' + expression.name + '</option>';
                });
                that.units.forEach(function (unit) {
                    tableRow += '<option data-unit-type="1" data-unit-name="' + unit.name + '" data-unit-id="' + unit.id + '">' + unit.name + '</option>';
                });
                tableRow += '</select>';
                that.$el.find('#expression_list').append(tableRow);
                that.initializeGrid(data);
            },
            error: function (data) {
                alert('Error fetching model list');
            }
        });
    }

    onDomLoaded() {
        this.fetchUnits();
    }

    initializeGrid(modelData) {
        var that = this;
        //var data = this.model.fetch();
        var row = '';
        for (var i = 0; i < modelData.length; i++) {
            var model = modelData[i];
            var unitName = '';
            if (model.expressionId > 0) {//expression
                var expressionId = model.expressionId;
                var expression = this.getExpressionById(expressionId);
                unitName = expression.name;
            } else {//unit
                var fieldId = model.fieldId;
                var unit = this.getUnitById(fieldId);
                unitName = unit.name;
            }
            row += (
                '<tr>' +
                    '<td>' + model.name + '</td>' +
                '<td>' + unitName + '</td>' +
                '<td>' + (model.condition || '') + '</td>' +
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
                "unit": function (column, row) {
                    var unitName = '';
                    var tableRow = '';
                    unitName = row.unitName || '';
                    tableRow = (
                        '<select class="expression" value="test">' +
                        '<option selected disabled hidden>' + unitName + '</option>'
                    );

                    that.expressions.forEach(function (expression) {
                        tableRow += '<option data-unit-type="2" data-unit-name="' + expression.name + '">' + expression.name + '</option>';
                    });
                    that.units.forEach(function (unit) {
                        tableRow += '<option data-unit-type="1" data-unit-name="' + unit.name + '">' + unit.name + '</option>';
                    });

                    tableRow += '</select>';
                    return tableRow;
                },
                "condition": function (column, row) {
                    var condition = row.condition || '';
                    return (
                        '<input data-model-name="' + row.name + '" class="model_condition" style="width:200px" type="text" value="' + condition + '"' + '>'
                    );
                }
            }
        }).on("loaded.rs.jquery.bootgrid", function()
        {
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');

            that.grid.find(".expression").change(function (event) {
                //alert($(this).data('expression-name'));
                var modelName = $(this).closest('tr').data('row-id');
                var unitType = $(this).find('option:checked').data('unit-type');
                var unitName = $(this).find('option:checked').data('unit-name');
                if (parseInt(unitType) === 2) {
                    var expression = that.getExpressionByName(unitName);
                    that.updateExpression({name: modelName, expressionId: expression.id});
                } else {
                    var unit = that.getUnitByName(unitName);
                    that.updateUnit({name: modelName, unitId: unit.id});
                }

                var exprId = $(this).find(":selected").data('expression-id');
            });
            that.grid.find(".model_condition").change(function (event) {
                var modelName = $(this).closest('tr').data('row-id');
                var conditionValue = $(this).val();
                var unitType = $(this).closest('tr').find('option:selected').data('unit-type');
                that.updateCondition({name: modelName, condition: conditionValue, unitType: unitType});
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
        this.$el.find('#addModel').click(function(){
            that.addRowToGrid();
        });
    }

    updateExpression(options) {
        var updatedModel = this.getModelByName(options.name);
        updatedModel['unitId'] = options.expressionId;
        updatedModel['unitType'] = 2;
        this.model.update({
            id: updatedModel.id,
            url: 'http://localhost:4567/model',
            dataObject: updatedModel,
            success: function (data) {
                alert('Successfully updated');
            },
            error: function (data) {
                alert('Failed to update: ' + data);
            }
        });
    }

    updateUnit(options) {
        var updatedModel = this.getModelByName(options.name);
        updatedModel['unitId'] = options.unitId;
        updatedModel['unitType'] = 1;
        this.model.update({
            id: updatedModel.id,
            url: 'http://localhost:4567/model',
            dataObject: updatedModel,
            success: function (data) {
                alert('Successfully updated');
            },
            error: function (data) {
                alert('Failed to update: ' + data);
            }
        });
    }

    updateCondition(options) {
        var updatedModel = this.getModelByName(options.name);
        updatedModel['condition'] = options.condition;
        var unitType = options.unitType;
        if (!unitType) {
            unitType = updatedModel.unitType;
        }
        if (unitType === 1) {
            updatedModel['unitId'] = updatedModel.fieldId;
        } else {
            updatedModel['unitId'] = updatedModel.expressionId;
        }
        this.model.update({
            id: updatedModel.id,
            url: 'http://localhost:4567/model',
            dataObject: updatedModel,
            success: function (data) {
                alert('Successfully updated');
            },
            error: function (data) {
                alert('Failed to update: ' + data);
            }
        });
    }

    addRowToGrid() {
        var that = this;
        var modelName = this.$el.find('#model_name').val();
        var unitId = this.$el.find('select#expression_name option:checked').data('unit-id');
        var unitType = this.$el.find('select#expression_name option:checked').data('unit-type');
        var newModel = {};
        newModel['name'] = modelName;
        newModel['unitId'] = unitId;
        newModel['unitType'] = unitType;
        if (modelName) {
            this.model.add({
                url: 'http://localhost:4567/project/' + that.projectId + '/model',
                dataObject: newModel,
                success: function (data) {
                    that.modelData.push(data);
                    var unitname = ''
                    if (data.unitType === 1) {
                        unitname = that.getUnitById(data.fieldId).name;
                    } else {
                        unitname = that.getExpressionById(data.expressionId).name;
                    }
                    data['unitName'] = unitname;
                    that.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
                    that.$el.find('#model_name').val('');
                    that.$el.find('#expression_name').val('');
                },
                error: function (data) {
                    alert('Failed to create model');
                }
            });
        }
    }

    deleteRows() {
        var selectedRows = this.$el.find("#datatype-grid-basic").bootgrid("getSelectedRows");
        var that = this;
        selectedRows.forEach(function (selectedRow) {
            var deletedModel = that.getModelByName(selectedRow);
            console.log(deletedModel);
            that.model.delete({
                url: 'http://localhost:4567/model',
                id: deletedModel.id,
                success: function (data) {
                    alert('Successfully deleted expression.');
                },
                error: function (data) {
                    alert('Failed to delete expression.');
                }
            });
        });
        this.$el.find("#datatype-grid-basic").bootgrid("remove");
    }
}
