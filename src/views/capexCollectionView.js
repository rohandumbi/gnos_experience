import { View } from '../core/view';
import { CapexCollection } from '../models/capexCollection'
import { CapexView } from './capexView'

export class CapexCollectionView extends View{

    constructor(options) {
        super();
        this.scenario = options.scenario;
        if (!this.scenario) {
            alert('Please select a scenario first');
        }
        this.projectId = options.projectId;
        this.capexCollection = new CapexCollection({scenario: this.scenario});
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/capexCollectionView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    onDomLoaded() {
        var that = this;
        if (!this.scenario) {
            return;
        }
        this.fetchCapex();
        this.$el.find('#scenario_name').val(this.scenario.name);
        this.$el.find('#add_capex').click(function (event) {
            that.addCapex();
        });
    }

    addCapex() {
        var that = this;
        var newCapex = {};
        newCapex['scenarioId'] = this.scenario.id;
        newCapex['name'] = this.$el.find('#new_capex_name').val();
        newCapex['listOfCapexInstances'] = [];
        this.capexCollection.add({
            dataObject: newCapex,
            success: function (data) {
                //that.$el.find("#datatype-grid-basic").bootgrid("append", [data]);
                that.capex.push(data);
                that.initializeCapexView(data);
                that.$el.find('#new_capex_name').val('');
            },
            error: function (data) {
                alert('Failed to create capex');
            }
        });
    }

    fetchCapex() {
        var that = this;
        this.capexCollection.fetch({
            success: function (data) {
                that.capex = data;
                that.initializeExistingCapex(that.capex);
            },
            error: function (data) {
                alert('Error fetching capex list');
            }
        });
    }

    initializeExistingCapex(capexData) {
        for (var i = 0; i < capexData.length; i++) {
            var capex = capexData[i];
            this.initializeCapexView(capex);
        }
    }

    initializeCapexView(capex) {
        var that = this;
        console.log("initializing capex with id: " + capex.id);
        var capexView = new CapexView({capex: capex, projectId: this.projectId});
        capexView.on('update:capex', function (updatedCapex) {
            console.log(updatedCapex);
            that.updateCapex({
                capex: updatedCapex,
                success: function (data) {
                    capexView.refreshCapex(data);
                }
            });
        });
        capexView.on('delete:capex', function (capex) {
            console.log(capex);
            that.capexCollection.delete({
                url: 'http://localhost:4567/capex',
                id: capex.id,
                success: function (data) {
                    //alert('Successfully deleted capex.');
                },
                error: function (data) {
                    alert('Failed to delete capex.');
                }
            });
        });
        capexView.on('delete:instance', function (instance) {
            console.log(instance);
            that.capexCollection.delete({
                url: 'http://localhost:4567/capex/' + instance.capexId + '/capexInstance',
                id: instance.id,
                success: function (data) {
                    //alert('Successfully deleted instance.');
                },
                error: function (data) {
                    alert('Failed to delete capex.');
                }
            });
        });
        capexView.render();
        this.$el.find('#capex-container').append(capexView.$el);
    }

    updateCapex(options) {
        this.capexCollection.update({
            id: options.capex.id,
            url: 'http://localhost:4567/capex',
            dataObject: options.capex,
            success: options.success || function () {
                //alert('Successfully updated instance')
            },
            error: options.error || function (data) {
                alert('Failed to update: ' + data);
            }
        });
    }
}
