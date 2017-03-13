import {View} from '../core/view';
import {ExpressionModel} from '../models/expressionModel';
import {UnitModel} from '../models/unitModel';
import {TruckParamPayloadModel} from '../models/truckParamPayloadModel';

export class TruckParamPayloadView extends View {

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.expressionModel = new ExpressionModel({projectId: this.projectId});
        this.unitModel = new UnitModel({projectId: this.projectId});
        this.truckParamPayloadModel = new TruckParamPayloadModel({projectId: this.projectId});
    }

    getHtml() {
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/truckParamPayloadView.html", function (data) {
                resolve(data);
            })
        });
        return promise;
    }

    fetchPayload() {
        var that = this;
        this.truckParamPayloadModel.fetch({
            success: function (data) {
                that.payloads = data;
                var tableRow = (
                    '<select id="expression_name" class="expression_name form-control">'
                );
                that.expressions.forEach(function (expression) {
                    tableRow += '<option data-expression-name="' + expression.name + '" data-expression-id="' + expression.id + '">' + expression.name + '</option>';
                });
                that.units.forEach(function (unit) {
                    tableRow += '<option data-expression-name="' + unit.name + '" data-expression-id="' + unit.id + '">' + unit.name + '</option>';
                });
                tableRow += '</select>';
                that.$el.find('#expression-list').append(tableRow);
                that.initializeGrid(data);
            },
            error: function (data) {
                alert('Error fetching truck payload');
            }
        });
    }

    fetchUnits() {
        var that = this;
        this.unitModel.fetch({
            success: function (data) {
                that.units = data;
                that.fetchExpressions();
            },
            error: function (data) {
                alert('Error fetching expressions');
            }
        });
    }

    fetchExpressions() {
        var that = this;
        this.expressionModel.fetch({
            success: function (data) {
                that.expressions = data;
                that.fetchPayload();
            },
            error: function (data) {
                alert('Error fetching expressions');
            }
        })
    }

    onDomLoaded() {
        this.fetchUnits();
    }

    initializeGrid(modelData) {
        var that = this;
        //var data = this.model.fetch();
        var row = '';
        for (var i = 0; i < modelData.length; i++) {
            var payload = modelData[i];
            row += (
                '<tr>' +
                '<td>' + payload.materialName + '</td>' +
                '<td>' + payload.payload + '</td>' +
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
                "payload": function (column, row) {
                    return (
                        '<input data-material-name="' + row.materialName + '" class="payload" style="width:200px" type="text" value="' + row.payload + '"' + '>'
                    );
                }
            }
        }).on("loaded.rs.jquery.bootgrid", function () {
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');

            that.grid.find(".payload").change(function (event) {
                var materialName = $(this).data('material-name');
                var payload = $(this).val();
                var updatedPayload = {};
                updatedPayload['materialName'] = materialName;
                updatedPayload['payload'] = payload;
                that.truckParamPayloadModel.update({
                    dataObject: updatedPayload,
                    success: function (data) {
                        alert('Updated payload');
                    },
                    error: function (data) {
                        alert('Error updating payload: ' + data);
                    }
                })
            });
        });
        var $addButton = $('<button type="button" class="btn btn-default" data-toggle="modal" data-target="#payloadDefinitionModal"></button>');
        $addButton.append('<span class="glyphicon glyphicon-plus"></span>');

        var $removeButton = $('<button type="button" class="btn btn-default"></button>');
        $removeButton.append('<span class="glyphicon glyphicon-trash"></span>');

        this.$el.find(".actionBar").append($addButton);
        this.$el.find(".actionBar").append($removeButton);

        $removeButton.click(function () {
            that.deleteRows();
        });
        this.$el.find('#addPayload').click(function () {
            that.addRowToGrid();
        });

    }

    updateExpressionFilter(options) {
        var updatedExpression = this.getExpressionByName(options.name);
        updatedExpression['filter'] = options.filter;
        this.model.update({
            id: updatedExpression.id,
            url: 'http://localhost:4567/expressions',
            dataObject: updatedExpression,
            success: function (data) {
                alert('Successfully updated');
            },
            error: function (data) {
                alert('Failed to update: ' + data);
            }
        });
    }

    updateExpressionDefinition(options) {
        var updatedExpression = this.getExpressionByName(options.name);
        updatedExpression['exprvalue'] = options.exprvalue;
        this.model.update({
            id: updatedExpression.id,
            url: 'http://localhost:4567/expressions',
            dataObject: updatedExpression,
            success: function (data) {
                alert('Successfully updated');
            },
            error: function (data) {
                alert('Failed to update: ' + data);
            }
        });
    }

    upgradeExpressionGrade(options) {
        var updatedExpression = this.getExpressionByName(options.name);
        updatedExpression['isGrade'] = options.isGrade;
        this.model.update({
            id: updatedExpression.id,
            url: 'http://localhost:4567/expressions',
            dataObject: updatedExpression,
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
        var materialName = this.$el.find('select#expression_name option:checked').data('expression-name');
        var newMaterial = {};
        newMaterial['materialName'] = materialName;
        newMaterial['payload'] = 0;
        this.truckParamPayloadModel.add({
            dataObject: newMaterial,
            success: function (data) {
                that.payloads.push(data);
                that.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
            },
            error: function (data) {
                alert('Error saving payload.');
            }
        });
    }

    clearDialog() {
        this.$el.find('#expression_name').val('');
        this.$el.find('#expression_isGrade').prop("checked", !this.$el.find('#expression_isGrade').prop("checked"));
        this.$el.find('#expression_isComplex').prop("checked", !this.$el.find('#expression_isComplex').prop("checked"));
        this.$el.find('#expression_definition').val('');
        this.$el.find('#expression_filter').val('');
    }

    deleteRows() {
        var selectedRows = this.$el.find("#datatype-grid-basic").bootgrid("getSelectedRows");
        var that = this;
        selectedRows.forEach(function (selectedRow) {
            //var deletedExpression = that.getExpressionByName(selectedRow);
            var deletedMaterialName = selectedRow;
            console.log(deletedMaterialName);
            that.truckParamPayloadModel.delete({
                url: 'http://localhost:4567/project/' + that.projectId + '/payloads/material',
                id: deletedMaterialName,
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

    getExpressionByName(expressionName) {
        var object;
        this.data.forEach(function (data) {
            if (data.name === expressionName) {
                object = data;
            }
        });
        return object;
    }
}
