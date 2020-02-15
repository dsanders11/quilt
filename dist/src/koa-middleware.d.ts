/// <reference types="koa-bodyparser" />
import { Context } from 'koa';
import compose from 'koa-compose';
import { CacheMissBehavior } from './shared';
export { CacheMissBehavior };
export interface Cache {
    get(id: string): string | undefined | null | Promise<string | undefined | null>;
    set(id: string, body: string): Promise<void>;
}
export interface Options {
    cache?: Cache;
    cacheMissBehavior?: CacheMissBehavior;
}
export declare function createPersistedGraphQLMiddleware(options?: Options): compose.Middleware<import("koa").ParameterizedContext<import("koa").DefaultState, import("koa").DefaultContext & Context>>;
//# sourceMappingURL=koa-middleware.d.ts.map