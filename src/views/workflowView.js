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
            $li = $('<li draggable="true">' + model.name + '</li>');
            $li.attr('title', model.name);
            $li.addClass('list-group-item list-group-item-info');
            $liGroup.append($li);
        });
    }

    initializeGraph() {
        var $canvas = this.$el.find("#viewport");
        //var $container = $canvas.parent();
        $canvas.attr('width', '1300');
        $canvas.attr('height', '700');

        this.system = arbor.ParticleSystem(1000, 400,1);
        this.system.parameters({gravity:true});
        this.system.renderer = Renderer($canvas);
        this.system.screenPadding(20);

        var data = this.processModel.fetch();

        var block = this.system.addNode('Block',{'color':'red','shape':'dot','label':'BLOCK'});
        this.addProcessToGraph(block, data.processes);
        this.addProcessJoins();
    }

    addProcessJoins() {
        var join_uranus_cr = this.system.addNode('uranus_cr',{'color':'#2b2e3b','shape':'square','label':'Join: uranus_cr'});
        var uranus_lg_node = this.system.getNode('uranus_lg');
        var uranus_hg_node = this.system.getNode('uranus_hg');
        this.system.addEdge(join_uranus_cr, uranus_lg_node, {directed: true, weight: 2});
        this.system.addEdge(join_uranus_cr, uranus_hg_node, {directed: true, weight: 2});


        var join_saturn_cr = this.system.addNode('saturn_cr',{'color':'#2b2e3b','shape':'square','label':'Join: saturn_cr'});
        var saturn_hg_node = this.system.getNode('saturn_hg');
        var saturn_lg_node = this.system.getNode('saturn_lg');
        var uranus_hg_node = this.system.getNode('uranus_hg');
        var mars_hg_node = this.system.getNode('mars_hg');

        this.system.addEdge(join_saturn_cr, saturn_hg_node, {directed: true, weight: 2});
        this.system.addEdge(join_saturn_cr, saturn_lg_node, {directed: true, weight: 2});
        //this.system.addEdge(join_saturn_cr, uranus_hg_node, {directed: true, weight: 2});
        this.system.addEdge(join_saturn_cr, mars_hg_node, {directed: true, weight: 2});
    }


    handleDragStart(e) {
        e.target.style.opacity = '0.4';  // this / e.target is the source node.
    }

    handleDragEnd(e) {
        console.log('Dragged model: ' + e.target.innerHTML);
        var draggedModel = this.getModelWithName(e.target.innerHTML);
        e.target.style.opacity = '1';
        var pos = this.$el.find('#viewport').offset();
        var p = {x:e.pageX-pos.left, y:e.pageY-pos.top}
        var selected = this.system.nearest(p);

        if ((selected.node !== null) && (draggedModel!==null)){
            // dragged.node.tempMass = 10000
            //dragged.node.fixed = true;
            console.log('need to add');
            this.addProcessToGraph(selected.node, [draggedModel]);
        }
    }

    bindDomEvents() {
        this.bindDragEventsOnModels();
    }

    bindDragEventsOnModels() {
        var models = document.querySelectorAll('.list-group-item');
        var that = this;
        [].forEach.call(models, function(col) {
            col.addEventListener('dragstart', that.handleDragStart.bind(that), false);
            col.addEventListener('dragend', that.handleDragEnd.bind(that), false);
        });
    }

    getModelWithName(modelName) {
        var data = this.gnosModel.fetch();
        var models = data.models;
        var selectedModel = null;
        models.forEach(function(model){
            if(model.name === modelName) {
                selectedModel = model;
            }
        });
        return selectedModel;
    }
}
