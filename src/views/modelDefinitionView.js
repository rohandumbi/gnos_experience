import { View } from '../core/view';
import { GnosModel } from '../models/gnosModel';
import {ExpressionModel} from '../models/expressionModel';

export class ModelDefinitionView extends View{

    constructor(options) {
        super();
        var that = this;
        this.projectId = options.projectId;
        this.model = new GnosModel({projectId: this.projectId});
        this.expressionModel = new ExpressionModel({projectId: this.projectId});
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

    getModelByName(modelName) {
        var modelObject;
        this.modelData.forEach(function (model) {
            if (model.name === modelName) {
                modelObject = model;
            }
        });
        return modelObject;
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
                that.initializeGrid(data);
            },
            error: function (data) {
                alert('Error fetching model list');
            }
        });
    }

    onDomLoaded() {
        this.fetchExpressions();
    }

    initializeGrid(modelData) {
        var that = this;
        //var data = this.model.fetch();
        var row = '';
        for (var i = 0; i < modelData.length; i++) {
            var model = modelData[i];
            row += (
                '<tr>' +
                    '<td>' + model.name + '</td>' +
                '<td>' + model.expressionId + '</td>' +
                '<td>' + (model.condition || '') + '</td>' +
                    /*'<td>' + model.id + '</td>' +*/
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
                "expression": function(column, row){
                    var expression = that.getExpressionById(row.expressionId);
                    var expressionName;
                    var tableRow = '';
                    if (expression && expression.name) {
                        expressionName = expression.name;
                        tableRow = (
                            '<select class="expression" value="test">' +
                            '<option selected disabled hidden>' + expressionName + '</option>'
                        );
                    } else {
                        expressionName = '';
                        tableRow = (
                            '<select disabled class="expression" value="test">' +
                            '<option selected disabled hidden>' + expressionName + '</option>'
                        );
                    }
                    that.expressions.forEach(function (expression) {
                        tableRow += '<option data-expression-id="' + expression.id + '">' + expression.name + '</option>';
                    });

                    tableRow += '</select>';
                    return tableRow;
                },
                "condition": function (column, row) {
                    return (
                        '<input data-model-name="' + row.name + '" class="model_condition" style="width:200px" type="text" value="' + row.condition + '"' + '>'
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
                var exprId = $(this).find(":selected").data('expression-id');
                that.updateExpression({name: modelName, expressionId: exprId});
            });
            that.grid.find(".model_condition").change(function (event) {
                var modelName = $(this).closest('tr').data('row-id');
                var conditionValue = $(this).val();
                that.updateCondition({name: modelName, condition: conditionValue});
            });
        });
        var $addButton = $('<button type="button" class="btn btn-default" data-toggle="modal" data-target="#modelDefinitionModal"></button>');
        $addButton.append('<span class="glyphicon glyphicon-plus"></span>');

        var $removeButton = $('<button type="button" class="btn btn-default"></button>');
        $removeButton.append('<span class="glyphicon glyphicon-trash"></span>');

        this.$el.find(".actionBar").append($addButton);
        this.$el.find(".actionBar").append($removeButton);
        /*$addButton.click(function(){
            that.addRowToGrid();
        });*/
        $removeButton.click(function(){
            that.deleteRows();
        });
        this.$el.find('#addModel').click(function(){
            that.addRowToGrid();
        });
    }

    updateExpression(options) {
        var updatedModel = this.getModelByName(options.name);
        updatedModel['expressionId'] = options.expressionId;
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
        var modelName = this.$el.find('#model_name').val();
        if(modelName) {
            this.$el.find("#datatype-grid-basic").bootgrid("append", [{
                name: modelName,
                id: -1,
                expressionId: -1,
                expressionName: "",
                filter:""
            }]);
            this.$el.find('#model_name').val('');
        }
    }

    deleteRows(rowIds) {
        this.$el.find("#datatype-grid-basic").bootgrid("remove");
    }
}
