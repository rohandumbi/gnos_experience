import { View } from './view';
import { DatatypeModel } from '../models/datatypeModel';

export class DataMappingView extends View{

    constructor(options) {
        super();
        this.model = new DatatypeModel({});
    }

    getHtml() {
        var htmlContent =  (
            '<div id="dataMappingView">' +
                '<table id="datatype-grid-basic" class="table table-condensed table-hover table-striped">' +
                    '<thead>' +
                        '<tr>' +
                            '<th data-column-id="datafield">CSV Data Field</th>' +
                            '<th data-column-id="datatype" data-formatter="datatype">Datatype</th>' +
                            '<th data-column-id="weightedunit" data-formatter="weightedunit" >Weighted Unit</th>' +
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
        var data = this.model.fetch();
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
            me.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            me.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');
        });;
        return this;
    }

    bindDomEvents() {
    }
}
