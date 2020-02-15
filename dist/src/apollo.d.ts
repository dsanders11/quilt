import { ApolloLink, Operation, NextLink, Observable, FetchResult } from 'apollo-link';
interface Options {
    alwaysSendQuery?: boolean;
    idFromOperation?(operation: Operation): string | undefined | null;
}
export declare function createPersistedLink(options?: Options): PersistedLink;
export declare class PersistedLink extends ApolloLink {
    private options;
    private sendAlwaysIds;
    constructor(options: Options);
    request(operation: Operation, forward?: NextLink): Observable<FetchResult> | null;
}
export {};
//# sourceMappingURL=apollo.d.ts.map