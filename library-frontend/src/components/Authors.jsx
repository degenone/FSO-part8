import { useQuery } from '@apollo/client';
import { ALL_AUTHORS } from '../queries';
import BirthYearForm from './BirthYearForm';

const Authors = () => {
    const { data, loading } = useQuery(ALL_AUTHORS);
    if (loading) {
        return <div>Loading authors...</div>;
    }
    return (
        <div>
            <h2>authors</h2>
            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th>born</th>
                        <th>books</th>
                    </tr>
                    {data.allAuthors.map((a) => (
                        <tr key={a.id}>
                            <td>{a.name}</td>
                            <td>{a.born}</td>
                            <td>{a.bookCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <BirthYearForm authors={data.allAuthors.map((a) => a.name)} />
        </div>
    );
};

export default Authors;
