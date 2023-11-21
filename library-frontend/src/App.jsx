import { Routes, Route, Link } from 'react-router-dom';
import Books from './components/Books';
import Authors from './components/Authors';
import NewBook from './components/NewBook';

function App() {
    const navStyle = {
        display: 'flex',
        gap: '1rem',
        padding: '1rem 2rem',
        borderBottom: '1px solid',
    };
    return (
        <div>
            <nav style={navStyle}>
                <Link to='/'>Books</Link>
                <Link to='/authors'>Authors</Link>
                <Link to='/add'>Add</Link>
            </nav>
            <main>
                <Routes>
                    <Route path='/' element={<Books />} />
                    <Route path='/authors' element={<Authors />} />
                    <Route path='/add' element={<NewBook />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
