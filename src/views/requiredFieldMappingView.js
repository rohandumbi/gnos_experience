import { View } from '../core/view';
import { RequiredFieldModel } from '../models/requiredFieldModel';
import {FieldsModel} from '../models/fieldsModel';

export class RequiredFieldMappingView extends View{

    constructor(options) {
        super();
		this.projectId = options.projectId;
        this.requiredFieldModel = new RequiredFieldModel({projectId: this.projectId});
        this.fieldsModel = new FieldsModel({projectId: this.projectId});
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/requiredFieldMappingView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    onDomLoaded() {
        this.fetchAllFields();
    }

    fetchAllFields() {
        var that = this;
        this.fieldsModel.fetch({
            success: function (data) {
                that.fields = data;
                that.fetchRequiredFields();
            },
            error: function (data) {
                alert('Error fetching required fields');
            }
        });
    }

    fetchRequiredFields() {
        var that = this;
        this.requiredFieldModel.fetch({
            success: function (data) {
                that.requiredFields = data;
                that.initializeGrid(data);
            },
            error: function (data) {
                alert('Error fetching required fields');
            }
        });
    }

    initializeGrid(dataObject) {
        //var allFields = this.allFieldsModel.fetch();
		var that = this;
        var row = '';
        for (var i = 0; i < dataObject.length; i++) {
            var requiredField = dataObject[i];
            row += (
                '<tr>' +
                '<td>' + requiredField.fieldName + '</td>' +
                '<td>' + requiredField.mappedFieldname + '</td>' +
                '</tr>'
            )
        }
        this.$el.find("#tableBody").append($(row));
        this.grid = this.$el.find("#requiredField-grid-basic").bootgrid({
            rowCount: [15, 10, 20, 25],
            selection: true,
            multiSelect: true,
            rowSelect: true,
            keepSelection: true,
            formatters: {
                "mapping": function (column, row) {
                    //var expression = that.getExpressionById(row.expressionId);
                    //var expressionName;
                    var mappedFieldName = row.mappedFieldname;
                    if (!mappedFieldName) {
                        mappedFieldName = '';
                    }
                    var tableRow = '';
                    tableRow = (
                        '<select class="mapped-field" value="test">' +
                        '<option selected disabled hidden>' + mappedFieldName + '</option>'
                    )
                    that.fields.forEach(function (field) {
                        tableRow += '<option data-field-name="' + field.name + '">' + field.name + '</option>';
                    });

                    tableRow += '</select>';
                    return tableRow;
                }
            }
        }).on("loaded.rs.jquery.bootgrid", function () {
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');
            that.grid.find(".mapped-field").change(function (event) {
                that.updateMapping($(this));
            });
        });
    }

    updateMapping($cell) {
        var that = this;
        var fieldName = $cell.closest('tr').data('row-id');
        var mappedField = $cell.find(":selected").val();
        var object = {};
        object['fieldName'] = fieldName;
        object['mappedFieldname'] = mappedField;
        this.requiredFieldModel.update({
            url: 'http://localhost:4567/project/' + that.projectId + '/requiredfields',
            dataObject: object,
            success: function (data) {
                //alert('Successfully updated required fields');
            },
            error: function () {
                //alert('Error updating required fields');
            }
        })
    }
}
