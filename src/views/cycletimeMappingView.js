import {View} from '../core/view';
import {ExpressionModel} from '../models/expressionModel';
import {TruckParamPayloadView} from './truckParamPayloadView';
import {TruckParamCycleTimeView} from './truckParamCycleTimeView';
import {FixedTimeModel} from '../models/fixedTimeModel';

import {CycletimeModel} from '../models/cycletimeModel';
import {CycletimeMappingModel} from '../models/cycletimeMappingModel';
import {CycletimeDumpFieldMappingView} from './cycletimeDumpFieldMappingView';
import {CycletimeFixedFieldMappingView} from './cycletimeFixedFieldMappingView';
import {CycletimeProcessFieldMappingView} from './cycletimeProcessFieldMappingView';
import {CycletimeStockpileFieldMappingView} from './cycletimeStockpileFieldMappingView';

export class CycletimeMappingView extends View {

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.fixedTimeModel = new FixedTimeModel({projectId: this.projectId});
        this.model = new ExpressionModel({projectId: this.projectId});

        this.cycletimeMappingModel = new CycletimeMappingModel({projectId: this.projectId});
    }

    getHtml() {
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/cycletimeMappingView.html", function (data) {
                resolve(data);
            })
        });
        return promise;
    }

    fetchFixedTime() {
        var that = this;
        this.fixedTimeModel.fetch({
            success: function (data) {
                that.fixedTime = data;
                that.$el.find('#fixed_time').val(data);
                that.$el.find('#fixed_time').change(function (event) {
                    that.fixedTimeModel.update({
                        url: 'http://localhost:4567/project/' + that.projectId + '/fixedtime/' + $(this).val(),
                        success: function (data) {
                            alert('Successfully updated fixed time');
                        },
                        error: function (data) {
                            alert('Error updating fixed time: ' + data);
                        }
                    });
                });
            },
            error: function (data) {
                alert('Error fetching fixed time');
            }
        });
    }

    fetchCycleTimeMappings() {
        var that = this;
        this.cycletimeMappingModel.fetch({
            success: function (data) {
                that.cycletimeMappings = data;
                that.filterDataIntoCategories();
                that.initializeSubViews();
            },
            error: function (data) {
                alert('Error fetching fixed time');
            }
        });
    }

    filterDataIntoCategories() {
        var that = this;
        this.fixedFieldMappings = [];
        this.processFieldMappings = [];
        this.dumpFieldMappings = [];
        this.stockpileFieldMappings = [];
        this.cycletimeMappings.forEach(function (cycletimeMapping) {
            if (cycletimeMapping.mappingType === 1) {
                that.fixedFieldMappings.push(cycletimeMapping);
            } else if (cycletimeMapping.mappingType === 2) {
                that.processFieldMappings.push(cycletimeMapping);
            } else if (cycletimeMapping.mappingType === 3) {
                that.dumpFieldMappings.push(cycletimeMapping);
            } else if (cycletimeMapping.mappingType === 4) {
                that.stockpileFieldMappings.push(cycletimeMapping);
            }
        });
    }

    initializeSubViews() {
        this.cycletimeFixedFieldMappingView = new CycletimeFixedFieldMappingView({
            projectId: this.projectId,
            map: this.fixedFieldMappings
        });
        this.cycletimeFixedFieldMappingView.render();
        this.$el.find('#fixed-container').append(this.cycletimeFixedFieldMappingView.$el);

        this.cycletimeProcessFieldMappingView = new CycletimeProcessFieldMappingView({
            projectId: this.projectId,
            map: this.processFieldMappings
        });
        this.cycletimeProcessFieldMappingView.render();
        this.$el.find('#process-container').append(this.cycletimeProcessFieldMappingView.$el);

        this.cycletimeDumpFieldMappingView = new CycletimeDumpFieldMappingView({
            projectId: this.projectId,
            map: this.dumpFieldMappings
        });
        this.cycletimeDumpFieldMappingView.render();
        this.$el.find('#dump-container').append(this.cycletimeDumpFieldMappingView.$el);

        this.cycletimeStockpileFieldMappingView = new CycletimeStockpileFieldMappingView({
            projectId: this.projectId,
            map: this.stockpileFieldMappings
        });
        this.cycletimeStockpileFieldMappingView.render();
        this.$el.find('#stockpile-container').append(this.cycletimeStockpileFieldMappingView.$el);
    }

    onDomLoaded() {
        //this.fetchFixedTime();
        this.fetchCycleTimeMappings();
    }

    initializeGrid(modelData) {
        var that = this;
        //var data = this.model.fetch();
        var row = '';
        for (var i = 0; i < modelData.length; i++) {
            var expression = modelData[i];
            row += (
                '<tr>' +
                '<td>' + expression.name + '</td>' +
                '<td>' + expression.isGrade + '</td>' +
                '<td>' + expression.exprvalue + '</td>' +
                '<td>' + (expression.filter || '') + '</td>' +
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
                "definition": function (column, row) {
                    return (
                        '<input data-expression-name="' + row.name + '" class="expression_definition" type="text" value="' + row.exprvalue + '"' + '>'
                    );
                },
                "filter": function (column, row) {
                    return (
                        '<input data-expression-name="' + row.name + '" class="expression_filter" style="width:200px" type="text" value="' + row.filter + '"' + '>'
                    );
                },
                "grade": function (column, row) {
                    if (row.isGrade.toString().toLowerCase() === "true") {
                        return (
                            '<input data-expression-name="' + row.name + '" class="expression_isgrade" type="checkbox" value="' + row.isGrade + '"' + 'checked  >'
                        )
                    } else {
                        return (
                            '<input data-expression-name="' + row.name + '" class="expression_isgrade" type="checkbox" value="' + row.isGrade + '"' + '>'
                        )
                    }
                }
            }
        }).on("loaded.rs.jquery.bootgrid", function () {
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');
            that.grid.find(".expression_definition").change(function (event) {
                //alert($(this).data('expression-name'));
                var expressionName = $(this).data('expression-name');
                var exprValue = $(this).val();
                that.updateExpressionDefinition({name: expressionName, exprvalue: exprValue});
            });
            that.grid.find(".expression_filter").change(function (event) {
                var expressionName = $(this).data('expression-name');
                var filterValue = $(this).val();
                that.updateExpressionFilter({name: expressionName, filter: filterValue});
            });
            that.grid.find(".expression_isgrade").change(function (event) {
                var expressionName = $(this).data('expression-name');
                var expressionIsGrade = $(this).is(':checked');
                that.upgradeExpressionGrade({name: expressionName, isGrade: expressionIsGrade});
            });
        });
        var $addButton = $('<button type="button" class="btn btn-default" data-toggle="modal" data-target="#expressionDefinitionModal"></button>');
        $addButton.append('<span class="glyphicon glyphicon-plus"></span>');

        var $removeButton = $('<button type="button" class="btn btn-default"></button>');
        $removeButton.append('<span class="glyphicon glyphicon-trash"></span>');

        this.$el.find(".actionBar").append($addButton);
        this.$el.find(".actionBar").append($removeButton);
        /*$addButton.click(function(){
         that.addRowToGrid();
         });*/
        $removeButton.click(function () {
            that.deleteRows();
        });
        this.$el.find('#addModel').click(function () {
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
        var expressionName = this.$el.find('#expression_name').val();
        var isGrade = this.$el.find('#expression_isGrade').is(':checked');
        var isComplex = this.$el.find('#expression_isComplex').is(':checked');
        var expressionDefinition = this.$el.find('#expression_definition').val();
        var expressionFilter = this.$el.find('#expression_filter').val();
        if (expressionName && expressionDefinition) {
            console.log(expressionName + '-' + isGrade + '-' + expressionDefinition + '-' + expressionFilter + '-' + isComplex);
            var newExpression = {
                name: expressionName,
                isGrade: isGrade || false,
                isComplex: isComplex || false,
                exprvalue: expressionDefinition,
                filter: expressionFilter
            }
            this.model.add({
                dataObject: newExpression,
                success: function (data) {
                    alert('Successfully added expression');
                    that.data.push(data);
                    that.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
                },
                error: function (data) {
                    alert('Failed to add expression ' + data);
                }

            });
        } else {
            alert('Model name/definition missing');
        }
        this.clearDialog();
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
            var deletedExpression = that.getExpressionByName(selectedRow);
            console.log(deletedExpression);
            that.model.delete({
                url: 'http://localhost:4567/expressions',
                id: deletedExpression.id,
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
