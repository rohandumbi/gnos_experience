import {View} from '../core/view';
import {StockpileModel} from '../models/stockpileModel';
import {PitModel} from '../models/pitModel';
import {PitGroupModel} from '../models/pitGroupModel';

export class StockpileDefinitionView extends View {

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.stockpileModel = new StockpileModel({projectId: this.projectId});
        this.pitModel = new PitModel({projectId: this.projectId});
        this.pitGroupModel = new PitGroupModel({projectId: this.projectId});
    }

    getHtml() {
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/stockpileDefinitionView.html", function (data) {
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
                var tableRow = (
                    '<select id="expression_name" class="expression_name form-control" value="test">'
                );
                that.expressions.forEach(function (expression) {
                    tableRow += '<option data-expression-name="' + expression.name + '" data-expression-id="' + expression.id + '">' + expression.name + '</option>';
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

    fetchPits() {
        var that = this;
        this.pitModel.fetch({
            success: function (data) {
                that.pits = data;
                that.fetchPitGroups();
            },
            error: function (data) {
                alert('Error fetching pits');
            }
        });
    }

    fetchPitGroups() {
        var that = this;
        this.pitGroupModel.fetch({
            success: function (data) {
                that.pitGroups = data;
                that.fetchStockpiles();
            },
            error: function (data) {
                alert('Error fetching pits');
            }
        });
    }

    fetchStockpiles() {
        var that = this;
        this.stockpileModel.fetch({
            success: function (data) {
                that.stockPiles = data;
                that.initializeGrid(data);
            },
            error: function (data) {
                alert('Error fetching pits');
            }
        });
    }

    onDomLoaded() {
        this.fetchPits();
    }

    initializeGrid(stockpileData) {
        var that = this;
        var row = '';
        for (var i = 0; i < stockpileData.length; i++) {
            var stockpile = stockpileData[i];
            row += (
                '<tr>' +
                '<td>' + stockpile.name + '</td>' +
                '<td>' + stockpile.type + '</td>' +
                '<td>' + stockpile.mappedTo + '</td>' +
                '<td>' + (stockpile.condition || '') + '</td>' +
                '<td>' + stockpile.hasCapacity + '</td>' +
                '<td>' + stockpile.capacity + '</td>' +
                '<td>' + stockpile.isReclaim + '</td>' +
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
                "type": function (column, row) {
                    var stockpileTypeIndex = row.type;
                    var stockpileType;
                    if (stockpileTypeIndex.toString() === '0') {
                        stockpileType = 'External'
                    } else {
                        stockpileType = 'Internal'
                    }
                    var tableRow = (
                        '<select class="stockpile_type">' +
                        '<option selected disabled hidden>' + stockpileType + '</option>' +
                        '<option data-stockpile-type="0">External</option>' +
                        '<option data-stockpile-type="1">Internal</option>' +
                        '</select>'

                    );
                    return tableRow;
                },
                "mappedTo": function (column, row) {
                    var groupName = row.mappedTo;
                    var tableRow = (
                        '<select class="stockpile_mapping" value="test">' +
                        '<option selected disabled hidden>' + groupName + '</option>'
                    );
                    that.pits.forEach(function (pit) {
                        tableRow += '<option data-mapping-type="0">' + pit.pitName + '</option>';
                    });
                    that.pitGroups.forEach(function (pitGroup) {
                        tableRow += '<option data-mapping-type="1">' + pitGroup.name + '</option>';
                    });
                    tableRow += '</select>';
                    return tableRow;
                },
                "condition": function (column, row) {
                    var condition = row.condition || '';
                    return (
                        '<input data-stockpile-name="' + row.name + '" class="stockpile_condition" style="width:200px" type="text" value="' + condition + '"' + '>'
                    );
                },
                "capacity": function (column, row) {
                    var capacity = row.capacity || '';
                    return (
                        '<input data-stockpile-name="' + row.name + '" class="stockpile_capacity" style="width:200px" type="text" value="' + capacity + '"' + '>'
                    );
                },
                "hasCapacity": function (column, row) {
                    if (row.hasCapacity.toString() === 'true') {
                        return (
                            '<input class="stockpile_hasCapacity" type="checkbox" value="' + row.hasCapacity + '"' + 'checked  >'
                        )
                    } else {
                        return (
                            '<input class="stockpile_hasCapacity" type="checkbox" value="' + row.hasCapacity + '"' + '>'
                        )
                    }
                },
                "isReclaim": function (column, row) {
                    if (row.isReclaim.toString() === 'true') {
                        return (
                            '<input class="stockpile_isReclaim" type="checkbox" value="' + row.isReclaim + '"' + 'checked  >'
                        )
                    } else {
                        return (
                            '<input class="stockpile_isReclaim" type="checkbox" value="' + row.isReclaim + '"' + '>'
                        )
                    }
                }
            }
        }).on("loaded.rs.jquery.bootgrid", function () {
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
        $removeButton.click(function () {
            that.deleteRows();
        });
        this.$el.find('#addModel').click(function () {
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
        var that = this;
        var modelName = this.$el.find('#model_name').val();
        var expressionId = this.$el.find('select#expression_name option:checked').data('expression-id');
        var newModel = {};
        newModel['name'] = modelName;
        newModel['expressionId'] = expressionId;
        if (modelName && expressionId) {
            this.model.add({
                url: 'http://localhost:4567/project/' + that.projectId + '/model',
                dataObject: newModel,
                success: function (data) {
                    that.modelData = data;
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
