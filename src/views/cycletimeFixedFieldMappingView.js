import {View} from '../core/view';
import {CycletimeMappingModel} from '../models/cycletimeMappingModel';

export class CycletimeFixedFieldMappingView extends View {

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.cycletimeMappingModel = new CycletimeMappingModel({projectId: this.projectId});
        this.mapping = options.map;
        this.fields = options.fields;
        this.fixedFields = [{name: 'pit'}, {name: 'bench'}];
    }

    getHtml() {
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/cycletimeFixedFieldMappingView.html", function (data) {
                resolve(data);
            })
        });
        return promise;
    }

    onDomLoaded() {
        //this.fetchAllFields();
        this.filterMissingFixedFields();
        console.log(this.missingFixedFields);
        this.initializeGrid(this.mapping);
    }

    filterMissingFixedFields() {
        var that = this;
        this.missingFixedFields = [];
        this.fixedFields.forEach(function (field) {
            var present = false;
            that.mapping.forEach(function (mapping) {
                if (mapping.fieldName === field.name) {
                    present = true;
                }
            })
            if (!present) {
                that.missingFixedFields.push(field);
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
                '<td>' + requiredField.mappedFieldName + '</td>' +
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
                    var mappedFieldName = row.mappedFieldName;
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
        object['mappedFieldName'] = mappedField;
        object['mappingType'] = 1;
        this.updateModel(object);
    }

    updateModel(object) {
        this.cycletimeMappingModel.update({
            url: 'http://localhost:4567/project/' + that.projectId + '/cycletimemappings',
            dataObject: object,
            success: function (data) {
                alert('Successfully updated fixed fields');
            },
            error: function () {
                alert('Error updating fixed fields');
            }
        });
    }
}
