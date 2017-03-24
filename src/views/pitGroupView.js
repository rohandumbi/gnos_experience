import { View } from '../core/view';
import { PitGroupModel } from '../models/pitGroupModel';
import { PitModel } from '../models/pitModel';

export class PitGroupView extends View {

    constructor(options) {
        super();
        this.pitGroupModel = new PitGroupModel({projectId: options.projectId});
        this.pitModel = new PitModel({projectId: options.projectId});
    }

    getHtml() {
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/pitGroupView.html", function (data) {
                resolve(data);
            })
        });
        return promise;
    }

    /*addGroupToGraph(parent, processes) {
        var that = this;
        processes.forEach(function (process) {
            var processNode = that.system.addNode(process.name, {
                'color': '#95cde5',
                'shape': 'dot',
                'label': process.name
            });
            that.system.addEdge(parent, processNode, {directed: true, weight: 2});
            if (process.processes && (process.processes.length > 1)) {
                that.addProcessToGraph(processNode, process.processes);
            }
        })
     }*/

    onDomLoaded() {
        this.fetchPits();
        //this.initializeGraph();
        //this.bindDomEvents();
    }

    fetchPitGroups() {
        var that = this;
        this.pitGroupModel.fetch({
            success: function (data) {
                that.pitGroups = data;
                that.initializeGraph();
            },
            error: function (data) {
                alert('Error fetching pit groups.');
            }
        });
    }

    fetchPits() {
        var that = this;
        var data = this.pitModel.fetch({
            success: function (data) {
                that.pits = data;
                var $liGroup = that.$el.find('ul.list-group');
                var $li;
                data.forEach(function (pit) {
                    $li = $('<li data-pitNo="' + pit.pitNo + '" draggable="true">' + pit.pitName + '</li>');
                    $li.attr('title', pit.pitName);
                    $li.addClass('list-group-item list-group-item-info');
                    $liGroup.append($li);
                });
                that.fetchPitGroups();
                //that.initializeGraph();
            },
            error: function (data) {
                alert('Error fetching list of pits: ' + data);
            }
        });
    }

    initializeGraph() {
        var that = this;
        var $canvas = this.$el.find("#viewport");
        //var $container = $canvas.parent();
        $canvas.attr('width', '1300');
        $canvas.attr('height', '700');

        this.system = arbor.ParticleSystem({
            friction: .5,
            stiffness: 200,
            repulsion: 0,
            gravity: false
        });
        this.system.renderer = Renderer($canvas);
        //this.system.screenPadding(20);

        //var block = this.system.addNode('Block',{'color':'red','shape':'dot','label':'BLOCK'});
        //var pitGroups = data.pitGroups;

        //adding child pits
        this.pitGroups.forEach(function (pitGroup) {
            var pitGroupNode = that.system.addNode(pitGroup.name, {
                'color': 'red',
                'shape': 'dot',
                'label': pitGroup.name
            });
            //this.addGroupToGraph(pitGroup, data.pitGroups);
            var childPits = pitGroup.listChildPits;
            childPits.forEach(function (childPit) {
                var childPitNode = that.system.addNode(childPit.toString(), {
                    'color': '#95cde5',
                    'shape': 'dot',
                    'label': childPit.toString()
                });
                that.system.addEdge(childPitNode, pitGroupNode, {directed: true, weight: 2});
            });
            var childPitGroups = pitGroup.listChildPitGroups;
            childPitGroups.forEach(function (childPitGroup) {
                var childPitGroupNode = that.system.addNode(childPitGroup.toString(), {
                    'color': 'red',
                    'shape': 'dot',
                    'label': childPitGroup.toString()
                });
                that.system.addEdge(childPitGroupNode, pitGroupNode, {directed: true, weight: 2});
            });
        });
        this.bindDomEvents();
        //this.addProcessJoins();
    }

    handleDragStart(e) {
        e.target.style.opacity = '0.4';  // this / e.target is the source node.
    }

    handleDragEnd(e) {
        var that = this;
        console.log('Dragged pit: ' + e.target.innerHTML);
        var draggedPit = this.getPitWithName(e.target.innerHTML);
        e.target.style.opacity = '1';
        var pos = this.$el.find('#viewport').offset();
        var p = {x: e.pageX - pos.left, y: e.pageY - pos.top}
        var selected = this.system.nearest(p);

        if ((selected.node !== null) && (draggedPit !== null)) {
            // dragged.node.tempMass = 10000
            //dragged.node.fixed = true;
            console.log('need to add');
            var selectedGroup = that.getPitGroupWithName(selected.node.name);
            if (!selectedGroup) {
                alert('Your target is not a pit group.');
            }
            that.addPitToGroup({pit: draggedPit, pitGroup: selectedGroup, selectedNode: selected.node});
            //this.addProcessToGraph(selected.node, [draggedModel]);
        }
    }

    addPitToGroup(options) {
        var that = this;
        var pitGroup = options.pitGroup;
        var childPit = options.pit;
        console.log('pit group to be updated: ' + pitGroup);
        var updatedPitGroup = {}
        updatedPitGroup['name'] = pitGroup.name;
        updatedPitGroup['childType'] = 1;// 1 mean child is a pit
        updatedPitGroup['child'] = childPit.pitName;
        this.pitGroupModel.add({
            dataObject: updatedPitGroup,
            success: function (data) {
                alert('Added pit to group');
                pitGroup.listChildPits.push(childPit.pitName);

                var pitNode = that.system.addNode(childPit.pitName, {
                    'color': '#95cde5',
                    'shape': 'dot',
                    'label': childPit.pitName
                });
                that.system.addEdge(pitNode, options.selectedNode, {directed: true, weight: 2});
            },
            error: function (data) {
                alert('Error adding pit to group.');
            }
        });
    }

    bindDomEvents() {
        var that = this;
        this.bindDragEventsOnPits();
        this.$el.find('#add-pitgroup').click(function () {
            //alert("To display pit group definition form");
            var newGroupName = that.$el.find('#new_group_name').val();
            that.addPitGroup(newGroupName);
        });
    }

    addPitGroup(groupName) {
        var that = this;
        this.$el.find('#new_group_name').val('');
        var newPitGroup = {};
        newPitGroup['name'] = groupName;
        newPitGroup['listChildPitGroups'] = [];
        newPitGroup['listChildPits'] = [];
        this.pitGroupModel.add({
            dataObject: newPitGroup,
            success: function (data) {
                alert('Added pit group');
                //pitGroup.listChildPits.push(childPit.pitName);
                that.pitGroups.push(newPitGroup);
                that.system.addNode(groupName, {'color': 'red', 'shape': 'dot', 'label': groupName});
            },
            error: function (data) {
                alert('Error adding pit group. ' + data);
            }
        });
    }

    bindDragEventsOnPits() {
        var models = document.querySelectorAll('.list-group-item');
        var that = this;
        [].forEach.call(models, function (col) {
            col.addEventListener('dragstart', that.handleDragStart.bind(that), false);
            col.addEventListener('dragend', that.handleDragEnd.bind(that), false);
        });
    }

    getPitWithName(pitName) {
        var selectedPit = null;
        this.pits.forEach(function (pit) {
            if (pit.pitName === pitName) {
                selectedPit = pit;
            }
        });
        return selectedPit;
    }

    getPitGroupWithName(pitGroupName) {
        var selectedPitGroup = null;
        this.pitGroups.forEach(function (pitGroup) {
            if (pitGroup.name === pitGroupName) {
                selectedPitGroup = pitGroup;
            }
        });
        return selectedPitGroup;
    }
}
