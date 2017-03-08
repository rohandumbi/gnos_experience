import {View} from '../core/view';
import {ExpressionModel} from '../models/expressionModel';
import {ProcessModel} from '../models/processModel'
import {TruckCycleTimeModel} from '../models/truckCycleTimeModel';
import {StockpileModel} from '../models/stockpileModel';

export class TruckParamCycleTimeView extends View {

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.expressionModel = new ExpressionModel({projectId: this.projectId});
        this.processModel = new ProcessModel({projectId: this.projectId});
        this.cycleTimeModel = new TruckCycleTimeModel({projectId: this.projectId});
        this.stockpileModel = new StockpileModel({projectId: this.projectId});
    }

    getHtml() {
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/truckParamCycleTimeView.html", function (data) {
                resolve(data);
            })
        });
        return promise;
    }

    render() {
        var that = this;
        this.processModel.fetch({
            success: function (data) {
                that.processes = data;
                that.renderToView({processes: data});
            },
            error: function (data) {
                alert('Error fetching processes.');
            }
        });
        return this;
    }

    fetchStockpiles() {
        var that = this;
        this.stockpileModel.fetch({
            success: function (data) {
                that.stockpiles = data;
                that.fetchCycleTimes();
            },
            error: function (data) {
                alert('Error fetching stockpiles.');
            }
        });
    }

    fetchCycleTimes() {
        var that = this;
        this.cycleTimeModel.fetch({
            success: function (data) {
                that.cycleTimes = data;
                that.initializeGrid(data);
                //that.renderToView({processes: data});
            },
            error: function (data) {
                alert('Error fetching processes.');
            }
        });
    }

    onDomLoaded() {
        this.fetchStockpiles();
    }

    initializeGrid(modelData) {
        var that = this;
        //var data = this.model.fetch();
        var row = '';
        for (var i = 0; i < modelData.length; i++) {
            var cycleTime = modelData[i];
            var processData = cycleTime.processData;
            row += (
                '<tr>' +
                '<td>' + cycleTime.stockPileName + '</td>'
            )
            that.processes.forEach(function (process) {
                row += '<td>' + processData[process.name.toString()] + '</td>';
            })
            row += '</tr>';
        }
        this.$el.find("#tableBody").append($(row));
        this.grid = this.$el.find("#datatype-grid-basic").bootgrid({
            rowCount: [15, 10, 20, 25],
            selection: true,
            multiSelect: true,
            rowSelect: true,
            keepSelection: true,
            formatters: {
                "value": function (column, row) {
                    return (
                        '<input data-process-name="' + column.id + '" class="process-data" type="text" value="' + row[column.id] + '"' + '>'
                    );
                }
            }
        }).on("loaded.rs.jquery.bootgrid", function () {
            /*Adding stockpiles which have note yet been accounted for*/
            that.stockpiles.forEach(function (stockPile) {
                if (!that.isStockpilePresent(stockPile.name)) {
                    that.addRowToGrid(stockPile);
                }
            });
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');
            that.grid.find(".process-data").change(function (event) {
                that.updateProcessData($(this));
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

    updateProcessData($cell) {
        var processName = $cell.data('process-name');
        var stockpileName = $cell.closest('tr').data('row-id');
        var value = $cell.val();
        var object = {}
        object['processName'] = processName;
        object['stockpileName'] = stockpileName;
        object['value'] = value;
        this.cycleTimeModel.update({
            dataObject: object,
            success: function (data) {
                alert('Successfully updated data');
            },
            error: function (data) {
                alert('Error updating process data');
            }

        });
    }

    isStockpilePresent(stockpileName) {
        var isPresent = false;
        this.cycleTimes.forEach(function (cycleTime) {
            if (cycleTime.stockPileName === stockpileName) {
                isPresent = true;
            }
        });
        return isPresent;
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

    addRowToGrid(stockpile) {
        var that = this;
        var newCycleTime = {};
        newCycleTime['stockPileName'] = stockpile.name;
        newCycleTime['stockpileName'] = stockpile.name;
        newCycleTime.processData = {};
        var counter = 0;
        this.processes.forEach(function (process) {
            var dataObject = $.extend({}, newCycleTime);
            //dataObject['stockpileName'] = newCycleTime.stockPileName;
            dataObject['processName'] = process.name;
            dataObject['value'] = 0;
            that.cycleTimeModel.add({
                dataObject: dataObject,
                success: function (data) {
                    alert('Successfully added data');
                    newCycleTime.processData[process.name] = 0;
                    counter++;
                    if (counter === that.processes.length) {
                        console.log('Finally over: ' + newCycleTime);
                        that.cycleTimes.push(newCycleTime);
                        that.$el.find("#datatype-grid-basic").bootgrid("append", [newCycleTime]);
                    }
                },
                error: function (data) {
                    alert('Failed to add expression ' + data);
                }

            });
        });
        console.log(newCycleTime);
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
