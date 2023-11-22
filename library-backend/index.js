const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const mongoose = require('mongoose');
const Author = require('./models/author');
const Book = require('./models/book');

mongoose.set('strictQuery', false);
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB!'))
    .catch((error) =>
        console.error('Error trying to connect to MongoDB!', error.message)
    );

const typeDefs = `
    type Author {
        name: String!
        born: Int
        id: ID!
        bookCount: Int!
    }
    type Book {
        title: String!
        published: Int!
        author: Author!
        id: ID!
        genres: [String!]!
    }
    type Query {
        bookCount: Int!
        authorCount: Int!
        allBooks(author: String, genre: String): [Book!]!
        allAuthors: [Author!]!
    }
    type Mutation {
        addBook(
            title: String!
            author: String!
            published: Int!
            genres: [String!]!
        ): Book
        editAuthor(
            name: String!
            setBornTo: Int!
        ): Author
    }
`;

const resolvers = {
    Book: {
        author: (root) => ({ name: root.author, id: root.id, born: root.born }),
    },
    Author: {
        bookCount: async (root) =>
            Book.collection.countDocuments({ author: root._id }),
    },
    Query: {
        bookCount: async () => Book.collection.countDocuments(),
        authorCount: async () => Author.collection.countDocuments(),
        allBooks: async (root, args) => {
            if (!args.author && !args.genre) {
                return Book.find({});
            } else if (!args.author) {
                return Book.find({ genres: args.genre });
            }
            const author = await Author.findOne({ name: args.author });
            if (!args.genre) {
                return Book.find({ author: author._id });
            }
            return Book.find({ author: author._id, genres: args.genre });
        },
        allAuthors: async () => Author.find({}),
    },
    Mutation: {
        addBook: async (root, args) => {
            let author = await Author.findOne({ name: args.author });
            if (!author) {
                author = new Author({ name: args.author });
                await author.save();
            }
            const book = new Book({
                title: args.title,
                author: author,
                published: args.published,
                genres: args.genres,
            });
            await book.save();
            return book;
        },
        editAuthor: async (root, args) => {
            const author = await Author.findOne({ name: args.name });
            author.born = args.setBornTo;
            return author.save();
        },
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

startStandaloneServer(server, {
    listen: { port: 4000 },
}).then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
