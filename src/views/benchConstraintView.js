import { View } from '../core/view';
import { BenchConstraintModel } from '../models/benchConstraintModel';
import {PitModel} from '../models/pitModel';

export class BenchConstraintView extends View{

    constructor(options) {
        super();
        this.scenario = options.scenario;
        this.projectId = options.projectId;
        if (!this.scenario) alert('select a scenario first');
        this.benchConstraintModel = new BenchConstraintModel({scenarioId: this.scenario.id});
        this.pitModel = new PitModel({projectId: this.projectId});
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
        var that = this;
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
        this.pitModel.fetch({
            success: function (data) {
                that.pits = data;
                var tableRow = (
                    '<select id="new_pit" class="pit-name form-control" value="test">'
                );
                that.pits.forEach(function (pit) {
                    tableRow += '<option data-pit-name="' + pit.pitName + '" data-pit-no="' + pit.pitNo + '">' + pit.pitName + '</option>';
                });
                tableRow += '</select>';
                that.$el.find('#pit_list').append(tableRow);
                that.fetchBenchConstraints();
            },
            error: function (data) {

            }

        });
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
                        tableRow += '<option data-pit-name="' + pit.pitName + '" data-pit-no="' + pit.pitNo + '">' + pit.pitName + '</option>';
                    });

                    tableRow += '</select>';
                    return tableRow;
                },
                "value": function(column, row){
                    var yearlyValue = row[column.id] || row.constraintData[column.id]
                    return (
                        '<input class="constraint" data-year="' + column.id + '" type="text" value="' + yearlyValue + '"' + '>'
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
        }).on("loaded.rs.jquery.bootgrid", function () {
            /*Add the defaultRow*/
            if (!that.isDefaultRowPresent()) {
                that.addRowToGrid('Default');
            }

            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');

            that.grid.find('.name').change(function (e) {
                //alert('update identifier of opex index: ' + $(this).closest('tr').data('row-id') + ':' + $(this).data('model-id'));
                that.updatePitName({
                    newPitName: $(this).find(":selected").data('pit-name'),
                    existingPitName: $(this).closest('tr').data('row-id')
                })
            });
            that.grid.find('.constraint').change(function (e) {
                //alert('update year of opex index: ' + $(this).data('year') + ':' + $(this).closest('tr').data('row-id') + ':' + $(this).val());
                that.updateConstraintData({
                    existingPitName: $(this).closest('tr').data('row-id'),
                    year: $(this).data('year'),
                    value: $(this).val()
                });
            });
            that.grid.find(".use").change(function (event) {
                var benchInUse = $(this).is(':checked');
                that.updateInUse({
                    existingPitName: $(this).closest('tr').data('row-id'),
                    inUse: benchInUse
                });
            });
        });
        var $addButton = $('<button type="button" data-target="#pitModal" class="btn btn-default" data-toggle="modal"></button>');
        $addButton.append('<span class="glyphicon glyphicon-plus"></span>');

        var $removeButton = $('<button type="button" class="btn btn-default"></button>');
        $removeButton.append('<span class="glyphicon glyphicon-trash"></span>');

        this.$el.find(".actionBar").append($addButton);
        this.$el.find(".actionBar").append($removeButton);

        $removeButton.click(function(){
            that.deleteRows();
        });

        this.$el.find('#addData').click(function () {
            var pitName = that.$el.find('select#new_pit option:checked').val();
            that.addRowToGrid(pitName);
        });
        /*$addButton.click(function () {
            that.addRowToGrid();
         });*/
    }

    loadScenario(scenarioName) {
        this.$el.find('#scenario_name').val(scenarioName);
    }

    updateBenchConstraint(options) {
        this.benchConstraintModel.update({
            url: 'http://localhost:4567/benchconstraints',
            id: options.benchData.id,
            dataObject: options.benchData,
            success: function (data) {
                alert('Successfully updated.');
                if (options.success) options.success(data);
            },
            error: function (data) {
                alert('failed update' + data);
                if (options.success) options.error(data);
            }
        });
    }

    getBenchByPitName(pitName) {
        var object;
        this.benchConstraintData.forEach(function (benchData) {
            if (benchData.pitName === pitName) {
                object = benchData;
            }
        });
        return object;
    }

    updatePitName(options) {
        var benchData = this.getBenchByPitName(options.existingPitName);
        //var opexData = this.opexData[options.index];
        benchData['pitName'] = options.newPitName;
        console.log(benchData);
        this.updateBenchConstraint({benchData: benchData});
    }

    updateConstraintData(options) {
        //var opexData = this.opexData[options.index];
        var benchData = this.getBenchByPitName(options.existingPitName);
        benchData.constraintData[options.year.toString()] = parseInt(options.value);
        console.log(benchData);
        this.updateBenchConstraint({benchData: benchData});
    }

    updateInUse(options) {
        //var opexData = this.opexData[options.index];
        var benchData = this.getBenchByPitName(options.existingPitName);
        benchData['inUse'] = options.inUse;
        console.log(benchData);
        this.updateBenchConstraint({benchData: benchData});
    }

    addRowToGrid(pitName) {
        var that = this;
        var newBenchConstraint = {};
        newBenchConstraint['pitName'] = pitName;
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

    isDefaultRowPresent() {
        var isPresent = false;
        this.benchConstraintData.forEach(function (benchConstraint) {
            if (benchConstraint.pitName === 'Default') {
                isPresent = true;
            }
        });
        return isPresent;
    }

    deleteRows() {
        var selectedRows = this.$el.find("#datatype-grid-basic").bootgrid("getSelectedRows");
        var that = this;
        selectedRows.forEach(function (selectedRow) {
            var deletedBenchConstraint = that.getBenchByPitName(selectedRow);
            console.log(deletedBenchConstraint);
            that.benchConstraintModel.delete({
                url: 'http://localhost:4567/benchconstraints',
                id: deletedBenchConstraint.id,
                success: function (data) {
                    alert('Successfully deleted expression.');
                },
                error: function (data) {
                    alert('Failed to delete expression.' + data);
                }
            });
        });
        this.$el.find("#datatype-grid-basic").bootgrid("remove");
    }
}
