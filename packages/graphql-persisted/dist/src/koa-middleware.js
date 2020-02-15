"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var koa_compose_1 = tslib_1.__importDefault(require("koa-compose"));
var koa_bodyparser_1 = tslib_1.__importDefault(require("koa-bodyparser"));
var sewing_kit_koa_1 = require("@shopify/sewing-kit-koa");
var shared_1 = require("./shared");
exports.CacheMissBehavior = shared_1.CacheMissBehavior;
function createOperationAssociationMiddleware(_a) {
    var cache = _a.cache, _b = _a.cacheMissBehavior, cacheMissBehavior = _b === void 0 ? shared_1.CacheMissBehavior.SendAlways : _b;
    if (cacheMissBehavior === shared_1.CacheMissBehavior.SendAndStore && cache == null) {
        throw new Error('You set the cacheMissBehavior to be SendAndStore, but did not provide a cache, which is necessary to store the persisted operation mapping.');
    }
    return function persistedOperationAssociationMiddleware(ctx, next) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var body, id, assets, operationFromManifest, _a, operation, _b, _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        body = ctx.request.body;
                        if (!!isPersistedBody(body)) return [3 /*break*/, 2];
                        return [4 /*yield*/, next()];
                    case 1:
                        _d.sent();
                        return [2 /*return*/];
                    case 2:
                        id = body.extensions.persisted.id;
                        if (!(body.query != null)) return [3 /*break*/, 6];
                        if (!(cacheMissBehavior === shared_1.CacheMissBehavior.SendAndStore &&
                            cache != null)) return [3 /*break*/, 4];
                        return [4 /*yield*/, cache.set(id, body.query)];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4: return [4 /*yield*/, next()];
                    case 5:
                        _d.sent();
                        return [2 /*return*/];
                    case 6:
                        assets = sewing_kit_koa_1.getAssets(ctx);
                        if (!(assets != null && assets.graphQLSource != null)) return [3 /*break*/, 8];
                        return [4 /*yield*/, assets.graphQLSource(id)];
                    case 7:
                        _a = _d.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        _a = undefined;
                        _d.label = 9;
                    case 9:
                        operationFromManifest = _a;
                        if (typeof operationFromManifest === 'string' && cache != null) {
                            cache.set(id, operationFromManifest);
                        }
                        _b = operationFromManifest;
                        if (_b) return [3 /*break*/, 12];
                        _c = cache;
                        if (!_c) return [3 /*break*/, 11];
                        return [4 /*yield*/, cache.get(id)];
                    case 10:
                        _c = (_d.sent());
                        _d.label = 11;
                    case 11:
                        _b = (_c);
                        _d.label = 12;
                    case 12:
                        operation = _b;
                        if (!(typeof operation === 'string')) return [3 /*break*/, 14];
                        body.query = operation;
                        return [4 /*yield*/, next()];
                    case 13:
                        _d.sent();
                        return [3 /*break*/, 15];
                    case 14:
                        ctx.type = 'json';
                        ctx.body = { errors: [{ message: cacheMissBehavior }] };
                        _d.label = 15;
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
}
function createPersistedGraphQLMiddleware(options) {
    if (options === void 0) { options = {}; }
    return koa_compose_1.default([koa_bodyparser_1.default(), createOperationAssociationMiddleware(options)]);
}
exports.createPersistedGraphQLMiddleware = createPersistedGraphQLMiddleware;
function isPersistedBody(body) {
    if (typeof body !== 'object' || body == null || !('extensions' in body)) {
        return false;
    }
    var extensions = body.extensions;
    if (typeof extensions !== 'object' || extensions == null) {
        return false;
    }
    var persisted = extensions.persisted;
    if (typeof persisted !== 'object' || persisted == null) {
        return false;
    }
    return typeof persisted.id === 'string';
}
