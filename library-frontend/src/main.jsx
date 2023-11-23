import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter as Router } from 'react-router-dom';
import {
    ApolloClient,
    ApolloProvider,
    InMemoryCache,
    createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
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

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <Router>
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
    </Router>
);
