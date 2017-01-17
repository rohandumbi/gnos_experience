import { View } from '../core/view';
import { ScenarioModel } from '../models/scenarioModel';
import { CapexModel } from '../models/capexModel';

export class CapexView extends View{

    constructor(options) {
        super();
        this.id = options.id;
        this.name = options.name;
        this.model = new ScenarioModel({});
        this.capexModel = new CapexModel({id: this.id});
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/capexView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    onDomLoaded() {
        this.$el.find('#capex_name').html(this.name);
        this.initializeGrid();
    }

    initializeGrid() {
        var that = this;
        var row = '';
        var data = that.capexModel.fetch();
        for(var i=0; i<data.capexInstances.length; i++){
            var instance = data.capexInstances[i];
            row += (
                '<tr>' +
                '<td>' + instance.name + '</td>' +
                '<td>' + instance.groupName + '</td>' +
                '<td>' + instance.capex + '</td>' +
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
                    return (
                    '<select value="test">' +
                        '<option selected disabled hidden>' + row.group + '</option>'+
                        '<option value="process">process 1</option>' +
                        '<option value="process_join">process Join</option>' +
                        '<option value="pit">pit 1</option>' +
                        '<option value="pit_group">pit group</option>' +
                    '</select>') ;
                },
                "capex": function(column, row){
                    return (
                        '<input type="text" value="' + row.capex + '"' + 'readonly>'
                    );
                },
                "expansion_capacity": function(column, row){
                    return (
                        '<input type="text" value="' + row.expansion_capacity + '"' + 'readonly>'
                    );
                }
                /*"commands": function(column, row){
                    return "<button title='Load Scenario' type=\"button\" class=\"btn btn-xs btn-default command-upload\" data-row-id=\"" + row.name + "\"><span class=\"glyphicon glyphicon-upload\"></span></button>";
                }*/
            }
        }).on("loaded.rs.jquery.bootgrid", function()
        {
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');

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
        this.$el.find('#add_instance').click(function(){
            that.addRowToGrid();
        });

        this.$el.find('#capex_delete').click(function(){
            that.deleteCapex();
        });

    }

    deleteCapex() {
        this.$el.html('');
    }

    addRowToGrid() {
        var instanceName = this.$el.find('#new_instance_name').val();
        var group = this.$el.find('#group').val();
        var capex = this.$el.find('#capex').val();
        var expansion_capacity = this.$el.find('#expansion_capacity').val();

        if(instanceName && group && capex && expansion_capacity) {
            this.$el.find("#datatype-grid-basic").bootgrid("append", [{
                name: instanceName,
                id: -1,
                group: group,
                groupType: 1,
                capex: capex,
                expansion_capacity: expansion_capacity
            }]);
            //this.$el.find('#model_name').val('');
            this.$el.find('#new_instance_name').val('');
            this.$el.find('#group').val('');
            this.$el.find('#capex').val('');
            this.$el.find('#expansion_capacity').val('');
        }
    }

    deleteRows(rowIds) {
        this.$el.find("#datatype-grid-basic").bootgrid("remove");
    }

}
