import {View} from '../core/view';
import {ReserveModel} from '../models/reserveModel';
export class ReserveView extends View {

    constructor(options) {
        super();
        this.reserveModel = new ReserveModel({projectId: options.projectId});
    }

    getHtml() {
        var htmlContent;
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/reserveView.html", function (data) {
                resolve(data);
            })
        });
        return promise;
    }

    fetchReserves() {
        var that = this;
        this.$el.find("#loading-indicator").show();
        this.reserveModel.fetch({
            success: function (data) {
                that.loadReserveTable(data);
            }
        });
    }

    loadReserveTable(reserveData) {
        var that = this;
        var tableHeaderNames = reserveData[0];
        var tableHeaders = '<tr>';
        tableHeaderNames.forEach(function (tableHeaderName) {
            tableHeaders += '<th data-header-css-class="yearlyValueColumn" data-column-id="' + tableHeaderName + '">' + tableHeaderName + '</th>';
        });
        tableHeaders += '</tr>';
        this.$el.find("#datatype-grid-basic").addClass('long-grid');

        var tableRows = '';
        for (var i = 1; i < reserveData.length; i++) {
            var tableRow = '<tr>';
            reserveData[i].forEach(function (cellValue) {
                tableRow += '<td>' + cellValue + '</td>'
            });
            tableRow += '</tr>';
            tableRows += tableRow;
        }
        this.$el.find('#tableHead').append($(tableHeaders));
        this.$el.find('#tableFoot').append($(tableHeaders));
        this.$el.find("#tableBody").append($(tableRows));

        /*this.grid = this.$el.find("#datatype-grid-basic").bootgrid({
            rowCount: [20, 15, 10, 25],
            selection: true,
            multiSelect: true,
            rowSelect: true,
            keepSelection: false
        }).on("loaded.rs.jquery.bootgrid", function () {
            that.$el.find(".fa-search").addClass('glyphicon glyphicon-search');
            that.$el.find(".fa-th-list").addClass('glyphicon glyphicon-th-list');
            that.$el.find("#loading-indicator").hide();
         });*/

        this.grid = this.$el.find("#datatype-grid-basic").DataTable();
    }

    onDomLoaded() {
        //this.bindEvents();
        this.fetchReserves();
    }

    bindEvents() {

    }
}
