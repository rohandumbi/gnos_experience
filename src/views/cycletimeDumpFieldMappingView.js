import {View} from '../core/view';
import {CycletimeMappingModel} from '../models/cycletimeMappingModel';
import {DumpModel} from '../models/dumpModel';

export class CycletimeDumpFieldMappingView extends View {

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.cycletimeMappingModel = new CycletimeMappingModel({projectId: this.projectId});
        this.dumpModel = new DumpModel({projectId: this.projectId});
        this.mapping = options.map;
        this.fields = options.fields;
    }

    getHtml() {
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/cycletimeDumpFieldMappingView.html", function (data) {
                resolve(data);
            })
        });
        return promise;
    }

    onDomLoaded() {
        this.fetchDumps();
    }

    filterMissingDumps() {
        var that = this;
        this.missingDumps = [];
        this.dumps.forEach(function (dump) {
            var present = false;
            that.mapping.forEach(function (mapping) {
                if (mapping.fieldName === dump.name) {
                    present = true;
                }
            })
            if (!present) {
                that.missingDumps.push(dump);
            }
        });
    }

    fetchDumps() {
        var that = this;
        this.dumpModel.fetch({
            success: function (data) {
                that.dumps = data;
                that.filterMissingDumps();
                console.log(that.missingDumps);
                that.initializeGrid(that.mapping);
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
        object['mappingType'] = 3;
        this.cycletimeMappingModel.update({
            url: 'http://localhost:4567/project/' + that.projectId + '/cycletimemappings',
            dataObject: object,
            success: function (data) {
                alert('Successfully updated dump fields');
            },
            error: function () {
                alert('Error updating fixed fields');
            }
        });
    }
}
