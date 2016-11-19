import { View } from './view';
import { LoginModel } from '../models/loginModel';
export class LoginView extends View{

    constructor(options) {
        super();
        this.model = new LoginModel({});
    }

    getHtml() {
        var htmlContent =  (
            '<div id="loginView">' +
                '<img id="logo" src="../resources/img/logo.png"/>' +
                '<p class="caption"><%= message %></p>' +
                /*'<div class="modal-dialog">'+
                    '<div class="loginmodal-container">' +
                        '<h1>Login to Your Account</h1><br>' +
                        '<div  id="errorMessage" class="auth-error error" role="alert" aria-live="assertive"><p style="margin:0px;">A username/password is required.</p></div>' +
                        '<input id="userName" type="text" name="user" placeholder="Username">' +
                        '<input id="password" type="password" name="pass" placeholder="Password">' +
                        '<button id="loginBtn" type="submit" name="login" class="login loginmodal-submit">Login</button>' +
                        '<div class="login-help">' +
                            '<a href="#">Register</a> - <a href="#">Forgot Password</a>' +
                        '</div>' +
                    '</div>' +
                '</div>' +*/
            '</div>'
        );
        return htmlContent;
    }

    bindDomEvents() {
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
