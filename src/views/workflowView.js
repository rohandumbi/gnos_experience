import {View} from '../core/view';
import {ProcessModel} from '../models/processModel';
import {GnosModel} from '../models/gnosModel';
import {ProcessTreeNodeModel} from '../models/processTreeNodeModel'
import {ProcessJoinModel} from '../models/processJoinModel'
import {ProductModel} from '../models/productModel'
import {ProductJoinModel} from '../models/productJoinModel'
import {ExpressionModel} from '../models/expressionModel'
import {UnitModel} from '../models/unitModel'
import {ProductGradeModel} from '../models/productGradeModel'

export class WorkflowView extends View{

    constructor(options) {
        super();
        this.projectId = options.projectId;
        this.processModel = new ProcessModel({projectId: options.projectId});
        this.gnosModel = new GnosModel({projectId: options.projectId});
        this.processTreeModel = new ProcessTreeNodeModel({projectId: options.projectId});
        this.processJoinModel = new ProcessJoinModel({projectId: options.projectId});
        this.productModel = new ProductModel({projectId: options.projectId});
        this.productJoinModel = new ProductJoinModel({projectId: options.projectId});
        this.expressionModel = new ExpressionModel({projectId: options.projectId});
        this.unitModel = new UnitModel({projectId: options.projectId});
        this.scaleFactor = 1;
        //this.productGradeModel = new ProductGradeModel({})
    }

    getHtml() {
        var promise = new Promise(function(resolve, reject){
            $.get( "../content/workflowView.html", function( data ) {
                resolve(data);
            })
        });
        return promise;
    }

    getModelWithId(modelId) {
        var object = null;
        this.models.forEach(function (model) {
            if (model.id === modelId) {
                object = model;
            }
        });
        return object;
    }

    getExpressionByName(expressionName) {
        var object = null;
        this.expressions.forEach(function (expression) {
            if (expression.name === expressionName) {
                object = expression;
            }
        });
        return object;
    }

    getProductWithName(productName) {
        var object = null;
        this.products.forEach(function (product) {
            if (product.name === productName) {
                object = product;
            }
        });
        return object;
    }

    getUnitWithName(unitName) {
        var object = null;
        this.units.forEach(function (unit) {
            if (unit.name === unitName) {
                object = unit;
            }
        });
        return object;
    }

    getNodeWithName(nodeName) {
        return this.system.getNode(nodeName);
    }

    filterNonGradeExpressions() {
        var that = this;
        this.nonGradeExpressions = [];
        this.expressions.forEach(function (expression) {
            if (!expression.isGrade) {
                that.nonGradeExpressions.push(expression);
            }
        });
        var tableRow = (
            '<select id="grade-expression" class="grade-expression form-control" value="test">'
        );
        var tableRow1 = (
            '<select id="edit-grade-expression" class="grade-expression form-control" value="test">'
        );
        //add non-grade expressions
        that.nonGradeExpressions.forEach(function (expression) {
            tableRow += '<option data-unit-id="' + expression.id + '" data-unit-type="2" data-unit-name="' + expression.name + '">' + expression.name + '</option>';
            tableRow1 += '<option data-unit-id="' + expression.id + '" data-unit-type="2" data-unit-name="' + expression.name + '">' + expression.name + '</option>';
        });
        //add units
        that.units.forEach(function (unit) {
            tableRow += '<option data-unit-id="' + unit.id + '" data-unit-type="1" data-unit-name="' + unit.name + '">' + unit.name + '</option>';
            tableRow1 += '<option data-unit-id="' + unit.id + '" data-unit-type="1" data-unit-name="' + unit.name + '">' + unit.name + '</option>';
        });
        tableRow += '</select>';
        tableRow1 += '</select>';
        that.$el.find('#unit-list').append(tableRow);
        that.$el.find('#edit-unit-list').append(tableRow1);

        var fieldSet = (
            '<fieldset class="group">' +
            '<legend>' + 'Select expressions' + '</legend>' +
            '<ul class="checkbox">'
        );
        that.nonGradeExpressions.forEach(function (expression) {
            fieldSet += '<li><input class="expression-checkbox" type="checkbox" value="' + expression.name + '" /><label for="cb1">' + expression.name + '</label></li>'
        });
        fieldSet += '</ul> </fieldset>'
        this.$el.find('#expression-group').append(fieldSet);
    }

    addProductJoinsToGraph(productJoins) {
        var that = this;
        productJoins.forEach(function (productJoin) {
            var productJoinNode = that.system.addNode(productJoin.name, {
                'color': '#E79A58',
                'shape': 'rect',
                'label': productJoin.name,
                'category': 'productJoin'
            });
            productJoin.productList.forEach(function (productName) {
                var childProductNode = that.system.getNode(productName);
                if (childProductNode) {
                    that.system.addEdge(childProductNode, productJoinNode, {
                        directed: true,
                        weight: 1,
                        color: '#333333'
                    });
                }
            });
            productJoin.productJoinList.forEach(function (productJoinName) {
                var childProductJoinNode = that.getNodeWithName(productJoinName);
                if (!childProductJoinNode) {
                    childProductJoinNode = that.system.addNode(productJoinName, {
                        'color': '#E79A58',
                        'shape': 'rect',
                        'label': productJoinName,
                        'category': 'superProductJoin'
                    });
                }
                that.system.addEdge(productJoinNode, childProductJoinNode, {
                    directed: true,
                    weight: 1,
                    color: '#333333'
                });
            });
        });
    }

    addProductsToGraph(products) {
        var that = this;
        products.forEach(function (product) {
            var productNode = that.system.addNode(product.name, {
                'color': '#A55540',
                'shape': 'rect',
                'label': product.name,
                'category': 'product'
            });

            var modelId = product.modelId;
            var associatedModel = that.getModelWithId(modelId);
            var modelNode = that.system.getNode(associatedModel.name);
            that.system.addEdge(modelNode, productNode, {directed: false, weight: 1, color: '#333333'});
        });
    }

    addProcessJoinsToGraph(processJoins) {
        var that = this;
        processJoins.forEach(function (processJoin) {
            var processJoinNode = that.system.addNode(processJoin.name, {
                'color': '#E1D5D2',
                'shape': 'dot',
                'label': processJoin.name,
                'category': 'processJoin'
            });
            processJoin.childProcessList.forEach(function (childProcessId) {
                if (childProcessId > 0) {
                    var childModel = that.getModelWithId(childProcessId);
                    var childModelNode = that.system.getNode(childModel.name);
                    if (childModelNode) {
                        that.system.addEdge(childModelNode, processJoinNode, {
                            directed: true,
                            weight: 1,
                            color: '#333333'
                        });
                    }
                }
            });
        });
    }

    addProcessesToGraph(processes) {
        var that = this;
        processes.forEach(function (process) {
            var modelId = process.modelId;
            var parentModelId = process.parentModelId;
            var model = that.getModelWithId(modelId);
            var parentModel = that.getModelWithId(parentModelId);

            var modelNode = that.getNodeWithName(model.name);
            if (!modelNode) {
                modelNode = that.system.addNode(model.name, {
                    'color': '#4B4A5A',
                    'shape': 'dot',
                    'label': model.name,
                    'id': model.id,
                    'category': 'model'
                });
            }
            var parentNode = null;
            if (parentModel) {
                parentNode = that.getNodeWithName(parentModel.name);
                if (!parentNode) {
                    parentNode = that.system.addNode(parentModel.name, {
                        'color': '#95cde5',
                        'shape': 'dot',
                        'label': parentModel.name,
                        'id': parentModel.id,
                        'category': 'block'
                    });
                }
            } else {
                parentNode = that.getNodeWithName('Block');
            }

            that.system.addEdge(parentNode, modelNode, {directed: true, weight: 1, color: '#333333'});
        });
    }

    fetchUnits() {
        var that = this;
        this.unitModel.fetch({
            success: function (data) {
                that.units = data;
                var fieldSet = (
                    '<fieldset class="group">' +
                    '<legend>' + 'Select units' + '</legend>' +
                    '<ul class="checkbox">'
                );
                that.units.forEach(function (unit) {
                    fieldSet += '<li><input class="unit-checkbox" type="checkbox" value="' + unit.name + '" /><label for="cb1">' + unit.name + '</label></li>'
                });
                fieldSet += '</ul> </fieldset>'
                that.$el.find('#unit-group').append(fieldSet);
                that.fetchExpressions();
            },
            error: function (data) {
                alert('Error fetching product joins');
            }
        });
    }

    fetchExpressions() {
        var that = this;
        this.expressionModel.fetch({
            success: function (data) {
                that.expressions = data;
                that.filterNonGradeExpressions();
                that.fetchProcesses();
            },
            error: function (data) {
                alert('Error fetching product joins');
            }
        });
    }

    fetchProductJoins() {
        var that = this;
        this.productJoinModel.fetch({
            success: function (data) {
                that.productJoins = data;
                that.initializeGraph(data);
                that.bindDomEvents();
            },
            error: function (data) {
                alert('Error fetching product joins');
            }
        });
    }

    fetchProducts() {
        var that = this;
        this.productModel.fetch({
            success: function (data) {
                that.products = data;
                that.fetchProductJoins();
            }
        });
    }

    fetchProcessJoins() {
        var that = this;
        this.processJoinModel.fetch({
            success: function (data) {
                that.processJoins = data;
                that.fetchProducts();
            }
        });
    }

    fetchProcessTreeNodes() {
        var that = this;
        this.processTreeModel.fetch({
            success: function (data) {
                that.treeNodes = data;
                that.fetchProcessJoins();
            }
        });
    }

    fetchProcesses() {
        var that = this;
        this.processModel.fetch({
            success: function (data) {
                that.processes = data;
                var tableRow = (
                    '<select id="new_process" class="process-name form-control" value="test">'
                );
                that.processes.forEach(function (process) {
                    tableRow += '<option data-process-name="' + process.name + '">' + process.name + '</option>';
                });
                tableRow += '</select>';
                that.$el.find('#process-list').append(tableRow);
                that.fetchModels();
                //that.initializeGraph();
            },
            error: function (data) {
                alert('Error fetching list of pits: ' + data);
            }
        });
    }

    fetchModels() {
        var that = this;
        this.gnosModel.fetch({
            success: function (data) {
                that.models = data;
                var $liGroup = that.$el.find('ul.list-group');
                var $li;
                data.forEach(function (model) {
                    $li = $('<li data-model-id="' + model.id + '" draggable="true">' + model.name + '</li>');
                    $li.attr('title', model.name);
                    $li.addClass('list-group-item list-group-item-info');
                    $liGroup.append($li);
                });
                that.fetchProcessTreeNodes();
            },
            error: function (data) {
                alert('Error fetching list of pits: ' + data);
            }
        });
    }

    onDomLoaded() {
        this.fetchUnits();
        //this.fitCanvasToContainer();
    }

    handleZoomIn() {
        //alert("Implement zoom in");
        this.scaleFactor += 0.5;
        var $canvas = this.$el.find("#viewport");
        var existingWidth = $canvas.attr('width');
        var existingHeight = $canvas.attr('height');

        var newWidth = existingWidth * 1.5;
        var newHeight = existingHeight * 1.5;
        this.system.renderer.setScaleFactor(this.scaleFactor);
        this.resizeCanvas({newWidth: newWidth, newHeight: newHeight});
    }

    handleZoomOut() {
        this.scaleFactor -= 0.5;
        var $canvas = this.$el.find("#viewport");
        var existingWidth = $canvas.attr('width');
        var existingHeight = $canvas.attr('height');

        var newWidth = existingWidth / 1.5;
        var newHeight = existingHeight / 1.5;
        this.system.renderer.setScaleFactor(this.scaleFactor);
        this.resizeCanvas({newWidth: newWidth, newHeight: newHeight});
    }

    resizeCanvas(options) {
        var $canvas = this.$el.find("#viewport");
        $canvas.attr('width', options.newWidth);
        $canvas.attr('height', options.newHeight);
        this.system.screenSize(options.newWidth, options.newHeight);
    }

    getStoredNodePosition(nodeName) {
        var position = {};
        if (!this.storedCoordinates) {
            return null;
        }
        this.storedCoordinates.forEach(function (storedNode) {
            if (storedNode.name === nodeName) {
                position['x'] = storedNode.x;
                position['y'] = storedNode.y;
                position['screenPosition'] = storedNode.screenPosition;
            }
        });
        return position;
    }

    initializeGraph(nodeData) {
        var that = this;
        var storedGraphNodes = localStorage.getItem('Coordinates-' + this.projectId);
        this.storedCoordinates = JSON.parse(storedGraphNodes);
        console.log(this.storedCoordinates);
        var parentWidth = this.$el.find('#canvas-container').width();
        var parentHeight = this.$el.find('#canvas-container').height();
        var $canvas = this.$el.find("#viewport");

        var canvas = document.querySelector('canvas');
        canvas.width = parentWidth;
        canvas.height = parentHeight;
        this.system = arbor.ParticleSystem({
            friction: 100,
            stiffness: -512,
            repulsion: 0,
            gravity: false
        });
        this.system.renderer = Renderer($canvas);
        var block = this.system.addNode('Block', {'color': 'red', 'shape': 'dot', 'label': 'Block'});
        this.addProcessesToGraph(this.treeNodes);
        this.addProcessJoinsToGraph(this.processJoins);
        this.addProductsToGraph(this.products);
        this.addProductJoinsToGraph(this.productJoins);

        setTimeout(function () {
            that.system.eachNode(function (node, point) {
                console.log('Node: ' + node.name + ' X:' + point.x + ' Y:' + point.y);
                var position = that.getStoredNodePosition(node.name);
                if (position) {
                    var node = that.system.getNode(node.name);
                    var pos = $(canvas).offset();
                    var s = arbor.Point(position.x - pos.left, position.x - pos.top);
                    var p = that.system.fromScreen(s);
                    node.p = position.screenPosition;
                }
            });
        }, 100);
        $canvas.contextMenu({
            arborSystem: this.system,
            menuSelector: "#workflowContextMenu",
            menuSelected: function (invokedOn, selectedMenu, event, selected) {
                var selectedAction = selectedMenu.text();
                //alert("Name:" + selected.node.name + " Category:" + selected.node.data.category)
                if (selectedAction.toString() === 'Delete') {
                    that.handleDelete(selected);
                } /*else if ((selectedAction.toString() === 'Add product')) {
                 that.handleAddProduct(selected);
                 } */ else if ((selectedAction.toString() === 'Add to process join')) {
                    that.handleAddProcessToJoin(selected);
                } else if ((selectedAction.toString() === 'Add to product join')) {
                    that.handleAddToProductJoin(selected);
                } else if ((selectedAction.toString() === 'Add expression')) {
                    that.handleAddExpressionToProduct(selected);
                } else if ((selectedAction.toString() === 'Add unit')) {
                    that.handleAddUnitToProduct(selected);
                } else if ((selectedAction.toString() === 'View grades')) {
                    that.handleViewGrades(selected);
                } else if ((selectedAction.toString() === 'Edit')) {
                    that.handleEdit(selected);
                }
            }
        });
    }

    handleEdit(selected) {
        var that = this;
        var selected = selected;
        if (selected.node) {
            var category = selected.node.data.category;

            if (category === 'product') {
                /*that.$el.find('#grade-list').html('');
                 that.showGradeListForProduct(selected.node.name);
                 that.$el.find('#associatedGrades').modal();*/
                that.$el.find('input#edit-name').val(selected.node.name);
                that.$el.find('#productEditModal').modal();
            } else {
                alert("Edit not available for category: " + category);
            }
        }
    }

    editProduct(event) {

    }

    handleViewGrades(selected) {
        var that = this;
        var selected = selected;
        if (selected.node) {
            var category = selected.node.data.category;

            if (category === 'product') {
                that.$el.find('#grade-list').html('');
                that.showGradeListForProduct(selected.node.name);
                that.$el.find('#associatedGrades').modal();
            } else if (category === 'productJoin') {
                that.$el.find('#grade-list').html('');
                that.showGradeListForProductJoin(selected.node.name);
                that.$el.find('#associatedGrades').modal();
            } else {
                alert('Not available for category: ' + category);
            }
        }
    }

    showGradeListForProductJoin(productJoinName) {
        var that = this;
        this.productJoinModel.fetch({
            success: function (data) {
                that.productJoins = data;
                that.productJoins.forEach(function (productJoin) {
                    if (productJoin.name === productJoinName) {
                        productJoin.productList.forEach(function (associatedProductName) {
                            that.showGradeListForProduct(associatedProductName);
                        });
                    }
                });
            },
            error: function (data) {
                alert('Error fetching product joins.');
            }
        });
    }

    showGradeListForProduct(productName) {
        var that = this;
        this.productGradeModel = new ProductGradeModel({
            projectId: this.projectId,
            productName: productName
        });
        this.productGradeModel.fetch({
            success: function (data) {
                var associatedGrades = data;
                var listGroup = '<ul class="list-group">';
                associatedGrades.forEach(function (associatedGrade) {
                    listGroup += '<li class="list-group-item">' + associatedGrade.name + '</li>'
                });
                listGroup += '</ul>';
                //that.$el.find('#grade-list').html();
                that.$el.find('#grade-list').append(listGroup);
                //that.$el.find('#associatedGrades').modal();
            },
            error: function (data) {
                alert('Error fetching list of associated grades');
            }
        });
    }

    removeProductFromProductJoins(productNode) {
        var that = this;
        var parentProductJoinNodes = this.system.getEdgesFrom(productNode);
        parentProductJoinNodes.forEach(function (parentProductJoinNode) {
            console.log(parentProductJoinNode.target.name);
            that.removeProductFromProductJoin(productNode.name, parentProductJoinNode.target.name);
        });
    }

    removeProductFromProductJoin(productName, productJoinName) {
        var that = this;
        this.productJoinModel.delete({
            url: 'http://localhost:4567/project/' + that.projectId + '/productjoins/' + productJoinName + '/product',
            id: productName,
            success: function (data) {
                alert('Successfully deleted product node.')
            },
            error: function (data) {
                alert('Failed to delete product join.');
            }
        });
    }

    removeProcessFromProcessJoins(processNode) {
        var that = this;
        var parentProcessJoinNodes = this.system.getEdgesFrom(processNode);
        parentProcessJoinNodes.forEach(function (parentProcessJoinNode) {
            console.log(parentProcessJoinNode.target.name);
            that.removeProcessFromProcessJoin(processNode.data.id, parentProcessJoinNode.target.name);
        });
    }

    removeProcessFromProcessJoin(modelId, processJoinName) {
        var that = this;
        this.processJoinModel.delete({
            url: 'http://localhost:4567/project/' + that.projectId + '/processjoins/' + processJoinName + '/process',
            id: modelId,
            success: function (data) {
                alert('Successfully deleted model node.')
            },
            error: function (data) {
                alert('Failed to delete product join.');
            }
        });
    }

    handleDelete(selected) {
        var that = this;
        var selected = selected;
        if (selected.node) {
            console.log('Delete: ' + selected.node.name);
            var category = selected.node.data.category;
            if (category.toString() === 'model') {
                this.processTreeModel.delete({
                    url: 'http://localhost:4567/project/' + that.projectId + '/processtreenodes/model',
                    id: selected.node.data.id,
                    success: function () {
                        that.removeProcessFromProcessJoins(selected.node);
                        that.system.pruneNode(selected.node);
                        var listOfBlockChildren = that.system.getEdgesFrom('Block');
                        if (listOfBlockChildren.length === 0) {// no more processes in graph
                            that.system.parameters({repulsion: 0});
                        }
                    },
                    error: function (data) {
                        alert('Failed to delete model.');
                    }
                });
            } else if (category.toString() === 'processJoin') {
                this.processJoinModel.delete({
                    url: 'http://localhost:4567/project/' + that.projectId + '/processjoins',
                    id: selected.node.name,
                    success: function () {
                        that.system.pruneNode(selected.node);
                    },
                    error: function (data) {
                        alert('Failed to delete process join.');
                    }
                });
            } else if (category.toString() === 'product') {
                this.productModel.delete({
                    url: 'http://localhost:4567/project/' + that.projectId + '/products',
                    id: selected.node.name,
                    success: function () {
                        that.removeProductFromProductJoins(selected.node);
                        that.system.pruneNode(selected.node);
                    },
                    error: function (data) {
                        alert('Failed to delete product.');
                    }
                });
            } else if (category.toString() === 'productJoin') {
                this.productJoinModel.delete({
                    url: 'http://localhost:4567/project/' + that.projectId + '/productjoins',
                    id: selected.node.name,
                    success: function (data) {
                        that.system.pruneNode(selected.node);
                    },
                    error: function (data) {
                        alert('Failed to delete product join.');
                    }
                });
            } else if (category.toString() === 'superProductJoin') {
                this.productJoinModel.delete({
                    url: 'http://localhost:4567/project/' + that.projectId + '/productjoins',
                    id: selected.node.name,
                    success: function (data) {
                        that.system.pruneNode(selected.node);
                    },
                    error: function (data) {
                        alert('Failed to delete product join.');
                    }
                });
            }
        }
    }


    handleAddExpressionToProduct(selected) {
        var that = this;
        var selected = selected;
        if (selected.node.data.category !== 'product') {
            alert('options not available for category' + selected.node.data.category);
            return;
        } else {
            this.$el.find('#addExpressions').click(function (event) {
                $(this).off('click');
                that.$el.find('.expression-checkbox:checked').each(
                    function (checkbox) {
                        // Insert code here
                        console.log($(this).val());
                        var updatedProduct = that.getProductWithName(selected.node.name);
                        var expression = that.getExpressionByName($(this).val());
                        updatedProduct['unitType'] = 2;
                        updatedProduct['unitId'] = expression.id;
                        that.productModel.add({
                            dataObject: updatedProduct,
                            success: function (data) {
                                alert('Successfully added expression to product.');
                            },
                            error: function (data) {
                                alert('Error adding product to join');
                            }
                        });
                    }
                );
            });
            this.$el.find('#addExpressionToProductModal').modal();
        }
    }

    handleAddUnitToProduct(selected) {
        var that = this;
        var selected = selected;
        if (selected.node.data.category !== 'product') {
            alert('options not available for category' + selected.node.data.category);
            return;
        } else {
            this.$el.find('#addUnits').click(function (event) {
                $(this).off('click');
                that.$el.find('.unit-checkbox:checked').each(
                    function (checkbox) {
                        // Insert code here
                        console.log($(this).val());
                        var updatedProduct = that.getProductWithName(selected.node.name);
                        var unit = that.getUnitWithName($(this).val());
                        updatedProduct['unitType'] = 1;
                        updatedProduct['unitId'] = unit.id;
                        that.productModel.add({
                            dataObject: updatedProduct,
                            success: function (data) {
                                alert('Successfully added unit to product.');
                            },
                            error: function (data) {
                                alert('Error adding product to join');
                            }
                        });
                    }
                );
            });
            this.$el.find('#addUnitToProductModal').modal();
        }
    }

    /*handleAddProduct(event) {
     var pos = this.$el.find('#viewport').offset();
     var p = {x: event.pageX - pos.left, y: event.pageY - pos.top}
     var selected = this.system.nearest(p);
     if (selected.node.data.category !== 'model') {
     alert('options not available for category' + selected.node.data.category);
     return;
     } else {
     this.$el.find('#productModal').modal();
     }

     }*/

    handleAddToProductJoin(selected) {
        var that = this;

        var selected = selected;
        var category = selected.node.data.category;
        if (category !== 'product' && category !== 'productJoin') {
            alert('Option not available for category: ' + selected.node.data.category);
            return;
        }
        if (category == 'product') {
            this.handleAddProductToProductJoin(selected);
        } else if (category == 'productJoin') {
            this.handleAddProductJoinToProductJoin(selected);
        }
    }

    handleAddProductToProductJoin(selected) {
        var that = this;
        var selected = selected;
        if (selected.node) {
            console.log('Adding product: ' + selected.node.name);
            this.$el.find('#addProductToJoin').click(function (event) {
                $(this).off('click');
                var productJoinName = that.$el.find('#target_product_join').val();
                var productJoinNode = that.system.getNode(productJoinName.trim());
                if (productJoinNode) {
                    var updatedProductJoin = {}
                    updatedProductJoin['name'] = productJoinName;
                    updatedProductJoin['childType'] = 1;
                    updatedProductJoin['child'] = selected.node.name;
                    that.productJoinModel.add({
                        dataObject: updatedProductJoin,
                        success: function (data) {
                            alert('Successfully added to join.');
                            that.system.addEdge(selected.node, productJoinNode, {
                                directed: true,
                                weight: 1,
                                color: '#333333'
                            });
                            that.$el.find('#target_product_join').val('');
                        },
                        error: function (data) {
                            alert('Error adding product to join');
                        }
                    });
                }
            });
            this.$el.find('#addProductToJoinModal').modal();
        }
    }

    handleAddProductJoinToProductJoin(selected) {
        var that = this;
        var selected = selected;
        if (selected.node) {
            console.log('Adding product join: ' + selected.node.name);
            this.$el.find('#addProductJoinToJoin').click(function (event) {
                $(this).off('click');
                var productJoinName = that.$el.find('#parent_product_join').val();
                var productJoinNode = that.system.getNode(productJoinName.trim());
                if (productJoinNode) {
                    var updatedProductJoin = {}
                    updatedProductJoin['name'] = productJoinName;
                    updatedProductJoin['childType'] = 2;
                    updatedProductJoin['child'] = selected.node.name;
                    that.productJoinModel.add({
                        dataObject: updatedProductJoin,
                        success: function (data) {
                            alert('Successfully added to join.');
                            that.system.addEdge(selected.node, productJoinNode, {
                                directed: true,
                                weight: 1,
                                color: '#333333'
                            });
                            that.$el.find('#target_product_join').val('');
                        },
                        error: function (data) {
                            alert('Error adding product to join');
                        }
                    });
                }
            });
            this.$el.find('#addProductJoinToJoinModal').modal();
        }
    }


    handleAddProcessToJoin(selected) {
        var that = this;
        var selected = selected;
        if (selected.node.data.category !== 'model') {
            alert('Option not available for category: ' + selected.node.data.category);
            return;
        }
        if (selected.node) {
            console.log('Adding to process: ' + selected.node.name);
            this.$el.find('#add-to-join').click(function (event) {
                $(this).off('click');
                var processJoinName = that.$el.find('#target_join').val();
                var processJoinNode = that.system.getNode(processJoinName.trim());
                if (processJoinNode) {
                    var newProcessJoin = {}
                    newProcessJoin['name'] = processJoinName;
                    newProcessJoin['processId'] = selected.node.data.id;
                    that.processJoinModel.add({
                        dataObject: newProcessJoin,
                        success: function (data) {
                            alert('Successfully added to join.');
                            that.system.addEdge(selected.node, processJoinNode, {
                                directed: true,
                                weight: 1,
                                color: '#333333'
                            });
                            that.$el.find('#target_join').val('');
                        }
                    });
                }
            });
            this.$el.find('#addProcessToJoinModal').modal();
        }
    }


    handleDragStart(e) {
        e.target.style.opacity = '0.4';  // this / e.target is the source node.
    }

    handleDragEnd(e) {
        console.log('Dragged model: ' + e.target.innerHTML);
        this.system.parameters({repulsion: 0})
        var draggedModel = this.getModelWithName(e.target.innerHTML);
        e.target.style.opacity = '1';
        var pos = this.$el.find('#viewport').offset();
        var p = {x:e.pageX-pos.left, y:e.pageY-pos.top}
        var selected = this.system.nearest(p);

        if ((selected.node !== null) && (draggedModel!==null)){
            // dragged.node.tempMass = 10000
            //dragged.node.fixed = true;
            var parentModel = this.getModelWithName(selected.node.name);
            if (!parentModel) {
                parentModel = this.system.getNode('Block');
            }
            console.log(draggedModel.name + ':' + parentModel.name);
            this.addModelToProcessFlow({draggedModel: draggedModel, parentModel: parentModel});
        }
    }

    addModelToProcessFlow(options) {
        var that = this;
        var draggedModel = options.draggedModel;
        var parentModel = options.parentModel;
        var newModel = {
            modelId: draggedModel.id,
            parentModelId: parentModel.id || -1
        }
        this.processTreeModel.add({
            dataObject: newModel,
            success: function (data) {
                console.log('Successfully created model: ' + data);
                that.addProcessesToGraph([data])
            },
            error: function (data) {
                alert('Error adding model: ' + data);
            }
        });
    }

    handleCanvasClick(e) {
        var that = this;
        var pos = this.$el.find('#viewport').offset();
        var _mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top)
        var clickedNode = this.system.nearest(_mouseP);
        if (clickedNode.node !== null) clickedNode.node.fixed = true;
        this.$el.find('.tooltiptext').html(clickedNode.node.name);
        this.$el.find('.tooltiptext')
            .show()
            .css({
                position: "absolute",
                left: e.clientX - $('#sidebar-wrapper').width(),
                top: e.clientY
            })
        setTimeout(function () {
            that.$el.find('.tooltiptext').hide();
        }, 1000);
    }

    bindDomEvents() {
        var that = this;
        this.$el.on('click', '#btn-zoomin', this.handleZoomIn.bind(this));
        this.$el.on('click', '#btn-zoomout', this.handleZoomOut.bind(this));
        this.$el.on('click', '#viewport', this.handleCanvasClick.bind(this));
        this.$el.find("#viewport").dblclick(function (event) {
            var offset = $(this).offset();
            var X = event.pageX - offset.left;
            var Y = event.pageY - offset.top;
            if (event.shiftKey) {
                that.handleZoomOut();
            } else {
                that.handleZoomIn();
                that.$el.find('#canvas-container').animate({
                    scrollTop: Y,
                    scrollLeft: X
                }, 500);
            }
        });
        this.bindDragEventsOnModels();
        this.$el.find('#join_processes').click(function (event) {
            that.addProcessJoin();
        });
        this.$el.find('#join_products').click(function (event) {
            that.addProductJoin();
        });
        this.$el.find('#add-product').click(function (event) {
            that.addProduct();
        });
        this.$el.find('#edit-product').click(function (event) {
            that.editProduct();
        });
        this.$el.find('#save-graph').click(function (event) {
            var coordinateSystem = [];
            that.system.eachNode(function (node, point) {
                console.log('Node: ' + node.name + ' X:' + point.x + ' Y:' + point.y);
                var object = {'name': node.name, 'x': point.x, 'y': point.y, screenPosition: node._p};
                coordinateSystem.push(object);
            });
            if (typeof(Storage) !== "undefined") {
                // Code for localStorage/sessionStorage.
                console.log('storage present');
                localStorage.setItem('Coordinates-' + that.projectId, JSON.stringify(coordinateSystem));
            } else {
                // Sorry! No Web Storage support..
                console.log('storage absent');
            }
        });
        this.$el.find('#switch').change(function (event) {
            //that.addProduct();
            var isEditMode = $(this).is(':checked');
            if (isEditMode) {
                that.system.parameters({friction: 1})
            } else {
                that.system.parameters({friction: 0.5})
            }
        });
    }

    addProcessJoin() {
        var that = this;
        var newProcessJoin = {}
        newProcessJoin['name'] = this.$el.find('#join_name').val();
        newProcessJoin['processId'] = 0;
        this.processJoinModel.add({
            dataObject: newProcessJoin,
            success: function (data) {
                alert('Successfully created join.');
                that.processJoins.push(data);
                that.addProcessJoinsToGraph([data]);
                that.$el.find('#join_name').val('');
            }
        });
    }

    addProductJoin() {
        var that = this;
        var newProductJoin = {}
        newProductJoin['name'] = this.$el.find('#product_join_name').val();
        newProductJoin['childType'] = 0;
        newProductJoin['child'] = '';
        this.productJoinModel.add({
            dataObject: newProductJoin,
            success: function (data) {
                alert('Successfully created product join.');
                that.productJoins.push(data);
                that.addProductJoinsToGraph([data]);
                that.$el.find('#product_join_name').val('');
            }
        });
    }

    addProduct() {
        var that = this;
        var newProduct = {}
        var processName = this.$el.find('#new_process').find(':selected').data('process-name');
        var unitName = this.$el.find('#grade-expression').find(':selected').data('unit-name');
        var unitId = this.$el.find('#grade-expression').find(':selected').data('unit-id');
        var unitType = this.$el.find('#grade-expression').find(':selected').data('unit-type');
        //var unit = this.getExpressionByName(unitName);
        //newProduct[]
        newProduct['name'] = processName + '_' + this.$el.find('#product_name').val();
        var process = this.getModelWithName(processName);
        newProduct['modelId'] = process.id;
        newProduct['unitType'] = unitType;
        newProduct['unitId'] = unitId;
        this.productModel.add({
            dataObject: newProduct,
            success: function (data) {
                alert('Successfully created product.');
                that.products.push(data);
                that.addProductsToGraph([data]);
                that.$el.find('#product_name').val('');
            },
            error: function (data) {
                alert('Error creating product');
            }
        });
        console.log(newProduct.name + ':' + newProduct.modelId + ':' + newProduct.unitType + ':' + newProduct.unitId);
    }

    bindDragEventsOnModels() {
        var models = document.querySelectorAll('.list-group-item');
        var that = this;
        [].forEach.call(models, function(col) {
            col.addEventListener('dragstart', that.handleDragStart.bind(that), false);
            col.addEventListener('dragend', that.handleDragEnd.bind(that), false);
        });
    }

    getModelWithName(modelName) {
        var selectedModel = null;
        this.models.forEach(function (model) {
            if(model.name === modelName) {
                selectedModel = model;
            }
        });
        return selectedModel;
    }
}
