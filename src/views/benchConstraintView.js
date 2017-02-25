import { View } from '../core/view';
import { BenchConstraintModel } from '../models/benchConstraintModel';

export class BenchConstraintView extends View{

    constructor(options) {
        super();
        this.scenario = options.scenario;
        this.projectId = options.projectId;
        if (!this.scenario) alert('select a scenario first');
        this.benchConstraintModel = new BenchConstraintModel({scenarioId: this.scenario.id});
    }

    render() {
        super.render(this.scenario);
        return this;
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/benchConstraintView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    fetchPitList() {
        this.pits = [
            {
                id: 1,
                projectId: this.projectId,
                name: 'pit_1'
            },
            {
                id: 2,
                projectId: this.projectId,
                name: 'pit_2'
            }
        ]
        this.fetchBenchConstraints();
    }

    fetchBenchConstraints() {
        var that = this;
        this.benchConstraintModel.fetch({
            success: function (data) {
                that.benchConstraintData = data;
                that.initializeGrid(data);
            },
            error: function (data) {
                alert('Error fetching opex data: ' + data);
            }
        });
    }

    onDomLoaded() {
        //this.initializeGrid();
        this.fetchPitList();
    }

    initializeGrid(benchConstraintData) {
        var that = this;
        var row = '';
        for (var i = 0; i < benchConstraintData.length; i++) {
            var benchConstraint = benchConstraintData[i];
            row += (
                '<tr>' +
                '<td>' + benchConstraint.pitName + '</td>'
            )
            row += '<td>' + benchConstraint.inUse + '</td>';

            var scenarioStartYear = this.scenario.startYear;
            var scenarioTimePeriod = this.scenario.timePeriod;
            var constraintData = benchConstraint.constraintData;
            for (var j = 0; j < scenarioTimePeriod; j++) {
                var presentYear = scenarioStartYear + j;
                row += '<td>' + constraintData[presentYear.toString()] + '</td>';
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
                "pit_name": function(column, row){
                    var tableRow = (
                        '<select class="pit-name" value="test">' +
                        '<option selected disabled hidden>' + row.pitName + '</option>'
                    );
                    that.pits.forEach(function (pit) {
                        tableRow += '<option data-pit-name="' + pit.name + '" data-pit-id="' + pit.id + '">' + pit.name + '</option>';
                    });

                    tableRow += '</select>';
                    return tableRow;
                },
                "value": function(column, row){
                    var yearlyValue = row[column.id] || row.constraintData[column.id]
                    return (
                        '<input class="cost" data-year="' + column.id + '" type="text" value="' + yearlyValue + '"' + '>'
                    );
                },
                "inUse": function (column, row) {
                    if (row.inUse.toString() === 'true') {
                        return (
                            '<input class="use" type="checkbox" value="' + row.inUse + '"' + 'checked  >'
                        )
                    }else{
                        return (
                            '<input class="use" type="checkbox" value="' + row.inUse + '"' + '>'
                        )
                    }
                }
            }
        }).on("loaded.rs.jquery.bootgrid", function()
        {
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');

            /*that.grid.find(".command-upload").on("click", function(e){
             that.loadScenario($(this).data("row-id"));
             })*/
        });
        var $addButton = $('<button type="button" class="btn btn-default" data-toggle="modal"></button>');
        $addButton.append('<span class="glyphicon glyphicon-plus"></span>');

        var $removeButton = $('<button type="button" class="btn btn-default"></button>');
        $removeButton.append('<span class="glyphicon glyphicon-trash"></span>');

        this.$el.find(".actionBar").append($addButton);
        this.$el.find(".actionBar").append($removeButton);

        $removeButton.click(function(){
            that.deleteRows();
        });
        $addButton.click(function () {
            that.addRowToGrid();
        });
    }

    loadScenario(scenarioName) {
        this.$el.find('#scenario_name').val(scenarioName);
    }

    addRowToGrid() {
        var that = this;
        var newBenchConstraint = {};
        newBenchConstraint['pitName'] = '';
        newBenchConstraint['inUse'] = true;
        var constraintData = {}
        var startYear = this.scenario.startYear;
        var timePeriod = this.scenario.timePeriod;
        for (var i = 0; i < timePeriod; i++) {
            var presentYear = startYear + i;
            constraintData[presentYear.toString()] = 0;
        }
        newBenchConstraint['constraintData'] = constraintData;
        console.log(newBenchConstraint);
        this.benchConstraintModel.add({
            dataObject: newBenchConstraint,
            success: function (data) {
                alert('added new data');
                that.benchConstraintData.push(data);
                that.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
            },
            error: function (data) {
                alert('Error creating bench data');
            }

        });
    }

    deleteRows(rowIds) {
        this.$el.find("#datatype-grid-basic").bootgrid("remove");
    }
}
