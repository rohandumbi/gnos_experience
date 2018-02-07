import {View} from '../core/view';
import {ReserveModel} from '../models/reserveModel';
export class ReserveView extends View {

    constructor(options) {
        super();
        this.projectId = options.projectId;
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
        var columns = [];
        for (var j = 0; j < reserveData[0].length; j++) {
            columns.push({title: reserveData[0][j]});
        }
        var dataSet = [];
        for (var i = 1; i < reserveData.length; i++) {
            dataSet.push(reserveData[i]);
        }
        this.grid = this.$el.find("#datatype-grid-basic")
            .on('draw.dt', function () {
                that.$el.find("#loading-indicator").hide();
            })
            .DataTable({
                lengthMenu: [[15, 20, 10, 25, 50, -1], [15, 20, 10, 25, 50, "All"]],
                columns: columns,
                data: dataSet,
                scrollX: true,
                deferRender: true
            });
    }

    onDomLoaded() {
        //this.bindEvents();
        this.fetchReserves();
    }

    bindEvents() {

    }
}
