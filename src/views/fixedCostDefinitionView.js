import { View } from '../core/view';
import { FixedCostModel } from '../models/fixedCostModel';
import {PitModel} from '../models/pitModel';
import {PitGroupModel} from '../models/pitGroupModel';
import {StockpileModel} from '../models/stockpileModel';

export class FixedCostDefinitionView extends View{

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.scenario = options.scenario;
        if (!this.scenario) alert('select a scenario first');
        this.fixedCostModel = new FixedCostModel({scenarioId: this.scenario.id});
        this.pitModel = new PitModel({projectId: this.projectId});
        this.pitGroupModel = new PitGroupModel({projectId: this.projectId});
        this.stockpileModel = new StockpileModel({projectId: this.projectId})
        this.costHeadNames = ['Ore mining cost', 'Waste mining cost', 'Stockpile cost', 'Stockpile reclaiming cost', 'Truck hour cost'];
        this.costHeads = [0, 1, 2, 3, 4];
        this.currentPageCount = 1;
        this.selectedRowIds = [];
    }

    removeFromSelectedRowsArray(rowId) {

    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/fixedCostDefinitionView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    render() {
        super.render(this.scenario);
        return this;
    }

    fetchFixedCosts() {
        var that = this;
        this.fixedCostModel.fetch({
            success: function (data) {
                that.fixedCostData = data;
                //that.filterMissingFixedCosts();
                that.initializeGrid(data);
            },
            error: function (data) {
                alert('Failed to get fixed costs.');
            }
        });
    }

    fetchPits() {
        this.pitModel.fetch({
            success: (data)=> {
                this.pits = data;
                this.fetchPitGroups();
            },
            error: ()=> {
                alert('Error fetching pits.');
            }
        });
    }

    fetchPitGroups() {
        this.pitGroupModel.fetch({
            success: (data)=> {
                this.pitGroups = data;
                this.fetchStockpiles();
            },
            error: ()=> {
                alert('Error fetching pits.');
            }
        });
    }

    fetchStockpiles() {
        this.stockpileModel.fetch({
            success: (data)=> {
                this.stockpiles = data;
                this.fetchFixedCosts();
            },
            error: ()=> {
                alert('Error fetching pits.');
            }
        });
    }

    onDomLoaded() {
        var that = this;
        if (this.scenario.timePeriod > 4) {
            this.$el.find("#datatype-grid-basic").addClass('long-grid');
        }
        this.fetchPits();
        this.$el.find('#newCostType').change((event) => {
            var $selectedCostType = this.$el.find('select#newCostType option:checked');
            var costType = parseInt($selectedCostType.data('costtype'), 10);
            var newFilterOptions = '';
            if (costType === 0 || costType === 1) {
                this.pits.forEach(function (pit) {
                    newFilterOptions += '<option data-filtertype="1" data-pit-no="' + pit.pitNo + '">' + pit.pitName + '</option>';
                });
                this.pitGroups.forEach(function (pitGroup) {
                    newFilterOptions += '<option data-filtertype="2" data-pitgroup-no="' + pitGroup.pitGroupNumber + '">' + pitGroup.name + '</option>';
                });
            } else if (costType === 2 || costType === 3) {
                this.stockpiles.forEach(function (stockpile) {
                    newFilterOptions += '<option data-filtertype="3" data-stockpile-no="' + stockpile.stockpileNumber + '">' + stockpile.name + '</option>';
                });
            }
            this.$el.find('#newFilter').html(newFilterOptions);
        });
        this.$el.find('#addCostButton').click((e) => {
            this.addCostToGrid(e);
        });
    }

    getCostById(id) {
        var cost;
        this.fixedCostData.forEach(function (fixedCost) {
            if (fixedCost.id === id) {
                cost = fixedCost;
                return;
            }
        });
        return cost;
    }

    initializeGrid(fixedCostData) {
        this.grid = this.$el.find("#datatype-grid-basic").bootgrid({
            ajax: true,
            ajaxSettings: {
                method: "GET",
                dataFilter: (data)=> {
                    var jsonData = JSON.parse(data);
                    var formattedRowData = [];
                    jsonData.forEach((cost)=> {
                        formattedRowData.push(this.mapCostToTableData(cost));
                    });
                    var returnedData = {};
                    returnedData.current = this.currentPageCount;
                    returnedData.rowCount = 15;
                    returnedData.rows = formattedRowData;
                    returnedData.total = formattedRowData.length;
                    return JSON.stringify(returnedData);
                }
            },
            url: "http://localhost:4567/scenario/" + this.scenario.id + "/fixedcosts",
            rowCount: [15, 10, 20, 25],
            selection: true,
            multiSelect: true,
            rowSelect: true,
            keepSelection: true,
            formatters: {
                "id": (column, row) => {
                    return "<span data-cost-id='" + row.costId + "'></span>"
                },
                "commands": (column, row) => {
                    return "<button type=\"button\" class=\"btn btn-xs btn-default command-edit glyphicon glyphicon-edit copy-forward\" data-row-id=\"" + row.id + "\"><span class=\"fa fa-pencil\"></span></button> ";
                },
                "value": (column, row) => {
                    //var yearlyValue = row[column.id] || row.costData[column.id];
                    var yearlyValue = row[column.id];
                    return (
                        '<input style="width:80px" class="cost" data-year="' + column.id + '" type="text" value="' + yearlyValue + '"' + '>'
                    );
                },
                "inUse": (column, row) => {
                    var cost = this.getCostById(parseInt(row.costId, 10));
                    var isDefaultRow = cost.isDefault;
                    if (row.inUse.toString() === 'true') {
                        if (isDefaultRow && !(cost.costType === 4)) {
                            return (
                                '<input class="use" type="checkbox" value="' + row.inUse + '"' + 'checked disabled >'
                            )
                        } else {
                            return (
                                '<input class="use" type="checkbox" value="' + row.inUse + '"' + 'checked  >'
                            )
                        }
                    } else {
                        return (
                            '<input class="use" type="checkbox" value="' + row.inUse + '"' + '>'
                        )
                    }
                },
                "filter": (column, row) => {
                    var cost = this.getCostById(parseInt(row.costId, 10));
                    var isDefaultRow = cost.isDefault;
                    if (isDefaultRow) {
                        return '<span></span>'
                    } else {
                        var filterName = row.filter;
                        var tableRow = '';
                        tableRow = (
                            '<select class="filter" value="test" style="width:100%">' +
                            '<option selected disabled hidden>' + filterName + '</option>'
                        );
                        /*tableRow += '<option data-filtertype="-1" >' + 'ALL' + '</option>';*/
                        if (cost.costType === 0 || cost.costType === 1) {
                            this.pits.forEach(function (pit) {
                                tableRow += '<option data-filtertype="1" data-pit-no="' + pit.pitNo + '">' + pit.pitName + '</option>';
                            });
                            this.pitGroups.forEach(function (pitGroup) {
                                tableRow += '<option data-filtertype="2" data-pitgroup-no="' + pitGroup.pitGroupNumber + '">' + pitGroup.name + '</option>';
                            });
                        } else if (cost.costType === 2 || cost.costType === 3) {
                            this.stockpiles.forEach(function (stockpile) {
                                tableRow += '<option data-filtertype="3" data-stockpile-no="' + stockpile.stockpileNumber + '">' + stockpile.name + '</option>';
                            });
                        }
                        tableRow += '</select>';
                        return tableRow;
                    }
                },
            }
        }).on("loaded.rs.jquery.bootgrid", ()=>
        {
            /* Executes after data is loaded and rendered */
            this.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            this.$el.find(".fa-refresh").addClass('glyphicon glyphicon-refresh');
            this.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');

            /*if (!that.missingRowsAdded) {
                console.log('missing cost heads: ' + that.missingCostHeads);
                that.addMissingRows();
                that.missingRowsAdded = true;
             }*/
            this.grid.find(".use").change((e) => {
                var costInUse = $(e.currentTarget).is(':checked');
                this.updateInUse({
                    id: $(e.currentTarget).closest('tr').data('row-id'),
                    inUse: costInUse
                });
            });

            this.grid.find(".select-box").change((e) => {
                var isSelected = $(e.currentTarget).is(':checked');
                var costId = $(e.currentTarget).closest('tr').data('row-id');
                if (isSelected) {
                    this.selectedRowIds.push(costId);
                } else {
                    var index = this.selectedRowIds.indexOf(costId);
                    this.selectedRowIds.splice(index, 1);
                }
            });

            this.grid.find(".filter").change((e) => {
                var selectorName = $(e.currentTarget).find(":selected").val();
                var selectionType = $(e.currentTarget).find(":selected").data('filtertype');
                this.updateFilter({
                    id: $(e.currentTarget).closest('tr').data('row-id'),
                    selectorName: selectorName,
                    selectionType: selectionType
                });
            });

            this.grid.find('.copy-forward').click((e) => {
                var $values = $(e.currentTarget).closest('tr').find('.cost');
                var firstValue = $values.first().val();
                console.log('First value: ' + $values[0]);
                $values.val(firstValue);
                $values.trigger('change');
            });

            this.grid.find('.cost').change((e)=> {
                //alert('update year of opex index: ' + $(this).data('year') + ':' + $(this).closest('tr').data('row-id') + ':' + $(this).val());
                this.updateCostData({
                    id: $(e.currentTarget).closest('tr').data('row-id'),
                    year: $(e.currentTarget).data('year'),
                    value: $(e.currentTarget).val()
                });
            });
        });
        var $addButton = $('<button id="addCost" type="button" class="btn btn-default" data-toggle="modal" data-target="#newCostModal"></button>');
        $addButton.append('<span class="glyphicon glyphicon-plus"></span>');

        var $removeButton = $('<button type="button" class="btn btn-default"></button>');
        $removeButton.append('<span class="glyphicon glyphicon-trash"></span>');

        this.$el.find(".actionBar").append($addButton);
        this.$el.find(".actionBar").append($removeButton);

        $removeButton.click((e) => {
            this.deleteRows(e);
        });
    }

    deleteRows() {
        if (this.selectedRowIds.length > 0) {
            var deletedRowsCount = 0;
            this.selectedRowIds.forEach((selectedRowId)=> {
                var cost = this.getCostById(parseInt(selectedRowId, 10));
                if (cost.isDefault) {
                    deletedRowsCount++;
                    if (deletedRowsCount === this.selectedRowIds.length) {
                        this.p
                        this.$el.find("#datatype-grid-basic").bootgrid("reload");
                        this.selectedRowIds = [];
                    }
                } else {
                    this.fixedCostModel.delete({
                        url: 'http://localhost:4567/fixedcost',
                        id: selectedRowId,
                        success: (data)=> {
                            deletedRowsCount++;
                            if (deletedRowsCount === this.selectedRowIds.length) {
                                this.$el.find("#datatype-grid-basic").bootgrid("reload");
                                this.selectedRowIds = [];
                            }
                        },
                        error: (data)=> {
                            alert('Failed to delete dependencies.');
                        }
                    });
                }
            });
        }
    }

    addCostToGrid(e) {
        var costType = this.$el.find('select#newCostType option:checked').data('costtype');
        var filterType = this.$el.find('select#newFilter option:checked').data('filtertype');
        var filterName = this.$el.find('select#newFilter option:checked').val();
        if (costType === undefined) {
            alert('Please select the cost type.');
            return;
        }
        if ((filterType === undefined) || !filterName) {
            alert('Please select the filter.');
            return;
        }
        var newCost = {};
        var costData = {};
        newCost['costType'] = costType;
        newCost['selectionType'] = filterType;
        newCost['selectorName'] = filterName;
        newCost['inUse'] = true;
        newCost['isDefault'] = false;
        var startYear = this.scenario.startYear;
        var presentYear = startYear + this.scenario.timePeriod;

        for (var i = 0; i < this.scenario.timePeriod; i++) {
            presentYear = startYear + i;
            costData[presentYear.toString()] = 0;
        }
        newCost['costData'] = costData;
        this.addCost({
            cost: newCost,
            success: (data)=> {
                var rowData = this.mapCostToTableData(data);
                this.fixedCostData.push(data);
                this.$el.find("#datatype-grid-basic").bootgrid("reload");
            }
        });
    }

    mapCostToTableData(cost) {
        var rowData = {};
        rowData['costId'] = cost.id;
        rowData['name'] = this.costHeadNames[cost.costType];
        rowData['inUse'] = cost.inUse;
        rowData['filter'] = cost.selectorName;
        rowData['commands'] = true;
        var scenarioStartYear = this.scenario.startYear;
        var scenarioTimePeriod = this.scenario.timePeriod;
        var costData = cost.costData;
        for (var j = 0; j < scenarioTimePeriod; j++) {
            var presentYear = scenarioStartYear + j;
            //row += '<td>' + costData[presentYear.toString()] + '</td>';
            rowData[presentYear.toString()] = costData[presentYear.toString()];
        }
        return rowData;
    }

    /*addMissingRows() {
        var that = this;
        this.missingCostHeads.forEach(function (missingCostHead) {
            var object = {};
            object['costHead'] = missingCostHead;
            //object['mappingType'] = 1;
            //object['mappedFieldName'] = that.fields[0].name;
            var costData = {};
            var startYear = that.scenario.startYear;
            var presentYear = startYear + that.scenario.timePeriod;

            for (var i = 0; i < that.scenario.timePeriod; i++) {
                presentYear = startYear + i;
                costData[presentYear.toString()] = 0;
            }
            object['costData'] = costData;
            that.fixedCostModel.add({
                dataObject: object,
                success: function (data) {
                    //alert('Successfully added fixed cost.');
     data.name = that.costHeadNames[data.costType];
                    that.fixedCostData.push(data);
                    that.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
                },
                error: function () {
                    alert('Error creating new fixed cost data.');
                }
            });
        });
     }*/

    loadScenario(scenarioName) {
        this.$el.find('#scenario_name').val(scenarioName);
    }

    updateInUse(options) {
        var cost = this.getCostById(options.id);
        cost['inUse'] = options.inUse;
        this.updateCost({cost: cost});
    }

    updateCostData(options) {
        var cost = this.getCostById(options.id);
        cost.costData[options.year.toString()] = parseFloat(options.value);
        this.updateCost({cost: cost});
    }

    updateFilter(options) {
        var cost = this.getCostById(options.id);
        cost['selectorName'] = options.selectorName;
        cost['selectionType'] = options.selectionType;
        this.updateCost({cost: cost});
    }

    updateCost(options) {
        this.fixedCostModel.update({
            dataObject: options.cost,
            success: (data) => {
                if (options.success) {
                    options.success(data);
                }
            },
            error: (data) => {
                alert('failed update' + data);
            }
        });
    }

    addCost(options) {
        this.fixedCostModel.add({
            dataObject: options.cost,
            success: (data) => {
                //alert('Successfully added fixed cost.');
                //this.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
                if (options.success) {
                    options.success(data);
                }
            },
            error: (data) => {
                alert('Error creating new fixed cost data.');
            }
        });
    }
}
