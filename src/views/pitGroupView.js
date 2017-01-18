import { View } from '../core/view';
import { PitGroupModel } from '../models/pitGroupModel';
import { PitModel } from '../models/pitModel';

export class PitGroupView extends View{

    constructor(options) {
        super();
        this.pitGroupModel = new PitGroupModel({});
        this.pitModel = new PitModel({});
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/pitGroupView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    addGroupToGraph(parent, processes) {
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
        this.initializePitList();
        this.initializeGraph();
        this.bindDomEvents();
    }

    initializePitList() {
        var data = this.pitModel.fetch();
        var $liGroup = this.$el.find('ul.list-group');
        var $li;
        data.pits.forEach(function(pit) {
            $li = $('<li draggable="true">' + pit.name + '</li>');
            $li.attr('title', pit.name);
            $li.addClass('list-group-item list-group-item-info');
            $liGroup.append($li);
        });
    }

    initializeGraph() {
        var that = this;
        var $canvas = this.$el.find("#viewport");
        //var $container = $canvas.parent();
        $canvas.attr('width', '1300');
        $canvas.attr('height', '700');

        this.system = arbor.ParticleSystem(1000, 400,1);
        this.system.parameters({gravity:true});
        this.system.renderer = Renderer($canvas);
        this.system.screenPadding(20);

        var data = this.pitGroupModel.fetch();

        //var block = this.system.addNode('Block',{'color':'red','shape':'dot','label':'BLOCK'});
        var pitGroups = data.pitGroups;
        pitGroups.forEach(function(pitGroup) {
            var pitGroupNode = that.system.addNode(pitGroup.name,{'color':'red','shape':'dot','label': pitGroup.name});
            //this.addGroupToGraph(pitGroup, data.pitGroups);
            var memberPits = pitGroup.pits;
            memberPits.forEach(function (memberPit) {
                var pitNode = that.system.addNode(memberPit.name,{'color':'#95cde5','shape':'dot','label':memberPit.name});
                that.system.addEdge(pitGroupNode, pitNode, {directed: true, weight: 2});
            });
        });
        //this.addProcessJoins();
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
        var that = this;
        console.log('Dragged model: ' + e.target.innerHTML);
        var draggedModel = this.getPitWithName(e.target.innerHTML);
        e.target.style.opacity = '1';
        var pos = this.$el.find('#viewport').offset();
        var p = {x:e.pageX-pos.left, y:e.pageY-pos.top}
        var selected = this.system.nearest(p);

        if ((selected.node !== null) && (draggedModel!==null)){
            // dragged.node.tempMass = 10000
            //dragged.node.fixed = true;
            console.log('need to add');
            //this.addProcessToGraph(selected.node, [draggedModel]);
            var pitNode = that.system.addNode(draggedModel.name,{'color':'#95cde5','shape':'dot','label':draggedModel.name});
            that.system.addEdge(selected.node, pitNode, {directed: true, weight: 2});
        }
    }

    bindDomEvents() {
        this.bindDragEventsOnModels();
        this.$el.find('#define_pit_group').click(function() {
           alert("To display pit group definition form");
        });
    }

    bindDragEventsOnModels() {
        var models = document.querySelectorAll('.list-group-item');
        var that = this;
        [].forEach.call(models, function(col) {
            col.addEventListener('dragstart', that.handleDragStart.bind(that), false);
            col.addEventListener('dragend', that.handleDragEnd.bind(that), false);
        });
    }

    getPitWithName(pitName) {
        var data = this.pitModel.fetch();
        var models = data.pits;
        var selectedModel = null;
        models.forEach(function(model){
            if(model.name === pitName) {
                selectedModel = model;
            }
        });
        return selectedModel;
    }
}
