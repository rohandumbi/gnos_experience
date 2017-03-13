import {View} from '../core/view';
import {ExpressionModel} from '../models/expressionModel';
import {TruckParamPayloadView} from './truckParamPayloadView';
import {TruckParamCycleTimeView} from './truckParamCycleTimeView';
import {FixedTimeModel} from '../models/fixedTimeModel';

export class TruckParamView extends View {

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.fixedTimeModel = new FixedTimeModel({projectId: this.projectId});
        this.model = new ExpressionModel({projectId: this.projectId});
    }

    getHtml() {
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/truckParamView.html", function (data) {
                resolve(data);
            })
        });
        return promise;
    }

    fetchFixedTime() {
        var that = this;
        this.fixedTimeModel.fetch({
            success: function (data) {
                that.fixedTime = data;
                if (data < 0) {//no fixed time entered, so adding value 0 as default
                    var defaultFixedTime = 0;
                    that.fixedTimeModel.add({
                        url: 'http://localhost:4567/project/' + that.projectId + '/fixedtime/' + defaultFixedTime,
                        success: function (data) {
                            alert('Successfully created default fixed time');
                            that.$el.find('#fixed_time').val(defaultFixedTime);
                        },
                        error: function (data) {
                            alert('Error updating fixed time: ' + data);
                        }
                    });
                } else {
                    that.$el.find('#fixed_time').val(data);
                }
                that.$el.find('#fixed_time').change(function (event) {
                    that.fixedTimeModel.update({
                        url: 'http://localhost:4567/project/' + that.projectId + '/fixedtime/' + $(this).val(),
                        success: function (data) {
                            alert('Successfully updated fixed time');
                        },
                        error: function (data) {
                            alert('Error updating fixed time: ' + data);
                        }
                    });
                });
            },
            error: function (data) {
                alert('Error fetching fixed time');
            }
        });
    }

    onDomLoaded() {
        this.fetchFixedTime();

        this.truckParamPayloadView = new TruckParamPayloadView({projectId: this.projectId});
        this.truckParamPayloadView.render();
        this.$el.find('#payload-container').append(this.truckParamPayloadView.$el);

        this.truckParamCycleTimeView = new TruckParamCycleTimeView({projectId: this.projectId});
        this.truckParamCycleTimeView.render();
        this.$el.find('#cycletime-container').append(this.truckParamCycleTimeView.$el);
    }
}
