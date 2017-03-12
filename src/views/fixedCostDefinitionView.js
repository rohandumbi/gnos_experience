import { View } from '../core/view';
import { FixedCostModel } from '../models/fixedCostModel';

export class FixedCostDefinitionView extends View{

    constructor(options) {
        super();
        this.scenario = options.scenario;
        this.fixedCostModel = new FixedCostModel({scenarioId: this.scenario.id});
        if (!this.scenario) alert('select a scenario first');
        this.costHeadNames = ['Ore mining cost', 'Waste mining cost', 'Stockpile cost', 'Stockpile reclaiming cost', 'Truck hour cost'];
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

    onDomLoaded() {
        var that = this;
        if (this.scenario.timePeriod > 4) {
            this.$el.find("#datatype-grid-basic").addClass('long-grid');
        }
        this.fixedCostModel.fetch({
            success: function (data) {
                that.fixedCostData = data;
                that.initializeGrid(data);
            },
            error: function (data) {
                alert('Failed to get fixed costs.');
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
                '<td>' + this.costHeadNames[fixedCost.costHead] + '</td>'
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
                "value": function(column, row){
                    var yearlyValue = row[column.id] || row.costData[column.id];
                    return (
                        '<input class="cost" data-year="' + column.id + '" type="text" value="' + yearlyValue + '"' + '>'
                    );
                }
            }
        }).on("loaded.rs.jquery.bootgrid", function()
        {
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');

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

    loadScenario(scenarioName) {
        this.$el.find('#scenario_name').val(scenarioName);
    }

    updateCostData(options) {
        var fixedCostData = this.fixedCostData[options.index];
        fixedCostData.costData[options.year.toString()] = parseInt(options.value);
        console.log(fixedCostData);
        this.fixedCostModel.update({
            dataObject: fixedCostData,
            success: function (data) {
                alert('Successfully updated.');
            },
            error: function (data) {
                alert('failed update' + data);
            }
        });
    }
}
