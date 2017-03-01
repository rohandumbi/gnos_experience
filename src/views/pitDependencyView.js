import {View} from '../core/view';
import {PitDependencyModel} from '../models/pitDependencyModel';
import {PitModel} from '../models/pitModel';
import {BenchModel} from '../models/benchModel';

export class PitDependencyView extends View {

    constructor(options) {
        super();
        if (!options.scenario) alert('Load a scenario');
        this.projectId = options.projectId;
        this.scenario = options.scenario;
        this.pitModel = new PitModel({projectId: this.projectId})
        this.pitDependencyModel = new PitDependencyModel({projectId: this.projectId, scenario: this.scenario});
    }

    getHtml() {
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/pitDependencyView.html", function (data) {
                resolve(data);
            })
        });
        return promise;
    }

    fetchPitList() {
        var that = this;
        this.pitModel.fetch({
            success: function (data) {
                that.pits = data;
                that.pits.forEach(function (pit) {
                    that.fetchBenchesForPit(pit);
                    //pit['associatedBenches'] = benchList;
                });
                that.fetchPitDependency();
            },
            error: function (data) {
                alert('Error fetching pit list.');
            }
        });


    }

    fetchPitDependency() {
        var that = this;
        this.pitDependencyModel.fetch({
            success: function (data) {
                that.pitDependency = data;
                that.initializeGrid(data);
            },
            error: function (data) {
                alert('Error fetching pit dependency data ' + data);
            }
        });
    }

    fetchBenchesForPit(pit) {
        this.benchModel = new BenchModel({projectId: this.projectId, pitNo: pit.pitNo});
        this.benchModel.fetch({
            success: function (data) {
                return pit['associatedBenches'] = data;
            },
            error: function (data) {
                alert('Error fetching list of benches: ' + data);
            }
        });
    }

    getDescriptionForRow(row) {
        //var rowNumber = $(row).closest('tr').data('row-id');
        return 'Hello first pit: ' + row.firstPitName;
    }

    getPitByName(pitName) {
        var object = null;
        this.pits.forEach(function (pit) {
            if (pit.pitName === pitName) {
                object = pit;
            }
        })
        return object;
    }

    onDomLoaded() {
        this.$el.find('#scenario_name').val(this.scenario.name);
        this.fetchPitList();
    }

    initializeGrid(modelData) {
        var that = this;
        var row = '';
        for (var i = 0; i < modelData.length; i++) {
            var pitDependency = modelData[i];
            row += (
                '<tr>' +
                '<td>' + pitDependency.firstPitName + '</td>' +
                '<td>' + pitDependency.firstPitAssociatedBench + '</td>' +
                '<td>' + pitDependency.dependentPitName + '</td>' +
                '<td>' + pitDependency.dependentPitAssociatedBench + '</td>' +
                '<td>' + pitDependency.inUse + '</td>' +
                '<td>' + pitDependency.minLead + '</td>' +
                '<td>' + pitDependency.maxLead + '</td>' +
                '<td>' + '' + '</td>' +
                '</tr>'
            )
        }
        this.$el.find("#tableBody").append($(row));
        this.grid = this.$el.find("#datatype-grid-basic").bootgrid({
            rowCount: [15, 10, 20, 25],
            selection: true,
            multiSelect: true,
            rowSelect: true,
            keepSelection: true,
            formatters: {
                "first_pit": function (column, row) {
                    var firstPitName = row.firstPitName;
                    var tableRow = '';
                    tableRow = (
                        '<select class="first_pit" value="test">' +
                        '<option selected disabled hidden>' + firstPitName + '</option>'
                    );
                    that.pits.forEach(function (pit) {
                        tableRow += '<option data-pit-no="' + pit.pitNo + '">' + pit.pitName + '</option>';
                    });
                    tableRow += '</select>';
                    return tableRow;
                },
                "dependent_pit": function (column, row) {
                    var dependentPitName = row.dependentPitName;
                    var tableRow = '';
                    tableRow = (
                        '<select class="first_pit" value="test">' +
                        '<option selected disabled hidden>' + dependentPitName + '</option>'
                    );
                    that.pits.forEach(function (pit) {
                        tableRow += '<option data-pit-no="' + pit.pitNo + '">' + pit.pitName + '</option>';
                    });
                    tableRow += '</select>';
                    return tableRow;
                },
                "in_use": function (column, row) {
                    if (row.inUse.toString() === 'true') {
                        return (
                            '<input class="use" type="checkbox" value="' + row.inUse + '"' + 'checked  >'
                        )
                    } else {
                        return (
                            '<input class="use" type="checkbox" value="' + row.inUse + '"' + '>'
                        )
                    }
                },
                "min_lead": function (column, row) {
                    var minLead = (row.minLead < 0 ) ? '' : row.minLead;
                    return (
                        '<input class="min_lead" type="text" value="' + minLead + '"' + '>'
                    );
                },
                "max_lead": function (column, row) {
                    var maxLead = (row.maxLead < 0 ) ? '' : row.maxLead;
                    return (
                        '<input class="min_lead" type="text" value="' + maxLead + '"' + '>'
                    );
                },
                "first_pit_bench": function (column, row) {
                    //var expression = that.getExpressionById(row.expressionId);
                    var benchName = row.firstPitAssociatedBench;
                    if (benchName.toString() === 'undefined') {
                        benchName = '';
                    }
                    var tableRow = (
                        '<select class="expression" value="test">' +
                        '<option selected disabled hidden>' + benchName + '</option>'
                    );
                    var firstPitName = row.firstPitName;
                    var pit = that.getPitByName(firstPitName);
                    pit.associatedBenches.forEach(function (bench) {
                        tableRow += '<option data-pit-name="' + firstPitName + '" data-bench-no="' + bench.benchName + '">' + bench.benchName + '</option>';
                    });

                    tableRow += '</select>';
                    return tableRow;
                },
                "dependent_pit_bench": function (column, row) {
                    var benchName = row.dependentPitAssociatedBench;
                    if (benchName.toString() === 'undefined') {
                        benchName = '';
                    }
                    var tableRow = (
                        '<select class="expression" value="test">' +
                        '<option selected disabled hidden>' + benchName + '</option>'
                    );
                    var dependentPitName = row.dependentPitName;
                    var pit = that.getPitByName(dependentPitName);
                    pit.associatedBenches.forEach(function (bench) {
                        tableRow += '<option data-pit-name="' + dependentPitName + '" data-bench-no="' + bench.benchName + '">' + bench.benchName + '</option>';
                    });

                    tableRow += '</select>';
                    return tableRow;
                },
                "description": function (column, row) {
                    var description = that.getDescriptionForRow(row);
                    return (
                        '<input class="description" type="text" value="' + description + '"' + '>'
                    );
                }
            }
        }).on("loaded.rs.jquery.bootgrid", function () {
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');
            that.grid.find(".expression_definition").change(function (event) {
                //alert($(this).data('expression-name'));
                var expressionName = $(this).data('expression-name');
                var exprValue = $(this).val();
                that.updateExpressionDefinition({name: expressionName, exprvalue: exprValue});
            });
            that.grid.find(".expression_filter").change(function (event) {
                var expressionName = $(this).data('expression-name');
                var filterValue = $(this).val();
                that.updateExpressionFilter({name: expressionName, filter: filterValue});
            });
            that.grid.find(".expression_isgrade").change(function (event) {
                var expressionName = $(this).data('expression-name');
                var expressionIsGrade = $(this).is(':checked');
                that.upgradeExpressionGrade({name: expressionName, isGrade: expressionIsGrade});
            });
        });
        var $addButton = $('<button type="button" class="btn btn-default" data-toggle="modal" data-target="#expressionDefinitionModal"></button>');
        $addButton.append('<span class="glyphicon glyphicon-plus"></span>');

        var $removeButton = $('<button type="button" class="btn btn-default"></button>');
        $removeButton.append('<span class="glyphicon glyphicon-trash"></span>');

        this.$el.find(".actionBar").append($addButton);
        this.$el.find(".actionBar").append($removeButton);
        /*$addButton.click(function(){
         that.addRowToGrid();
         });*/
        $removeButton.click(function () {
            that.deleteRows();
        });
        this.$el.find('#addModel').click(function () {
            that.addRowToGrid();
        });

    }

    updateExpressionFilter(options) {
        var updatedExpression = this.getExpressionByName(options.name);
        updatedExpression['filter'] = options.filter;
        this.model.update({
            id: updatedExpression.id,
            url: 'http://localhost:4567/expressions',
            dataObject: updatedExpression,
            success: function (data) {
                alert('Successfully updated');
            },
            error: function (data) {
                alert('Failed to update: ' + data);
            }
        });
    }

    updateExpressionDefinition(options) {
        var updatedExpression = this.getExpressionByName(options.name);
        updatedExpression['exprvalue'] = options.exprvalue;
        this.model.update({
            id: updatedExpression.id,
            url: 'http://localhost:4567/expressions',
            dataObject: updatedExpression,
            success: function (data) {
                alert('Successfully updated');
            },
            error: function (data) {
                alert('Failed to update: ' + data);
            }
        });
    }

    upgradeExpressionGrade(options) {
        var updatedExpression = this.getExpressionByName(options.name);
        updatedExpression['isGrade'] = options.isGrade;
        this.model.update({
            id: updatedExpression.id,
            url: 'http://localhost:4567/expressions',
            dataObject: updatedExpression,
            success: function (data) {
                alert('Successfully updated');
            },
            error: function (data) {
                alert('Failed to update: ' + data);
            }
        });
    }

    addRowToGrid() {
        var that = this;
        var expressionName = this.$el.find('#expression_name').val();
        var isGrade = this.$el.find('#expression_isGrade').is(':checked');
        var isComplex = this.$el.find('#expression_isComplex').is(':checked');
        var expressionDefinition = this.$el.find('#expression_definition').val();
        var expressionFilter = this.$el.find('#expression_filter').val();
        if (expressionName && expressionDefinition) {
            console.log(expressionName + '-' + isGrade + '-' + expressionDefinition + '-' + expressionFilter + '-' + isComplex);
            var newExpression = {
                name: expressionName,
                isGrade: isGrade || false,
                isComplex: isComplex || false,
                exprvalue: expressionDefinition,
                filter: expressionFilter
            }
            this.model.add({
                dataObject: newExpression,
                success: function (data) {
                    alert('Successfully added expression');
                    that.data.push(data);
                    that.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
                },
                error: function (data) {
                    alert('Failed to add expression ' + data);
                }

            });
        } else {
            alert('Model name/definition missing');
        }
        this.clearDialog();
    }

    clearDialog() {
        this.$el.find('#expression_name').val('');
        this.$el.find('#expression_isGrade').prop("checked", !this.$el.find('#expression_isGrade').prop("checked"));
        this.$el.find('#expression_isComplex').prop("checked", !this.$el.find('#expression_isComplex').prop("checked"));
        this.$el.find('#expression_definition').val('');
        this.$el.find('#expression_filter').val('');
    }

    deleteRows() {
        var selectedRows = this.$el.find("#datatype-grid-basic").bootgrid("getSelectedRows");
        var that = this;
        selectedRows.forEach(function (selectedRow) {
            var deletedExpression = that.getExpressionByName(selectedRow);
            console.log(deletedExpression);
            that.model.delete({
                url: 'http://localhost:4567/expressions',
                id: deletedExpression.id,
                success: function (data) {
                    alert('Successfully deleted expression.');
                },
                error: function (data) {
                    alert('Failed to delete expression.');
                }
            });
        });
        this.$el.find("#datatype-grid-basic").bootgrid("remove");
    }

    getExpressionByName(expressionName) {
        var object;
        this.data.forEach(function (data) {
            if (data.name === expressionName) {
                object = data;
            }
        });
        return object;
    }
}
