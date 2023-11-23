import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { ADD_BOOK, ALL_AUTHORS, ALL_BOOKS } from '../queries';

const NewBook = (props) => {
    const { notify } = props;
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [published, setPublished] = useState('');
    const [genre, setGenre] = useState('');
    const [genres, setGenres] = useState([]);
    const [createBook] = useMutation(ADD_BOOK, {
        update: (cache, res) => {
            cache.updateQuery(
                { query: ALL_BOOKS, variables: { genre: '' } },
                (data) => {
                    console.log('data ALL_BOOKS', data);
                    const updatedGenres = [
                        ...new Set([
                            ...data.allGenres,
                            ...res.data.addBook.genres,
                        ]),
                    ];
                    return {
                        allBooks: [...data.allBooks, res.data.addBook],
                        allGenres: updatedGenres,
                    };
                }
            );
        },
        refetchQueries: [{ query: ALL_AUTHORS }],
        onCompleted: () => {
            setTitle('');
            setPublished('');
            setAuthor('');
            setGenres([]);
            setGenre('');
        },
        onError: (error) => {
            const messages = error.graphQLErrors
                .map((e) => e.message)
                .join(', ');
            notify(messages);
        },
    });
    const submit = async (e) => {
        e.preventDefault();
        createBook({
            variables: {
                title,
                author,
                published: +published,
                genres,
            },
        });
    };
    const addGenre = () => {
        if (!genres.includes(genre)) {
            setGenres(genres.concat(genre));
            setGenre('');
        }
    };
    const genreStyle = {
        backgroundColor: 'lightgray',
        padding: '5px',
        border: '1px solid grey',
        borderRadius: '0.7rem',
        marginInlineEnd: 1,
    };
    const btnStyle = {
        backgroundColor: 'transparent',
    };
    const formStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem',
    };
    return (
        <div>
            <form onSubmit={submit} style={{ width: 'max-content' }}>
                <fieldset>
                    <legend>Add a new Book</legend>
                    <div style={formStyle}>
                        <label htmlFor='title'>Title:</label>
                        <input
                            id='title'
                            value={title}
                            onChange={({ target }) => setTitle(target.value)}
                            required
                        />
                    </div>
                    <div style={formStyle}>
                        <label htmlFor='author'>Author:</label>
                        <input
                            id='author'
                            value={author}
                            onChange={({ target }) => setAuthor(target.value)}
                            required
                        />
                    </div>
                    <div style={formStyle}>
                        <label htmlFor='published'>Published</label>
                        <input
                            id='published'
                            type='number'
                            value={published}
                            onChange={({ target }) =>
                                setPublished(target.value)
                            }
                            required
                        />
                    </div>
                    <div>
                        <div style={formStyle}>
                            <label htmlFor='add-genre'>Add genre:</label>
                            <input
                                id='add-genre'
                                value={genre}
                                onChange={({ target }) =>
                                    setGenre(target.value)
                                }
                            />
                        </div>
                        <button onClick={addGenre} type='button'>
                            Add
                        </button>
                    </div>
                    <div style={{ marginBlock: 8 }}>
                        <span style={{ marginInlineEnd: 5 }}>genres:</span>
                        {genres.map((g, i) => (
                            <span key={`${g}-${i}`} style={genreStyle}>
                                {g}{' '}
                                <button
                                    style={btnStyle}
                                    type='button'
                                    onClick={() =>
                                        setGenres(
                                            genres.filter((gn) => gn !== g)
                                        )
                                    }>
                                    x
                                </button>
                            </span>
                        ))}
                    </div>
                    <button type='submit'>create book</button>
                </fieldset>
            </form>
        </div>
    );
};

export default NewBook;
