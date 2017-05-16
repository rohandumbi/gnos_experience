import {View} from '../core/view';
import {LoginModel} from '../models/loginModel';
export class ProjectDefinitionView extends View {

    constructor(options) {
        super();
        this.model = new LoginModel({});
    }

    getHtml() {
        var htmlContent;
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/projectDefinitionView.html", function (data) {
                resolve(data);
            })
        });
        return promise;
    }

    onDomLoaded() {
        this.bindEvents();
    }

    bindEvents() {

    }
}
