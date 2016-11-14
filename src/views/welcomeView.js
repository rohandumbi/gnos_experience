import { WelcomeViewModel } from '../models/welcomeViewModel';
export class WelcomeView {

    constructor(options) {
        //this.model = options.model;
        this.model = new WelcomeViewModel({});
    }

    getHtml() {
        return (
            '<div id="welcomeView">' +
            '<img id="logo" src="../resources/img/logo.png"/>' +
            '<p class="caption">GNOS - Hi-Tech Mining</p>' +
            '<div class="modal-dialog">'+
            '<div class="loginmodal-container">' +
            '<h1>Login to Your Account</h1><br>' +
            '<form>' +
            '<input type="text" name="user" placeholder="Username">' +
            '<input type="password" name="pass" placeholder="Password">' +
            '<input type="submit" name="login" class="login loginmodal-submit" value="Login">' +
            '</form>' +

            '<div class="login-help">' +
            '<a href="#">Register</a> - <a href="#">Forgot Password</a>' +
            '</div></div></div></div>'
        );
    }

    render() {
        var _ = require('underscore');
        var WelcomeTmpl = _.template(this.getHtml());
        return WelcomeTmpl(this.model.fetch());
    }
}
