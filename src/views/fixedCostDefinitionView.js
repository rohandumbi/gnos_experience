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

    /*filterMissingFixedCosts() {
        var that = this;
        this.missingCostHeads = [];
        this.costHeads.forEach(function (costHead) {
            var present = false;
            that.fixedCostData.forEach(function (fixedCost) {
                if (fixedCost.costHead === costHead) {
                    present = true;
                }
            })
            if (!present) {
                that.missingCostHeads.push(costHead);
            }
        });
     }*/

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
        var that = this;
        var row = '';
        for (var i = 0; i < fixedCostData.length; i++) {
            var fixedCost = fixedCostData[i];
            row += (
                '<tr>' +
                '<td>' + fixedCost.id + '</td>' +
                '<td>' + this.costHeadNames[fixedCost.costType] + '</td>' +
                '<td>' + fixedCost.inUse + '</td>' +
                '<td>' + fixedCost.selectorName + '</td>' +
                '<td>' + true + '</td>'
            )
            var scenarioStartYear = this.scenario.startYear;
            var scenarioTimePeriod = this.scenario.timePeriod;
            var costData = fixedCost.costData;
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
            this.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');

            /*if (!that.missingRowsAdded) {
                console.log('missing cost heads: ' + that.missingCostHeads);
                that.addMissingRows();
                that.missingRowsAdded = true;
             }*/
            this.grid.find(".use").change((e) => {
                var costInUse = $(e.currentTarget).is(':checked');
                that.updateInUse({
                    id: $(e.currentTarget).closest('tr').data('row-id'),
                    inUse: costInUse
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
        alert('TODO: delete selected rows');
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
                var rowData = {};
                rowData['costId'] = data.id;
                rowData['name'] = this.costHeadNames[data.costType];
                rowData['inUse'] = data.inUse;
                rowData['filter'] = data.selectorName;
                rowData['commands'] = true;

                var scenarioStartYear = this.scenario.startYear;
                var scenarioTimePeriod = this.scenario.timePeriod;
                var costData = data.costData;
                for (var j = 0; j < scenarioTimePeriod; j++) {
                    var presentYear = scenarioStartYear + j;
                    //row += '<td>' + costData[presentYear.toString()] + '</td>';
                    rowData[presentYear.toString()] = costData[presentYear.toString()];
                }

                this.$el.find("#datatype-grid-basic").bootgrid("append", [rowData]);
                this.fixedCostData.push(data);
            }
        });
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

    updateCost(options) {
        this.fixedCostModel.update({
            dataObject: options.cost,
            success: (data) => {
                if (options.success) {
                    options.success(data);
                }
                //alert('Successfully updated.');
                //that.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
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
