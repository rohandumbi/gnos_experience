import { View } from '../core/view';
import { ExpressionModel } from '../models/expressionModel';
import {UnitModel} from '../models/unitModel'

export class ExpressionDefinitionView extends View{

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.model = new ExpressionModel({projectId: this.projectId});
        this.unitModel = new UnitModel({projectId: options.projectId});
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/expressionDefinitionView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    fetchUnits() {
        var that = this;
        this.unitModel.fetch({
            success: function (data) {
                that.units = data;
                that.fetchExpressions();
            },
            error: function (data) {
                alert('Error fetching product joins');
            }
        });
    }

    fetchExpressions() {
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

    onDomLoaded() {
        this.fetchUnits();
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
                '<td>' + (expression.weightedField || '') + '</td>' +
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
                        '<input data-expression-name="' + row.name + '" class="expression_definition" style="min-width:250px" type="text" value="' + row.exprvalue + '"' + '>'
                    ) ;
                },
                "filter": function(column, row){
                    var filter = row.filter;
                    if (!filter) {
                        filter = '';
                    }
                    return (
                        '<input data-expression-name="' + row.name + '" class="expression_filter" style="min-width:350px" type="text" value="' + filter + '"' + '>'
                    );
                },
                "unit": function (column, row) {
                    var expressionIsGrade = (row.isGrade.toString()) === 'true';
                    var unit = row.weightedField;
                    if (!unit) {
                        unit = '';
                    }
                    that.nonGradeExpressions = [];
                    that.data.forEach(function (expression) {
                        if (!expression.isGrade) {
                            that.nonGradeExpressions.push(expression);
                        }
                    });
                    var tableRow = '';
                    if (!expressionIsGrade) {
                        tableRow += (
                            '<select disabled data-expression-name="' + row.name + '" id="grade-expression" class="expression_unit form-control" value="test">'
                        );
                    } else {
                        tableRow += (
                            '<select data-expression-name="' + row.name + '" id="grade-expression" class="expression_unit form-control" value="test">'
                        );
                    }
                    tableRow += '<option selected disabled>' + unit + '</option>'
                    //add non-grade expressions
                    that.nonGradeExpressions.forEach(function (expression) {
                        tableRow += '<option data-unit-id="' + expression.id + '" data-unit-type="2" data-unit-name="' + expression.name + '">' + expression.name + '</option>';
                    });
                    //add units
                    that.units.forEach(function (unit) {
                        tableRow += '<option data-unit-id="' + unit.id + '" data-unit-type="1" data-unit-name="' + unit.name + '">' + unit.name + '</option>';
                    });
                    tableRow += '</select>';
                    return tableRow;
                },
                "grade": function(column, row) {
                    if (row.isGrade.toString().toLowerCase() === "true") {
                        return (
                            '<input data-expression-name="' + row.name + '" class="expression_isgrade" type="checkbox" value="' + row.isGrade + '"' + 'checked  >'
                        )
                    }else{
                        return (
                            '<input data-expression-name="' + row.name + '" class="expression_isgrade" type="checkbox" value="' + row.isGrade + '"' + '>'
                        )
                    }
                }
            }
        }).on("loaded.rs.jquery.bootgrid", function()
        {
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');
            that.grid.find(".expression_definition").change(function (event) {
                var expressionName = $(this).data('expression-name');
                var exprValue = $(this).val();
                that.updateExpressionDefinition({name: expressionName, exprvalue: exprValue});
            });
            that.grid.find(".expression_filter").change(function (event) {
                var expressionName = $(this).data('expression-name');
                var filterValue = $(this).val();
                that.updateExpressionFilter({name: expressionName, filter: filterValue});
            });

            that.grid.find(".expression_unit").change(function (event) {
                var expressionName = $(this).data('expression-name');
                var weightedField = $(this).find(':selected').data('unit-name');
                var weightedFieldType = $(this).find(':selected').data('unit-type');
                that.updateWeightedUnit({
                    name: expressionName,
                    weightedField: weightedField,
                    weightedFieldType: weightedFieldType
                });
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
        $removeButton.click(function(){
            that.deleteRows();
        });
        this.$el.find('#addModel').click(function(){
            that.addRowToGrid();
        });

    }

    updateExpressionFilter(options) {
        var updatedExpression = this.getExpressionByName(options.name);
        updatedExpression['filter'] = options.filter;
        this.model.update({
            id: updatedExpression.id,
            url: 'http://localhost:4567/project/'+this.projectId+'/expressions',
            dataObject: updatedExpression,
            success: function (data) {
                //alert('Successfully updated');
            },
            error: function (data) {
                alert('Failed to update: ' + data);
            }
        });
    }

    updateWeightedUnit(options) {
        var updatedExpression = this.getExpressionByName(options.name);
        updatedExpression['weightedField'] = options.weightedField;
        updatedExpression['weightedFieldType'] = options.weightedFieldType;
        this.model.update({
            id: updatedExpression.id,
            url: 'http://localhost:4567/project/'+this.projectId+'/expressions',
            dataObject: updatedExpression,
            success: function (data) {
                //alert('Successfully updated');
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
            url: 'http://localhost:4567/project/'+this.projectId+'/expressions',
            dataObject: updatedExpression,
            success: function (data) {
                //alert('Successfully updated');
            },
            error: function (data) {
                alert('Failed to update: ' + data);
            }
        });
    }

    upgradeExpressionGrade(options) {
        var that = this;
        var updatedExpression = this.getExpressionByName(options.name);
        updatedExpression['isGrade'] = options.isGrade;
        if (!options.isGrade) {// if no longer grade, associated unit should be removed
            delete updatedExpression.weightedField;
        }
        this.model.update({
            id: updatedExpression.id,
            url: 'http://localhost:4567/project/'+this.projectId+'/expressions',
            dataObject: updatedExpression,
            success: function (data) {
                //alert('Successfully updated');
                that.trigger('reload');
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
        //var expressionFilter = this.$el.find('#expression_filter').val();
        //var associatedUnit = this.$el.find('#associated_unit').val();
        if (expressionName && expressionDefinition) {
            var newExpression = {
                name: expressionName,
                isGrade: isGrade || false,
                isComplex: isComplex || false,
                exprvalue: expressionDefinition
            }
            this.model.add({
                dataObject: newExpression,
                success: function (data) {
                    //alert('Successfully added expression');
                    //that.data.push(data);
                    //that.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
                    $('.modal-backdrop').hide();
                    that.trigger('reload');

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
                    //alert('Successfully deleted expression.');
                },
                error: function (data) {
                    alert('Failed to delete expression.');
                }
            });
        });
        this.$el.find("#datatype-grid-basic").bootgrid("remove");
    }

    getExpressionByName(expressionName) {
        var object = null;
        this.data.forEach(function (data) {
            if (data.name === expressionName) {
                object = data;
            }
        });
        return object;
    }
}
