import { View } from './view';
export class WorkflowView extends View{

    constructor(options) {
        super();
    }

    getHtml() {
        var htmlContent =  (
            '<div id="workflowView">' +
                '<canvas id="viewport" width="1500" height="600"></canvas>' +
            '</div>'
        );
        return htmlContent;
    }

    render() {
        super.render();
        //var sys = arbor.ParticleSystem(2600, 512, 0.5);
        var sys = arbor.ParticleSystem(1000, 400,1);
        sys.parameters({gravity:true});
        sys.renderer = Renderer(this.$el.find("#viewport"));
        sys.screenPadding(20);
        var animals = sys.addNode('Animals',{'color':'red','shape':'dot','label':'Animals'});

        var dog = sys.addNode('dog',{'color':'green','shape':'dot','label':'dog'});
        var cat = sys.addNode('cat',{'color':'blue','shape':'dot','label':'cat'});

        sys.addEdge(animals, dog);
        sys.addEdge(animals, cat);
        return this;
    }

    bindDomEvents() {

    }
}
