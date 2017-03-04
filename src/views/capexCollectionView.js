import { View } from '../core/view';
import { CapexCollection } from '../models/capexCollection'
import { CapexView } from './capexView'

export class CapexCollectionView extends View{

    constructor(options) {
        super();
        this.scenario = options.scenario;
        if (!this.scenario) {
            alert('Please select a scenario first');
        }
        this.projectId = options.projectId;
        this.capexCollection = new CapexCollection({scenario: this.scenario});
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/capexCollectionView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    onDomLoaded() {
        if (!this.scenario) {
            return;
        }
        this.fetchCapex();
        this.$el.find('#scenario_name').val(this.scenario.name);
    }

    fetchCapex() {
        var that = this;
        this.capexCollection.fetch({
            success: function (data) {
                that.capex = data;
                that.initializeExistingCapex(that.capex);
            },
            error: function (data) {
                alert('Error fetching capex list');
            }
        });
    }

    initializeExistingCapex(capexData) {
        //var data = this.capexCollection.fetch();
        for (var i = 0; i < capexData.length; i++) {
            var capex = capexData[i];
            this.initializeCapexView(capex);
        }
    }

    initializeCapexView(capex) {
        var that = this;
        console.log("initializing capex with id: " + capex.id);
        var capexView = new CapexView({capex: capex, projectId: this.projectId});
        capexView.on('update:capex', function (updatedCapex) {
            console.log(updatedCapex);
            that.updateCapex(updatedCapex);
        });
        capexView.render();
        this.$el.find('#capex-container').append(capexView.$el);
    }

    updateCapex(updatedCapex) {
        this.capexCollection.update({
            id: updatedCapex.id,
            url: 'http://localhost:4567/capex',
            dataObject: updatedCapex,
            success: function (data) {
                alert('Successfully updated');
            },
            error: function (data) {
                alert('Failed to update: ' + data);
            }
        });
    }
}
