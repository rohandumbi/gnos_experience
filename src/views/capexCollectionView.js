import { View } from '../core/view';
import { ScenarioModel } from '../models/scenarioModel';
import { CapexCollection } from '../models/capexCollection'
import { CapexView } from './capexView'

export class CapexCollectionView extends View{

    constructor(options) {
        super();
        this.model = new ScenarioModel({});
        this.capexCollection = new CapexCollection({});
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
        this.initializeExistingCapex();
    }

    initializeExistingCapex() {
        var data = this.capexCollection.fetch();
        for(var i=0; i<data.capexCollection.length; i++){
            var capex = data.capexCollection[i];
            this.initializeCapexView(capex);
        }
    }

    initializeCapexView(capex) {
        console.log("initializing capex with id: " + capex.id);
        var capexView = new CapexView(capex);
        capexView.render();
        this.$el.find('#capex-container').append(capexView.$el);
    }
}
