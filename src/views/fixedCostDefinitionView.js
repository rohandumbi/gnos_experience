import { View } from '../core/view';
import { FixedCostModel } from '../models/fixedCostModel';

export class FixedCostDefinitionView extends View{

    constructor(options) {
        super();
        this.scenario = options.scenario;
        if (!this.scenario) alert('select a scenario first');
        this.fixedCostModel = new FixedCostModel({scenarioId: this.scenario.id});
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
                that.filterMissingFixedCosts();
                that.initializeGrid(data);
            },
            error: function (data) {
                alert('Failed to get fixed costs.');
            }
        });
    }

    onDomLoaded() {
        var that = this;
        if (this.scenario.timePeriod > 4) {
            this.$el.find("#datatype-grid-basic").addClass('long-grid');
        }
        this.fetchFixedCosts();
    }

    filterMissingFixedCosts() {
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
    }

    initializeGrid(fixedCostData) {
        var that = this;
        var row = '';
        for (var i = 0; i < fixedCostData.length; i++) {
            var fixedCost = fixedCostData[i];
            row += (
                '<tr>' +
                '<td>' + this.costHeadNames[fixedCost.costHead] + '</td>' +
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
                "commands": function (column, row) {
                    return "<button type=\"button\" class=\"btn btn-xs btn-default command-edit glyphicon glyphicon-edit copy-forward\" data-row-id=\"" + row.id + "\"><span class=\"fa fa-pencil\"></span></button> ";
                },
                "value": function(column, row){
                    var yearlyValue = row[column.id] || row.costData[column.id];
                    return (
                        '<input style="width:80px" class="cost" data-year="' + column.id + '" type="text" value="' + yearlyValue + '"' + '>'
                    );
                }
            }
        }).on("loaded.rs.jquery.bootgrid", function()
        {
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');

            if (!that.missingRowsAdded) {
                console.log('missing cost heads: ' + that.missingCostHeads);
                that.addMissingRows();
                that.missingRowsAdded = true;
            }

            that.grid.find('.copy-forward').click(function (event) {
                var $values = $(this).closest('tr').find('.cost');
                var firstValue = $values.first().val();
                console.log('First value: ' + $values[0]);
                $values.val(firstValue);
                $values.trigger('change');
            });

            that.grid.find('.cost').change(function (e) {
                //alert('update year of opex index: ' + $(this).data('year') + ':' + $(this).closest('tr').data('row-id') + ':' + $(this).val());
                that.updateCostData({
                    index: $(this).closest('tr').data('row-id'),
                    year: $(this).data('year'),
                    value: $(this).val()
                });
            });
        });
    }

    addMissingRows() {
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
                    data.name = that.costHeadNames[data.costHead];
                    that.fixedCostData.push(data);
                    that.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
                },
                error: function () {
                    alert('Error creating new fixed cost data.');
                }
            });
        });
    }

    loadScenario(scenarioName) {
        this.$el.find('#scenario_name').val(scenarioName);
    }

    updateCostData(options) {
        var that = this;
        var fixedCostData = this.fixedCostData[options.index];
        fixedCostData.costData[options.year.toString()] = parseFloat(options.value);
        console.log(fixedCostData);
        this.fixedCostModel.update({
            dataObject: fixedCostData,
            success: function (data) {
                //alert('Successfully updated.');
                //that.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
            },
            error: function (data) {
                alert('failed update' + data);
            }
        });
    }
}
