/* eslint react-hooks/rules-of-hooks: off */

import {
  ApolloClient,
  OperationVariables,
  ObservableQuery,
  useQuery as useApolloQuery,
} from '@apollo/client';
import {DocumentNode} from 'graphql-typed';
import {useServerEffect} from '@shopify/react-effect';
import {IfAllNullableKeys, NoInfer} from '@shopify/useful-types';

import {AsyncDocumentNode} from '../types';

import {QueryHookOptions, QueryHookResult} from './types';
import useApolloClient from './apollo-client';
import useGraphQLDocument from './graphql-document';

export default function useQuery<
  Data = any,
  Variables = OperationVariables,
  DeepPartial = {}
>(
  queryOrAsyncQuery:
    | DocumentNode<Data, Variables, DeepPartial>
    | AsyncDocumentNode<Data, Variables, DeepPartial>,
  ...optionsPart: IfAllNullableKeys<
    Variables,
    [QueryHookOptions<Data, NoInfer<Variables>>?],
    [QueryHookOptions<Data, NoInfer<Variables>>]
  >
): QueryHookResult<Data, Variables> {
  const [options = {} as QueryHookOptions<Data, Variables>] = optionsPart;

  const {
    skip = false,
    fetchPolicy,
    client: overrideClient,
    ssr = true,
  } = options;

  const variables: Variables = options.variables || ({} as any);
  const client = useApolloClient(overrideClient);

  if (
    typeof window === 'undefined' &&
    (skip || fetchPolicy === 'no-cache' || !ssr)
  ) {
    return createDefaultResult(client, variables);
  }

  const query = useGraphQLDocument(queryOrAsyncQuery);

  if (!query) {
    return createDefaultResult(client, variables);
  }

  if (skip || !options) {
    return createDefaultResult(client, variables);
  }

  const queryResult = useApolloQuery(query, options);

  useServerEffect(() => {
    if (queryResult == null) {
      return;
    }

    const result = queryResult;
    return result.loading ? queryResult : undefined;
  });

  return queryResult;
}

function createDefaultResult<Variables>(
  client: ApolloClient<unknown>,
  variables: Variables,
  queryObservable?: ObservableQuery,
): QueryHookResult<any, Variables> {
  return {
    data: undefined,
    error: undefined,
    networkStatus: undefined,
    loading: false,
    called: false,
    variables: (queryObservable ? queryObservable.variables : variables) as any,
    refetch: queryObservable
      ? queryObservable.refetch.bind(queryObservable)
      : noop,
    fetchMore: queryObservable
      ? queryObservable.fetchMore.bind(queryObservable)
      : noop,
    updateQuery: queryObservable
      ? queryObservable.updateQuery.bind(queryObservable)
      : noop,
    startPolling: queryObservable
      ? queryObservable.startPolling.bind(queryObservable)
      : noop,
    stopPolling: queryObservable
      ? queryObservable.stopPolling.bind(queryObservable)
      : noop,
    subscribeToMore: queryObservable
      ? queryObservable.subscribeToMore.bind(queryObservable)
      : noop,
    client,
  };
}

function noop() {}
