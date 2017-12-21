import {View} from '../core/view';
import {ProcessModel} from '../models/processModel';
import {GnosModel} from '../models/gnosModel';
import {ProcessTreeNodeModel} from '../models/processTreeNodeModel';
import {ProcessJoinModel} from '../models/processJoinModel';
import {ProductModel} from '../models/productModel';
import {ProductJoinModel} from '../models/productJoinModel';
import {ExpressionModel} from '../models/expressionModel';
import {UnitModel} from '../models/unitModel';
import {ProductGradeModel} from '../models/productGradeModel';
import {MultiProductOverlay} from '../overlays/multiProductOverlay';
import {ProductJoinEditOverlay} from '../overlays/productJoinEditOverlay';
import {UIStateModel} from '../models/uiStateModel';
import cytoscape from 'cytoscape';
import contextMenus from 'cytoscape-context-menus';

export class WorkflowView_V2 extends View {
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
        this.uiStateModel = new UIStateModel({projectId: options.projectId});
        this.multiProductOverlay = new MultiProductOverlay();
        this.scaleFactor = 1;
        contextMenus(cytoscape, jQuery); // register extension
    }

    getHtml() {
        var promise = new Promise(function (resolve, reject) {
            $.get("../content/workflowView_v2.html", function (data) {
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

    getExpressionById(expressionId) {
        var object = null;
        this.expressions.forEach(function (expression) {
            if (expression.id === expressionId) {
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

    getProductJoinWithName(productJoinName) {
        var object = null;
        this.productJoins.forEach(function (productJoin) {
            if (productJoin.name === productJoinName) {
                object = productJoin;
            }
        });
        return object;
    }

    getProcessJoinWithName(processJoinName) {
        var object = null;
        this.processJoins.forEach(function (processJoin) {
            if (processJoin.name === processJoinName) {
                object = processJoin;
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

    getUnitWithId(unitId) {
        var object = null;
        this.units.forEach(function (unit) {
            if (unit.id === unitId) {
                object = unit;
            }
        });
        return object;
    }

    getNodeWithName(nodeName) {
        //return this.system.getNode(nodeName)
        var object = this.system.$id(nodeName);
        if (object.length > 0) {
            return object;
        } else {
            return undefined;
        }
    }

    getNodeWithId(nodeId) {
        var object = this.system.$id(nodeId);
        if (object.length > 0) {
            return object;
        } else {
            return undefined;
        }
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
            '<select id="grade-expression" class="grade-expression form-control">'
        );
        var tableRow1 = (
            '<select id="edit-grade-expression" class="grade-expression form-control">' /*+
             '<option class="present-value" selected="" disabled="" hidden=""></option>'*/
        );
        //add non-grade expressions
        that.nonGradeExpressions.forEach(function (expression) {
            tableRow += '<option data-unit-id="' + expression.id + '" data-unit-type="2" data-unit-name="' + expression.name + '">' + expression.name + '</option>';
            tableRow1 += '<option data-unit-id="' + expression.id + '" data-unit-type="2" value="' + expression.name + '" data-unit-name="' + expression.name + '">' + expression.name + '</option>';
        });
        //add units
        that.units.forEach(function (unit) {
            tableRow += '<option data-unit-id="' + unit.id + '" data-unit-type="1" data-unit-name="' + unit.name + '">' + unit.name + '</option>';
            tableRow1 += '<option data-unit-id="' + unit.id + '" data-unit-type="1" value="' + unit.name + '" data-unit-name="' + unit.name + '">' + unit.name + '</option>';
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
            var productJoinNode = that.getNodeWithId(productJoin.name);
            if (!productJoinNode) {
                productJoinNode = that.system.add({
                    group: "nodes",
                    data: {id: productJoin.name, label: productJoin.name, weight: 75},//product has no ID, so name is the id
                    classes: 'product-join'
                });
            }
            productJoin.productList.forEach(function (productName) {
                var childProductNode = that.getNodeWithId(productName);
                if (childProductNode && !(childProductNode.edgesTo(productJoinNode).length > 0)) {
                    that.system.add({
                        group: "edges",
                        data: {source: productName, target: productJoin.name, weight: 1}
                    });
                }
            });
            productJoin.productJoinList.forEach(function (productJoinName) {
                var childProductJoinNode = that.getNodeWithId(productJoinName);
                if (!childProductJoinNode) {
                    childProductJoinNode = that.system.add({
                        group: "nodes",
                        data: {id: productJoinName, label: productJoinName, weight: 75},//product has no ID, so name is the id
                        classes: 'product-join'
                    });
                }
                if (!(childProductJoinNode.edgesTo(productJoinNode).length > 0)) {
                    that.system.add({
                        group: "edges",
                        data: {source: productJoin.name, target: productJoinName, weight: 1}
                    });
                }
            });
        });
    }

    addProductsToGraph(products) {
        var that = this;
        products.forEach(function (product) {
            var productNode = that.getNodeWithId(product.name);
            if (!productNode) {
                productNode = that.system.add({
                    group: "nodes",
                    data: {id: product.name, label: product.name, weight: 75},//product has no ID, so name is the id
                    classes: 'product'
                });
            }
            var modelId = product.modelId;
            var modelNode = that.getNodeWithId(modelId);
            if (modelNode && !(modelNode.edgesTo(productNode).length > 0)) {
                that.system.add({
                    group: "edges",
                    data: {source: modelId, target: product.name, weight: 1}
                });
            }
        });
    }

    addProcessJoinsToGraph(processJoins) {
        var that = this;
        processJoins.forEach(function (processJoin) {
            var processJoinNode = that.getNodeWithId(processJoin.name);
            if (!processJoinNode) {
                processJoinNode = that.system.add({
                    group: "nodes",
                    data: {id: processJoin.name, label: processJoin.name, weight: 75},//process join has no ID, so name is the id
                    classes: 'model-join'
                });
            }
            processJoin.childProcessList.forEach(function (childProcessId) {
                if (childProcessId > 0) {
                    //var childModel = that.getModelWithId(childProcessId);
                    //var childModelNode = that.system.getNode(childModel.name);
                    var childModelNode = that.getNodeWithId(childProcessId);
                    if (childModelNode && !(childModelNode.edgesTo(processJoinNode).length > 0)) {
                        that.system.add({
                            group: "edges",
                            data: {source: processJoin.name, target: childProcessId, weight: 1}
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

            var modelNode = that.getNodeWithId(modelId);
            if (!modelNode) {
                modelNode = that.system.add({
                    group: "nodes",
                    data: {id: model.id, label: model.name, weight: 75},
                    /*position: { x: 200, y: 200 },*/
                    classes: 'model'
                });
            }
            var parentNodeId = 'block';
            var parentNode = that.getNodeWithId('block');
            if (parentModel) {
                parentNode = that.getNodeWithId(parentModelId);
                if (!parentNode) {
                    parentNode = that.system.add({
                        group: "nodes",
                        data: {id: parentModel.id, label: parentModel.name, weight: 75},
                        classes: 'model'
                    });
                }
                parentNodeId = parentModel.id;
            }
            if (!(modelNode.edgesTo(parentNode).length > 0)) {
                that.system.add({
                    group: "edges",
                    data: {id: 'model-' + modelId, source: parentNodeId, target: modelId, weight: 1}
                });
            }
        });
    }

    fetchUnits() {
        var promise = new Promise((resolve, reject)=> {
            this.unitModel.fetch({
                success: (data) => {
                    this.units = data;
                    var fieldSet = (
                        '<fieldset class="group">' +
                        '<legend>' + 'Select units' + '</legend>' +
                        '<ul class="checkbox">'
                    );
                    this.units.forEach(function (unit) {
                        fieldSet += '<li><input class="unit-checkbox" type="checkbox" value="' + unit.name + '" /><label for="cb1">' + unit.name + '</label></li>'
                    });
                    fieldSet += '</ul> </fieldset>'
                    this.$el.find('#unit-group').append(fieldSet);
                    resolve();
                },
                error: (data)=> {
                    reject('Error fetching product joins');
                }
            });
        });
        return promise;
    }

    fetchExpressions() {
        var promise = new Promise((resolve, reject)=> {
            this.expressionModel.fetch({
                success: (data)=> {
                    this.expressions = data;
                    resolve();
                },
                error: (data)=> {
                    reject('Error fetching product joins');
                }
            });
        });
        return promise;
    }

    fetchStoredCoordinates() {
        var promise = new Promise((resolve, reject)=> {
            this.uiStateModel.fetch({
                success: (data)=> {
                    this.storedCoordinates = data;
                    resolve();
                },
                error: (error)=> {
                    reject(error.message);
                }
            });
        });
        return promise;
    }

    fetchProductJoins() {
        var promise = new Promise((resolve, reject)=> {
            this.productJoinModel.fetch({
                success: (data) => {
                    this.productJoins = data;
                    resolve();
                },
                error: (error) => {
                    reject('Error fetching product joins:' + error.message);
                }
            });
        });
        return promise;
    }

    fetchProducts() {
        var promise = new Promise((resolve, reject)=> {
            this.productModel.fetch({
                success: (data)=> {
                    this.products = data;
                    resolve();
                },
                error: (error)=> {
                    reject('Error fetching products: ' + error.message);
                }
            });
        });
        return promise;
    }

    fetchProcessJoins() {
        var promise = new Promise((resolve, reject)=> {
            this.processJoinModel.fetch({
                success: (data)=> {
                    this.processJoins = data;
                    resolve();
                },
                error: (error)=> {
                    reject('Error fetching process joins: ' + error.message);
                }
            });
        });
        return promise;
    }

    fetchProcessTreeNodes() {
        var promise = new Promise((resolve, reject)=> {
            this.processTreeModel.fetch({
                success: (data)=> {
                    this.treeNodes = data;
                    resolve();
                },
                error: (error)=> {
                    reject('Error fetching tree nodes: ' + error.message);
                }
            });
        });
        return promise;
    }

    fetchProcesses() {
        var promise = new Promise((resolve, reject)=> {
            this.processModel.fetch({
                success: (data) => {
                    this.processes = data;
                    var tableRow = (
                        '<label>Process:</label>' +
                        '<select id="new_process" class="process-name form-control" value="test">'
                    );
                    this.processes.forEach(function (process) {
                        tableRow += '<option data-process-name="' + process.name + '">' + process.name + '</option>';
                    });
                    tableRow += '</select>';
                    this.$el.find('#process-list').html(tableRow);
                    resolve();
                },
                error: (data)=> {
                    reject('Error fetching list of pits: ' + data);
                }
            });
        });
        return promise;
    }

    fetchModels() {
        var promise = new Promise((resolve, reject)=> {
            this.gnosModel.fetch({
                success: (data)=> {
                    this.models = data;
                    resolve();
                },
                error: (data)=> {
                    reject('Error fetching list of pits: ' + data);
                }
            });
        });
        return promise;
    }

    filterUnusedModel() {
        var unusedModels = [];
        this.models.forEach((model)=> {
            var presentInTree = false;
            this.treeNodes.forEach((node)=> {
                if (node.modelId === model.id) {
                    presentInTree = true;
                }
            });
            if (!presentInTree) {
                unusedModels.push(model);
            }
        });
        var $liGroup = this.$el.find('ul.list-group');
        var $li;
        unusedModels.forEach(function (model) {
            $li = $('<li data-model-id="' + model.id + '" draggable="true">' + model.name + '</li>');
            $li.attr('title', model.name);
            $li.addClass('list-group-item list-group-item-info unused-model');
            $liGroup.append($li);
        });
        return unusedModels;
    }

    onDomLoaded() {
        //this.fetchUnits();
        //this.fitCanvasToContainer();
        var fetchUnitsPromise = this.fetchUnits();
        var fetchExpressionsPromise = this.fetchExpressions();
        var fetchProcessesPromise = this.fetchProcesses();
        var fetchProcessTreeNodesPromise = this.fetchProcessTreeNodes();
        var fetchProcessJoinsPromise = this.fetchProcessJoins();
        var fetchProductsPromise = this.fetchProducts();
        var fetchProductJoinsPromise = this.fetchProductJoins();
        var fetchModelsPromise = this.fetchModels();
        var fetchStoredCoordinatesPromise = this.fetchStoredCoordinates();
        Promise.all([
            fetchUnitsPromise,
            fetchExpressionsPromise,
            fetchProcessesPromise,
            fetchProcessTreeNodesPromise,
            fetchProcessJoinsPromise,
            fetchProductsPromise,
            fetchProductJoinsPromise,
            fetchModelsPromise,
            fetchStoredCoordinatesPromise
        ]).then(values => {
            this.filterNonGradeExpressions();
            this.filterUnusedModel();
            this.initializeGraph();
            this.hookContextMenu();
            this.bindDomEvents();
        }).catch(reason=> {
            alert(reason);
        });
    }

    handleZoomIn() {
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
            if (storedNode.nodeName === nodeName) {
                position['x'] = storedNode.xLoc;
                position['y'] = storedNode.yLoc;
                position['screenPosition'] = {x: storedNode.xLoc, y: storedNode.yLoc};
            }
        });
        return position;
    }

    initializeGraph(nodeData) {
        var that = this;
        var parentWidth = this.$el.find('#canvas-container').width();
        var parentHeight = this.$el.find('#canvas-container').height();
        var $viewport = this.$el.find('#viewport');
        $viewport.width(parentWidth - 5);
        $viewport.height(parentHeight - 5);

        //var cytoscape = require('cytoscape');
        this.system = cytoscape({
            container: $viewport,
            style: cytoscape.stylesheet()
                .selector('node')
                .css({
                    'content': 'data(label)'
                })
                .selector('edge')
                .css({
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                    'width': 2,
                    'line-color': '#ddd',
                    'target-arrow-color': '#ddd'
                })
                .selector('.block')
                .css({
                    'background-color': '#d9534f'
                })
                .selector('.model')
                .css({
                    'background-color': '#4b4a5a'
                })
                .selector('.model-join')
                .css({
                    'background-color': '#E1D5D2'
                })
                .selector('.product')
                .css({
                    'background-color': '#A55540'
                })
                .selector('.product-join')
                .css({
                    'background-color': '#E79A58'
                })
        });
        this.system.add({
            group: "nodes",
            data: {id: 'block', label: 'Block', weight: 75},
            classes: 'block'
        });
        this.addProcessesToGraph(this.treeNodes);
        this.addProcessJoinsToGraph(this.processJoins);
        this.addProductsToGraph(this.products);
        this.addProductJoinsToGraph(this.productJoins);
        var layout = this.system.elements().layout({
            name: 'breadthfirst'
        });

        layout.run();
    }

    hookContextMenu() {
        var removed;
        var options = {
            // List of initial menu items
            menuItems: [
                {
                    id: 'remove',
                    content: 'remove',
                    selector: '.model, .model-join, .product, .product-join',
                    onClickFunction: function (event) {
                        var target = event.target || event.cyTarget;
                        removed = target.remove();
                        contextMenu.showMenuItem('undo-last-remove');
                    },
                    hasTrailingDivider: true
                },
                {
                    id: 'edit',
                    content: 'edit',
                    selector: '.product, .product-join, .model-join',
                    coreAsWell: false,
                    onClickFunction: (event)=> {
                        var target = event.target || event.cyTarget;
                        if (target.hasClass('model-join')) {
                            alert('Edit model join');
                        } else if (target.hasClass('product')) {
                            alert('Edit product');
                        } else if (target.hasClass('product-join')) {
                            //alert('Edit product join');
                            this.editProductJoin(target);
                        }
                    }
                }
            ]
        };
        var instance = this.system.contextMenus(options);
    }

    editProductJoin(el) {
        var productJoin = this.getProductJoinWithName(el.id());
        this.productJoinEditOverlay = new ProductJoinEditOverlay({
            productJoin: productJoin,
            products: this.products,
            projectId: this.projectId
        });
        this.productJoinEditOverlay.on('submitted', (options)=> {
            this.productJoinEditOverlay.close();
            this.fetchProductJoins().then((result)=> {
                var updatedProductJoin = this.getProductJoinWithName(el.id());
                this.system.$('node').edgesTo('#' + el.id()).remove();
                this.addProductJoinsToGraph([updatedProductJoin]);
            }).catch((msg)=> {
                alert(msg);
            });
        });
        this.productJoinEditOverlay.show();
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
                var product = that.getProductWithName(selected.node.name);
                var unitId, expressionId;
                var unitName;
                if (product.fieldIdList.length > 0) {
                    unitId = product.fieldIdList[0];
                    var unit = that.getUnitWithId(unitId);
                    unitName = unit.name;
                } else {
                    expressionId = product.expressionIdList[0];
                    var expression = that.getExpressionById(expressionId);
                    unitName = expression.name;
                }
                that.$el.find('#edit-grade-expression').val('');
                //that.$el.find('#edit-grade-expression .present-value').html(unitName);
                that.$el.find('#edit-grade-expression option').filter(function () {
                    //may want to use $.trim in here
                    return $(this).text() === unitName;
                }).prop('selected', true);

                that.$el.find('input#edit-name').val(selected.node.name);
                that.$el.find('#productEditModal').modal();
            } else if (category === 'productJoin') {
                var productJoin = that.getProductJoinWithName(selected.node.name);
                that.productJoinEditOverlay = new ProductJoinEditOverlay({
                    productJoin: productJoin,
                    products: that.products,
                    projectId: that.projectId
                });
                that.productJoinEditOverlay.on('submitted', (options)=> {
                    that.productJoinEditOverlay.close();
                    var productJoinNode = selected.node.name;
                    var addedProducts = options.addedProducts;
                    var addedProductNode;
                    var removedProducts = options.removedProducts;
                    var removedProductNode;
                    addedProducts.forEach(addedProduct=> {
                        addedProductNode = this.system.getNode(addedProduct);
                        if (addedProductNode) {
                            this.system.addEdge(addedProductNode, productJoinNode, {
                                directed: true,
                                weight: 1,
                                color: '#333333'
                            });
                        }
                    });
                    removedProducts.forEach(removedProduct=> {
                        removedProductNode = this.system.getNode(removedProduct);
                        if (removedProductNode) {
                            var edges = this.system.getEdges(removedProductNode, productJoinNode);
                            edges.forEach(edge=> {
                                this.system.pruneEdge(edge);
                            });
                        }
                    });
                });
                that.productJoinEditOverlay.show();
            } else {
                alert("Edit not available for category: " + category);
            }
        }
    }

    editProduct(event) {
        var that = this;
        var productName = this.$el.find('input#edit-name').val();
        var unitType = this.$el.find('#edit-grade-expression').find(':selected').data('unit-type');
        var unitName = this.$el.find('#edit-grade-expression').find(':selected').data('unit-name');
        this.productModel.delete({
            url: 'http://localhost:4567/project/' + that.projectId + '/products',
            id: productName,
            success: function () {
                var updatedProduct = that.getProductWithName(productName);
                updatedProduct['unitType'] = unitType;
                if (unitType === 1) {
                    updatedProduct['unitId'] = that.getUnitWithName(unitName).id;
                } else if (unitType === 2) {
                    updatedProduct['unitId'] = that.getExpressionByName(unitName).id;
                }
                that.productModel.add({
                    dataObject: updatedProduct,
                    success: function (data) {
                        //alert('Successfully updated product.');
                        that.refreshProducts();
                    },
                    error: function (data) {
                        alert('Error updating product.');
                    }
                });
            },
            error: function (data) {
                alert('Failed to delete product.');
            }
        });
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
                var listGroup = '<ul class="list-group" style="display:inline-block">';
                listGroup += '<li class="list-group-item">' + '<b>' + productName + '</b>' + '</li>'
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
                //alert('Successfully deleted product node.')
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
                //alert('Successfully deleted model node.')
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
                        var model = that.getModelWithId(selected.node.data.id);
                        that.addModelToList(model);
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
                                //alert('Successfully added expression to product.');
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
                                //alert('Successfully added unit to product.');
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
                            //alert('Successfully added to join.');
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
                            //alert('Successfully added to join.');
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
                            //alert('Successfully added to join.');
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
        var draggedModel = this.getModelWithName(e.target.innerHTML);
        var parentModel;
        e.target.style.opacity = '1';
        var pos = this.$el.find('#viewport').offset();
        var p = {x: e.clientX - pos.left, y: e.clientY - pos.top};
        var nearestNodeElement = this.getNearestNodeElement(p);
        if (nearestNodeElement.hasClass('model') || nearestNodeElement.hasClass('block')) {
            parentModel = this.getModelWithName(nearestNodeElement.data('label'));
            this.addModelToProcessTree({draggedModel: draggedModel, parentModel: parentModel});
        } else {
            alert('Cannot add model to this element');
        }
    }

    getNearestNodeElement(dropPosition) {
        var leastDistance = 0;
        var nearestNode;
        this.system.$('node').forEach((node)=> {
            var renderedPosition = node.renderedPosition();
            var delX = Math.abs(dropPosition.x - renderedPosition.x);
            var delY = Math.abs(dropPosition.y - renderedPosition.y);
            var linearDistance = Math.hypot(delX, delY);
            if ((leastDistance === 0) || (linearDistance <= leastDistance)) {
                nearestNode = node;
                leastDistance = linearDistance;
            }
        });
        return nearestNode;
    }

    addModelToProcessTree(options) {
        var parentModelId = -1;
        var draggedModel = options.draggedModel;
        var parentModel = options.parentModel;
        if (parentModel && parentModel.id) {
            parentModelId = parentModel.id;
        }
        var newModel = {
            modelId: draggedModel.id,
            parentModelId: parentModelId
        }
        this.processTreeModel.add({
            dataObject: newModel,
            success: (data)=> {
                this.treeNodes.push(data);
                this.fetchProcesses()
                    .then(result=> {
                        this.addProcessesToGraph([data]);
                        this.removeModelFromList(draggedModel);
                    })
            },
            error: (data)=> {
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
        //this.$el.on('click', '#viewport', this.handleCanvasClick.bind(this));
        this.bindDragEvents();
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
            var nodes = []
            that.system.eachNode(function (node, point) {
                var screenPositionObject = {nodeName: node.name, xLoc: node._p.x, yLoc: node._p.y};
                nodes.push(screenPositionObject);
            });
            var stateObject = {projectId: that.projectId, nodes: nodes};
            that.uiStateModel.add({
                dataObject: stateObject,
                success: (data) => {
                    alert('Successfully saved state.');
                },
                error: (error) => {
                    alert('Error saving state in DB: ' + error.message);
                }
            });


        });
        this.$el.find('#btnCreateProcessJoin').click((event) => {
            var processList = '';
            this.processes.forEach((process)=> {
                processList += '<div class="checkbox"><label><input type="checkbox" value="' + process.id + '">' + process.name + '</label></div>'
            });
            this.$el.find('#processJoinModalProcessList').html(processList)
            this.$el.find('#processJoinModal').modal();
        });
        this.$el.find('#btnCreateProductJoin').click((event) => {
            var productList = '';
            this.products.forEach((product)=> {
                productList += '<div class="checkbox"><label><input type="checkbox" value="' + product.name + '">' + product.name + '</label></div>'
            });
            this.$el.find('#productJoinModalProductList').html(productList)
            this.$el.find('#productJoinModal').modal();
        });
        this.$el.find('#createMultiProduct').click((event)=> {
            this.multiProductOverlay.show();
        });
    }

    addProcessJoin() {
        var that = this;
        var processJoinName = this.$el.find('#join_name').val().trim();
        var checkedModels = that.$el.find('#processJoinModalProcessList').find('input:checked');
        checkedModels.each((index, checkedModel)=> {
            var checkedModelId = $(checkedModel).val();
            that.addProcessToProcessJoin({
                processJoinName: processJoinName,
                processId: checkedModelId
            })
        });
    }

    addProcessToProcessJoin(options) {
        var processJoinName = options.processJoinName;
        var processId = options.processId;
        var updatedProcessJoin = {}
        updatedProcessJoin['name'] = processJoinName;
        updatedProcessJoin['processId'] = processId;
        this.processJoinModel.add({
            dataObject: updatedProcessJoin,
            success: (data) => {
                var processJoin = this.getProcessJoinWithName(processJoinName);
                if (!processJoin) {
                    this.processJoins.push(data);
                } else {
                    processJoin.childProcessList.push(processId);
                }
                this.addProcessJoinsToGraph([data]);
            },
            error: function (data) {
                alert('Error adding model to join');
            }
        });
    }

    addProductJoin() {
        var that = this;
        var productJoinName = this.$el.find('#product_join_name').val().trim();
        var checkedProducts = that.$el.find('#productJoinModalProductList').find('input:checked');
        checkedProducts.each((index, checkedProduct)=> {
            var checkedProductName = $(checkedProduct).val();
            that.addProductToProductJoin({
                productJoinName: productJoinName,
                productName: checkedProductName
            })
        });
    }

    addProductToProductJoin(options) {
        var productJoinName = options.productJoinName;
        var productName = options.productName;
        var updatedProductJoin = {}
        updatedProductJoin['name'] = productJoinName;
        updatedProductJoin['childType'] = 1;
        updatedProductJoin['child'] = productName;
        this.productJoinModel.add({
            dataObject: updatedProductJoin,
            success: (data) => {
                var productJoin = this.getProductJoinWithName(productJoinName);
                if (!productJoin) {
                    this.productJoins.push(data);
                } else {
                    productJoin.productList.push(productName);
                }
                this.addProductJoinsToGraph([data]);
            },
            error: function (data) {
                alert('Error adding product to join');
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
        newProduct['name'] = processName + '_' + this.$el.find('#product_name').val();
        var process = this.getModelWithName(processName);
        newProduct['modelId'] = process.id;
        newProduct['unitType'] = unitType;
        newProduct['unitId'] = unitId;
        this.productModel.add({
            dataObject: newProduct,
            success: function (data) {
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

    bindDragEvents() {
        this.$el.on('dragstart', '.unused-model', (e)=> {
            this.handleDragStart(e);
        });
        this.$el.on('dragend', '.unused-model', (e)=> {
            this.handleDragEnd(e);
        });
    }

    getModelWithName(modelName) {
        var selectedModel = null;
        this.models.forEach(function (model) {
            if (model.name === modelName) {
                selectedModel = model;
            }
        });
        return selectedModel;
    }

    refreshProducts() {
        var that = this;
        this.productModel.fetch({
            success: function (data) {
                that.products = data;
            }
        });
    }

    removeModelFromList(model) {
        console.log('To remove: ' + model.name);
        this.$el.find('.list-group li').each(function (index) {
            if (parseInt($(this).data('model-id'), 10) === model.id) {
                $(this).remove();
            }
        });
    }

    addModelToList(model) {
        var $li = $('<li data-model-id="' + model.id + '" draggable="true">' + model.name + '</li>');
        $li.attr('title', model.name);
        $li.addClass('list-group-item list-group-item-info');
        this.$el.find('.list-group').append($li);
    }
}
