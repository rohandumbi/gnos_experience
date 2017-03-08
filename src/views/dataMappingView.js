import { View } from '../core/view';
import {FieldsModel} from '../models/fieldsModel';

export class DataMappingView extends View{

    constructor(options) {
        super();
		this.projectId = options.projectId;
        this.fieldsModel = new FieldsModel({projectId: this.projectId});
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/dataMappingView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    fetchFields() {
        var that = this;
        this.fieldsModel.fetch({
            success: function (data) {
                that.fields = data;
                that.initializeGrid(data);
            }
        });
    }

    onDomLoaded() {
        this.fetchFields();
    }

    getFieldByName(name) {
        var object;
        this.fields.forEach(function (field) {
            if (field.name === name) {
                object = field;
            }
        });
        return object;

    }

    initializeGrid(dataObject) {
        var that = this;
        var row = '';
        for (var i = 0; i < dataObject.length; i++) {
            var field = dataObject[i];
            row += (
                '<tr>' +
                '<td>' + field.name + '</td>' +
                '<td>' + field.dataType + '</td>' +
                '<td>' + field.weightedUnit + '</td>' +
                '</tr>'
            )
            var $row = $(row);
            $row.data('data', field);
        }
        that.$el.find("#tableBody").append($(row));
        var grid = that.$el.find("#datatype-grid-basic").bootgrid({
            /*rowCount: 15,*/
            formatters: {
                "datatype": function (column, row) {
                    var dataTypeName = '';
                    if (row.dataType.toString() === '1') {
                        dataTypeName = 'Group By(Text)';
                    } else if (row.dataType.toString() === '2') {
                        dataTypeName = 'Group By(Numeric)';
                    } else if (row.dataType.toString() === '3') {
                        dataTypeName = 'Unit';
                    } else if (row.dataType.toString() === '4') {
                        dataTypeName = 'Grade';
                    }

                    return (
                        '<select class="data-type" data-fieldname="' + row.name + '" class="data-type">' +
                        '<option selected disabled hidden>' + dataTypeName + '</option>' +
                        '<option value="1">Group By(Text)</option>' +
                        '<option value="2">Group By(Numeric)</option>' +
                        '<option value="3">Unit</option>' +
                        '<option value="4">Grade</option>' +
                        '</select>'
                    )
                },
                "weightedunit": function (column, row) {
                    var weightedUnitName = row.weightedUnit;
                    if (!weightedUnitName) {
                        weightedUnitName = '';
                    }
                    return (
                        '<input data-fieldname="' + row.name + '" class="weightedunit" type="text" name="fname" value="' + weightedUnitName + '"' + '>'
                    );
                }
            }
        }).on("loaded.rs.jquery.bootgrid", function () {
            /* Executes after data is loaded and rendered */
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');
            grid.find(".data-type").change(function (e) {
                var fieldName = $(this).data('fieldname');
                var dataType = parseInt($(this).val());
                var field = that.getFieldByName(fieldName);
                field['dataType'] = dataType
                that.updateField(field);
            });
            grid.find(".weightedunit").change(function (e) {
                var fieldName = $(this).data('fieldname');
                var weightedUnit = $(this).val();
                var field = that.getFieldByName(fieldName);
                field['weightedUnit'] = weightedUnit;
                that.updateField(field);
            });
        });
    }

    updateField(field) {
        console.log('field');
        this.fieldsModel.update({
            url: 'http://localhost:4567/field',
            id: field.id,
            dataObject: field,
            success: function (data) {
                alert('Successfully Updated');
            },
            error: function (data) {
                alert('Error Updating: ' + data);
            }
        });

    }
}
