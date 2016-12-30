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
        var me = this;
        $loginButton.click(function(e){
            e.preventDefault();
            var userName = me.$el.find('#userName').val();
            var password = me.$el.find('#password').val();
            var errorMessage = me.$el.find('#errorMessage');
            if(!userName || !password){
                errorMessage.show();
                return;
            }
            me.trigger('login:successful',[{}]);
        });
    }
}
