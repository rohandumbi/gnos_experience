import {View} from '../core/view';
import {PitGroupModel} from '../models/pitGroupModel';
import {PitModel} from '../models/pitModel';

export class PitGroupConceptView extends View {

    constructor(options) {
        super();
        this.pitGroupModel = new PitGroupModel({projectId: options.projectId});
        this.pitModel = new PitModel({projectId: options.projectId});
    }

    getHtml() {
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/pitGroupConceptView.html", function (data) {
                resolve(data);
            })
        });
        return promise;
    }

    onDomLoaded() {
        this.fetchPits();
        this.bindDomEvents();
    }

    fetchPitGroups() {
        var that = this;
        this.pitGroupModel.fetch({
            success: function (data) {
                that.pitGroups = data;
                var $liPitGroups = that.$el.find('#pit-group-list');
                var $li;
                data.forEach(function (pitGroup) {
                    $li = $('<a href="#" data-pitgroupname="' + pitGroup.name + '" draggable="false">' + pitGroup.name + '</a>');
                    $li.attr('title', pitGroup.name);
                    $li.addClass('list-group-item list-group-item-success');
                    $liPitGroups.append($li);
                });
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
                var $liPits = that.$el.find('#pit-list');
                var $li;
                data.forEach(function (pit) {
                    $li = $('<a href="#" data-pitname="' + pit.pitName + '" data-pitNo="' + pit.pitNo + '" draggable="false">' + pit.pitName + '</a>');
                    $li.attr('title', pit.pitName);
                    $li.addClass('list-group-item list-group-item-info');
                    $liPits.append($li);
                });
                that.fetchPitGroups();
                //that.initializeGraph();
            },
            error: function (data) {
                alert('Error fetching list of pits: ' + data);
            }
        });
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
        //this.bindDragEventsOnPits();
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
                that.pitGroups.push(newPitGroup);
                var $liPitGroups = that.$el.find('#pit-group-list');
                var $li = $('<a href="#" data-pitgroupname="' + data.name + '" draggable="false">' + data.name + '</a>');
                $li.attr('title', data.name);
                $li.addClass('list-group-item list-group-item-success');
                $liPitGroups.prepend($li);
            },
            error: function (data) {
                alert('Error adding pit group. ' + data);
            }
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
