import { View } from '../core/view';
import { RequiredFieldModel } from '../models/requiredFieldModel';
import { AllFieldsModel } from '../models/allFieldsModel';

export class RequiredFieldMappingView extends View{

    constructor(options) {
        super();
        this.requiredFieldModel = new RequiredFieldModel({});
        this.allFieldsModel = new AllFieldsModel({});
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
        var that = this;
        var data = this.requiredFieldModel.fetch();
        var allFields = this.allFieldsModel.fetch();
        var row = '';
        var sourceOptions = '';

        for(var i=0; i<data.fields.length; i++){
            var field = data.fields[i];
            row += (
                '<tr>' +
                '<td>' + field.name + '</td>' +
                '<td>' + field.source + '</td>' +
                '</tr>'
            )
        }

        for(var j=0; j<allFields.fields.length; j++){
            var option = allFields.fields[j];
            sourceOptions += (
                '<option value="' + option.name + '">' + option.name + '</option>'
            )
        }
        this.$el.find("#tableBody").append($(row));
        this.$el.find("#requiredField-grid-basic").bootgrid({
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
    }
}
