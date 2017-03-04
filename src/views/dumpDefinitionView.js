import {View} from '../core/view';
import {DumpModel} from '../models/dumpModel';
import {PitModel} from '../models/pitModel';
import {PitGroupModel} from '../models/pitGroupModel';

export class DumpDefinitionView extends View {

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.dumpModel = new DumpModel({projectId: this.projectId});
        this.pitModel = new PitModel({projectId: this.projectId});
        this.pitGroupModel = new PitGroupModel({projectId: this.projectId});
    }

    getHtml() {
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/dumpDefinitionView.html", function (data) {
                resolve(data);
            })
        });
        return promise;
    }

    getExpressionById(expressionId) {
        var expressionObject;
        this.expressions.forEach(function (expression) {
            if (expression.id === parseInt(expressionId)) {
                expressionObject = expression;
            }
        });
        return expressionObject;
    }

    getModelByName(modelName) {
        var modelObject;
        this.modelData.forEach(function (model) {
            if (model.name === modelName) {
                modelObject = model;
            }
        });
        return modelObject;
    }

    fetchExpressions() {
        var that = this;
        this.expressionModel.fetch({
            success: function (data) {
                that.expressions = data;
                that.fetchModels();
            },
            error: function (data) {
                alert('Error fetching expression list: ' + data);
            }
        })
    }

    fetchModels() {
        var that = this;
        this.model.fetch({
            success: function (data) {
                that.modelData = data;
                var tableRow = (
                    '<select id="expression_name" class="expression_name form-control" value="test">'
                );
                that.expressions.forEach(function (expression) {
                    tableRow += '<option data-expression-name="' + expression.name + '" data-expression-id="' + expression.id + '">' + expression.name + '</option>';
                });
                tableRow += '</select>';
                that.$el.find('#expression_list').append(tableRow);
                that.initializeGrid(data);
            },
            error: function (data) {
                alert('Error fetching model list');
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
                alert('Error fetching pits');
            }
        });
    }

    fetchPitGroups() {
        var that = this;
        this.pitGroupModel.fetch({
            success: function (data) {
                that.pitGroups = data;
                that.fetchDumps();
            },
            error: function (data) {
                alert('Error fetching pits');
            }
        });
    }

    fetchDumps() {
        var that = this;
        this.dumpModel.fetch({
            success: function (data) {
                that.dumps = data;
                var tableRow = (
                    '<select id="mapping_name" class="dump_mapping form-control" value="test">'
                );
                that.pits.forEach(function (pit) {
                    tableRow += '<option data-mapping-type="0">' + pit.pitName + '</option>';
                });
                that.pitGroups.forEach(function (pitGroup) {
                    tableRow += '<option data-mapping-type="1">' + pitGroup.name + '</option>';
                });
                tableRow += '</select>';
                that.$el.find('#mapping_list').append(tableRow);
                that.initializeGrid(data);
            },
            error: function (data) {
                alert('Error fetching pits');
            }
        });
    }

    onDomLoaded() {
        this.fetchPits();
    }

    initializeGrid(dumpData) {
        var that = this;
        var row = '';
        for (var i = 0; i < dumpData.length; i++) {
            var dump = dumpData[i];
            row += (
                '<tr>' +
                '<td>' + dump.name + '</td>' +
                '<td>' + dump.type + '</td>' +
                '<td>' + dump.mappedTo + '</td>' +
                '<td>' + (dump.condition || '') + '</td>' +
                '<td>' + dump.hasCapacity + '</td>' +
                '<td>' + dump.capacity + '</td>' +
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
                "type": function (column, row) {
                    var dumpTypeIndex = row.type;
                    var dumpType;
                    if (dumpTypeIndex.toString() === '0') {
                        dumpType = 'External'
                    } else {
                        dumpType = 'Internal'
                    }
                    var tableRow = (
                        '<select class="dump_type">' +
                        '<option selected disabled hidden>' + dumpType + '</option>' +
                        '<option data-dump-type="0">External</option>' +
                        '<option data-dump-type="1">Internal</option>' +
                        '</select>'

                    );
                    return tableRow;
                },
                "mappedTo": function (column, row) {
                    var groupName = row.mappedTo;
                    var tableRow = (
                        '<select class="dump_mapping" value="test">' +
                        '<option selected disabled hidden>' + groupName + '</option>'
                    );
                    that.pits.forEach(function (pit) {
                        tableRow += '<option data-mapping-type="0">' + pit.pitName + '</option>';
                    });
                    that.pitGroups.forEach(function (pitGroup) {
                        tableRow += '<option data-mapping-type="1">' + pitGroup.name + '</option>';
                    });
                    tableRow += '</select>';
                    return tableRow;
                },
                "condition": function (column, row) {
                    var condition = row.condition || '';
                    return (
                        '<input data-dump-name="' + row.name + '" class="dump_condition" style="width:200px" type="text" value="' + condition + '"' + '>'
                    );
                },
                "capacity": function (column, row) {
                    var capacity = row.capacity || '';
                    return (
                        '<input data-dump-name="' + row.name + '" class="dump_capacity" style="width:200px" type="text" value="' + capacity + '"' + '>'
                    );
                },
                "hasCapacity": function (column, row) {
                    if (row.hasCapacity.toString() === 'true') {
                        return (
                            '<input class="dump_hasCapacity" type="checkbox" value="' + row.hasCapacity + '"' + 'checked  >'
                        )
                    } else {
                        return (
                            '<input class="dump_hasCapacity" type="checkbox" value="' + row.hasCapacity + '"' + '>'
                        )
                    }
                }
            }
        }).on("loaded.rs.jquery.bootgrid", function () {
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');

            that.grid.find(".expression").change(function (event) {
                //alert($(this).data('expression-name'));
                var modelName = $(this).closest('tr').data('row-id');
                var exprId = $(this).find(":selected").data('expression-id');
                that.updateExpression({name: modelName, expressionId: exprId});
            });
            that.grid.find(".model_condition").change(function (event) {
                var modelName = $(this).closest('tr').data('row-id');
                var conditionValue = $(this).val();
                that.updateCondition({name: modelName, condition: conditionValue});
            });
        });
        var $addButton = $('<button type="button" class="btn btn-default" data-toggle="modal" data-target="#dumpDefinitionModal"></button>');
        $addButton.append('<span class="glyphicon glyphicon-plus"></span>');

        var $removeButton = $('<button type="button" class="btn btn-default"></button>');
        $removeButton.append('<span class="glyphicon glyphicon-trash"></span>');

        this.$el.find(".actionBar").append($addButton);
        this.$el.find(".actionBar").append($removeButton);
        $removeButton.click(function () {
            that.deleteRows();
        });
        this.$el.find('#addDump').click(function () {
            that.addRowToGrid();
        });
    }

    updateExpression(options) {
        var updatedModel = this.getModelByName(options.name);
        updatedModel['expressionId'] = options.expressionId;
        this.model.update({
            id: updatedModel.id,
            url: 'http://localhost:4567/model',
            dataObject: updatedModel,
            success: function (data) {
                alert('Successfully updated');
            },
            error: function (data) {
                alert('Failed to update: ' + data);
            }
        });
    }

    updateCondition(options) {
        var updatedModel = this.getModelByName(options.name);
        updatedModel['condition'] = options.condition;
        this.model.update({
            id: updatedModel.id,
            url: 'http://localhost:4567/model',
            dataObject: updatedModel,
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
        var dumpName = this.$el.find('#dump_name').val();
        var mappingType = this.$el.find('select#mapping_name option:checked').data('mapping-type');
        var mappedTo = this.$el.find('select#mapping_name option:checked').val();
        var newDump = {};
        newDump['name'] = dumpName;
        newDump['mappingType'] = mappingType;
        newDump['mappedTo'] = mappedTo;
        newDump['hasCapacity'] = false;
        newDump['condition'] = '';
        newDump['type'] = 0;
        newDump['capacity'] = 0;
        if (dumpName && mappedTo) {
            this.dumpModel.add({
                dataObject: newDump,
                success: function (data) {
                    that.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
                    that.dumps.push(data);
                    that.$el.find('#dump_name').val('');
                    that.$el.find('#mapping_name').val('');
                },
                error: function (data) {
                    alert('Failed to create dump');
                }
            });
        }
    }

    deleteRows() {
        var selectedRows = this.$el.find("#datatype-grid-basic").bootgrid("getSelectedRows");
        var that = this;
        selectedRows.forEach(function (selectedRow) {
            var deletedModel = that.getModelByName(selectedRow);
            console.log(deletedModel);
            that.model.delete({
                url: 'http://localhost:4567/model',
                id: deletedModel.id,
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
}
