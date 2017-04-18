import {View} from '../core/view';
import {DumpDependencyModel} from '../models/dumpDependencyModel';
import {PitModel} from '../models/pitModel';
import {DumpModel} from '../models/dumpModel';
import {BenchModel} from '../models/benchModel';
import {PitGroupModel} from '../models/pitGroupModel'

export class DumpDependencyView extends View {

    constructor(options) {
        super();
        if (!options.scenario) alert('Load a scenario');
        this.projectId = options.projectId;
        this.scenario = options.scenario;
        this.pitModel = new PitModel({projectId: this.projectId});
        this.pitGroupModel = new PitGroupModel({projectId: this.projectId});
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
                that.fetchPitGroupList();
                var firstDumpOptions = (
                    '<select id="first_dump" class="dump-name form-control" value="test">' + '<option selected disabled hidden>' + '' + '</option>'
                );
                var dependentDumpOptions = (
                    '<select id="dependent_dump" class="dump-name form-control" value="test">' + '<option selected disabled hidden>' + '' + '</option>'
                );
                that.dumps.forEach(function (dump) {
                    firstDumpOptions += '<option data-dump-name="' + dump.name + '" data-dump-no="' + dump.dumpNumber + '">' + dump.name + '</option>';
                    dependentDumpOptions += '<option data-dump-name="' + dump.name + '" data-dump-no="' + dump.dumpNumber + '">' + dump.name + '</option>';
                });
                firstDumpOptions += '</select>';
                dependentDumpOptions += '</select>';
                that.$el.find('#first_dump_list').append(firstDumpOptions);
                that.$el.find('#dependent_dump_list').append(dependentDumpOptions);
            },
            error: function (data) {
                alert('Error fetching list of dumps');
            }
        })
    }

    fetchPitGroupList() {
        var that = this;
        this.pitGroupModel.fetch({
            success: function (data) {
                that.pitGroups = data;
                that.fetchPitList();
                var firstPitGroupOptions = (
                    '<select id="first_pit_group" class="pit_group-name form-control" value="test">' + '<option selected disabled hidden>' + '' + '</option>'
                );
                /*var dependentDumpOptions = (
                 '<select id="dependent_dump" class="dump-name form-control" value="test">' + '<option selected disabled hidden>' + '' + '</option>'
                 );*/
                that.pitGroups.forEach(function (pitGroup) {
                    firstPitGroupOptions += '<option data-pit-group-name="' + pitGroup.name + '" data-pit-group-no="' + pitGroup.number + '">' + pitGroup.name + '</option>';
                    //dependentDumpOptions += '<option data-dump-name="' + dump.name + '" data-dump-no="' + dump.dumpNumber + '">' + dump.name + '</option>';
                });
                firstPitGroupOptions += '</select>';
                //dependentDumpOptions += '</select>';
                that.$el.find('#first_pit_group_list').append(firstPitGroupOptions);
                //that.$el.find('#dependent_dump_list').append(dependentDumpOptions);
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
                    //dependentPitOptions += '<option data-pit-name="' + pit.pitName + '" data-pit-no="' + pit.pitNo + '">' + pit.pitName + '</option>';
                });
                firstPitOptions += '</select>';
                //dependentPitOptions += '</select>';
                that.$el.find('#first_pit_list').append(firstPitOptions);
                //that.$el.find('#dependent_pit_list').append(dependentPitOptions);
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
                that.dumpDependency = data;
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
                '<td>' + dumpDependency.firstPitGroupName + '</td>' +
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
                    if (!firstPitName || firstPitName.toString() === 'undefined') {
                        firstPitName = '';
                    }
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
                "first_pit_group": function (column, row) {
                    var firstPitGroupName = row.firstPitGroupName;
                    if (!firstPitGroupName || firstPitGroupName.toString() === 'undefined') {
                        firstPitGroupName = '';
                    }
                    var tableRow = '';
                    tableRow = (
                        '<select class="first_pit_group" value="test">' +
                        '<option selected disabled hidden>' + firstPitGroupName + '</option>'
                    );
                    that.pitGroups.forEach(function (pitGroup) {
                        tableRow += '<option>' + pitGroup.name + '</option>';
                    });
                    tableRow += '</select>';
                    return tableRow;
                },
                "first_dump": function (column, row) {
                    var firstDumpName = row.firstDumpName;
                    if (!firstDumpName || firstDumpName.toString() === 'undefined') {
                        firstDumpName = '';
                    }
                    var tableRow = '';
                    tableRow = (
                        '<select class="first_dump" value="test">' +
                        '<option selected disabled hidden>' + firstDumpName + '</option>'
                    );
                    that.dumps.forEach(function (dump) {
                        tableRow += '<option data-dump-no="' + dump.dumpNumber + '">' + dump.name + '</option>';
                    });
                    tableRow += '</select>';
                    return tableRow;
                },
                "dependent_dump": function (column, row) {
                    var dependentDumpName = row.dependentDumpName;
                    if (dependentDumpName.toString() === 'undefined') {
                        dependentDumpName = '';
                    }
                    var tableRow = '';
                    tableRow = (
                        '<select class="dependent_dump" value="test">' +
                        '<option selected disabled hidden>' + dependentDumpName + '</option>'
                    );
                    that.dumps.forEach(function (dump) {
                        tableRow += '<option data-dump-no="' + dump.dumpNumber + '">' + dump.name + '</option>';
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
            that.$el.find('#first_pit').change(function () {
                that.$el.find('#first_dump').val('');
            });
            /*that.$el.find('#first_dump').change(function () {
                that.$el.find('#first_pit').val('');
             that.$el.find('#first_pit_group').val('');
             });*/

            that.grid.find(".first_pit").change(function (event) {
                var index = $(this).closest('tr').data('row-id');
                var firstPitName = $(this).find(":selected").val();
                var $firstDump = $(this).closest('tr').find('.first_dump');
                var $firstPitGroup = $(this).closest('tr').find('.first_pit_group');

                $firstDump.val('');
                $firstPitGroup.val('');
                that.updateFirstPit({index: index, firstPitName: firstPitName});
            });

            that.grid.find(".first_pit_group").change(function (event) {
                var index = $(this).closest('tr').data('row-id');
                var firstPitGroupName = $(this).find(":selected").val();
                var $firstDump = $(this).closest('tr').find('.first_dump');
                var $firstPit = $(this).closest('tr').find('.first_pit');

                $firstDump.val('');
                $firstPit.val('');
                that.updateFirstPitGroup({index: index, firstPitGroupName: firstPitGroupName});
            });
            that.grid.find(".first_dump").change(function (event) {
                var index = $(this).closest('tr').data('row-id');
                var firstDumpName = $(this).find(":selected").val();
                var $firstPit = $(this).closest('tr').find('.first_pit');
                var $firstPitGroup = $(this).closest('tr').find('.first_pit_group');

                $firstPit.val('');
                $firstPitGroup.val('');
                that.updateFirstDump({index: index, firstDumpName: firstDumpName});
            });

            that.grid.find(".dependent_dump").change(function (event) {
                var index = $(this).closest('tr').data('row-id');
                var dependentDumpName = $(this).find(":selected").val();
                that.updateDependentDump({index: index, dependentDumpName: dependentDumpName});
            });
            that.grid.find(".in_use").change(function (event) {
                var inUse = $(this).is(':checked');
                that.updateInUse({
                    index: $(this).closest('tr').data('row-id'),
                    inUse: inUse
                });
            });
        });
        var $addButton = $('<button type="button" class="btn btn-default" data-toggle="modal" data-target="#dumpDependencyModal"></button>');
        $addButton.append('<span class="glyphicon glyphicon-plus"></span>');

        var $removeButton = $('<button type="button" class="btn btn-default"></button>');
        $removeButton.append('<span class="glyphicon glyphicon-trash"></span>');

        this.$el.find(".actionBar").append($addButton);
        this.$el.find(".actionBar").append($removeButton);

        $removeButton.click(function () {
            that.deleteRows();
        });
        this.$el.find('#addDumpDependency').click(function () {
            var firstPitName = that.$el.find('select#first_pit option:checked').val();
            var firstDumpName = that.$el.find('select#first_dump option:checked').val();
            var dependentDumpName = that.$el.find('select#dependent_dump option:checked').val();
            if (!firstPitName && !firstDumpName) {
                alert('Select first pit/dump.');
                return;
            }
            if (!dependentDumpName) {
                alert('Select dependent dump name.');
                return;
            }
            that.addRowToGrid({
                firstPitName: firstPitName,
                firstDumpName: firstDumpName,
                dependentDumpName: dependentDumpName
            });
        });

    }

    updateFirstPit(options) {
        var dumpDependency = this.dumpDependency[options.index];
        dumpDependency['firstPitName'] = options.firstPitName;
        delete dumpDependency.firstDumpName;
        delete dumpDependency.firstPitGroupName;
        console.log(dumpDependency);
        this.updateDumpDependency({dumpDependency: dumpDependency});
    }

    updateFirstPitGroup(options) {
        var dumpDependency = this.dumpDependency[options.index];
        dumpDependency['firstPitGroupName'] = options.firstPitGroupName;
        delete dumpDependency.firstDumpName;
        delete dumpDependency.firstPitName;
        console.log(dumpDependency);
        this.updateDumpDependency({dumpDependency: dumpDependency});
    }

    updateFirstDump(options) {
        var dumpDependency = this.dumpDependency[options.index];
        dumpDependency['firstDumpName'] = options.firstDumpName;
        delete dumpDependency.firstPitName;
        delete dumpDependency.firstPitGroupName;
        console.log(dumpDependency);
        this.updateDumpDependency({dumpDependency: dumpDependency});
    }

    updateDependentDump(options) {
        var dumpDependency = this.dumpDependency[options.index];
        dumpDependency['dependentDumpName'] = options.dependentDumpName;
        console.log(dumpDependency);
        this.updateDumpDependency({dumpDependency: dumpDependency});
    }

    updateInUse(options) {
        var dumpDependency = this.dumpDependency[options.index];
        dumpDependency['inUse'] = options.inUse;
        console.log(dumpDependency);
        this.updateDumpDependency({dumpDependency: dumpDependency});
    }

    updateDumpDependency(options) {
        this.dumpDependencyModel.update({
            id: options.dumpDependency.id,
            url: 'http://localhost:4567/dumpdependencies',
            dataObject: options.dumpDependency,
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
        var newDumpDependency = {};
        if (options.firstPitName) {
            newDumpDependency['firstPitName'] = options.firstPitName;
        } else {
            newDumpDependency['firstDumpName'] = options.firstDumpName;
        }
        newDumpDependency['dependentDumpName'] = options.dependentDumpName;
        newDumpDependency['inUse'] = true;
        this.dumpDependencyModel.add({
            dataObject: newDumpDependency,
            success: function (data) {
                alert('added new data');
                that.dumpDependency.push(data);
                that.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
            },
            error: function (data) {
                alert('Error creating dump dependency');
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
