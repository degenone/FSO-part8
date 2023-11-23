import { useMutation } from '@apollo/client';
import { useEffect, useState } from 'react';
import { LOGIN } from '../queries';
import { USER_KEY } from '../constants';

const LoginForm = (props) => {
    const { setLoggedIn, notify } = props;
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [login, result] = useMutation(LOGIN, {
        onCompleted: () => {
            setUsername('');
            setPassword('');
        },
        onError: (error) => {
            const messages = error.graphQLErrors
                .map((e) => e.message)
                .join(', ');
            notify(messages);
        },
    });
    useEffect(() => {
        if (result.data) {
            const token = result.data.login.value;
            localStorage.setItem(USER_KEY, token);
            setLoggedIn(Boolean(token));
        }
    }, [result.data, setLoggedIn]);
    const handleSubmit = (e) => {
        e.preventDefault();
        login({ variables: { username, password } });
    };
    const formStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem',
    };
    return (
        <div>
            <form onSubmit={handleSubmit} style={{ width: 'max-content' }}>
                <fieldset>
                    <legend>Login</legend>
                    <div style={formStyle}>
                        <label htmlFor='username'>Username:</label>
                        <input
                            type='text'
                            name='username'
                            id='username'
                            value={username}
                            onChange={({ target }) => setUsername(target.value)}
                        />
                    </div>
                    <div style={formStyle}>
                        <label htmlFor='password'>Password:</label>
                        <input
                            type='password'
                            name='password'
                            id='password'
                            value={password}
                            onChange={({ target }) => setPassword(target.value)}
                        />
                    </div>
                    <div>
                        <input type='submit' value='Log In' />
                    </div>
                </fieldset>
            </form>
        </div>
    );
};

export default LoginForm;
