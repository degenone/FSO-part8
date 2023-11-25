export const updateCache = (cache, query, bookAdded) => {
    const uniqueTitles = (books) => {
        let seenTitles = new Set();
        return books.filter((book) =>
            seenTitles.has(book.title) ? false : seenTitles.add(book.title)
        );
    };
    cache.updateQuery({ query, variables: { genre: '' } }, (data) => {
        if (!data) return;
        const { allBooks, allGenres } = data;
        const updatedGenres = [...new Set([...allGenres, ...bookAdded.genres])];
        return {
            allBooks: uniqueTitles([...allBooks, bookAdded]),
            allGenres: updatedGenres,
        };
    });
    bookAdded.genres.forEach((genre) => {
        cache.updateQuery({ query, variables: { genre } }, (data) => {
            if (data && data.allBooks) {
                return {
                    allBooks: uniqueTitles([...data.allBooks, bookAdded]),
                    allGenres: data.allGenres,
                };
            }
        });
    });
};
