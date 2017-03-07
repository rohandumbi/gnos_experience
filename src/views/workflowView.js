import { View } from '../core/view';
import { ProcessModel } from '../models/processModel';
import { GnosModel } from '../models/gnosModel';
import {ProcessTreeNodeModel} from '../models/processTreeNodeModel'
import {ProcessJoinModel} from '../models/processJoinModel'

export class WorkflowView extends View{

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.processModel = new ProcessModel({projectId: options.projectId});
        this.gnosModel = new GnosModel({projectId: options.projectId});
        this.processTreeModel = new ProcessTreeNodeModel({projectId: options.projectId});
        this.processJoinModel = new ProcessJoinModel({projectId: options.projectId});
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/workflowView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    getModelWithId(modelId) {
        var object = null;
        this.models.forEach(function (model) {
            if (model.id === modelId) {
                object = model;
            }
        });
        return object;
    }

    getNodeWithName(nodeName) {
        return this.system.getNode(nodeName);
    }

    addProcessJoinsToGraph(processJoins) {
        var that = this;
        processJoins.forEach(function (processJoin) {
            var processNode = that.system.addNode(processJoin.name, {
                'color': '#00ff52',
                'shape': 'dot',
                'label': processJoin.name,
                'category': 'processJoin'
            });
            processJoin.childProcessList.forEach(function (childProcessId) {
                var childModel = that.getModelWithId(childProcessId);
                var childModelNode = that.system.getNode(childModel.name);
                that.system.addEdge(processNode, childModelNode, {directed: true, weight: 2});
            });
            /*var modelId = process.modelId;
             var parentModelId = process.parentModelId;
             var model = that.getModelWithId(modelId);
             var parentModel = that.getModelWithId(parentModelId);

             var modelNode = that.getNodeWithName(model.name);
             if (!modelNode) {
             modelNode = that.system.addNode(model.name, {
             'color': '#95cde5',
             'shape': 'dot',
             'label': model.name,
             'id': model.id,
             'category': 'model'
             });
             }
             var parentNode = null;
             if (parentModel) {
             parentNode = that.getNodeWithName(parentModel.name);
             if (!parentNode) {
             parentNode = that.system.addNode(parentModel.name, {
             'color': '#95cde5',
             'shape': 'dot',
             'label': parentModel.name,
             'id': parentModel.id,
             'category': 'block'
             });
             }
             } else {
             parentNode = that.getNodeWithName('Block');
             }

             that.system.addEdge(parentNode, modelNode, {directed: true, weight: 2});*/
        });
    }

    addProcessesToGraph(processes) {
        var that = this;
        processes.forEach(function (process) {
            var modelId = process.modelId;
            var parentModelId = process.parentModelId;
            var model = that.getModelWithId(modelId);
            var parentModel = that.getModelWithId(parentModelId);

            var modelNode = that.getNodeWithName(model.name);
            if (!modelNode) {
                modelNode = that.system.addNode(model.name, {
                    'color': '#95cde5',
                    'shape': 'dot',
                    'label': model.name,
                    'id': model.id,
                    'category': 'model'
                });
            }
            var parentNode = null;
            if (parentModel) {
                parentNode = that.getNodeWithName(parentModel.name);
                if (!parentNode) {
                    parentNode = that.system.addNode(parentModel.name, {
                        'color': '#95cde5',
                        'shape': 'dot',
                        'label': parentModel.name,
                        'id': parentModel.id,
                        'category': 'block'
                    });
                }
            } else {
                parentNode = that.getNodeWithName('Block');
            }

            that.system.addEdge(parentNode, modelNode, {directed: true, weight: 2});
        });
    }

    fetchProcesses() {
        var that = this;
        this.processModel.fetch({
            success: function (data) {
                that.processes = data;
                /*var $liGroup = that.$el.find('ul.list-group');
                 var $li;
                 data.forEach(function (process) {
                 $li = $('<li data-process-id="' + process.id + '" draggable="true">' + process.name + '</li>');
                 $li.attr('title', process.name);
                 $li.addClass('list-group-item list-group-item-info');
                 $liGroup.append($li);
                 });*/
                //that.fetchPitGroups();
                //that.initializeGraph();
            },
            error: function (data) {
                alert('Error fetching list of pits: ' + data);
            }
        });
    }

    fetchProcessJoins() {
        var that = this;
        this.processJoinModel.fetch({
            success: function (data) {
                that.processJoins = data;
                that.initializeGraph(data);
                that.bindDomEvents();
            }
        });
    }

    fetchProcessTreeNodes() {
        var that = this;
        this.processTreeModel.fetch({
            success: function (data) {
                that.treeNodes = data;
                that.fetchProcessJoins();
            }
        });
    }

    fetchModels() {
        var that = this;
        this.gnosModel.fetch({
            success: function (data) {
                that.models = data;
                var $liGroup = that.$el.find('ul.list-group');
                var $li;
                data.forEach(function (model) {
                    $li = $('<li data-model-id="' + model.id + '" draggable="true">' + model.name + '</li>');
                    $li.attr('title', model.name);
                    $li.addClass('list-group-item list-group-item-info');
                    $liGroup.append($li);
                });
                that.fetchProcessTreeNodes();
                //that.initializeGraph();
            },
            error: function (data) {
                alert('Error fetching list of pits: ' + data);
            }
        });
    }

    onDomLoaded() {
        this.fetchModels();
        //this.initializeGraph();
        //this.bindDomEvents();
    }

    /*initializeModelList() {
        var data = this.gnosModel.fetch();
        var $liGroup = this.$el.find('ul.list-group');
        var $li;
        data.models.forEach(function(model) {
            $li = $('<li draggable="true">' + model.name + '</li>');
            $li.attr('title', model.name);
            $li.addClass('list-group-item list-group-item-info');
            $liGroup.append($li);
        });
     }*/

    initializeGraph(nodeData) {
        var that = this;
        var $canvas = this.$el.find("#viewport");
        //var $container = $canvas.parent();
        $canvas.attr('width', '1300');
        $canvas.attr('height', '700');

        this.system = arbor.ParticleSystem(1000, 400,1);
        this.system.parameters({gravity:true});
        this.system.renderer = Renderer($canvas);
        this.system.screenPadding(20);

        var block = this.system.addNode('Block', {'color': 'red', 'shape': 'dot', 'label': 'Block'});
        this.addProcessesToGraph(this.treeNodes);
        this.addProcessJoinsToGraph(this.processJoins);
        $canvas.contextMenu({
            menuSelector: "#workflowContextMenu",
            menuSelected: function (invokedOn, selectedMenu, event) {
                var selectedAction = selectedMenu.text();
                if (selectedAction.toString() === 'Delete') {
                    that.handleDelete(event);
                } else if ((selectedAction.toString() === 'Add product')) {
                    that.handleAddProduct(event);
                }
            }
        });
    }

    handleDelete(event) {
        var that = this;
        var pos = this.$el.find('#viewport').offset();
        var p = {x: event.pageX - pos.left, y: event.pageY - pos.top}
        var selected = this.system.nearest(p);
        if (selected.node) {
            console.log('Delete: ' + selected.node.name);
            this.processTreeModel.delete({
                url: 'http://localhost:4567/project/' + that.projectId + '/processtreenodes/model',
                id: selected.node.data.id,
                success: function () {
                    that.system.pruneNode(selected.node);
                },
                error: function (data) {
                    alert('Failed to delete model.');
                }
            });
        }
    }

    handleAddProduct(event) {
        var pos = this.$el.find('#viewport').offset();
        var p = {x: event.pageX - pos.left, y: event.pageY - pos.top}
        var selected = this.system.nearest(p);
        if (selected.node) {
            console.log('Add product to: ' + selected.node.name);
        }
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
            var parentModel = this.getModelWithName(selected.node.name);
            if (!parentModel) {
                parentModel = this.system.getNode('Block');
            }
            console.log(draggedModel.name + ':' + parentModel.name);
            this.addModelToProcessFlow({draggedModel: draggedModel, parentModel: parentModel});
        }
    }

    addModelToProcessFlow(options) {
        var that = this;
        var draggedModel = options.draggedModel;
        var parentModel = options.parentModel;
        var newModel = {
            modelId: draggedModel.id,
            parentModelId: parentModel.id || -1
        }
        this.processTreeModel.add({
            dataObject: newModel,
            success: function (data) {
                console.log('Successfully created model: ' + data);
                that.addProcessesToGraph([data])
            },
            error: function (data) {
                alert('Error adding model: ' + data);
            }
        });
    }

    bindDomEvents() {
        this.bindDragEventsOnModels();
        this.$el.find('#join_processes').click(function() {
           alert("To display process join form");
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

    getModelWithName(modelName) {
        //var data = this.gnosModel.fetch();
        // var models = data.models;
        var selectedModel = null;
        this.models.forEach(function (model) {
            if(model.name === modelName) {
                selectedModel = model;
            }
        });
        return selectedModel;
    }
}
