import { View } from '../core/view';
import { ExpressionModel } from '../models/expressionModel';

export class ExpressionDefinitionView extends View{

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.model = new ExpressionModel({projectId: this.projectId});
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
        var that = this;
        this.model.fetch({
            success: function (data) {
                that.data = data;
                that.initializeGrid(data);
            },
            error: function (data) {
                alert('Error fetching expressions ' + data);
            }
        });
    }

    initializeGrid(modelData) {
        var that = this;
        //var data = this.model.fetch();
        var row = '';
        for (var i = 0; i < modelData.length; i++) {
            var expression = modelData[i];
            row += (
                '<tr>' +
                    '<td>' + expression.name + '</td>' +
                '<td>' + expression.isGrade + '</td>' +
                '<td>' + expression.exprvalue + '</td>' +
                '<td>' + (expression.filter || '') + '</td>' +
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
            }
        }).on("loaded.rs.jquery.bootgrid", function()
        {
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');
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
        $removeButton.click(function(){
            that.deleteRows();
        });
        this.$el.find('#addModel').click(function(){
            that.addRowToGrid();
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
                isGrade: isGrade,
                isComplex: isComplex,
                exprvalue: expressionDefinition,
                filter: expressionFilter
            }
            this.model.add({
                dataObject: newExpression,
                success: function (data) {
                    alert('Successfully added expression');
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
