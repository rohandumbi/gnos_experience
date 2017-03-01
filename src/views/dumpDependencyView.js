import {View} from '../core/view';
import {DumpDependencyModel} from '../models/dumpDependencyModel';
import {PitModel} from '../models/pitModel';
import {DumpModel} from '../models/dumpModel';
import {BenchModel} from '../models/benchModel';

export class DumpDependencyView extends View {

    constructor(options) {
        super();
        if (!options.scenario) alert('Load a scenario');
        this.projectId = options.projectId;
        this.scenario = options.scenario;
        this.pitModel = new PitModel({projectId: this.projectId});
        this.dumpModel = new DumpModel({projectId: this.projectId});
        //this.pitDependencyModel = new PitDependencyModel({projectId: this.projectId, scenario: this.scenario});
        this.dumpDependencyModel = new DumpDependencyModel({projectId: this.projectId, scenario: this.scenario});
    }

    getHtml() {
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/dumpDependencyView.html", function (data) {
                resolve(data);
            })
        });
        return promise;
    }

    fetchDumpList() {
        var that = this;
        this.dumpModel.fetch({
            success: function (data) {
                that.dumps = data;
                that.fetchPitList();
            },
            error: function (data) {
                alert('Error fetching list of dumps');
            }
        })
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
                that.fetchDumpDependency();
                var firstPitOptions = (
                    '<select id="first_pit" class="pit-name form-control" value="test">' + '<option selected disabled hidden>' + '' + '</option>'
                );
                var dependentPitOptions = (
                    '<select id="dependent_pit" class="pit-name form-control" value="test">' + '<option selected disabled hidden>' + '' + '</option>'
                );
                that.pits.forEach(function (pit) {
                    firstPitOptions += '<option data-pit-name="' + pit.pitName + '" data-pit-no="' + pit.pitNo + '">' + pit.pitName + '</option>';
                    dependentPitOptions += '<option data-pit-name="' + pit.pitName + '" data-pit-no="' + pit.pitNo + '">' + pit.pitName + '</option>';
                });
                firstPitOptions += '</select>';
                dependentPitOptions += '</select>';
                that.$el.find('#first_pit_list').append(firstPitOptions);
                that.$el.find('#dependent_pit_list').append(dependentPitOptions);
            },
            error: function (data) {
                alert('Error fetching pit list.');
            }
        });


    }

    fetchDumpDependency() {
        var that = this;
        this.dumpDependencyModel.fetch({
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
        return 'Hello dump: ' + row.dependentDumpName;
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
        this.fetchDumpList();
    }

    initializeGrid(modelData) {
        var that = this;
        var row = '';
        for (var i = 0; i < modelData.length; i++) {
            var dumpDependency = modelData[i];
            row += (
                '<tr>' +
                '<td>' + dumpDependency.firstPitName + '</td>' +
                '<td>' + dumpDependency.firstDumpName + '</td>' +
                '<td>' + dumpDependency.dependentDumpName + '</td>' +
                '<td>' + dumpDependency.inUse + '</td>' +
                '<td>' + dumpDependency.description + '</td>' +
                '<td>' + '' + '</td>' +
                '</tr>'
            )
        }
        this.$el.find("#tableBody").append($(row));
        if (this.grid) {
            this.grid.remove();
        }
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
                        '<select class="dependent_pit" value="test">' +
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
                            '<input class="in_use" type="checkbox" value="' + row.inUse + '"' + 'checked  >'
                        )
                    } else {
                        return (
                            '<input class="in_use" type="checkbox" value="' + row.inUse + '"' + '>'
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
                        '<input class="max_lead" type="text" value="' + maxLead + '"' + '>'
                    );
                },
                "first_pit_bench": function (column, row) {
                    //var expression = that.getExpressionById(row.expressionId);
                    var benchName = row.firstPitAssociatedBench;
                    if (!benchName || benchName.toString() === 'undefined') {
                        benchName = '';
                    }
                    var tableRow = (
                        '<select class="first_pit_bench" value="test">' +
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
                    if (!benchName || benchName.toString() === 'undefined') {
                        benchName = '';
                    }
                    var tableRow = (
                        '<select class="dependent_pit_bench" value="test">' +
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
            that.grid.find(".first_pit").change(function (event) {
                var index = $(this).closest('tr').data('row-id');
                var firstPitName = $(this).find(":selected").val();
                var $associatedBench = $(this).closest('tr').find('.first_pit_bench');
                $associatedBench.val('');
                var pit = that.getPitByName(firstPitName);
                var selectOptions = '<option selected disabled hidden>' + '' + '</option>';
                pit.associatedBenches.forEach(function (bench) {
                    selectOptions += '<option data-pit-name="' + firstPitName + '" data-bench-no="' + bench.benchName + '">' + bench.benchName + '</option>';
                });
                $associatedBench.html(selectOptions);
                that.updateFirstPit({index: index, firstPitName: firstPitName});
            });
            that.grid.find(".dependent_pit").change(function (event) {
                var index = $(this).closest('tr').data('row-id');
                var dependentPitName = $(this).find(":selected").val();
                var $associatedBench = $(this).closest('tr').find('.dependent_pit_bench');
                $associatedBench.val('');
                var pit = that.getPitByName(dependentPitName);
                var selectOptions = '<option selected disabled hidden>' + '' + '</option>';
                pit.associatedBenches.forEach(function (bench) {
                    selectOptions += '<option data-pit-name="' + dependentPitName + '" data-bench-no="' + bench.benchName + '">' + bench.benchName + '</option>';
                });
                $associatedBench.html(selectOptions);
                that.updateDependentPit({index: index, dependentPitName: dependentPitName});
            });
            that.grid.find(".first_pit_bench").change(function (event) {
                var index = $(this).closest('tr').data('row-id');
                var firstPitAssociatedBench = $(this).find(":selected").val();
                that.updateFirstPitAssociatedBench({index: index, firstPitAssociatedBench: firstPitAssociatedBench});
            });
            that.grid.find(".dependent_pit_bench").change(function (event) {
                var index = $(this).closest('tr').data('row-id');
                var dependentPitAssociatedBench = $(this).find(":selected").val();
                that.updateDependentPitAssociatedBench({
                    index: index,
                    dependentPitAssociatedBench: dependentPitAssociatedBench
                });
            });
            that.grid.find(".max_lead").change(function (event) {
                var index = $(this).closest('tr').data('row-id');
                var maxLead = $(this).val();
                that.updateMaxLead({index: index, maxLead: maxLead});
            });
            that.grid.find(".min_lead").change(function (event) {
                var index = $(this).closest('tr').data('row-id');
                var minLead = $(this).val();
                that.updateMinLead({index: index, minLead: minLead});
            });
            that.grid.find(".in_use").change(function (event) {
                var inUse = $(this).is(':checked');
                that.updateInUse({
                    index: $(this).closest('tr').data('row-id'),
                    inUse: inUse
                });
            });
        });
        var $addButton = $('<button type="button" class="btn btn-default" data-toggle="modal" data-target="#pitDependencyModal"></button>');
        $addButton.append('<span class="glyphicon glyphicon-plus"></span>');

        var $removeButton = $('<button type="button" class="btn btn-default"></button>');
        $removeButton.append('<span class="glyphicon glyphicon-trash"></span>');

        this.$el.find(".actionBar").append($addButton);
        this.$el.find(".actionBar").append($removeButton);

        $removeButton.click(function () {
            that.deleteRows();
        });
        this.$el.find('#addPitDependency').click(function () {
            var firstPitName = that.$el.find('select#first_pit option:checked').val();
            var dependentPitName = that.$el.find('select#dependent_pit option:checked').val();
            if (!firstPitName || !dependentPitName) {
                alert('Select a pit');
            }
            that.addRowToGrid({firstPitName: firstPitName, dependentPitName: dependentPitName});
        });

    }

    updateFirstPit(options) {
        var pitDependency = this.pitDependency[options.index];
        pitDependency['firstPitName'] = options.firstPitName;
        delete pitDependency.firstPitAssociatedBench;
        console.log(pitDependency);
        this.updatePitDependency({pitDependency: pitDependency});
    }

    updateFirstPitAssociatedBench(options) {
        var pitDependency = this.pitDependency[options.index];
        pitDependency['firstPitAssociatedBench'] = options.firstPitAssociatedBench;
        console.log(pitDependency);
        this.updatePitDependency({pitDependency: pitDependency});
    }

    updateDependentPitAssociatedBench(options) {
        var pitDependency = this.pitDependency[options.index];
        pitDependency['dependentPitAssociatedBench'] = options.dependentPitAssociatedBench;
        console.log(pitDependency);
        this.updatePitDependency({pitDependency: pitDependency});
    }

    updateDependentPit(options) {
        var pitDependency = this.pitDependency[options.index];
        pitDependency['dependentPitName'] = options.dependentPitName;
        delete pitDependency.dependentPitAssociatedBench;
        console.log(pitDependency);
        this.updatePitDependency({pitDependency: pitDependency});
    }

    updateMaxLead(options) {
        var pitDependency = this.pitDependency[options.index];
        pitDependency['maxLead'] = options.maxLead;
        console.log(pitDependency);
        this.updatePitDependency({pitDependency: pitDependency});
    }

    updateMinLead(options) {
        var pitDependency = this.pitDependency[options.index];
        pitDependency['minLead'] = options.minLead;
        console.log(pitDependency);
        this.updatePitDependency({pitDependency: pitDependency});
    }

    updateInUse(options) {
        var pitDependency = this.pitDependency[options.index];
        pitDependency['inUse'] = options.inUse;
        console.log(pitDependency);
        this.updatePitDependency({pitDependency: pitDependency});
    }

    updatePitDependency(options) {
        this.pitDependencyModel.update({
            id: options.pitDependency.id,
            url: 'http://localhost:4567/pitdependencies',
            dataObject: options.pitDependency,
            success: function (data) {
                alert('Successfully updated');
                if (options.success) {
                    options.success();
                }
            },
            error: function (data) {
                alert('Failed to update: ' + data);
                if (options.error) {
                    options.error();
                }
            }
        });
    }

    addRowToGrid(options) {
        var that = this;
        var newPitDependency = {};
        newPitDependency['firstPitName'] = options.firstPitName;
        newPitDependency['dependentPitName'] = options.dependentPitName;
        newPitDependency['maxLead'] = -1;
        newPitDependency['minLead'] = -1;
        newPitDependency['inUse'] = true;
        this.pitDependencyModel.add({
            dataObject: newPitDependency,
            success: function (data) {
                alert('added new data');
                that.pitDependency.push(data);
                that.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
            },
            error: function (data) {
                alert('Error creating bench data');
            }

        });
        this.clearDialog();
    }

    clearDialog() {
        this.$el.find('#first_pit').val('');
        this.$el.find('#dependent_pit').val('');
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