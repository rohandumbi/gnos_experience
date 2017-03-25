import { View } from '../core/view';
import { GradeConstraintModel } from '../models/gradeConstraintModel';
import {ProcessModel} from '../models/processModel';
import {ProcessJoinModel} from '../models/processJoinModel';
import {PitModel} from '../models/pitModel';
import {PitGroupModel} from '../models/pitGroupModel';
import {ProductJoinModel} from '../models/productJoinModel';
import {GradeModel} from '../models/gradeModel';
import {ProductGradeModel} from '../models/productGradeModel'

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
        if (this.scenario.timePeriod > 4) {
            this.$el.find("#datatype-grid-basic").addClass('long-grid');
        }
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
            row += '<td>' + true + '</td>'
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
                "commands": function (column, row) {
                    return "<button type=\"button\" class=\"btn btn-xs btn-default command-edit glyphicon glyphicon-edit copy-forward\" data-row-id=\"" + row.id + "\"><span class=\"fa fa-pencil\"></span></button> ";
                },
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
                        '<select class="constraint_grade" value="test">' +
                        '<option selected disabled hidden>' + gradeName + '</option>'
                    );
                    //that.fetchGradeListForProductJoin(row.productJoinName, $(tableRow));
                    /*that.grades.forEach(function (grade) {
                        tableRow += '<option data-grade-name="' + grade.name + '" data-grade-type="0">' + grade.name + '</option>';
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
                        '<select class="product_join" value="test">' +
                        '<option selected disabled hidden>' + productJoinName + '</option>'
                    );
                    that.productJoins.forEach(function (productJoin) {
                        tableRow += '<option data-join-name="' + productJoin.name + '">' + productJoin.name + '</option>';
                    });
                    tableRow += '</select>';
                    return tableRow;
                },
                "values": function (column, row) {
                    var yearlyValue = row[column.id] || row.constraintData[column.id]
                    return (
                        '<input style="width:80px" class="value" data-year="' + column.id + '" type="text" value="' + yearlyValue + '"' + '>'
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
                    '<select class="isMax" value="test"  style="max-width: 120px">' +
                    '<option selected disabled hidden>' + type + '</option>' +
                    '<option data-is-max="true" value="max">Max</option>' +
                    '<option data-is-max="false" value="min">Min</option>' +
                    '</select>') ;
                }
            }
        }).on("loaded.rs.jquery.bootgrid", function()
        {
            var _ = require('underscore');

            that.$el.find("#tableBody tr").each(function (i, row) {
                var productJoinName = $(row).find('.product_join').find('option:checked').val();
                var $gradeSelect = $(row).find('.constraint_grade');
                that.fetchGradeListForProductJoin(productJoinName, $gradeSelect);
            });

            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');

            that.grid.find('.copy-forward').click(function (event) {
                var $values = $(this).closest('tr').find('.value');
                var firstValue = $values.first().val();
                console.log('First value: ' + $values[0]);
                $values.val(firstValue);
                $values.trigger('change');
            });

            that.grid.find('.value').change(function (e) {
                that.updateValues($(this));
            });

            that.grid.find(".use").change(function (event) {
                that.updateInUse($(this));
            });

            that.grid.find('.constraint_grouping').change(function () {
                that.updateGrouping($(this));
            });

            that.grid.find('.product_join').change(function () {
                var self = this;
                that.updateProductJoin($(this));
                var $grade = $(this).closest('tr').find('.constraint_grade'); // as soon as a new product join is selected, grade shout be set to NONE
                //$grade.val('NONE');
                $grade.html('');
                //that.updateGrade($grade);
                var index = $grade.closest('tr').data('row-id');
                var gradeConstraint = that.gradeConstraints[index];
                gradeConstraint['selectedGradeName'] = '';
                //gradeConstraint['selectorName'] = $grouping.find('option:checked').data('grouping-name');
                console.log(gradeConstraint);
                that.updateConstraint({
                    gradeConstraint: gradeConstraint, success: function (data) {
                        that.fetchGradeListForProductJoin($(self).find('option:checked').val(), $grade, true);
                    }
                });
            });


            /*that.grid.find('.constraint_grade').data('open',false);
             that.grid.find('.constraint_grade').click( function() {
             if ( $(this).data('open') == false ) {
             $(this).data('open', true);
             $(document).mouseup( _.bind(that.waitForCloseClick, this) );
             //alert('Opening');
             var productJoinName = $(this).closest('tr').find('.product_join').find('option:checked').val();
             that.fetchGradeListForProductJoin(productJoinName, $(this));
             } else {
             $(this).data('open', false );
             }
             });*/
            /* that.grid.find('.constraint_grade').change(function () {
             that.updateGrade($(this));
             });*/

            that.grid.find('.constraint_grade').change(function () {
                that.updateGrade($(this));
            });

            that.grid.find('.isMax').change(function () {
                that.updateIsMax($(this));
            });

        });
        var $addButton = $('<button type="button" class="btn btn-default"></button>');
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

    fetchGradeListForProductJoin(productJoinName, $select, isUpdate) {
        var that = this;
        //$select.html('');
        this.productJoinModel.fetch({
            success: function (data) {
                that.productJoins = data;
                that.productJoins.forEach(function (productJoin) {
                    if (productJoin.name === productJoinName) {
                        /*productJoin.productList.forEach(function (associatedProductName) {
                         that.fetchGradeListForProduct(associatedProductName, $select);
                         });*/
                        var firstProduct = productJoin.productList[0];// since in a product join all products will have same grades
                        that.fetchGradeListForProduct(firstProduct, $select, isUpdate);
                    }
                });
            },
            error: function (data) {
                alert('Error fetching product joins.');
            }
        });
    }

    fetchGradeListForProduct(productName, $select, isUpdate) {
        var that = this;
        this.productGradeModel = new ProductGradeModel({
            projectId: this.projectId,
            productName: productName
        });
        this.productGradeModel.fetch({
            success: function (data) {
                var associatedGrades = data;
                //var options = '<option selected disabled hidden>' + 'NONE' + '</option>';
                var options = '';
                if (isUpdate) {
                    options = '<option selected disabled hidden>' + 'NONE' + '</option>';
                }
                associatedGrades.forEach(function (associatedGrade) {
                    //listGroup += '<li class="list-group-item">' + associatedGrade.name + '</li>'
                    options += '<option data-grade-name="' + associatedGrade.name + '">' + associatedGrade.name + '</option>'
                });
                $select.append(options);
            },
            error: function (data) {
                alert('Error fetching list of associated grades');
            }
        });
    }

    updateValues($row) {
        var index = $row.closest('tr').data('row-id');
        var year = $row.data('year');
        var value = $row.val();
        var gradeConstraint = this.gradeConstraints[index];
        gradeConstraint.constraintData[year] = parseFloat(value);
        console.log(gradeConstraint);
        this.updateConstraint({gradeConstraint: gradeConstraint});
    }

    updateInUse($row) {
        var index = $row.closest('tr').data('row-id');
        var inUse = $row.is(':checked');
        var gradeConstraint = this.gradeConstraints[index];
        gradeConstraint['inUse'] = inUse;
        console.log(gradeConstraint);
        this.updateConstraint({gradeConstraint: gradeConstraint});
    }

    updateProductJoin($productJoin) {
        var index = $productJoin.closest('tr').data('row-id');
        var gradeConstraint = this.gradeConstraints[index];
        gradeConstraint['productJoinName'] = $productJoin.find('option:checked').val();
        //gradeConstraint['selectorName'] = $grouping.find('option:checked').data('grouping-name');
        console.log(gradeConstraint);
        this.updateConstraint({gradeConstraint: gradeConstraint});
    }

    updateGrade($grade) {
        var index = $grade.closest('tr').data('row-id');
        var gradeConstraint = this.gradeConstraints[index];
        gradeConstraint['selectedGradeName'] = $grade.find('option:checked').val() || '';
        //gradeConstraint['selectorName'] = $grouping.find('option:checked').data('grouping-name');
        console.log(gradeConstraint);
        this.updateConstraint({gradeConstraint: gradeConstraint});
    }

    updateGrouping($grouping) {
        var index = $grouping.closest('tr').data('row-id');
        var gradeConstraint = this.gradeConstraints[index];
        gradeConstraint['selectionType'] = $grouping.find('option:checked').data('grouping-type');
        gradeConstraint['selectorName'] = $grouping.find('option:checked').data('grouping-name');
        console.log(gradeConstraint);
        this.updateConstraint({gradeConstraint: gradeConstraint});
    }

    updateIsMax($isMax) {
        var index = $isMax.closest('tr').data('row-id');
        var gradeConstraint = this.gradeConstraints[index];
        var isMax = ($isMax.find('option:checked').data('is-max').toString() === "true");
        gradeConstraint['isMax'] = isMax;
        //processConstraint['selector_name'] = $grouping.find('option:checked').data('grouping-name');
        console.log(gradeConstraint);
        this.updateConstraint({gradeConstraint: gradeConstraint});
    }

    updateConstraint(options) {
        this.gradeConstraintModel.update({
            url: 'http://localhost:4567/gradeconstraints',
            id: options.gradeConstraint.id,
            dataObject: options.gradeConstraint,
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

    addRowToGrid() {
        var that = this;
        var newGradeConstraint = {};
        newGradeConstraint['productJoinName'] = '';
        newGradeConstraint['selectedGradeName'] = '';
        newGradeConstraint['selectorName'] = 'NONE';
        newGradeConstraint['selectionType'] = 0;
        newGradeConstraint['inUse'] = true;
        newGradeConstraint['isMax'] = true;

        var constraintData = {}
        var startYear = this.scenario.startYear;
        var timePeriod = this.scenario.timePeriod;
        for (var i = 0; i < timePeriod; i++) {
            var presentYear = startYear + i;
            constraintData[presentYear.toString()] = 0;
        }
        newGradeConstraint['constraintData'] = constraintData;
        console.log(newGradeConstraint);
        this.gradeConstraintModel.add({
            dataObject: newGradeConstraint,
            success: function (data) {
                alert('added new data');
                that.gradeConstraints.push(data);
                that.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
            },
            error: function (data) {
                alert('Error creating opex data');
            }

        });
    }

    deleteRows(rowIds) {
        this.$el.find("#datatype-grid-basic").bootgrid("remove");
    }
}
