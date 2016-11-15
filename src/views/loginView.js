import { View } from './view';
import { LoginModel } from '../models/loginModel';
export class LoginView extends View{

    constructor(options) {
        super();
        this.model = new LoginModel({});
    }

    getHtml() {
        var htmlContent =  (
            '<div id="welcomeView">' +
            '<img id="logo" src="../resources/img/logo.png"/>' +
            '<p class="caption"><%= message %></p>' +
            '<div class="modal-dialog">'+
            '<div class="loginmodal-container">' +
            '<h1>Login to Your Account</h1><br>' +
            '<input type="text" name="user" placeholder="Username">' +
            '<input type="password" name="pass" placeholder="Password">' +
            '<button id="loginBtn" type="submit" name="login" class="login loginmodal-submit">Login</button>' +
            '<div class="login-help">' +
            '<a href="#">Register</a> - <a href="#">Forgot Password</a>' +
            '</div></div></div></div>'
        );
        return htmlContent;
    }

    bindDomEvents() {
        var $loginButton = this.$el.find('#loginBtn');
        //var event = new CustomEvent('login:successful',{});
        var me = this;
        $loginButton.click(function(e){
            e.preventDefault();
            console.log('Got click...');
            //me.$el.trigger('login:successful',[{}]);
            me.trigger('login:successful',[{}]);
        });
    }
}
