import { View } from '../core/view';
import { ProcessModel } from '../models/processModel';
import { GnosModel } from '../models/gnosModel';

export class WorkflowView extends View{

    constructor(options) {
        super();
        this.processModel = new ProcessModel({});
        this.gnosModel = new GnosModel({});
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/workflowView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    addProcessToGraph(parent, processes) {
        var that = this;
        processes.forEach(function (process) {
            var processNode = that.system.addNode(process.name,{'color':'#95cde5','shape':'dot','label':process.name});
            that.system.addEdge(parent, processNode, {directed: true, weight: 2});
            if(process.processes && (process.processes.length > 1)){
                that.addProcessToGraph(processNode, process.processes);
            }
        })
    }

    onDomLoaded() {
        this.initializeModelList();
        this.initializeGraph();
        this.bindDomEvents();
    }

    initializeModelList() {
        var data = this.gnosModel.fetch();
        var $liGroup = this.$el.find('ul.list-group');
        var $li;
        data.models.forEach(function(model) {
            $li = $('<li>' + model.name + '</li>');
            $li.addClass('list-group-item list-group-item-info');
            $liGroup.append($li);
        });
    }

    initializeGraph() {
        this.system = arbor.ParticleSystem(1000, 400,1);
        this.system.parameters({gravity:true});
        this.system.renderer = Renderer(this.$el.find("#viewport"));
        this.system.screenPadding(20);

        var data = this.processModel.fetch();

        var block = this.system.addNode('Block',{'color':'red','shape':'dot','label':'BLOCK'});
        this.addProcessToGraph(block, data.processes);
    }

    bindDomEvents() {

    }
}
