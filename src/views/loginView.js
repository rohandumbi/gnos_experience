import { View } from '../core/view';
import { LoginModel } from '../models/loginModel';
export class LoginView extends View{

    constructor(options) {
        super();
        this.model = new LoginModel({});
    }

    getHtml() {
        var htmlContent;
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/loginView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    onDomLoaded() {
        this.bindEvents();
    }

    bindEvents() {
        var $loginButton = this.$el.find('#loginBtn');
        var that = this;
        this.$el.find('#myCarousel').carousel({
            interval: 2500,
            pause: null
        });
        this.$el.on('click', '#btn-enter', function (event) {
            event.preventDefault();
            that.trigger('loginView:enter-app');
        });
    }
}
