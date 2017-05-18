import { View } from '../core/view';
import { ProcessConstraintModel } from '../models/processConstraintModel';
import {ProcessModel} from '../models/processModel';
import {ProcessJoinModel} from '../models/processJoinModel';
import {PitModel} from '../models/pitModel';
import {PitGroupModel} from '../models/pitGroupModel';
import {ExpressionModel} from '../models/expressionModel';
import {UnitModel} from '../models/unitModel';
import {ProductModel} from '../models/productModel';
import {ProductJoinModel} from '../models/productJoinModel';

export class ProcessConstraintView extends View{

    constructor(options) {
        super();
        if (!options.scenario) alert('Load a scenario');
        this.projectId = options.projectId;
        this.scenario = options.scenario;
        this.processConstraintModel = new ProcessConstraintModel({projectId: this.projectId, scenario: this.scenario});
        this.processModel = new ProcessModel({projectId: this.projectId});
        this.processJoinModel = new ProcessJoinModel({projectId: this.projectId});
        this.pitModel = new PitModel({projectId: this.projectId});
        this.pitGroupModel = new PitGroupModel({projectId: this.projectId});
        this.expressionModel = new ExpressionModel({projectId: this.projectId});
        this.productModel = new ProductModel({projectId: this.projectId});
        this.productJoinModel = new ProductJoinModel({projectId: this.projectId});
        this.unitModel = new UnitModel({projectId: this.projectId});
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/processConstraintView.html", function( data ) {
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
        this.fetchUnits();
        if (this.scenario.timePeriod > 4) {
            this.$el.find("#datatype-grid-basic").addClass('long-grid');
        }
    }

    fetchUnits() {
        var that = this;
        this.unitModel.fetch({
            success: function (data) {
                that.units = data;
                that.fetchExpressions();
            },
            error: function (data) {
                alert('Error fetching expression list: ' + data);
            }
        })
    }

    fetchExpressions() {
        var that = this;
        this.expressionModel.fetch({
            success: function (data) {
                that.expressions = data;
                that.fetchProducts(data);
            },
            error: function () {
                alert('Failed to fetch process constraints.');
            }
        });
    }

    fetchProducts() {
        var that = this;
        this.productModel.fetch({
            success: function (data) {
                that.products = data;
                that.fetchProductJoins(data);
            },
            error: function () {
                alert('Failed to fetch process constraints.');
            }
        });
    }

    fetchProductJoins() {
        var that = this;
        this.productJoinModel.fetch({
            success: function (data) {
                that.productJoins = data;
                that.fetchProcesses(data);
            },
            error: function () {
                alert('Failed to fetch process constraints.');
            }
        });
    }

    fetchProcessConstraints() {
        var that = this;
        this.processConstraintModel.fetch({
            success: function (data) {
                that.processConstraints = data;
                that.initializeGrid(data);
            },
            error: function () {
                alert('Failed to fetch process constraints.');
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
                that.fetchProcessConstraints();
            },
            error: function (data) {
                alert('Error fetching list of pit groups.');
            }
        });
    }

    initializeGrid(dataObject) {
        var that = this;
        //var data = this.processConstraintModel.fetch();
        var row = '';
        for (var i = 0; i < dataObject.length; i++) {
            var processConstraint = dataObject[i];
            row += (
                '<tr>' +
                '<td>' + processConstraint.id + '</td>' +
                '<td>' + processConstraint.coefficient_name + '</td>'
            )
            row += '<td>' + processConstraint.inUse + '</td>';
            row += '<td>' + processConstraint.selector_name + '</td>';
            row += '<td>' + processConstraint.isMax + '</td>';
            row += '<td>' + true + '</td>'
            var constraintData = processConstraint.constraintData;
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
                "id": function (column, row) {
                    return "<span data-contraint-id='" + row.constraintId + "'></span>"
                },
                "commands": function (column, row) {
                    return "<button type=\"button\" class=\"btn btn-xs btn-default command-edit glyphicon glyphicon-edit copy-forward\" data-row-id=\"" + row.id + "\"><span class=\"fa fa-pencil\"></span></button> ";
                },
                "grouping": function (column, row) {
                    var groupName = row.selector_name;
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
                },
                "coefficient": function (column, row) {
                    var coefficientName = row.coefficient_name;
                    if (!coefficientName) {
                        coefficientName = 'NONE';
                    }
                    var tableRow = (
                        '<select class="constraint_coefficient" value="test">' +
                        '<option selected disabled hidden>' + coefficientName + '</option>'
                    );
                    tableRow += '<option data-coefficient-name="" data-coefficient-type="0">' + 'NONE' + '</option>';
                    that.expressions.forEach(function (expression) {
                        tableRow += '<option data-coefficient-name="' + expression.name + '" data-coefficient-type="1">' + expression.name + '</option>';
                    });
                    that.products.forEach(function (product) {
                        tableRow += '<option data-coefficient-name="' + product.name + '" data-coefficient-type="2">' + product.name + '</option>';
                    });
                    that.productJoins.forEach(function (productJoin) {
                        tableRow += '<option data-coefficient-name="' + productJoin.name + '" data-coefficient-type="3">' + productJoin.name + '</option>';
                    });
                    that.units.forEach(function (unit) {
                        tableRow += '<option data-coefficient-name="' + unit.name + '" data-coefficient-type="5">' + unit.name + '</option>';
                    });
                    tableRow += '<option data-coefficient-name="Total_TH" data-coefficient-type="4">' + 'Total_TH' + '</option>';
                    tableRow += '</select>';
                    return tableRow;
                }
            }
        }).on("loaded.rs.jquery.bootgrid", function()
        {
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

            that.grid.find('.constraint_coefficient').change(function () {
                that.updateCoefficient($(this));
            });

            that.grid.find('.isMax').change(function () {
                that.updateIsMax($(this));
            });

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

    updateValues($row) {
        var index = $row.closest('tr').data('row-id');
        var year = $row.data('year');
        var value = $row.val();
        var processConstraint = this.processConstraints[index];
        processConstraint.constraintData[year] = parseFloat(value);
        console.log(processConstraint);
        this.updateConstraint({processConstraint: processConstraint});
    }

    updateInUse($row) {
        var index = $row.closest('tr').data('row-id');
        var inUse = $row.is(':checked');
        var processConstraint = this.processConstraints[index];
        processConstraint['inUse'] = inUse;
        console.log(processConstraint);
        this.updateConstraint({processConstraint: processConstraint});
    }

    updateGrouping($grouping) {
        var index = $grouping.closest('tr').data('row-id');
        var processConstraint = this.processConstraints[index];
        processConstraint['selectionType'] = $grouping.find('option:checked').data('grouping-type');
        processConstraint['selector_name'] = $grouping.find('option:checked').data('grouping-name');
        console.log(processConstraint);
        this.updateConstraint({processConstraint: processConstraint});
    }

    updateCoefficient($coefficient) {
        var index = $coefficient.closest('tr').data('row-id');
        var processConstraint = this.processConstraints[index];
        processConstraint['coefficientType'] = $coefficient.find('option:checked').data('coefficient-type');
        processConstraint['coefficient_name'] = $coefficient.find('option:checked').data('coefficient-name');
        console.log(processConstraint);
        this.updateConstraint({processConstraint: processConstraint});
    }

    updateIsMax($isMax) {
        var index = $isMax.closest('tr').data('row-id');
        var processConstraint = this.processConstraints[index];
        var isMax = ($isMax.find('option:checked').data('is-max').toString() === "true");
        processConstraint['isMax'] = isMax;
        //processConstraint['selector_name'] = $grouping.find('option:checked').data('grouping-name');
        console.log(processConstraint);
        this.updateConstraint({processConstraint: processConstraint});
    }

    updateConstraint(options) {
        this.processConstraintModel.update({
            url: 'http://localhost:4567/processconstraints',
            id: options.processConstraint.id,
            dataObject: options.processConstraint,
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
        var newProcessConstraint = {};
        newProcessConstraint['coefficient_name'] = 'NONE';
        newProcessConstraint['selector_name'] = 'NONE';
        newProcessConstraint['coefficientType'] = 0;
        newProcessConstraint['selectionType'] = 0;
        newProcessConstraint['inUse'] = true;
        newProcessConstraint['isMax'] = true;
        //newOpex['costData'] = {};
        var constraintData = {}
        var startYear = this.scenario.startYear;
        var timePeriod = this.scenario.timePeriod;
        for (var i = 0; i < timePeriod; i++) {
            var presentYear = startYear + i;
            constraintData[presentYear.toString()] = 0;
        }
        newProcessConstraint['constraintData'] = constraintData;
        console.log(newProcessConstraint);
        this.processConstraintModel.add({
            dataObject: newProcessConstraint,
            success: function (data) {
                alert('added new data');
                that.processConstraints.push(data);
                that.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
            },
            error: function (data) {
                alert('Error creating opex data');
            }

        });
    }

    deleteRows(rowIds) {
        var selectedRowIds = this.$el.find("#datatype-grid-basic").bootgrid("getSelectedRows");
        var that = this;
        selectedRowIds.forEach(function (selectedRowId) {
            //var deletedExpression = that.getExpressionByName(selectedRow);
            console.log(selectedRowId);
            that.processConstraintModel.delete({
                url: 'http://localhost:4567/processconstraints',
                id: selectedRowId,
                success: function (data) {
                    alert('Successfully deleted constraint.');
                },
                error: function (data) {
                    alert('Failed to delete constraint.');
                }
            });
        });
        this.$el.find("#datatype-grid-basic").bootgrid("remove");
    }
}
