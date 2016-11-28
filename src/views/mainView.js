import { View } from './view';
import { SideNavView } from './sideNavView';
export class MainView extends View{

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.initializeSideNavView();
        this.initializeContentView();
    }

    initializeSideNavView() {
        this.sideNavView = new SideNavView();
    }

    getSideNavViewContent() {
        this.sideNavView.render();
        return this.sideNavView.$el;
    }

    initializeContentView() {

    }

    getHtml() {
        var htmlContent =  (
            '<div id="mainView">' +
                '<nav class="navbar navbar-default"> ' +
                    '<div class="container-fluid"> ' +
                        '<div class="navbar-header">' +
                            '<button id="toggleBtn" type="button" class="btn btn-default" aria-label="Left Align">' +
                                '<span style="color:white" class="glyphicon glyphicon-menu-hamburger" aria-hidden="true"></span>' +
                            '</button>' +
                            '<a class="navbar-brand" href="#">' +
                                '<img class="brand" alt="Brand" src="../resources/icons/brand.png">' +
                            '</a>' +
                        '</div>' +
                    '</div>' +
                '</nav>' +
                ' <div id="wrapper">' +
                    '<div id="sidebar-wrapper" class="nav-side-menu"></div>' +
                    '<div id="page-content-wrapper"></div>' +
                    /*'<div id="sidebar-wrapper">' +
                        '<ul class="sidebar-nav">' +
                            '<li class="sidebar-brand">' +
                                '<a href="#">Start Bootstrap</a>' +
                            '</li>' +
                            '<li>' +
                                '<a href="#">Dashboard</a>' +
                            '</li>' +
                            '<li>' +
                                '<a href="#">Shortcuts</a>' +
                            '</li>' +
                            '<li>' +
                                '<a href="#">Overview</a>' +
                            '</li>' +
                            '<li>' +
                                '<a href="#">Events</a>' +
                            '</li>' +
                            '<li>' +
                                '<a href="#">About</a>' +
                            '</li>' +
                            '<li>' +
                                '<a href="#">Services</a>' +
                            '</li>' +
                            '<li>' +
                            '<a href="#">Contact</a>' +
                            '</li>' +
                        '</ul>' +
                    '</div>' +*/
                    /*'<div id="page-content-wrapper">' +
                        '<div class="container-fluid">' +
                            '<div class="row">' +
                                '<div class="col-lg-12">' +
                                    '<h1>Simple Sidebar</h1>' +
                                    '<p>This template has a responsive menu toggling system. The menu will appear collapsed on smaller screens, and will appear non-collapsed on larger screens. When toggled using the button below, the menu will appear/disappear. On small screens, the page content will be pushed off canvas.</p>' +
                                    '<p>Make sure to keep all page content within the <code>#page-content-wrapper</code>.</p>' +
                                    '<a href="#menu-toggle" class="btn btn-default" id="menu-toggle">Toggle Menu</a>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +*/
                '</div>' +
            '</div>'
        );
        return htmlContent;
    }

    render() {
        super.render();
        console.log("My own render");
        this.sideNavView.render();
        this.$el.find("#sidebar-wrapper").html(this.sideNavView.$el);
        return this;
    }

    bindDomEvents() {
        var me = this;
        this.$el.find("#toggleBtn").click(function(e) {
            e.preventDefault();
            me.$el.find("#wrapper").toggleClass("toggled");
        });
    }
}
