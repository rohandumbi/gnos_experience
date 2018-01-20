import {Overlay} from '../core/overlay';
import {ProcessJoinModel} from '../models/processJoinModel';
export class EditProcessJoinOverlay extends Overlay {
    constructor(options) {
        var contentUrl = '../content/editProcessJoinOverlay.html';
        var overlayTitle = 'Edit Process Join';
        var mergedOptions = $.extend(options, {contentUrl: contentUrl, title: overlayTitle});
        super(mergedOptions);
        this.processJoin = options.processJoin;
        this.processes = options.processes;
        this.projectId = options.projectId;
        this.processJoinModel = new ProcessJoinModel({projectId: options.projectId});
    }

    onDomLoaded() {
        this.$el.find('#name').val(this.processJoin.name);
        var processList = '';
        this.processes.forEach((process)=> {
            var isPresent = false;
            this.processJoin.childProcessList.forEach((childProcessId)=> {
                if (process.id === childProcessId) {
                    isPresent = true;
                }
            });
            if (isPresent) {
                processList += '<div class="checkbox"><label><input class="processName" type="checkbox" checked="checked" value="' + process.id + '">' + process.name + '</label></div>'
            } else {
                processList += '<div class="checkbox"><label><input class="processName" type="checkbox" value="' + process.id + '">' + process.name + '</label></div>'
            }
        });
        this.$el.find('#processList').html(processList)
        this.bindEvents();
    }

    bindEvents() {
        this.$el.find('.btn-close').click((e) => {
            this.trigger('closed');
        });
        this.$el.find('.btn-submit').click((e) => {
            this.updateProcessJoin(e);
        });
    }

    updateProcessJoin(e) {
        var existingProcessIdList = this.processJoin.childProcessList;
        var editedProcessIdList = [];
        this.$el.find('#processList .processName:checked').each(function (event) {
            editedProcessIdList.push(parseInt($(this).val(), 10));
        });
        var _ = require('underscore');
        let addedProcesses = _.difference(editedProcessIdList, existingProcessIdList);
        let removedProcesses = _.difference(existingProcessIdList, editedProcessIdList);
        var addProcessesToJoinPromise = this.addProcessToJoin(addedProcesses);
        var removeProcessesFromJoinPromise = this.removeProcessesFromJoin(removedProcesses);
        Promise.all([addProcessesToJoinPromise, removeProcessesFromJoinPromise])
            .then(()=> {
                this.trigger('submitted', {addedProcesses: addedProcesses, removedProcesses: removedProcesses});
            })
            .catch(reason=> {
                alert(reason);
                this.close();
            });
    }

    addProcessToJoin(addedProcessIds) {
        return new Promise((resolve, reject)=> {
            var numberOfProcessesToAdd = addedProcessIds.length;
            if (numberOfProcessesToAdd === 0) {
                resolve();
            }
            var numberOfProcessesAdded = 0;
            var updatedProcessJoin = {};
            addedProcessIds.forEach(addedProcessId => {
                updatedProcessJoin['name'] = this.processJoin.name;
                updatedProcessJoin['processId'] = addedProcessId;
                this.processJoinModel.add({
                    dataObject: updatedProcessJoin,
                    success: (data)=> {
                        numberOfProcessesAdded++;
                        this.processJoin.childProcessList.push(addedProcessId);
                        if (numberOfProcessesAdded === numberOfProcessesToAdd) {
                            resolve();
                        }
                    },
                    error: (error)=> {
                        reject(error.message);
                    }
                });
            });
        });
    }

    removeProcessesFromJoin(removedProcessIds) {
        return new Promise((resolve, reject)=> {
            var numberOfProcessesToDelete = removedProcessIds.length;
            if (numberOfProcessesToDelete === 0) {
                resolve();
            }
            var numberOfProcessesDeleted = 0;
            removedProcessIds.forEach(removedProcessId => {
                this.processJoinModel.delete({
                    url: 'http://localhost:4567/project/' + this.projectId + '/processjoins/' + this.processJoin.name + '/process',
                    id: removedProcessId,
                    success: (data)=> {
                        numberOfProcessesDeleted++;
                        this.processJoin.childProcessList.splice(this.processJoin.childProcessList.indexOf(removedProcessId), 1);
                        if (numberOfProcessesDeleted === numberOfProcessesToDelete) {
                            resolve();
                        }
                    },
                    error: (error)=> {
                        reject(error.message);
                    }
                });
            })
        });
    }
}
