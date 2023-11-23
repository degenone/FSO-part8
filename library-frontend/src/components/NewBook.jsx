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
        refetchQueries: [{ query: ALL_AUTHORS }, { query: ALL_BOOKS }],
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
        setGenres(genres.concat(genre));
        setGenre('');
    };
    return (
        <div>
            <form onSubmit={submit} style={{ width: 'max-content' }}>
                <fieldset>
                    <legend>Add a new Book</legend>
                    <div>
                        title
                        <input
                            value={title}
                            onChange={({ target }) => setTitle(target.value)}
                            required
                        />
                    </div>
                    <div>
                        author
                        <input
                            value={author}
                            onChange={({ target }) => setAuthor(target.value)}
                            required
                        />
                    </div>
                    <div>
                        published
                        <input
                            type='number'
                            value={published}
                            onChange={({ target }) =>
                                setPublished(target.value)
                            }
                            required
                        />
                    </div>
                    <div>
                        <input
                            value={genre}
                            onChange={({ target }) => setGenre(target.value)}
                        />
                        <button onClick={addGenre} type='button'>
                            add genre
                        </button>
                    </div>
                    <div>genres: {genres.join(' ')}</div>
                    <button type='submit'>create book</button>
                </fieldset>
            </form>
        </div>
    );
};

export default NewBook;
