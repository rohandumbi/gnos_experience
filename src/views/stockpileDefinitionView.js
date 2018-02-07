import {View} from '../core/view';
import {StockpileModel} from '../models/stockpileModel';
import {PitModel} from '../models/pitModel';
import {PitGroupModel} from '../models/pitGroupModel';

export class StockpileDefinitionView extends View {

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.stockpileModel = new StockpileModel({projectId: this.projectId});
        this.pitModel = new PitModel({projectId: this.projectId});
        this.pitGroupModel = new PitGroupModel({projectId: this.projectId});
    }

    getHtml() {
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/stockpileDefinitionView.html", function (data) {
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

    getStockpileByName(stockpileName) {
        var object = null;
        this.stockPiles.forEach(function (stockpile) {
            if (stockpile.name === stockpileName) {
                object = stockpile;
            }
        });
        return object;
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
                that.fetchStockpiles();
            },
            error: function (data) {
                alert('Error fetching pits');
            }
        });
    }

    fetchStockpiles() {
        var that = this;
        this.stockpileModel.fetch({
            success: function (data) {
                that.stockPiles = data;
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

    initializeGrid(stockpileData) {
        var that = this;
        var row = '';
        for (var i = 0; i < stockpileData.length; i++) {
            var stockpile = stockpileData[i];
            row += (
                '<tr>' +
                '<td>' + stockpile.name + '</td>' +
                '<td>' + stockpile.type + '</td>' +
                '<td>' + stockpile.mappedTo + '</td>' +
                '<td>' + (stockpile.condition || '') + '</td>' +
                '<td>' + stockpile.hasCapacity + '</td>' +
                '<td>' + stockpile.capacity + '</td>' +
                '<td>' + stockpile.isReclaim + '</td>' +
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
                    var stockpileTypeIndex = row.type;
                    var stockpileType;
                    if (stockpileTypeIndex.toString() === '0') {
                        stockpileType = 'External'
                    } else {
                        stockpileType = 'Internal'
                    }
                    var tableRow = (
                        '<select class="stockpile_type">' +
                        '<option selected disabled hidden>' + stockpileType + '</option>' +
                        '<option data-stockpile-type="0">External</option>' +
                        '<option data-stockpile-type="1">Internal</option>' +
                        '</select>'

                    );
                    return tableRow;
                },
                "mappedTo": function (column, row) {
                    var groupName = row.mappedTo;
                    var tableRow = (
                        '<select class="stockpile_mapping" value="test">' +
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
                        '<input data-stockpile-name="' + row.name + '" class="stockpile_condition" style="width:200px" type="text" value="' + condition + '"' + '>'
                    );
                },
                "capacity": function (column, row) {
                    var capacity = row.capacity || '';
                    return (
                        '<input data-stockpile-name="' + row.name + '" class="stockpile_capacity" style="width:200px" type="text" value="' + capacity + '"' + '>'
                    );
                },
                "hasCapacity": function (column, row) {
                    if (row.hasCapacity.toString() === 'true') {
                        return (
                            '<input class="stockpile_hasCapacity" type="checkbox" value="' + row.hasCapacity + '"' + 'checked  >'
                        )
                    } else {
                        return (
                            '<input class="stockpile_hasCapacity" type="checkbox" value="' + row.hasCapacity + '"' + '>'
                        )
                    }
                },
                "isReclaim": function (column, row) {
                    if (row.isReclaim.toString() === 'true') {
                        return (
                            '<input class="stockpile_isReclaim" type="checkbox" value="' + row.isReclaim + '"' + 'checked  >'
                        )
                    } else {
                        return (
                            '<input class="stockpile_isReclaim" type="checkbox" value="' + row.isReclaim + '"' + '>'
                        )
                    }
                }
            }
        }).on("loaded.rs.jquery.bootgrid", function () {
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');

            that.grid.find('.stockpile_type').change(function () {
                that.updateType($(this));
            });
            that.grid.find('.stockpile_mapping').change(function () {
                that.updateMapping($(this));
            });
            that.grid.find(".stockpile_condition").change(function (event) {
                that.updateCondition($(this));
            });
            that.grid.find(".stockpile_capacity").change(function (event) {
                that.updateCapacity($(this));
            });
            that.grid.find(".stockpile_hasCapacity").change(function (event) {
                that.updateHasCapacity($(this));
            });
            that.grid.find(".stockpile_isReclaim").change(function (event) {
                that.updateIsReclaim($(this));
            });

        });
        var $addButton = $('<button type="button" class="btn btn-default" data-toggle="modal" data-target="#stockpileDefinitionModal"></button>');
        $addButton.append('<span class="glyphicon glyphicon-plus"></span>');

        var $removeButton = $('<button type="button" class="btn btn-default"></button>');
        $removeButton.append('<span class="glyphicon glyphicon-trash"></span>');

        this.$el.find(".actionBar").append($addButton);
        this.$el.find(".actionBar").append($removeButton);
        $removeButton.click(function () {
            that.deleteRows();
        });
        this.$el.find('#addStockpile').click(function () {
            that.addRowToGrid();
        });
    }

    updateType($type) {
        var stockpileName = $type.closest('tr').data('row-id');
        var stockpileType = $type.find('option:checked').data('stockpile-type');
        var updatedStockpile = this.getStockpileByName(stockpileName);
        updatedStockpile['type'] = stockpileType;
        this.stockpileModel.update({
            id: updatedStockpile.id,
            url: 'http://localhost:4567/stockpiles',
            dataObject: updatedStockpile,
            success: function (data) {
                //alert('Successfully updated');
            },
            error: function (data) {
                alert('Failed to update: ' + data);
            }
        });
    }

    updateMapping($mapping) {
        var stockpileName = $mapping.closest('tr').data('row-id');
        var mappingType = $mapping.find('option:checked').data('mapping-type');
        var mappedTo = $mapping.find('option:checked').val();
        var updatedStockpile = this.getStockpileByName(stockpileName);
        updatedStockpile['mappingType'] = mappingType;
        updatedStockpile['mappedTo'] = mappedTo;
        this.stockpileModel.update({
            id: updatedStockpile.id,
            url: 'http://localhost:4567/stockpiles',
            dataObject: updatedStockpile,
            success: function (data) {
                //('Successfully updated');
            },
            error: function (data) {
                alert('Failed to update: ' + data);
            }
        });
    }

    updateCondition($condition) {
        var stockpileName = $condition.closest('tr').data('row-id');
        var condition = $condition.val();
        var updatedStockpile = this.getStockpileByName(stockpileName);
        updatedStockpile['condition'] = condition;
        this.stockpileModel.update({
            id: updatedStockpile.id,
            url: 'http://localhost:4567/stockpiles',
            dataObject: updatedStockpile,
            success: function (data) {
                //alert('Successfully updated');
            },
            error: function (data) {
                alert('Failed to update: ' + data);
            }
        });
    }

    updateHasCapacity($hasCapacity) {
        var stockpileName = $hasCapacity.closest('tr').data('row-id');
        var hasCapacity = $hasCapacity.is(':checked');
        var updatedStockpile = this.getStockpileByName(stockpileName);
        updatedStockpile['hasCapacity'] = hasCapacity;
        this.stockpileModel.update({
            id: updatedStockpile.id,
            url: 'http://localhost:4567/stockpiles',
            dataObject: updatedStockpile,
            success: function (data) {
                //alert('Successfully updated');
            },
            error: function (data) {
                alert('Failed to update: ' + data);
            }
        });
    }

    updateCapacity($capacity) {
        var stockpileName = $capacity.closest('tr').data('row-id');
        var capacity = $capacity.val();
        var updatedStockpile = this.getStockpileByName(stockpileName);
        updatedStockpile['capacity'] = capacity;
        this.stockpileModel.update({
            id: updatedStockpile.id,
            url: 'http://localhost:4567/stockpiles',
            dataObject: updatedStockpile,
            success: function (data) {
                //alert('Successfully updated');
            },
            error: function (data) {
                alert('Failed to update: ' + data);
            }
        });
    }

    updateIsReclaim($isReclaim) {
        var stockpileName = $isReclaim.closest('tr').data('row-id');
        var isReclaim = $isReclaim.is(':checked');
        var updatedStockpile = this.getStockpileByName(stockpileName);
        updatedStockpile['isReclaim'] = isReclaim;
        this.stockpileModel.update({
            id: updatedStockpile.id,
            url: 'http://localhost:4567/stockpiles',
            dataObject: updatedStockpile,
            success: function (data) {
                //alert('Successfully updated');
            },
            error: function (data) {
                alert('Failed to update: ' + data);
            }
        });
    }

    addRowToGrid() {
        var that = this;
        var stockpileName = this.$el.find('#stockpile_name').val();
        var mappingType = this.$el.find('select#mapping_name option:checked').data('mapping-type');
        var mappedTo = this.$el.find('select#mapping_name option:checked').val();
        var newStockpile = {};
        newStockpile['name'] = stockpileName;
        newStockpile['mappingType'] = mappingType;
        newStockpile['mappedTo'] = mappedTo;
        newStockpile['hasCapacity'] = false;
        newStockpile['condition'] = '';
        newStockpile['type'] = 0;
        newStockpile['capacity'] = 0;
        newStockpile['isReclaim'] = false;
        if (stockpileName && mappedTo) {
            this.stockpileModel.add({
                dataObject: newStockpile,
                success: function (data) {
                    that.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
                    that.stockPiles.push(data);
                    that.$el.find('#stockpile_name').val('');
                    that.$el.find('#mapping_name').val('');
                },
                error: function (data) {
                    alert('Failed to create stockpile');
                }
            });
        }
    }

    deleteRows() {
        var selectedRows = this.$el.find("#datatype-grid-basic").bootgrid("getSelectedRows");
        var that = this;
        selectedRows.forEach(function (selectedRow) {
            var deletedStockpile = that.getStockpileByName(selectedRow);
            console.log(deletedStockpile);
            that.stockpileModel.delete({
                url: 'http://localhost:4567/stockpiles',
                id: deletedStockpile.id,
                success: function (data) {
                    //alert('Successfully deleted stockpile.');
                },
                error: function (data) {
                    alert('Failed to delete stockpile.');
                }
            });
        });
        this.$el.find("#datatype-grid-basic").bootgrid("remove");
    }
}
