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

    filterMissingStockpiles() {
        var that = this;
        this.missingStockpiles = [];
        this.stockpiles.forEach(function (stockpile) {
            var present = false;
            that.cycleTimes.forEach(function (cycleTime) {
                if (cycleTime.stockPileName === stockpile.name) {
                    present = true;
                }
            })
            if (!present) {
                that.missingStockpiles.push(stockpile);
            }
        });
    }

    fetchProcesses() {

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
                that.filterMissingStockpiles();
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
                    var value = row[column.id] || row.processData[column.id];
                    if (!value) {
                        value = 0;
                    }
                    return (
                        '<input data-process-name="' + column.id + '" class="process-data" type="text" value="' + value + '"' + '>'
                    );
                }
            }
        }).on("loaded.rs.jquery.bootgrid", function () {
            /*Adding stockpiles which have note yet been accounted for*/
            /*that.stockpiles.forEach(function (stockPile) {
                if (!that.isStockpilePresent(stockPile.name)) {
                    that.addRowToGrid(stockPile);
                }
             });*/

            if (!that.missingRowsAdded) {
                that.addMissingRows();
                that.missingRowsAdded = true;
            }
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');
            that.grid.find(".process-data").change(function (event) {
                that.updateProcessData($(this));
            });
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

    addMissingRows() {
        var that = this;
        this.missingStockpiles.forEach(function (missingStockpile) {
            that.addRowToGrid(missingStockpile);
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
}
