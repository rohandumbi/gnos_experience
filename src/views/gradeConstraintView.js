import { View } from '../core/view';
import { GradeConstraintModel } from '../models/gradeConstraintModel';
import {ProcessModel} from '../models/processModel';
import {ProcessJoinModel} from '../models/processJoinModel';
import {PitModel} from '../models/pitModel';
import {PitGroupModel} from '../models/pitGroupModel';
import {ProductJoinModel} from '../models/productJoinModel';
import {GradeModel} from '../models/gradeModel';

export class GradeConstraintView extends View{

    constructor(options) {
        super();
        if (!options.scenario) alert('Load a scenario');
        this.projectId = options.projectId;
        this.scenario = options.scenario;
        this.gradeConstraintModel = new GradeConstraintModel({projectId: this.projectId, scenario: this.scenario});
        this.processModel = new ProcessModel({projectId: this.projectId});
        this.processJoinModel = new ProcessJoinModel({projectId: this.projectId});
        this.pitModel = new PitModel({projectId: this.projectId});
        this.pitGroupModel = new PitGroupModel({projectId: this.projectId});
        this.productJoinModel = new ProductJoinModel({projectId: this.projectId});
        this.gradeModel = new GradeModel({projectId: this.projectId});
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/gradeConstraintView.html", function( data ) {
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
        this.fetchProductJoins();
    }

    fetchProductJoins() {
        var that = this;
        this.productJoinModel.fetch({
            success: function (data) {
                that.productJoins = data;
                that.fetchGrades();
            },
            error: function (data) {
                alert('Error fetching list of processes.');
            }
        });
    }

    fetchGrades() {
        var that = this;
        this.gradeModel.fetch({
            success: function (data) {
                that.grades = data;
                that.fetchProcesses();
            },
            error: function (data) {
                alert('Error fetching list of processes.');
            }
        });
    }

    fetchProcesses() {
        var that = this;
        this.processModel.fetch({
            success: function (data) {
                that.processes = data;
                that.fetchProcessJoins();
            },
            error: function (data) {
                alert('Error fetching list of processes.');
            }
        });
    }

    fetchProcessJoins() {
        var that = this;
        this.processJoinModel.fetch({
            success: function (data) {
                that.processJoins = data;
                that.fetchPits();
            },
            error: function (data) {
                alert('Error fetching list of process joins.');
            }
        });
    }

    fetchPits() {
        var that = this;
        this.pitModel.fetch({
            success: function (data) {
                that.pits = data;
                that.fetchPitGroups();
            },
            error: function (data) {
                alert('Error fetching list of pits.');
            }
        });
    }

    fetchPitGroups() {
        var that = this;
        this.pitGroupModel.fetch({
            success: function (data) {
                that.pitGroups = data;
                that.fetchGradeConstraints();
            },
            error: function (data) {
                alert('Error fetching list of pit groups.');
            }
        });
    }

    fetchGradeConstraints() {
        var that = this;
        this.gradeConstraintModel.fetch({
            success: function (data) {
                that.gradeConstraints = data;
                that.initializeGrid(data);
            },
            error: function () {
                alert('Failed to fetch process constraints.');
            }
        });
    }

    initializeGrid(dataObject) {
        var that = this;
        var row = '';
        for (var i = 0; i < dataObject.length; i++) {
            var gradeConstraint = dataObject[i];
            row += (
                '<tr>' +
                '<td>' + gradeConstraint.productJoinName + '</td>'
            )
            row += '<td>' + gradeConstraint.inUse + '</td>';
            row += '<td>' + gradeConstraint.selectedGradeName + '</td>';
            row += '<td>' + gradeConstraint.selectorName + '</td>';
            row += '<td>' + gradeConstraint.isMax + '</td>';
            var constraintData = gradeConstraint.constraintData;
            var scenarioStartYear = this.scenario.startYear;
            var scenarioTimePeriod = this.scenario.timePeriod;
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
                "grouping": function (column, row) {
                    var groupName = row.selectorName;
                    if (!groupName) {
                        groupName = 'NONE';
                    }
                    var tableRow = (
                        '<select class="constraint_grouping" value="test">' +
                        '<option selected disabled hidden>' + groupName + '</option>'
                    );
                    tableRow += '<option data-grouping-name="" data-grouping-type="0">' + 'NONE' + '</option>';
                    that.processJoins.forEach(function (processJoin) {
                        tableRow += '<option data-grouping-name="' + processJoin.name + '" data-grouping-type="1">' + processJoin.name + '</option>';
                    });
                    that.processes.forEach(function (process) {
                        tableRow += '<option data-grouping-name="' + process.name + '" data-grouping-type="2">' + process.name + '</option>';
                    });
                    that.pits.forEach(function (pit) {
                        tableRow += '<option data-grouping-name="' + pit.pitName + '" data-grouping-type="3">' + pit.pitName + '</option>';
                    });
                    that.pitGroups.forEach(function (pitGroup) {
                        tableRow += '<option data-grouping-name="' + pitGroup.name + '" data-grouping-type="4">' + pitGroup.name + '</option>';
                    });
                    tableRow += '</select>';
                    return tableRow;
                },
                "grade": function (column, row) {
                    var gradeName = row.selectedGradeName;
                    if (!gradeName) {
                        gradeName = 'NONE';
                    }
                    var tableRow = (
                        '<select class="constraint_grouping" value="test">' +
                        '<option selected disabled hidden>' + gradeName + '</option>'
                    );
                    tableRow += '<option data-grade-name="" data-grade-type="-1">' + 'NONE' + '</option>';
                    /*that.grades.forEach(function (grade) {
                     tableRow += '<option data-grade-name="' + grade.name + '" data-grade-type="0">' + grade.name + '</option>';
                     });*/
                    /*that.processes.forEach(function (process) {
                     tableRow += '<option data-grade-name="' + process.name + '" data-grade-type="1">' + process.name + '</option>';
                     });*/
                    tableRow += '</select>';
                    return tableRow;
                },
                "productJoin": function (column, row) {
                    var productJoinName = row.productJoinName;
                    if (!productJoinName) {
                        productJoinName = 'NONE';
                    }
                    var tableRow = (
                        '<select class="constraint_grouping" value="test">' +
                        '<option selected disabled hidden>' + productJoinName + '</option>'
                    );
                    /*tableRow += '<option data-grade-name="" data-grade-type="-1">' + 'NONE' + '</option>';*/
                    that.productJoins.forEach(function (productJoin) {
                        tableRow += '<option data-join-name="' + productJoin.name + '">' + productJoin.name + '</option>';
                    });
                    /*that.processes.forEach(function (process) {
                     tableRow += '<option data-grade-name="' + process.name + '" data-grade-type="1">' + process.name + '</option>';
                     });*/
                    tableRow += '</select>';
                    return tableRow;
                },
                "values": function (column, row) {
                    var yearlyValue = row[column.id] || row.constraintData[column.id]
                    return (
                        '<input class="value" data-year="' + column.id + '" type="text" value="' + yearlyValue + '"' + '>'
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
                },
                "isMax": function (column, row) {
                    var type;
                    if (row.isMax.toString() === 'true') {
                        type = 'Max';
                    } else {
                        type = 'Min';
                    }
                    return (
                    '<select value="test"  style="max-width: 120px">' +
                    '<option selected disabled hidden>' + type + '</option>' +
                    '<option data-isMax="true" value="max">MAX</option>' +
                    '<option data-isMax="false" value="min">MIN</option>' +
                    '</select>') ;
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
        var $addButton = $('<button type="button" class="btn btn-default" data-toggle="modal" data-target="#modelDefinitionModal"></button>');
        $addButton.append('<span class="glyphicon glyphicon-plus"></span>');

        var $removeButton = $('<button type="button" class="btn btn-default"></button>');
        $removeButton.append('<span class="glyphicon glyphicon-trash"></span>');

        this.$el.find(".actionBar").append($addButton);
        this.$el.find(".actionBar").append($removeButton);

        $removeButton.click(function(){
            that.deleteRows();
        });
        this.$el.find('#addScenario').click(function(){
            that.addRowToGrid();
        });
    }

    loadScenario(scenarioName) {
        this.$el.find('#scenario_name').val(scenarioName);
    }

    addRowToGrid() {
        var scenarioName = this.$el.find('#new_scenario_name').val();
        var startYear = this.$el.find('#start_year').val();
        var timePeriod = this.$el.find('#time_period').val();
        var discountFactor = this.$el.find('#discount_factor').val();

        if(scenarioName && startYear && timePeriod && discountFactor) {
            this.$el.find("#datatype-grid-basic").bootgrid("append", [{
                name: scenarioName,
                id: -1,
                startYear: startYear,
                timePeriod: timePeriod,
                discountFactor: discountFactor
            }]);
            //this.$el.find('#model_name').val('');
            this.$el.find('#new_scenario_name').val('');
            this.$el.find('#start_year').val('');
            this.$el.find('#time_period').val('');
            this.$el.find('#discount_factor').val('');
        }
    }

    deleteRows(rowIds) {
        this.$el.find("#datatype-grid-basic").bootgrid("remove");
    }
}
