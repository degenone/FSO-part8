import { useQuery } from '@apollo/client';
import { ALL_AUTHORS } from '../queries';
import BirthYearForm from './BirthYearForm';

const Authors = (props) => {
    const { data, loading } = useQuery(ALL_AUTHORS);
    if (loading) {
        return <div>Loading authors...</div>;
    }
    return (
        <div>
            <h2>Authors</h2>
            <table>
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Born</th>
                        <th>Books published</th>
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
            <BirthYearForm
                authors={data.allAuthors.map((a) => a.name)}
                notify={props.notify}
            />
        </div>
    );
};

export default Authors;
