import {View} from '../core/view';
import {ProjectModel} from '../models/projectModel'

export class ProjectDefinitionView extends View {

    constructor(options) {
        super();
        this.projectId = options.projectId;
        //this.project = options.project;
        this.projectModel = new ProjectModel();
    }

    getHtml() {
        var htmlContent;
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/projectDefinitionView.html", function (data) {
                resolve(data);
            })
        });
        return promise;
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

    onDomLoaded() {
        var that = this;
        this.bindEvents();
        this.files = [];
        var myDropzone = new Dropzone("div#fileUpload", {
            url: "/file/post",
            autoProcessQueue: false,
            addRemoveLinks: true,
            dictDefaultMessage: 'Click to add files.'
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

        this.projectModel.fetch({
            success: function (data) {
                that.projects = data;
                that.project = that.getProjectById(that.projectId);
                that.$el.find('#name').val(that.project.name);
                that.$el.find('#date').val(that.project.createdDate);
                that.$el.find('#descriptions').val(that.project.desc);
                var files = '';
                that.project.files.forEach(function (fileName) {
                    files += fileName + ';'
                });
                that.$el.find('#present-file').val(files);
            },
            error: function (data) {
                alert('Error fetching project data.');
            }
        });
    }

    bindEvents() {
        var that = this;
        this.$el.find('#btn-update').click(function (event) {
            var projectName = that.$el.find('#name').val();
            //var projectDate = this.$el.find('#date').val();
            var projectDescriptions = that.$el.find('#descriptions').val();
            //var projectFile = this.$el.find('#name').val();

            /*var files = that.$el.find('#new-file').prop("files");
            assuming first selection to be valid*/
            //var file = files[0];
            //var filePath = file && file.path;

            var files = that.files || [];
            if ( files.length == 0 ) {
				files[0] = that.$el.find('#present-file').val();
            }
            var projectObject = {};
            var append = !(that.$el.find('#override').prop("checked")); // This data should be read from the checkbox
            projectObject['name'] = projectName;
            projectObject['desc'] = projectDescriptions;
            projectObject['files'] = files;
			projectObject['append'] = append;

            that.projectModel.update({
                id: that.project.id,
                dataObject: projectObject,
                success: function (data) {
                    //alert()
                    that.trigger('reload');
                },
                error: function (data) {
                    alert("Error: " + data);
                }
            });
        });
    }
}
