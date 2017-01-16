import { View } from '../core/view';
import { ExpressionModel } from '../models/expressionModel';

export class ExpressionDefinitionView extends View{

    constructor(options) {
        super();
        this.model = new ExpressionModel({});
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/expressionDefinitionView.html", function( data ) {
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
        for(var i=0; i<data.expressions.length; i++){
            var expression = data.expressions[i];
            row += (
                '<tr>' +
                    '<td>' + expression.name + '</td>' +
                    '<td>' + expression.is_grade + '</td>' +
                    '<td>' + expression.expr_value + '</td>' +
                    '<td>' + expression.filter + '</td>' +
                    /*'<td>' + model.id + '</td>' +*/
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
                /*"name": function(column, row){
                    return (
                        '<input type="text" value="' + row.name + '"' + 'readonly>'
                    );
                },*/
                "definition": function(column, row){
                    return (
                        '<input type="text" value="' + row.value + '"' + '>'
                    ) ;
                },
                "filter": function(column, row){
                    return (
                        '<input style="width:200px" type="text" value="' + row.filter + '"' + '>'
                    );
                },
                "grade": function(column, row) {
                    if(row.grade.toString().toLowerCase() === "true"){
                        return (
                            '<input type="checkbox" value="' + row.grade + '"' + 'checked  >'
                        )
                    }else{
                        return (
                            '<input type="checkbox" value="' + row.grade + '"' + '>'
                        )
                    }
                }
                /*"commands": function(column, row)
                {
                    return "<button type=\"button\" class=\"btn btn-xs btn-default command-delete\" data-row-id=\"" + row.id + "\"><span class=\"glyphicon glyphicon-trash\"></span></button>";
                }*/
            }
        }).on("loaded.rs.jquery.bootgrid", function()
        {
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');

            /*that.grid.find(".command-edit").on("click", function(e){
                alert("You pressed edit on row: " + $(this).data("row-id"));
            }).end().find(".command-delete").on("click", function(e){
                alert("You pressed delete on row: " + $(this).data("row-id"));
            });*/
            /*that.grid.find(".command-delete").on("click", function(e){
                alert("You pressed delete on row: " + $(this).data("row-id"));
                that.deleteRows([$(this).data("row-id")]);
            })*/
        });
        var $addButton = $('<button type="button" class="btn btn-default" data-toggle="modal" data-target="#modelDefinitionModal"></button>');
        $addButton.append('<span class="glyphicon glyphicon-plus"></span>');

        var $removeButton = $('<button type="button" class="btn btn-default"></button>');
        $removeButton.append('<span class="glyphicon glyphicon-trash"></span>');

        this.$el.find(".actionBar").append($addButton);
        this.$el.find(".actionBar").append($removeButton);
        /*$addButton.click(function(){
            that.addRowToGrid();
        });*/
        $removeButton.click(function(){
            that.deleteRows();
        });
        this.$el.find('#addModel').click(function(){
            that.addRowToGrid();
        });
    }

    addRowToGrid() {
        var modelName = this.$el.find('#model_name').val();
        if(modelName) {
            this.$el.find("#datatype-grid-basic").bootgrid("append", [{
                name: modelName,
                id: -1,
                expressionId: -1,
                expressionName: "",
                filter:""
            }]);
            this.$el.find('#model_name').val('');
        }
    }

    deleteRows(rowIds) {
        this.$el.find("#datatype-grid-basic").bootgrid("remove");
    }
}
