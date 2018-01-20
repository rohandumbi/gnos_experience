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
import {CreateProductOverlay} from '../overlays/createProductOverlay';
import {CreateProductJoinOverlay} from '../overlays/createProductJoinOverlay';
import {CreateProcessJoinOverlay} from '../overlays/createProcessJoinOverlay';
import {EditProductJoinOverlay} from '../overlays/editProductJoinOverlay';
import {EditProcessJoinOverlay} from '../overlays/editProcessJoinOverlay';
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
        this.scaleFactor = 1;
        this.layout = 'preset';
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
            '<select id="edit-grade-expression" class="grade-expression form-control">'
        );
        //add non-grade expressions
        that.nonGradeExpressions.forEach(function (expression) {
            tableRow += '<option data-unit-id="' + expression.id + '" data-unit-type="2" value="' + expression.name + '" data-unit-name="' + expression.name + '">' + expression.name + '</option>';
        });
        //add units
        that.units.forEach(function (unit) {
            tableRow += '<option data-unit-id="' + unit.id + '" data-unit-type="1" value="' + unit.name + '" data-unit-name="' + unit.name + '">' + unit.name + '</option>';
        });
        tableRow += '</select>';
        that.$el.find('#edit-unit-list').append(tableRow);

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
                    data: {id: productJoin.name, label: productJoin.name, weight: 1},//product has no ID, so name is the id
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
                        data: {id: productJoinName, label: productJoinName, weight: 1},//product has no ID, so name is the id
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
                    data: {id: product.name, label: product.name, weight: 2},//product has no ID, so name is the id
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
                    data: {id: processJoin.name, label: processJoin.name, weight: 3},//process join has no ID, so name is the id
                    classes: 'model-join'
                });
            }
            processJoin.childProcessList.forEach(function (childProcessId) {
                if (childProcessId > 0) {
                    var childModelNode = that.getNodeWithId(childProcessId);
                    if (childModelNode && !(childModelNode.edgesTo(processJoinNode).length > 0)) {
                        that.system.add({
                            group: "edges",
                            data: {source: childProcessId, target: processJoin.name, weight: 1}
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
                    data: {id: model.id, label: model.name, weight: 4},
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
                        data: {id: parentModel.id, label: parentModel.name, weight: 4},
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
            $li = $('<li data-model-id="' + model.id + '" draggable="true"><span class="glyphicon glyphicon-adjust"></span>&nbsp;<a>' + model.name + '</a></li>');
            $li.attr('title', model.name);
            $li.addClass('list-group-item list-group-item-info unused-model');
            $liGroup.append($li);
        });
        return unusedModels;
    }

    onDomLoaded() {
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
            this.setStoredNodePositions();
            this.hookContextMenu();
            this.bindDomEvents();
            this.allNodes = this.system.$('node');
            this.allEdges = this.system.$('edge');
        }).catch(reason=> {
            alert(reason);
        });
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

    setStoredNodePositions() {
        this.storedCoordinates.forEach((storedCoordinate)=> {
            var node = this.system.nodes("[label='" + storedCoordinate.nodeName + "']")[0];//taking first returned node as the node to be set
            if (node) {
                node.position({x: storedCoordinate.xLoc, y: storedCoordinate.yLoc});
            } else {
                console.log('No node for ' + storedCoordinate.nodeName);
            }
        });
        var layout = this.system.layout({
            nodeDimensionsIncludeLabels: true,
            avoidOverlap: true,
            name: 'preset',
            fit: true,
            animate: true,
            animationDuration: 500
        });
        layout.run();
    }

    saveUiState() {
        var coordinateSystem = [];
        var nodes = []
        this.system.nodes().forEach((node)=> {
            var screenPositionObject = {
                nodeName: node.data('label'),
                xLoc: node.position('x'),
                yLoc: node.position('y')
            };
            nodes.push(screenPositionObject);
        });
        var stateObject = {projectId: this.projectId, nodes: nodes};
        this.uiStateModel.add({
            dataObject: stateObject,
            success: (data) => {
                alert('Successfully saved state.');
            },
            error: (error) => {
                alert('Error saving state in DB: ' + error.message);
            }
        });
    }

    initializeGraph(nodeData) {
        var that = this;
        var parentWidth = this.$el.find('#canvas-container').width();
        var parentHeight = this.$el.find('#canvas-container').height();
        var $viewport = this.$el.find('#viewport');

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
            data: {id: 'block', label: 'Block', weight: 5},
            classes: 'block'
        });
        this.addProcessesToGraph(this.treeNodes);
        this.addProcessJoinsToGraph(this.processJoins);
        this.addProductsToGraph(this.products);
        this.addProductJoinsToGraph(this.productJoins);
    }

    hookContextMenu() {
        var removed;
        var removePromise;
        var options = {
            // List of initial menu items
            menuItems: [
                {
                    id: 'remove',
                    content: 'Remove',
                    selector: '.model, .model-join, .product, .product-join',
                    coreAsWell: false,
                    onClickFunction: (event)=> {
                        var returnValue = confirm("This will remove the node permanently. Are you sure?");
                        if (returnValue == true) {
                            var target = event.target || event.cyTarget;
                            if (target.hasClass('model')) {
                                this.deleteModel(target);
                            } else if (target.hasClass('model-join')) {
                                this.deleteModelJoin(target);
                            } else if (target.hasClass('product')) {
                                this.deleteProduct(target);
                            } else if (target.hasClass('product-join')) {
                                this.deleteProductJoin(target);
                            }
                        } else {
                            return;
                        }
                    },
                    hasTrailingDivider: true
                },
                {
                    id: 'edit',
                    content: 'Edit',
                    selector: '.product, .product-join, .model-join',
                    coreAsWell: false,
                    onClickFunction: (event)=> {
                        var target = event.target || event.cyTarget;
                        if (target.hasClass('model-join')) {
                            this.editModelJoin(target);
                        } else if (target.hasClass('product')) {
                            this.editProduct(target);
                        } else if (target.hasClass('product-join')) {
                            this.editProductJoin(target);
                        }
                    }
                },
                {
                    id: 'grades',
                    content: 'View grades',
                    selector: '.product, .product-join',
                    coreAsWell: false,
                    onClickFunction: (event)=> {
                        var target = event.target || event.cyTarget;
                        this.$el.find('#grade-list').html('');
                        if (target.hasClass('product')) {
                            this.showGradeListForProduct(target.id());
                        } else if (target.hasClass('product-join')) {
                            this.showGradeListForProductJoin(target.id());
                        }
                        this.$el.find('#associatedGradesModal').modal();
                    }
                },
                {
                    id: 'connections',
                    content: 'View connections',
                    selector: '.model, .model-join, .product, .product-join',
                    coreAsWell: false,
                    onClickFunction: (event)=> {
                        var target = event.target || event.cyTarget;
                        this.displayOnlyConnectedNodes(target);
                    }
                }
            ]
        };
        var instance = this.system.contextMenus(options);
    }

    displayOnlyConnectedNodes(el) {
        var successorNodes = el.successors();
        var predecessorNodes = el.predecessors();
        this.allNodes.remove();
        el.restore();
        successorNodes.restore();
        predecessorNodes.restore();
    }

    editModelJoin(el) {
        var processJoin = this.getProcessJoinWithName(el.id());
        this.editProcessJoinOverlay = new EditProcessJoinOverlay({
            processJoin: processJoin,
            processes: this.processes,
            projectId: this.projectId
        });
        this.editProcessJoinOverlay.on('submitted', (options)=> {
            this.editProcessJoinOverlay.close();
            this.fetchProcessJoins().then((result)=> {
                var updatedProcessJoin = this.getProcessJoinWithName(el.id());
                this.system.$('node').edgesTo('#' + el.id()).remove();
                this.addProcessJoinsToGraph([updatedProcessJoin]);
            }).catch((msg)=> {
                alert(msg);
            });
        });
        this.editProcessJoinOverlay.show();
    }

    editProductJoin(el) {
        var productJoin = this.getProductJoinWithName(el.id());
        this.editProductJoinOverlay = new EditProductJoinOverlay({
            productJoin: productJoin,
            products: this.products,
            projectId: this.projectId
        });
        this.editProductJoinOverlay.on('submitted', (options)=> {
            this.editProductJoinOverlay.close();
            this.fetchProductJoins().then((result)=> {
                var updatedProductJoin = this.getProductJoinWithName(el.id());
                this.system.$('node').edgesTo('#' + el.id()).remove();
                this.addProductJoinsToGraph([updatedProductJoin]);
            }).catch((msg)=> {
                alert(msg);
            });
        });
        this.editProductJoinOverlay.show();
    }

    editProduct(el) {
        var product = this.getProductWithName(el.id());
        var unitId, expressionId;
        var unitName;
        if (product.fieldIdList.length > 0) {
            unitId = product.fieldIdList[0];
            var unit = this.getUnitWithId(unitId);
            unitName = unit.name;
        } else {
            expressionId = product.expressionIdList[0];
            var expression = this.getExpressionById(expressionId);
            unitName = expression.name;
        }
        this.$el.find('#edit-grade-expression').val('');
        this.$el.find('#edit-grade-expression option').filter(function () {
            //may want to use $.trim in here
            return $(this).text() === unitName;
        }).prop('selected', true);

        this.$el.find('input#edit-name').val(el.id());
        this.$el.find('#edit-product').click((event)=> {
            this.updateProduct();
            this.$el.find('#edit-product').off();
        });
        this.$el.find('#productEditModal').modal();
    }

    updateProduct() {
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
        var removeProductFromProductJoinPromises = [];
        var promise = new Promise((resolve, reject)=> {
            var parentProductJoinConnections = productNode.edgesTo('.product-join');
            parentProductJoinConnections.forEach((parentProductJoinConnection)=> {
                removeProductFromProductJoinPromises.push(this.removeProductFromProductJoin(productNode.id(), parentProductJoinConnection.data('target')));
            });
            Promise.all(removeProductFromProductJoinPromises)
                .then(result=> {
                    resolve();
                })
                .catch(error=> {
                    reject(error);
                });
        });
        return promise;
    }

    removeProductFromProductJoin(productName, productJoinName) {
        var promise = new Promise((resolve, reject)=> {
            this.productJoinModel.delete({
                url: 'http://localhost:4567/project/' + this.projectId + '/productjoins/' + productJoinName + '/product',
                id: productName,
                success: (data)=> {
                    resolve(data);
                },
                error: (error)=> {
                    reject(error.message);
                }
            });
        });
        return promise;
    }

    removeProcessFromProcessJoins(modelNode) {
        var removeProcessFromProcessJoinPromises = [];
        var promise = new Promise((resolve, reject)=> {
            var connectedProcessJoinConnections = modelNode.edgesTo('.model-join');
            connectedProcessJoinConnections.forEach((connectedProcessJoinConnection)=> {
                removeProcessFromProcessJoinPromises.push(this.removeProcessFromProcessJoin(modelNode.id(), connectedProcessJoinConnection.data('target')));
            });
            Promise.all(removeProcessFromProcessJoinPromises)
                .then(result=> {
                    resolve();
                })
                .catch(error=> {
                    reject(error);
                });
        });
        return promise;
    }

    removeProcessFromProcessJoin(modelId, processJoinName) {
        var promise = new Promise((resolve, reject)=> {
            this.processJoinModel.delete({
                url: 'http://localhost:4567/project/' + this.projectId + '/processjoins/' + processJoinName + '/process',
                id: modelId,
                success: (data)=> {
                    resolve(data);
                },
                error: (error)=> {
                    reject(error.message);
                }
            });
        });
        return promise;
    }

    deleteModel(el) {
        var modelId = el.id();
        this.processTreeModel.delete({
            url: 'http://localhost:4567/project/' + this.projectId + '/processtreenodes/model',
            id: modelId,
            success: (data) => {
                this.removeProcessFromProcessJoins(el)
                    .then((result)=> {
                        var model = this.getModelWithId(parseInt(modelId, 10));
                        this.addModelToDraggableList(model);
                        Promise.all([this.fetchProcesses(), this.fetchProcessJoins(), this.fetchProcessTreeNodes()])
                            .then((result)=> {
                                el.remove();
                            })
                            .catch(errorMsg=> {
                                alert(errorMsg);
                            })
                    })
                    .catch((errorMsg)=> {
                        alert(errorMsg);
                    });
            },
            error: function (error) {
                reject(error.message);
            }
        });
    }

    deleteModelJoin(el) {
        this.processJoinModel.delete({
            url: 'http://localhost:4567/project/' + this.projectId + '/processjoins',
            id: el.id(),
            success: ()=> {
                el.remove();
            },
            error: (error)=> {
                alert('Failed to delete process join.' + error.message);
            }
        });
    }

    deleteProduct(el) {
        this.productModel.delete({
            url: 'http://localhost:4567/project/' + this.projectId + '/products',
            id: el.id(),
            success: ()=> {
                this.removeProductFromProductJoins(el)
                    .then((result)=> {
                        el.remove();
                    })
                    .catch((errorMsg)=> {
                        alert(errorMsg);
                    });
            },
            error: function (data) {
                alert('Failed to delete product.');
            }
        });
    }

    deleteProductJoin(el) {
        this.productJoinModel.delete({
            url: 'http://localhost:4567/project/' + this.projectId + '/productjoins',
            id: el.id(),
            success: (data)=> {
                el.remove();
            },
            error: (error)=> {
                alert('Failed to delete product join. ' + error.message);
            }
        });
    }


    handleDragStart(e) {
        e.target.style.opacity = '0.4';  // this / e.target is the source node.
    }

    handleDragEnd(e) {
        var draggedModel = this.getModelWithName($(e.target).find('a').html());
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

    bindDomEvents() {
        var that = this;
        this.bindDragEvents();
        this.$el.find('#save-graph').click((event)=> {
            this.saveUiState();
        });
        this.$el.find('#btnCreateProcessJoin').click((event) => {
            this.createProcessJoin();
        });
        this.$el.find('#btnCreateProductJoin').click((event) => {
            this.createProductJoin();
        });
        this.$el.find('#btnCreateProduct').click((event)=> {
            this.createProduct();
        });
        this.$el.find('#blockFilter').change(event=> {
            this.toggleBlockNodeDisplay(event);
        });
        this.$el.find('#modelFilter').change(event=> {
            this.toggleModelNodesDisplay(event);
        });
        this.$el.find('#mJoinFilter').change(event=> {
            this.toggleModelJoinNodesDisplay(event);
        });
        this.$el.find('#productFilter').click(event=> {
            this.toggleProductNodesDisplay(event);
        });
        this.$el.find('#pJoinFilter').click(event=> {
            this.toggleProductJoinNodesDisplay(event);
        });

        this.$el.find('#btnPresetLayout').click(event=> {
            this.$el.find('.btn-layout').removeClass('active');
            $(event.currentTarget).addClass('active');
            this.applyPresetLayout();
        });
        this.$el.find('#btnDirectedtLayout').click(event=> {
            this.$el.find('.btn-layout').removeClass('active');
            $(event.currentTarget).addClass('active');
            this.applyDirectedLayout();
        });
        this.$el.find('#btnConcentricLayout').click(event=> {
            this.$el.find('.btn-layout').removeClass('active');
            $(event.currentTarget).addClass('active');
            this.applyConcentricLayout();
        });
        this.$el.find('#btn-zoomin').click(event=> {
            this.system.zoom(parseFloat(this.system.zoom()) + .5);
            this.system.center();
        });
        this.$el.find('#btn-zoomout').click(event=> {
            this.system.zoom(parseFloat(this.system.zoom()) - .5);
            this.system.center();
        });
        this.$el.find('#btn-fitscreen').click(event=> {
            this.system.fit();
        });
        this.$el.find('#btn-restore').click(event=> {
            if (this.allNodes) {
                this.allNodes.restore();
            }
            if (this.allEdges) {
                this.allEdges.restore();
            }
            this.applyExistingLayout();
        });
    }

    applyExistingLayout() {
        if (this.layout === 'preset') {
            this.applyPresetLayout();
        } else if (this.layout === 'directed') {
            this.applyDirectedLayout();
        } else if (this.layout === 'concentric') {
            this.applyConcentricLayout();
        }
    }

    applyPresetLayout() {
        this.fetchStoredCoordinates().then(result=> {
            this.setStoredNodePositions();
        });
        this.layout = 'preset';
    }

    applyDirectedLayout() {
        var layout = this.system.layout({
            nodeDimensionsIncludeLabels: true,
            name: 'breadthfirst',
            directed: true,
            spacingFactor: 1.75,
            avoidOverlap: true,
            animate: true,
            animationDuration: 500
        });
        layout.run();
        this.layout = 'directed';
    }

    applyConcentricLayout() {
        var layout = this.system.layout({
            nodeDimensionsIncludeLabels: true,
            name: 'breadthfirst',
            directed: true,
            circle: true,
            spacingFactor: 1.75,
            avoidOverlap: true,
            animate: true,
            animationDuration: 500
        });
        layout.run();
        this.layout = 'concentric';
    }

    toggleBlockNodeDisplay(event) {
        if ($(event.currentTarget).is(":checked")) {
            this.system.$('.block').show();
        } else {
            console.log('hide blocks');
            this.system.$('.block').hide();
        }
    }

    toggleModelNodesDisplay(event) {
        if ($(event.currentTarget).is(":checked")) {
            this.system.$('.model').show();
        } else {
            console.log('hide models');
            this.system.$('.model').hide();
        }
    }

    toggleModelJoinNodesDisplay(event) {
        if ($(event.currentTarget).is(":checked")) {
            this.system.$('.model-join').show();
        } else {
            console.log('hide model joins');
            this.system.$('.model-join').hide();
        }
    }

    toggleProductNodesDisplay(event) {
        if ($(event.currentTarget).is(":checked")) {
            this.system.$('.product').show();
        } else {
            console.log('hide products');
            this.system.$('.product').hide();
        }
    }

    toggleProductJoinNodesDisplay() {
        if ($(event.currentTarget).is(":checked")) {
            this.system.$('.product-join').show();
        } else {
            this.system.$('.product-join').hide();
        }
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
                    processJoin.childProcessList.push(parseInt(processId, 10));
                }
                this.addProcessJoinsToGraph([data]);
            },
            error: function (data) {
                alert('Error adding model to join');
            }
        });
    }

    createProduct() {
        this.createProductOverlay = new CreateProductOverlay({
            projectId: this.projectId,
            processes: this.processes,
            nonGradeExpressions: this.nonGradeExpressions,
            units: this.units
        });
        this.createProductOverlay.on('submitted', createdProductsArray=> {
            Promise.all([this.fetchUnits(), this.fetchExpressions(), this.fetchProducts()]).then(result=> {
                this.addProductsToGraph(createdProductsArray);
                this.createProductOverlay.close();
            }).catch(error=> {
                alert(error);
            });
        });
        this.createProductOverlay.show();
    }

    createProductJoin() {
        this.createProductJoinOverlay = new CreateProductJoinOverlay({
            projectId: this.projectId,
            products: this.products
        });
        this.createProductJoinOverlay.on('submitted', productJoin=> {
            this.fetchProductJoins().then(()=> {
                this.addProductJoinsToGraph([productJoin]);
                this.createProductJoinOverlay.close();
            });
        });
        this.createProductJoinOverlay.show();
    }

    createProcessJoin() {
        this.createProcessJoinOverlay = new CreateProcessJoinOverlay({
            projectId: this.projectId,
            processes: this.processes
        });
        this.createProcessJoinOverlay.on('submitted', processJoin=> {
            this.fetchProcessJoins().then(()=> {
                this.addProcessJoinsToGraph([processJoin]);
                this.createProcessJoinOverlay.close();
            });
        });
        this.createProcessJoinOverlay.show();
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

    addModelToDraggableList(model) {
        var $li = $('<li data-model-id="' + model.id + '" draggable="true"><span class="glyphicon glyphicon-adjust"></span>&nbsp;<a>' + model.name + '</a></li>');
        $li.attr('title', model.name);
        $li.addClass('list-group-item list-group-item-info unused-model');
        this.$el.find('.list-group').append($li);
    }

    resize() {
        console.log('Time to readjust canvas');
        var $viewport = this.$el.find('#viewport');
        setTimeout(()=> {
            $viewport.find('div').width($viewport.width());
            $viewport.find('div').height($viewport.height());
            this.system.resize();
        }, 500);
    }
}
