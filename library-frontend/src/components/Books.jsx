import { useQuery } from '@apollo/client';
import { ALL_BOOKS } from '../queries';
import { useState } from 'react';

const Books = () => {
    const [genre, setGenre] = useState('');
    const { data, loading } = useQuery(ALL_BOOKS, {
        variables: { genre },
    });
    const genresStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '0.5rem',
    };
    if (loading) {
        return <div>Loading books...</div>;
    }
    return (
        <div>
            <h2>Books</h2>
            <div>
                <h3>Select gategory:</h3>
                <div style={genresStyle}>
                    <button type='button' onClick={() => setGenre('')}>
                        all
                    </button>
                    {data.allGenres.map((g) => (
                        <button
                            type='button'
                            key={g}
                            onClick={() => setGenre(g)}>
                            {g}
                        </button>
                    ))}
                </div>
            </div>
            <table>
                <tbody>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Published</th>
                    </tr>
                    {data.allBooks.map((a) => (
                        <tr key={a.title}>
                            <td>{a.title}</td>
                            <td>{a.author.name}</td>
                            <td>{a.published}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Books;
