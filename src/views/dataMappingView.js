import { View } from './view';

export class DataMappingView extends View{

    constructor(options) {
        super();
        //this.model = new LoginModel({});
    }

    getHtml() {
        var htmlContent =  (
            '<div id="dataMappingView">' +
                '<table id="grid-basic" class="table table-condensed table-hover table-striped">' +
                    '<thead>' +
                        '<tr>' +
                            '<th data-column-id="datafield">CSV Data Field</th>' +
                            '<th data-column-id="datatype" data-formatter="datatype">Datatype</th>' +
                            '<th data-column-id="weightedunit" data-formatter="weightedunit" data-order="desc">Weighted Unit</th>' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody>' +
                        '<tr>' +
                            '<td>block</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td>model</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td>pit_name</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td>bench_rl</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td>mp_dest</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td>bin</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td>watertable</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td>t_t</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td>t_fe</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td>t_al</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td>t_si</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td>t_p</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td>t_mn</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td>t_loi</td>' +
                        '</tr>' +
                    '</tbody>' +
                '</table>' +
            '</div>'
        );
        return htmlContent;
    }

    render() {
        super.render();
        this.$el.find("#grid-basic").bootgrid({
            formatters: {
                "datatype": function(column, row){
                    return (
                        '<select>' +
                            '<option value="grouptext">Group By(Text)</option>' +
                            '<option value="groupnumeric">Group By(Numeric)</option>' +
                            '<option value="unit">Unit</option>' +
                            '<option value="grade">Grade</option>' +
                        '</select>') ;
                },
                "weightedunit": function(column, row){
                    return (
                        '<input type="text" name="fname">'
                    );
                }
            }
        });;
        return this;
    }

    bindDomEvents() {
    }
}
