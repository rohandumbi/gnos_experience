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
                    $li.addClass('list-group-item list-group-item-success pit-group');
                    $liPitGroups.append($li);
                });
                that.bindDomEvents();
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
                    $li.addClass('list-group-item list-group-item-info pit');
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
        this.$el.find('#add-pitgroup').click(function () {
            //alert("To display pit group definition form");
            var newGroupName = that.$el.find('#new_group_name').val();
            that.addPitGroup(newGroupName);
        });
        this.$el.find('.pit-group').click(function (event) {
            that.loadPitGroupDetails({name: $(this).data('pitgroupname')});
            that.$el.find('.pit-group').removeClass('active');
            $(this).addClass('active');
        });
        this.bindPitGroupEvents();
    }

    bindPitGroupEvents() {
        this.$el.on('click', '.child-pits .list-group-item', function () {
            $(this).toggleClass('active');
        });
        this.$el.on('click', '.all-pits .list-group-item', function () {
            $(this).toggleClass('active');
        });
        this.$el.find('.list-arrows button').click(function () {
            var $button = $(this), actives = '';
            if ($button.hasClass('move-left')) {
                actives = $('.list-right ul li.active');
                actives.clone().appendTo('.list-left ul');
                actives.remove();
            } else if ($button.hasClass('move-right')) {
                actives = $('.list-left ul li.active');
                actives.clone().appendTo('.list-right ul');
                actives.remove();
            }
        });
        this.$el.find('.dual-list .selector').click(function () {
            var $checkBox = $(this);
            if (!$checkBox.hasClass('selected')) {
                $checkBox.addClass('selected').closest('.well').find('ul li:not(.active)').addClass('active');
                $checkBox.children('i').removeClass('glyphicon-unchecked').addClass('glyphicon-check');
            } else {
                $checkBox.removeClass('selected').closest('.well').find('ul li.active').removeClass('active');
                $checkBox.children('i').removeClass('glyphicon-check').addClass('glyphicon-unchecked');
            }
        });
        this.$el.find('[name="SearchDualList"]').keyup(function (e) {
            var code = e.keyCode || e.which;
            if (code == '9') return;
            if (code == '27') $(this).val(null);
            var $rows = $(this).closest('.dual-list').find('.list-group li');
            var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();
            $rows.show().filter(function () {
                var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                return !~text.indexOf(val);
            }).hide();
        });
    }

    loadPitGroupDetails(options) {
        this.loadedPitGroup = options.name;
        //alert('To Load: ' + this.loadedPitGroup);
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
                $li.addClass('list-group-item list-group-item-success pit-group');
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
