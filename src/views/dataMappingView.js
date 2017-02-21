import { View } from '../core/view';
import { DatatypeModel } from '../models/datatypeModel';

export class DataMappingView extends View{

    constructor(options) {
        super();
		this.projectId = options.projectId;
        this.model = new DatatypeModel({projectId: this.projectId});
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/dataMappingView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    onDomLoaded() {
        this.initializeGrid();
    }

    getObjectByName(name) {
        var object;
        this.data.forEach(function (field) {
            if (field.name === name) {
                object = field;
            }
        });
        return object;

    }

    initializeGrid() {
        var that = this;
		this.model.fetch({
            success: function(data){
                that.data = data;
				var row = '';
                for (var i = 0; i < data.length; i++) {
                    var field = data[i];
					row += (
						'<tr>' +
							'<td>' + field.name + '</td>' +
                        '<td>' + field.dataType + '</td>' +
							'<td>' + field.weightedunit + '</td>' +
						'</tr>'
					)
                    var $row = $(row);
                    $row.data('data', field);
				}
                that.$el.find("#tableBody").append($(row));
                var grid = that.$el.find("#datatype-grid-basic").bootgrid({
					/*rowCount: 15,*/
					formatters: {
						"datatype": function(column, row){
                            if (row.datatype.toString() === '1') {
                                return (
                                    '<select data-fieldname="' + row.datafield + '" class="data-type">' +
                                    '<option value="1" selected>Number</option>' +
                                    '<option value="0">Text</option>' +
                                    '</select>'
                                )
                            } else if (row.datatype.toString() === '0') {
                                return (
                                    '<select data-fieldname="' + row.datafield + '" class="data-type">' +
                                    '<option value="1">Number</option>' +
                                    '<option selected value="0">Text</option>' +
                                    '</select>'
                                )
                            }
						},
						"weightedunit": function(column, row){
							return (
								'<input type="text" name="fname" value="' + row.weightedunit + '"' + '>'
							);
						}
					}
				}).on("loaded.rs.jquery.bootgrid", function()
				{
					/* Executes after data is loaded and rendered */
					that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
					that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');
                    grid.find(".data-type").change(function (e) {
                        var fieldName = $(this).data('fieldname');
                        var dataType = parseInt($(this).val());
                        var field = that.getObjectByName(fieldName);
                        field['dataType'] = dataType
                        that.updateField(field);
                    });
				});
			},
            error: function(data){
                alert("Error: " + data);
            }
        });
    }

    updateField(field) {
        console.log('field');
        this.model.update({
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
