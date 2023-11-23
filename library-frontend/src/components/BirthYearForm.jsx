import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { EDIT_AUTHOR } from '../queries';
import Select from 'react-select';

const BirthYearForm = (props) => {
    const { authors, notify } = props;
    const options = authors.map((a) => ({ value: a, label: a }));
    const [name, setName] = useState(null);
    const [year, setYear] = useState('');
    const [editAuthor] = useMutation(EDIT_AUTHOR, {
        onCompleted: () => {
            setYear('');
        },
        onError: (error) => {
            const messages = error.graphQLErrors
                .map((e) => e.message)
                .join(', ');
            notify(messages);
        },
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name) return;
        editAuthor({
            variables: { name: name.value, setBornTo: +year },
        });
    };
    return (
        <div>
            <form onSubmit={handleSubmit} style={{ width: 'max-content' }}>
                <fieldset>
                    <legend>Update author birth year</legend>
                    <div>
                        <span>Select author:</span>
                        <Select
                            defaultValue={name}
                            onChange={setName}
                            options={options}
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
