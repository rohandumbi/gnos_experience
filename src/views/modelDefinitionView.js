import { View } from '../core/view';
import { GnosModel } from '../models/gnosModel';

export class ModelDefinitionView extends View{

    constructor(options) {
        super();
        this.model = new GnosModel({});
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/modelDefinitionView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    onDomLoaded() {
        this.initializeGrid();
    }

    initializeGrid() {
        var that = this;
        var data = this.model.fetch();
        var row = '';
        for(var i=0; i<data.models.length; i++){
            var model = data.models[i];
            row += (
                '<tr>' +
                    '<td>' + model.name + '</td>' +
                    '<td>' + model.expressionName + '</td>' +
                    '<td>' + model.filter + '</td>' +
                '</tr>'
            )
        }
        this.$el.find("#tableBody").append($(row));
        this.grid = this.$el.find("#datatype-grid-basic").bootgrid({
            rowCount: [15, 10, 20, 25],
            formatters: {
                "name": function(column, row){
                    return (
                        '<input type="text" value="' + row.name + '"' + 'readonly>'
                    );
                },
                "expression": function(column, row){
                    return (
                    '<select value="test">' +
                    '<option selected disabled hidden>' + row.expressionName + '</option>'+
                    '<option value="grouptext">Group By(Text)</option>' +
                    '<option value="groupnumeric">Group By(Numeric)</option>' +
                    '<option value="unit">Unit</option>' +
                    '<option value="grade">Grade</option>' +
                    '</select>') ;
                },
                "filter": function(column, row){
                    return (
                        '<input type="text" value="' + row.filter + '"' + 'readonly>'
                    );
                },
                "commands": function(column, row)
                {
                    return "<button type=\"button\" class=\"btn btn-xs btn-default command-edit\" data-row-id=\"" + row.id + "\"><span class=\"glyphicon glyphicon-pencil\"></span></button> " +
                        "<button type=\"button\" class=\"btn btn-xs btn-default command-delete\" data-row-id=\"" + row.id + "\"><span class=\"glyphicon glyphicon-trash\"></span></button>";
                }
            }
        }).on("loaded.rs.jquery.bootgrid", function()
        {
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');

            that.grid.find(".command-edit").on("click", function(e){
                alert("You pressed edit on row: " + $(this).data("row-id"));
            }).end().find(".command-delete").on("click", function(e){
                alert("You pressed delete on row: " + $(this).data("row-id"));
            });
        });
        var $addButton = $('<button type="button" class="btn btn-default"></button>');
        $addButton.append('<span class="glyphicon glyphicon-plus"></span>');
        this.$el.find(".actionBar").append($addButton);
        $addButton.click(function(){
            that.addRowToGrid();
        });
    }

    addRowToGrid() {
        this.$el.find("#datatype-grid-basic").bootgrid("append", [{
            name: "",
            id: -1,
            expressionId: -1,
            expressionName: "",
            filter:""
        }]);
    }
}
