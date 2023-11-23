import { useQuery } from '@apollo/client';
import { ALL_BOOKS } from '../queries';

const Books = () => {
    const { data, loading } = useQuery(ALL_BOOKS);
    if (loading) {
        return <div>Loading books...</div>;
    }
    return (
        <div>
            <h2>Books</h2>
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
