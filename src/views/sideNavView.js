import { View } from '../core/view';
//import { LoginModel } from '../models/loginModel';
export class SideNavView extends View{

    constructor(options) {
        super();
        //this.model = new LoginModel({});
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/sideNavView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    onDomLoaded() {
        this.bindEvents();
    }

    bindEvents() {
        var that = this;
        this.$el.find('.sub-menu > li').click(function(e){
            that.$el.find('.sub-menu > li').removeClass('active');
            $(e.currentTarget).addClass('active');
            that.trigger('selected:category', {$category:$(e.currentTarget)});
        });
        this.$el.find('.category').click(function(e){
            $(e.currentTarget).toggleClass('active');
        });
    }
}
