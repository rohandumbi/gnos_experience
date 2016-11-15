import { View } from './view';
export class DashBoardView extends View{

    constructor(options) {
        super();
    }

    getHtml() {
        var htmlContent =  (
            '<div id="dashBoardView">' +
            '<p class="caption">Listed Projects</p>' +
            '<div class="container"> ' +
            '<div class="notice notice-success notice-lg"> <strong>Create New</strong> + </div> ' +
            '<div class="notice notice-success notice-lg"> <strong>Project A</strong> DD/MM/YYYY </div> ' +
            '<div class="notice notice-danger notice-lg"> <strong>Project B</strong> DD/MM/YYYY </div> ' +
            '<div class="notice notice-info notice-lg"> <strong>Project C</strong> DD/MM/YYYY </div> ' +
            '<div class="notice notice-warning notice-lg"> <strong>Project D</strong> DD/MM/YYYY </div> ' +
            '<div class="notice notice-lg notice-info"> <strong>Project E</strong> DD/MM/YYYY</div> ' +
            '<div class="notice notice-lg"> <strong>Project F</strong> DD/MM/YYYY</div> ' +
            '</div></div>'
        );
        return htmlContent;
    }

    bindDomEvents() {
        /*var $loginButton = this.$el.find('#loginBtn');
        //var event = new CustomEvent('login:successful',{});
        var me = this;
        $loginButton.click(function(e){
            e.preventDefault();
            console.log('Got click...');
            //me.$el.trigger('login:successful',[{}]);
            me.trigger('login:successful',[{}]);
        });*/
    }
}
