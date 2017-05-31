import { View } from '../core/view';
import {ProjectModel} from '../models/projectModel';
export class DashBoardView extends View{

    constructor(options) {
        super();
        this.projectModel = new ProjectModel();
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
            '<div class="dropzone dz-default" style="margin-top: 50px;border: 2px dashed #0087F7;border-radius: 5px; background: white;" id="dropZone"></div>' +
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
                '<button type="button" data-projectid="' + data[i].id + '" class="deleteProjectBtn glyphicon glyphicon-trash pull-right text-primary"></button> ' +
                                    '</div>' +
                                    '<div class="col-lg-12 well well-add-card"> ' +
                                        '<h4>' + data[i].name + '</h4> ' +
                                    '</div>' +
                                    '<div class="col-lg-12">' +
                                        '<p class"text-muted">Created: ' + data[i].createdDate + '</p>' +
                                    '</div>' +
                '<button type="button" data-projectid="' + data[i].id + '" class="openProjectBtn btn btn-primary btn-xs btn-update btn-add-card">Open</button> ' +
                                    '<span title="' + data[i].desc + '" class="glyphicon glyphicon-exclamation-sign text-danger pull-right icon-style"></span> ' +
                                '</div>' +
                            '</div> ' +
                        '</div>'
        }
        return containerDiv + cards + '</div>';

    }



    onDomLoaded() {
        var that = this;
        this.files = [];
        this.projectModel.fetch({
            success: function(data){
                var $projectListPane = that.$el.find('#projectListPane');
                var $newProjectPane = that.$el.find('#newProjectPane');
                $projectListPane.append(that.getCards(data));
                $newProjectPane.append(that.getNewProjectCard());
                that.projects = data;
                that.bindEvents();
            },
            error: function (xhr, textStatus, errorThrown) {
                alert(textStatus + ": " + xhr.responseText);
            }
        });
        //this.bindEvents();
    }

    getProjectById(projectId) {
        var myProject;
        this.projects.forEach(function (project) {
            if (project.id === projectId) {
                myProject = project;
            }
        });
        return myProject;
    }

    bindEvents() {
        var that = this;
        var myDropzone = new Dropzone("div#dropZone", {
            url: "/file/post",
            autoProcessQueue: false,
            addRemoveLinks: true,
            dictDefaultMessage: 'Click to add files.',
            acceptedFiles: '.csv'
        });

        myDropzone.on('addedfile', function (file, event) {
            console.log(file);
            that.files.push(file.path);
        });
        myDropzone.on('removedfile', function (file, event) {
            that.files.forEach(function (fileName, i) {
                if (fileName === file.path) {
                    that.files.splice(i, 1);
                    // break;       //<-- Uncomment  if only the first term has to be removed
                }
            });
        });
        this.$el.find('.openProjectBtn').click(function() {
            var projectId = $(this).data('projectid');
            var project = that.getProjectById(projectId);
            that.trigger('open:project', {projectId: projectId, project: project});
        });
        this.$el.find('.deleteProjectBtn').click(function () {
            //that.trigger('open:project', {projectId: $(this).data('projectid')})
            event.preventDefault();
            var projectId = $(this).data('projectid');
            that.projectModel.delete({
                id: projectId,
                success: function (data) {
                    that.trigger('reload');
                },
                error: function (data) {
                    alert("Could not delete: " + data);
                }
            });
        });
        this.$el.find('#continue').click(function(event) {
            event.preventDefault();
            var name = that.$el.find('#projectName').val();
            //var fileInput = that.$el.find('#fileLocation').val();
            var desc = that.$el.find('#descriptions').val();

            if (!name || (that.files.length === 0)) {
                alert('One of the required fields is empty');
            }else{
                var files = that.$el.find('#fileLocation').prop("files");
                /*assuming first selection to be valid*/
                //var file = files[0];
                //var filePath = file.path;
                //var filePath = that.files;

                var projectObject = {};
                projectObject['name'] = name;
                projectObject['desc'] = desc;
                projectObject['files'] = that.files;
                projectObject['append'] = false;
                that.projectModel.add({
                    dataObject: projectObject,
                    success: function(data){
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
