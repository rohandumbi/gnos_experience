import { View } from '../core/view';
import { DashboardModel } from '../models/dashboardModel';
export class DashBoardView extends View{

    constructor(options) {
        super();
        this.dashboardModel = new DashboardModel();
    }

    getHtml() {
        var htmlContent =  (
            '<div id="dashBoardView">' +
                '<div id="pageName">'+
                    '<p class="caption">Projects</p>' +
                '</div>' +
                '<div id="description">'+
                    '<p class="caption"><span class="glyphicon glyphicon-exclamation-sign text-info pull-left icon-style"></span><span style="padding: 20px">Select your project or create a new one</span></p>' +
                '</div>' +
                '<div id="dashboardPane">' +
                    '<div id="projectListPane">' +
                        /*this.getCards() +*/
                    '</div>' +
                    '<div id="newProjectPane">' +
                        /*this.getNewProjectCard() +*/
                    '</div>' +
                '</div>' +
            '</div>'
        );
        return new Promise(function(resolve, reject){
            resolve(htmlContent);
        });
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
                            '<input id="fileLocation" name="file" name="file" type="file" placeholder="" class="form-control input-md" required=""> ' +
                            '<span class="help-block">Browse and select CSV.</span> ' +
                        '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                        '<label class="col-md-4 control-label" for=""></label> ' +
                        '<div class="col-md-5"> ' +
                            '<input id="descriptions" name="" type="text" placeholder="Notes" class="form-control input-md" required=""> ' +
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

    getCards(data){
        var containerDiv = '<div id="projectCardContainer" class="row"> ';
        var cards = ''
        for(var i=0; i<data.length; i++){
            cards += '<div id="' + data[i].id + '" class="col-xs-12 col-sm-4 col-md-4 col-lg-4"> ' +
                            '<div class="thumbnail">' +
                                '<div class="caption"> ' +
                                    '<div class= "col-lg-12"> ' +
                                        '<span class="glyphicon glyphicon-trash pull-right text-primary"></span>' +
                                    '</div>' +
                                    '<div class="col-lg-12 well well-add-card"> ' +
                                        '<h4>' + data[i].name + '</h4> ' +
                                    '</div>' +
                                    '<div class="col-lg-12">' +
                                        '<p class"text-muted">Created: ' + data[i].createdDate + '</p>' +
                                    '</div>' +
                '<button type="button" data-projectid="' + data[i].id + '" class=" openProjectBtn btn btn-primary btn-xs btn-update btn-add-card">Open</button> ' +
                                    '<span title="' + data[i].desc + '" class="glyphicon glyphicon-exclamation-sign text-danger pull-right icon-style"></span> ' +
                                '</div>' +
                            '</div> ' +
                        '</div>'
        }
        return containerDiv + cards + '</div>';

    }



    onDomLoaded() {
        var that = this;
        this.dashboardModel.fetch({
            success: function(data){
                var $projectListPane = that.$el.find('#projectListPane');
                var $newProjectPane = that.$el.find('#newProjectPane');
                $projectListPane.append(that.getCards(data));
                $newProjectPane.append(that.getNewProjectCard());
                that.bindEvents();
            },
            error: function(data){
                alert("Error: " + data);
            }
        });
        //this.bindEvents();
    }

    bindEvents() {
        var that = this;
        this.$el.find('.openProjectBtn').click(function() {
            that.trigger('open:project', {projectId: $(this).data('projectid')})
        });
        this.$el.find('#continue').click(function(event) {
            event.preventDefault();
            var name = that.$el.find('#projectName').val();
            var fileInput = that.$el.find('#fileLocation').val();
            var desc = that.$el.find('#descriptions').val();

            if(!name || !fileInput){
                alert('One of the required fields is empty');
            }else{
                var files = that.$el.find('#fileLocation').prop("files");
                /*assuming first selection to be valid*/
                var file = files[0];
                var filePath = file.path;

                var projectObject = {};
                projectObject['name'] = name;
                projectObject['desc'] = desc;
                projectObject['fileName'] = filePath;
                that.dashboardModel.add({
                    dataObject: projectObject,
                    success: function(data){
                        //alert()
                        that.trigger('reload');
                    },
                    error: function(data){
                        alert("Error: " + data);
                    }
                });
            }
        });
    }
}
