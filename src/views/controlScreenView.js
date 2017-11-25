import { View } from '../core/view';
export class ControlScreenView extends View{

    constructor(options) {
        super();
        this.scenario = options.scenario;
		this.projectId = options.projectId;
		this.scenarioId = options.scenario.id;
    }

    getHtml() {
		var promise = new Promise(function(resolve, reject){
            $.get( "../content/controlScreenView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    render() {
        super.render(this.scenario);
        return this;
    }

    onDomLoaded() {
		this.bindEvents();
        this.loadSavedRunConfig();
    }

    loadSavedRunConfig() {
        var savedRunConfig = JSON.parse(localStorage.getItem('RunConfig-' + this.projectId));
        if (savedRunConfig) {
            if (savedRunConfig.gap) {
                this.$el.find('#gap').val(savedRunConfig.gap);
            }
            if (savedRunConfig.isReclaim) {
                this.$el.find('#reclaimoption').prop('checked', true);
            }
            if (!savedRunConfig.enableEquations['GRADE_CONSTRAINT']) {
                this.$el.find('#gradeConstraint').prop('checked', false);
            }
            if (!savedRunConfig.enableEquations['BENCH_PROPORTION']) {
                this.$el.find('#benchProportion').prop('checked', false);
            }
            if (!savedRunConfig.enableEquations['CAPEX']) {
                this.$el.find('#capex').prop('checked', false);
            }
            if (savedRunConfig.period) {
                this.$el.find('#period option[value="' + savedRunConfig.period + '"]').prop('selected', true);
            }
            if (savedRunConfig.window) {
                this.$el.find('#window').val(savedRunConfig.window);
            }
            if (savedRunConfig.mode === '1') {
                this.$el.find('#globalBtn').prop('checked', true);
                this.$el.find('#slidingBtn').prop('checked', false);
                this.$el.find('#window').prop('disabled', true);
            } else if (savedRunConfig.mode === '2') {
                this.$el.find('#slidingBtn').prop('checked', true);
                this.$el.find('#globalBtn').prop('checked', false);
                this.$el.find('#window').prop('disabled', false);

            }
        }
    }

    bindEvents() {
        var that = this;
        this.$el.find('input:radio[name=modeoption]').change(function (e) {
            if (this.value === '1') {
                that.$el.find('#window').prop('disabled', true);
                //that.$el.find('#step-size').prop('disabled', true);
            } else if (this.value === '2') {
                that.$el.find('#window').prop('disabled', false);
                //that.$el.find('#step-size').prop('disabled', false);
            }
        });

		this.$el.find('#controlScreenForm').submit(function(e) {
			e.preventDefault();
			var url = "http://localhost:4567/project/"+that.projectId+"/scenario/"+that.scenarioId+"/runscheduler";
			var dataObj = {};
			var mode = $('input:radio[name=modeoption]:checked').val();
            var isReclaim = $('#reclaimoption').is(':checked');
			dataObj.mode = mode;
			dataObj.isReclaim = isReclaim;
			dataObj.enableEquations = {};
            that.$el.find('#equations input:checkbox').each(function () {
                dataObj.enableEquations[$(this).val()] = $(this).is(':checked');
                ;
            });
            dataObj.period = that.$el.find('#period').val();
            var gapValue = that.$el.find('#gap').val();
            var intGap = parseInt(gapValue, 10);
            if(!gapValue || intGap <= 0 || intGap> 100){
                alert("The GAP value must be greater than 0 and less than 100");
                return;
            }
            dataObj.gap = gapValue;
            dataObj.window = that.$el.find('#window').val();
            dataObj.stepSize = that.$el.find('#step-size').val();

			var data = JSON.stringify(dataObj);
			$.ajax({
				url: url,
				type: "POST",
				data: data,
				success: function(data){
					alert("Scheduler started")
                    localStorage.setItem('RunConfig-' + that.projectId, JSON.stringify(dataObj));
				},
				error: function(data) {
                    alert(data.message);
				},
				dataType: 'json'
			});
        });
    }
}
