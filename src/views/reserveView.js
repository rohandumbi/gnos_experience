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
        this.reserveModel.fetch({
            success: function (data) {
                that.loadReserveTable(data);
            }
        });
    }

    loadReserveTable(reserveData) {
        var tableHeaderNames = reserveData[0];
        var tableHeaders = '<thead><tr>';
        tableHeaderNames.forEach(function (tableHeaderName) {
            tableHeaders += '<th>' + tableHeaderName + '</th>';
        });
        tableHeaders += '</tr></thead>';
        var tableBody = '<tbody>';
        var tableRows = '';
        for (var i = 1; i < reserveData.length; i++) {
            var tableRow = '<tr>';
            reserveData[i].forEach(function (cellValue) {
                tableRow += '<td>' + cellValue + '</td>'
            });
            tableRow += '</tr>';
            tableRows += tableRow;
        }
        tableBody += tableRows + '</tbody>';

        this.$el.find('#reserve-table').append(tableHeaders);
        this.$el.find('#reserve-table').append(tableBody);
    }

    onDomLoaded() {
        //this.bindEvents();
        this.fetchReserves();
    }

    bindEvents() {

    }
}
