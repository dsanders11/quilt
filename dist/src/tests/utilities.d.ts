import { ApolloLink, Operation, Observable, FetchResult, NextLink } from 'apollo-link';
import { DocumentNode } from 'graphql-typed';
interface ExecuteOnceOutcome {
    operation: Operation;
    result?: FetchResult;
    error?: Error;
}
export declare function executeOnce(link: ApolloLink, query: DocumentNode): Promise<ExecuteOnceOutcome>;
declare type BeforeResult = (operation: Operation) => void;
declare type Result = {
    data: object;
} | {
    errors: {
        message: string;
    }[];
} | Error;
declare type MultiResult = Result | Promise<Result> | Result[] | ((index: number) => Result);
export declare class SimpleLink extends ApolloLink {
    private result;
    private beforeResult;
    private resultIndex;
    constructor(result?: MultiResult, beforeResult?: BeforeResult);
    request(operation: Operation, nextLink?: NextLink): Observable<any>;
}
export {};
//# sourceMappingURL=utilities.d.ts.map