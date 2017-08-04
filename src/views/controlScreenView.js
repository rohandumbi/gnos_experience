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
    }

    bindEvents() {
        var that = this;
        this.$el.find('input:radio[name=modeoption]').change(function (e) {
            if (this.value === '1') {
                that.$el.find('#window').prop('disabled', true);
                that.$el.find('#step-size').prop('disabled', true);
            } else if (this.value === '2') {
                that.$el.find('#window').prop('disabled', false);
                that.$el.find('#step-size').prop('disabled', false);
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
			$('#equations input:checkbox:checked').each(function(){
				dataObj.enableEquations[$(this).val()] = true;
            });
            dataObj.enableEquations["PROCESS_CONSTRAINT"] = true;
            dataObj.enableEquations["BENCH_CONSTRAINT"] = true;
            dataObj.enableEquations["DUMP_CAPACITIES"] = true;
            dataObj.enableEquations["DUMP_DEPENDENCY"] = true;
            dataObj.enableEquations["PIT_DEPENDENCY"] = true;
            dataObj.enableEquations["BOUNDARY_VARIABLES"] = true;

            dataObj.period = that.$el.find('#period').val();
            var gapValue = that.$el.find('#gap').val();
            if (!gapValue) {
                gapValue = 0;
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
				},
				error: function(data) {
					alert(data);
				},
				dataType: 'json'
			});
        });
    }
}
