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

    initializeGrid() {
        var that = this;
		this.model.fetch({
            success: function(data){
				var row = '';
				for(var i=0; i<data.fields.length; i++){
					var field = data.fields[i];
					row += (
						'<tr>' +
							'<td>' + field.name + '</td>' +
							'<td>' + field.datatype + '</td>' +
							'<td>' + field.weightedunit + '</td>' +
						'</tr>'
					)
				}
				this.$el.find("#tableBody").append($(row));
				var grid = this.$el.find("#datatype-grid-basic").bootgrid({
					/*rowCount: 15,*/
					formatters: {
						"datatype": function(column, row){
							return (
							'<select value="test">' +
							'<option selected disabled hidden>' + row.datatype + '</option>'+
							'<option value="grouptext">Group By(Text)</option>' +
							'<option value="groupnumeric">Group By(Numeric)</option>' +
							'<option value="unit">Unit</option>' +
							'<option value="grade">Grade</option>' +
							'</select>') ;
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
				});
			},
            error: function(data){
                alert("Error: " + data);
            }
        });
    }
}
