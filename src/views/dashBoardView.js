import { View } from './view';
export class DashBoardView extends View{

    constructor(options) {
        super();
    }

    getHtml() {
        var htmlContent =  (
            '<div id="dashBoardView">' +
                '<p class="caption">Listed Projects</p>' +
                '<div id="dashboardPane">' +
                    '<div id="projectListPane">' +
                        this.getCards() +
                    '</div>' +
                    '<div id="newProjectPane">' +
                        this.getNewProjectCard() +
                    '</div>' +
                '</div>' +
            '</div>'
        );
        return htmlContent;
    }

    getNewProjectCard(){
        var htmlForm = (
            '<form class="form-horizontal"> ' +
                '<fieldset>' +
                    '<legend>New Project</legend> ' +
                    '<div class="form-group"> ' +
                        '<label class="col-md-4 control-label" for="projectName">Project Name</label> ' +
                        '<div class="col-md-5"> ' +
                            '<input id="projectName" name="Card" type="text" placeholder="" class="form-control input-md" required=""> ' +
                            '<span class="help-block">Enter name for the project.</span> ' +
                        '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                        '<label class="col-md-4 control-label" for="fullname">File Location</label> ' +
                        '<div class="col-md-4"> ' +
                            '<input id="fileLocation" name="fullname" type="file" placeholder="" class="form-control input-md" required=""> ' +
                            '<span class="help-block">Browse and select CSV.</span> ' +
                        '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                        '<label class="col-md-4 control-label" for=""></label> ' +
                        '<div class="col-md-5"> ' +
                            '<input id="" name="" type="text" placeholder="Notes" class="form-control input-md" required=""> ' +
                        '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                        '<label class="col-md-4 control-label" for="continue"></label> ' +
                        '<div class="col-md-4"> ' +
                            '<button id="continue" name="continue" class="btn btn-success">Continue</button> ' +
                        '</div> ' +
                    '</div> ' +
                '</fieldset> ' +
            '</form>');
        return htmlForm;
    }

    getCards(){
        var containerDiv = '<div id="projectCardContainer" class="row"> ';
        var cards = ''
        for(var i=0; i<10; i++){
            cards += '<div class="col-xs-12 col-sm-4 col-md-4 col-lg-4"> ' +
                            '<div class="thumbnail">' +
                                '<div class="caption"> ' +
                                    '<div class= "col-lg-12"> ' +
                                        '<span class="glyphicon glyphicon-trash pull-right text-primary"></span>' +
                                    '</div>' +
                                    '<div class="col-lg-12 well well-add-card"> ' +
                                        '<h4>' + 'Project: ' + (i+1) + '</h4> ' +
                                    '</div>' +
                                    '<div class="col-lg-12">' +
                                        '<p class"text-muted">Created On: DD-MM-YYYY</p>' +
                                    '</div>' +
                                    '<button type="button" class="btn btn-primary btn-xs btn-update btn-add-card">Open</button> ' +
                                    '<span title="Project notes will come here" class="glyphicon glyphicon-exclamation-sign text-danger pull-right icon-style"></span> ' +
                                '</div>' +
                            '</div> ' +
                        '</div>'
        }
        return containerDiv + cards + '</div>';
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
