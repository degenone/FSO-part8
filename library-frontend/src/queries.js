import { gql } from '@apollo/client';

export const ALL_AUTHORS = gql`
    query AllAuthors {
        allAuthors {
            name
            born
            bookCount
            id
        }
    }
`;

const BOOK_DETAILS = gql`
    fragment BookDetails on Book {
        title
        published
        genres
        author {
            name
        }
        id
    }
`;

export const ALL_BOOKS = gql`
    query AllBooks($genre: String) {
        allBooks(genre: $genre) {
            ...BookDetails
        }
        allGenres
    }
    ${BOOK_DETAILS}
`;

export const ADD_BOOK = gql`
    mutation AddBook(
        $title: String!
        $author: String!
        $published: Int!
        $genres: [String!]!
    ) {
        addBook(
            title: $title
            author: $author
            published: $published
            genres: $genres
        ) {
            ...BookDetails
        }
    }
    ${BOOK_DETAILS}
`;

export const EDIT_AUTHOR = gql`
    mutation EditAuthor($name: String!, $setBornTo: Int!) {
        editAuthor(name: $name, setBornTo: $setBornTo) {
            name
            born
            bookCount
            id
        }
    }
`;

export const LOGIN = gql`
    mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            value
        }
    }
`;

export const RECOMMENDED_BOOKS = gql`
    query RecommendedBooks {
        recommendedBooks {
            ...BookDetails
        }
        me {
            favoriteGenre
        }
    }
    ${BOOK_DETAILS}
`;

export const BOOK_ADDED = gql`
    subscription {
        bookAdded {
            ...BookDetails
        }
    }
    ${BOOK_DETAILS}
`;
