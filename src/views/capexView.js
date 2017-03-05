import { View } from '../core/view';
import {ProcessModel} from '../models/processModel';
import {ProcessJoinModel} from '../models/processJoinModel';
import {PitModel} from '../models/pitModel';
import {PitGroupModel} from '../models/pitGroupModel';

export class CapexView extends View{

    constructor(options) {
        super();
        this.capex = options.capex;
        this.projectId = options.projectId;
        this.processModel = new ProcessModel({projectId: this.projectId});
        this.processJoinModel = new ProcessJoinModel({projectId: this.projectId});
        this.pitModel = new PitModel({projectId: this.projectId});
        this.pitGroupModel = new PitGroupModel({projectId: this.projectId});
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/capexView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    getInstanceByName(name) {
        var object = null;
        this.capex.listOfCapexInstances.forEach(function (instance) {
            if (instance.name == name) {
                object = instance;
            }
        });
        return object;
    }

    onDomLoaded() {
        this.$el.find('#capex_name').html(this.capex.name);
        this.fetchProcessses();
    }

    fetchProcessses() {
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

    render() {
        super.render(this.capex);
    }

    fetchPitGroups() {
        var that = this;
        this.pitGroupModel.fetch({
            success: function (data) {
                that.pitGroups = data;
                that.initializeGrid();
            },
            error: function (data) {
                alert('Error fetching list of pit groups.');
            }
        });
    }

    initializeGrid() {
        var that = this;
        var row = '';
        //var data = that.capexModel.fetch();
        this.capexInstances = this.capex.listOfCapexInstances;
        for (var i = 0; i < this.capexInstances.length; i++) {
            var instance = this.capexInstances[i];
            row += (
                '<tr>' +
                '<td>' + instance.name + '</td>' +
                '<td>' + instance.groupingName + '</td>' +
                '<td>' + instance.capexAmount + '</td>' +
                '<td>' + instance.expansionCapacity + '</td>' +
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
                "group": function(column, row){
                    var groupName = row.groupingName;
                    if (!groupName) {
                        groupName = 'NONE';
                    }
                    var tableRow = (
                        '<select class="instance_grouping" value="test">' +
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
                "capex": function(column, row){
                    return (
                        '<input class="instance_capex" type="text" value="' + row.capexAmount + '"' + '>'
                    );
                },
                "expansion_capacity": function(column, row){
                    return (
                        '<input class="instance_expansion" type="text" value="' + row.expansionCapacity + '"' + '>'
                    );
                }
            }
        }).on("loaded.rs.jquery.bootgrid", function()
        {
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');

            that.grid.find('.instance_grouping').change(function () {
                that.updateGrouping($(this));
            });
            that.grid.find('.instance_capex').change(function () {
                that.updateCapex($(this));
            });
            that.grid.find('.instance_expansion').change(function () {
                that.updateExpansion($(this));
            });

        });
        var $addButton = $('<button type="button" class="btn btn-default" data-toggle="modal" data-target="#' + this.capex.name + '"></button>');
        $addButton.append('<span class="glyphicon glyphicon-plus"></span>');

        var $removeButton = $('<button type="button" class="btn btn-default"></button>');
        $removeButton.append('<span class="glyphicon glyphicon-trash"></span>');

        this.$el.find(".actionBar").append($addButton);
        this.$el.find(".actionBar").append($removeButton);

        $removeButton.click(function(){
            that.deleteRows();
        });
        this.$el.find('#add_instance').click(function(){
            that.addRowToGrid();
        });

        this.$el.find('#capex_delete').click(function(){
            that.deleteCapex();
        });

    }

    refreshCapex(capex) {
        this.capex = capex;
    }

    updateGrouping($grouping) {
        var updatedInstance = this.getInstanceByName($grouping.closest('tr').data('row-id'));
        updatedInstance['groupingType'] = $grouping.find('option:checked').data('grouping-type');
        updatedInstance['groupingName'] = $grouping.find('option:checked').data('grouping-name');
        this.trigger('update:capex', this.capex);
    }

    updateCapex($capex) {
        var updatedInstance = this.getInstanceByName($capex.closest('tr').data('row-id'));
        updatedInstance['capexAmount'] = $capex.val();
        this.trigger('update:capex', this.capex);
    }

    updateExpansion($expansion) {
        var updatedInstance = this.getInstanceByName($expansion.closest('tr').data('row-id'));
        updatedInstance['expansionCapacity'] = $expansion.val();
        this.trigger('update:capex', this.capex);
    }

    deleteCapex() {
        this.trigger('delete:capex', this.capex);
        this.$el.find("#datatype-grid-basic").bootgrid("remove");
        this.$el.html('');
    }

    addRowToGrid() {
        var instanceName = this.$el.find('#new_instance_name').val();
        if (instanceName) {
            var newInstance = {};
            newInstance['id'] = -1;
            newInstance['capexId'] = this.capex.id;
            newInstance['name'] = instanceName;
            newInstance['groupingName'] = '';
            newInstance['groupingType'] = 0;
            newInstance['capexAmount'] = 0;
            newInstance['expansionCapacity'] = 0;
        }
        this.capex.listOfCapexInstances.push(newInstance);
        this.trigger('update:capex', this.capex);
        this.$el.find("#datatype-grid-basic").bootgrid("append", [newInstance]);
        this.$el.find('#new_instance_name').val('');
    }

    deleteRows() {
        var selectedRows = this.$el.find("#datatype-grid-basic").bootgrid("getSelectedRows");
        var that = this;
        selectedRows.forEach(function (selectedRow) {
            var deletedCapexInstance = that.getInstanceByName(selectedRow);
            console.log(deletedCapexInstance);
            that.trigger('delete:instance', deletedCapexInstance);
            /*that.dumpModel.delete({
             url: 'http://localhost:4567/dumps',
             id: deletedDump.id,
             success: function (data) {
             alert('Successfully deleted dump.');
             },
             error: function (data) {
             alert('Failed to delete dump.');
             }
             });*/
        });
        this.$el.find("#datatype-grid-basic").bootgrid("remove");
        /* this.trigger('delete:capex', this.capex);
         this.$el.find("#datatype-grid-basic").bootgrid("remove");*/
    }

}
