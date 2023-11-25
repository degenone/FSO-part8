import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter as Router } from 'react-router-dom';
import {
    ApolloClient,
    ApolloProvider,
    InMemoryCache,
    createHttpLink,
    split,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { USER_KEY } from './constants.js';

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem(USER_KEY);
    return {
        headers: {
            ...headers,
            Authorization: token ? `Bearer ${token}` : null,
        },
    };
});

const httpLink = createHttpLink({ uri: 'http://localhost:4000' });

const wsLink = new GraphQLWsLink(createClient({ url: 'ws://localhost:4000' }));

const splitLink = split(
    ({ query }) => {
        const def = getMainDefinition(query);
        return (
            def.kind === 'OperationDefinition' &&
            def.operation === 'subscription'
        );
    },
    wsLink,
    authLink.concat(httpLink)
);

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: splitLink,
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <Router>
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
    </Router>
);
