import { View } from './view';
import { ProcessModel } from '../models/processModel';

export class WorkflowView extends View{

    constructor(options) {
        super();
        this.processModel = new ProcessModel({});
    }

    getHtml() {
        var htmlContent =  (
            '<div id="workflowView">' +
                '<canvas id="viewport" width="1500" height="600"></canvas>' +
            '</div>'
        );
        return htmlContent;
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

    render() {
        super.render();
        //var sys = arbor.ParticleSystem(2600, 512, 0.5);
        var sys = arbor.ParticleSystem(1000, 400,1);
        sys.parameters({gravity:true});
        sys.renderer = Renderer(this.$el.find("#viewport"));
        sys.screenPadding(20);

        var data = this.processModel.fetch();

        var block = sys.addNode('Block',{'color':'red','shape':'dot','label':'BLOCK'});
        this.addProcessToGraph(sys, block, data.processes);

        /*var dog = sys.addNode('dog',{'color':'green','shape':'dot','label':'dog'});
        var cat = sys.addNode('cat',{'color':'blue','shape':'dot','label':'cat'});

        sys.addEdge(animals, dog, {directed: true, weight: 2});
        sys.addEdge(animals, cat, {directed: true, weight: 2});*/
        return this;
    }

    bindDomEvents() {

    }
}
