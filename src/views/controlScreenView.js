import { View } from '../core/view';
export class ControlScreenView extends View{

    constructor(options) {
        super();
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

    onDomLoaded() {
		this.bindEvents();
    }

    bindEvents() {
        var that = this;

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
			})
            dataObj.period = that.$el.find('#period').val();
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
