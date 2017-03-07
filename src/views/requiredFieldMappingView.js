import { View } from '../core/view';
import { RequiredFieldModel } from '../models/requiredFieldModel';
import { AllFieldsModel } from '../models/allFieldsModel';

export class RequiredFieldMappingView extends View{

    constructor(options) {
        super();
		this.projectId = options.projectId;
        this.requiredFieldModel = new RequiredFieldModel({projectId: this.projectId});
        this.allFieldsModel = new AllFieldsModel({projectId: this.projectId});
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
        this.initializeGrid();
    }

    initializeGrid() {
		var allFields = this.allFieldsModel.fetch();
		var that = this;
		this.requiredFieldModel.fetch({
            success: function(data){
				var row = '';
				var sourceOptions = '';
				for(var i=0; i<data.length; i++){
					var field = data[i];
					row += (
						'<tr>' +
						'<td>' + field.fieldName + '</td>' +
						'<td>' + field.mappedFieldname + '</td>' +
						'</tr>'
					)
					var $row = $(row);
                    $row.data('data', field);
				}
/*
				for(var j=0; j< allFields.fields.length; j++){
					var option = allFields.fields[j];
					sourceOptions += (
						'<option value="' + option.name + '">' + option.name + '</option>'
					)
				} */
				that.$el.find("#tableBody").append($(row));
				that.$el.find("#requiredField-grid-basic").bootgrid({
					/*rowCount: 15,*/
					formatters: {
						"source": function(column, row){
							return (
							'<select value="test">' +
							'<option selected disabled hidden>' + row.source + '</option>'+
							sourceOptions +
							'</select>') ;
						}
					}
				}).on("loaded.rs.jquery.bootgrid", function()
				{
					/* Executes after data is loaded and rendered */
					that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
					that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');
				});
			},
            error: function(data){
                alert("Error: " + data);
            }
        });
    }
}
