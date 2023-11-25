import { Routes, Route, Link } from 'react-router-dom';
import Books from './components/Books';
import Authors from './components/Authors';
import NewBook from './components/NewBook';
import { useEffect, useState } from 'react';
import LoginForm from './components/LoginForm';
import Notification from './components/Notification';
import { USER_KEY } from './constants';
import { useApolloClient, useSubscription } from '@apollo/client';
import Recommend from './components/Recommend';
import { ALL_BOOKS, BOOK_ADDED } from './queries';
import { updateCache } from './utils';

function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [message, setMessage] = useState('');
    const client = useApolloClient();
    const navStyle = {
        display: 'flex',
        gap: '1rem',
        padding: '1rem 2rem',
        borderBottom: '1px solid',
    };
    const notify = (message) => {
        setMessage(message);
        setTimeout(() => {
            setMessage('');
        }, 3500);
    };
    useEffect(() => setLoggedIn(Boolean(localStorage.getItem(USER_KEY))), []);
    useSubscription(BOOK_ADDED, {
        onData: ({ data }) => {
            const bookAdded = data.data.bookAdded;
            notify(`Book ${bookAdded.title} was just added.`);
            updateCache(client.cache, ALL_BOOKS, bookAdded);
        },
    });
    if (!loggedIn) {
        return (
            <div>
                <Notification message={message} />
                <LoginForm setLoggedIn={setLoggedIn} notify={notify} />
            </div>
        );
    }
    const handleLogout = () => {
        setLoggedIn(false);
        localStorage.removeItem(USER_KEY);
        client.resetStore();
    };
    return (
        <div>
            <nav style={navStyle}>
                <Link to='/'>Books</Link>
                <Link to='/authors'>Authors</Link>
                <Link to='/add'>Add Book</Link>
                <Link to='/recommend'>Recommend</Link>
                <button
                    style={{ marginInlineStart: 'auto' }}
                    type='button'
                    onClick={handleLogout}>
                    Logout
                </button>
            </nav>
            <Notification message={message} />
            <main>
                <Routes>
                    <Route path='/' element={<Books />} />
                    <Route
                        path='/authors'
                        element={<Authors notify={notify} />}
                    />
                    <Route path='/add' element={<NewBook notify={notify} />} />
                    <Route path='/recommend' element={<Recommend />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
