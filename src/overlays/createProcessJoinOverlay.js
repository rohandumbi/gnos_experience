import {Overlay} from '../core/overlay';
import {ProcessJoinModel} from '../models/processJoinModel';
export class CreateProcessJoinOverlay extends Overlay {
    constructor(options) {
        var contentUrl = '../content/createProcessJoinOverlay.html';
        var overlayTitle = 'Create Model Join';
        var mergedOptions = $.extend(options, {contentUrl: contentUrl, title: overlayTitle});
        super(mergedOptions);
        this.processes = options.processes;
        this.projectId = options.projectId;
        this.processJoinModel = new ProcessJoinModel({projectId: options.projectId});
    }

    onDomLoaded() {
        var processList = '';
        this.processes.forEach((process)=> {
            processList += '<div class="checkbox"><label><input class="processName" type="checkbox" value="' + process.id + '">' + process.name + '</label></div>'
        });
        this.$el.find('#processList').html(processList)
        this.bindEvents();
    }

    bindEvents() {
        this.$el.find('.btn-close').click((e) => {
            this.trigger('closed');
        });
        this.$el.find('.btn-submit').click((e) => {
            this.createProcessJoin(e);
        });
    }

    createProcessJoin(e) {
        this.processJoinName = this.$el.find('#name').val().trim();
        if (!this.processJoinName) {
            this.$el.find('.form-name').addClass('has-error has-feedback');
            return;
        }
        var childProcessIds = [];
        this.$el.find('#processList .processName:checked').each(function (event) {
            childProcessIds.push(parseInt($(this).val(), 10));
        });
        this.addProcessesToJoin(childProcessIds).then(processJoin=> {
            this.trigger('submitted', processJoin);
        }).catch(message=> {
            this.close();
            alert(message);
        });
    }

    addProcessesToJoin(addedProcessIds) {
        return new Promise((resolve, reject)=> {
            if (!addedProcessIds || addedProcessIds.length === 0) {
                resolve();
            }
            var numberOfProcessesAdded = 0;
            var updatedProcessJoin = {};
            addedProcessIds.forEach(addedProcessId => {
                updatedProcessJoin['name'] = this.processJoinName;
                updatedProcessJoin['processId'] = addedProcessId;
                this.processJoinModel.add({
                    dataObject: updatedProcessJoin,
                    success: (data)=> {
                        numberOfProcessesAdded++;
                        if (numberOfProcessesAdded === addedProcessIds.length) {
                            data.childProcessList = addedProcessIds;
                            resolve(data);
                        }
                    },
                    error: (error)=> {
                        reject(error.message);
                    }
                });
            });
        });
    }
}
