"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var apollo_link_1 = require("apollo-link");
var shared_1 = require("./shared");
function createPersistedLink(options) {
    if (options === void 0) { options = {}; }
    return new PersistedLink(options);
}
exports.createPersistedLink = createPersistedLink;
var PersistedLink = /** @class */ (function (_super) {
    tslib_1.__extends(PersistedLink, _super);
    function PersistedLink(options) {
        var _this = _super.call(this) || this;
        _this.options = options;
        _this.sendAlwaysIds = new Set();
        return _this;
    }
    PersistedLink.prototype.request = function (operation, forward) {
        var _this = this;
        if (forward == null) {
            throw new Error('Persisted link can’t be a terminating link.');
        }
        return new apollo_link_1.Observable(function (observer) {
            var _a = _this.options, _b = _a.alwaysSendQuery, alwaysSendQuery = _b === void 0 ? false : _b, _c = _a.idFromOperation, idFromOperation = _c === void 0 ? defaultIdFromOperation : _c;
            var id = idFromOperation(operation);
            if (typeof id !== 'string' || _this.sendAlwaysIds.has(id)) {
                var subscription_1 = forward(operation).subscribe(observer);
                return function () { return subscription_1.unsubscribe(); };
            }
            operation.extensions.persisted = {
                id: id,
            };
            operation.setContext({
                http: {
                    includeQuery: alwaysSendQuery,
                    includeExtensions: true,
                },
            });
            var subscription = null;
            subscription = forward(operation).subscribe({
                next: function (response) {
                    var errors = (response && response.errors) || [];
                    if (errors.some(function (_a) {
                        var message = _a.message;
                        return message.includes(shared_1.CacheMissBehavior.SendAlways);
                    })) {
                        _this.sendAlwaysIds.add(id);
                        if (subscription != null) {
                            subscription.unsubscribe();
                        }
                        delete operation.extensions.persisted;
                        operation.setContext({
                            http: {
                                includeQuery: true,
                                includeExtensions: false,
                            },
                        });
                        subscription = forward(operation).subscribe(observer);
                    }
                    else if (errors.some(function (_a) {
                        var message = _a.message;
                        return message.includes(shared_1.CacheMissBehavior.SendAndStore);
                    })) {
                        if (subscription != null) {
                            subscription.unsubscribe();
                        }
                        operation.setContext({
                            http: {
                                includeQuery: true,
                                includeExtensions: true,
                            },
                        });
                        subscription = forward(operation).subscribe(observer);
                    }
                    else {
                        observer.next(response);
                    }
                },
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
            });
            return function () {
                if (subscription != null) {
                    subscription.unsubscribe();
                }
            };
        });
    };
    return PersistedLink;
}(apollo_link_1.ApolloLink));
exports.PersistedLink = PersistedLink;
function defaultIdFromOperation(operation) {
    return operation.query.id || null;
}
