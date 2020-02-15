"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var apollo_link_1 = require("apollo-link");
function noop() { }
function executeOnce(link, query) {
    var op;
    var storeLink = new apollo_link_1.ApolloLink(function (operation, nextLink) {
        op = operation;
        if (nextLink == null) {
            return null;
        }
        return nextLink(operation);
    });
    return new Promise(function (resolve) {
        apollo_link_1.execute(storeLink.concat(link), { query: query }).subscribe({
            next: function (result) {
                resolve({ operation: op, result: result });
            },
            error: function (error) {
                resolve({ operation: op, error: error });
            },
        });
    });
}
exports.executeOnce = executeOnce;
var SimpleLink = /** @class */ (function (_super) {
    tslib_1.__extends(SimpleLink, _super);
    function SimpleLink(result, beforeResult) {
        if (result === void 0) { result = {
            data: {},
        }; }
        if (beforeResult === void 0) { beforeResult = noop; }
        var _this = _super.call(this) || this;
        _this.result = result;
        _this.beforeResult = beforeResult;
        _this.resultIndex = 0;
        return _this;
    }
    SimpleLink.prototype.request = function (operation, nextLink) {
        var _this = this;
        this.beforeResult(operation);
        if (nextLink != null) {
            return nextLink(operation);
        }
        return new apollo_link_1.Observable(function (obs) {
            var handleResult = function (result) {
                _this.resultIndex += 1;
                if (result instanceof Error) {
                    obs.error(result);
                }
                else {
                    obs.next(result);
                }
                obs.complete();
            };
            if (_this.result instanceof Promise) {
                _this.result.then(handleResult).catch(handleResult);
            }
            else if (Array.isArray(_this.result)) {
                handleResult(_this.result[_this.resultIndex]);
            }
            else if (typeof _this.result === 'function') {
                handleResult(_this.result(_this.resultIndex));
            }
            else {
                handleResult(_this.result);
            }
        });
    };
    return SimpleLink;
}(apollo_link_1.ApolloLink));
exports.SimpleLink = SimpleLink;
