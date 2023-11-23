import { useQuery } from '@apollo/client';
import { RECOMMENDED_BOOKS } from '../queries';

const Recommend = () => {
    const { data, loading } = useQuery(RECOMMENDED_BOOKS);
    if (loading) {
        return <div>Loading recommendations...</div>;
    }
    return (
        <div>
            <h2>
                Recommended books in your favorite genre:{' '}
                {data.me.favoriteGenre}
            </h2>
            <table>
                <tbody>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Published</th>
                    </tr>
                    {data.recommendedBooks.map((a) => (
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

export default Recommend;
