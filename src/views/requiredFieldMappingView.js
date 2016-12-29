import { View } from './view';
import { RequiredFieldModel } from '../models/requiredFieldModel';
import { AllFieldsModel } from '../models/allFieldsModel';

export class RequiredFieldMappingView extends View{

    constructor(options) {
        super();
        this.requiredFieldModel = new RequiredFieldModel({});
        this.allFieldsModel = new AllFieldsModel({});
    }

    getHtml() {
        var htmlContent =  (
            '<div id="requiredFieldMappingView">' +
                '<table id="requiredField-grid-basic" class="table table-condensed table-hover table-striped">' +
                    '<thead>' +
                        '<tr>' +
                            '<th data-column-id="datafield">Required Fields</th>' +
                            '<th data-column-id="source" data-formatter="source">Source</th>' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody id="tableBody">' +
                    '</tbody>' +
                '</table>' +
            '</div>'
        );
        return htmlContent;
    }

    render() {
        super.render();
        var me = this;
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
            me.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            me.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');
        });
        return this;
    }

    bindDomEvents() {
    }
}
