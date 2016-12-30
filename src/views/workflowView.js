import { View } from '../core/view';
import { ProcessModel } from '../models/processModel';

export class WorkflowView extends View{

    constructor(options) {
        super();
        this.processModel = new ProcessModel({});
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/workflowView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    addProcessToGraph(system, parent, processes) {
        var that = this;
        processes.forEach(function (process) {
            var processNode = system.addNode(process.name,{'color':'#95cde5','shape':'dot','label':process.name});
            system.addEdge(parent, processNode, {directed: true, weight: 2});
            if(process.processes && (process.processes.length > 1)){
                that.addProcessToGraph(system, processNode, process.processes);
            }
        })
    }

    onDomLoaded() {
        this.initializeGraph();
    }

    initializeGraph() {
        var sys = arbor.ParticleSystem(1000, 400,1);
        sys.parameters({gravity:true});
        sys.renderer = Renderer(this.$el.find("#viewport"));
        sys.screenPadding(20);

        var data = this.processModel.fetch();

        var block = sys.addNode('Block',{'color':'red','shape':'dot','label':'BLOCK'});
        this.addProcessToGraph(sys, block, data.processes);
    }
}
