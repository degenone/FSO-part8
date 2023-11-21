import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { EDIT_AUTHOR } from '../queries';

const BirthYearForm = () => {
    const [name, setName] = useState('');
    const [year, setYear] = useState('');
    const [editAuthor] = useMutation(EDIT_AUTHOR, {
        onCompleted: () => {
            setName('');
            setYear('');
        },
        onError: (error) => {
            const messages = error.graphQLErrors
                .map((e) => e.message)
                .join(', ');
            console.error('messages', messages);
        },
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        editAuthor({
            variables: { name, setBornTo: +year },
        });
    };
    return (
        <div>
            <form onSubmit={handleSubmit} style={{ width: 'max-content' }}>
                <fieldset>
                    <legend>Update author birth year</legend>
                    <div>
                        <label htmlFor='name'>Author name:</label>
                        <input
                            type='text'
                            name='name'
                            id='name'
                            list='author-names'
                            value={name}
                            onChange={({ target }) => setName(target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor='year'>Author birth year</label>
                        <input
                            type='number'
                            name='year'
                            id='year'
                            value={year}
                            onChange={({ target }) => setYear(target.value)}
                        />
                    </div>
                    <div>
                        <input type='submit' value='Save author' />
                    </div>
                </fieldset>
            </form>
        </div>
    );
};

export default BirthYearForm;
