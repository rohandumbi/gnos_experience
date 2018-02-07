import {Overlay} from '../core/overlay';
import {ScenarioCollection} from '../models/scenarioCollection';
export class CopyScenarioOverlay extends Overlay {
    constructor(options) {
        if (!options.projectId) {
            throw 'This overlay needs project id.'
        }
        if (!options.scenarioId) {
            throw 'This overlay needs scenario id.'
        }
        var contentUrl = '../content/copyScenarioOverlay.html';
        var overlayTitle = 'Copy Scenario';
        var mergedOptions = $.extend(options, {contentUrl: contentUrl, title: overlayTitle});
        super(mergedOptions);
        this.projectId = options.projectId;
        this.scenarioId = options.scenarioId;
        this.model = new ScenarioCollection({projectId: this.projectId});
    }

    onDomLoaded() {
        this.bindEvents();
    }

    bindEvents() {
        this.$el.find('.btn-close').click((e) => {
            this.trigger('closed');
        });
        this.$el.find('.btn-submit').click((e) => {
            this.cloneScenario(e);
        });
    }

    cloneScenario(event) {
        var copiedScenarioName = this.$el.find('#copiedScenarioName').val();
        if (!copiedScenarioName) {
            this.$el.find('.form-name').addClass('has-error');
            this.$el.find('.help-block').show();
            return;
        }
        this.model.add({
            url: "http://localhost:4567/project/" + this.projectId + "/scenarios/" + this.scenarioId + "/copy",
            dataObject: {name: copiedScenarioName},
            success: (data) => {
                this.close();
                this.trigger('submitted');
            },
            error: (error) => {
                this.close();
                alert('Error cloning scenario:' + error.message);
            }
        });
    }
}
