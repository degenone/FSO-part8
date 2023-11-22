const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { GraphQLError } = require('graphql');
require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Author = require('./models/author');
const Book = require('./models/book');
const User = require('./models/user');

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
        me: User
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
        createUser(
            username: String!
            favoriteGenre: String!
        ): User
        login(
            username: String!
            password: String!
        ): Token
    }
    type User {
        username: String!
        favoriteGenre: String!
        id: ID!
    }
    type Token {
        value: String!
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
        me: (root, args, { user }) => user,
    },
    Mutation: {
        addBook: async (root, args, { user }) => {
            if (!user) {
                throw new GraphQLError('Not authorized', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                });
            }
            let author = await Author.findOne({ name: args.author });
            if (!author) {
                author = new Author({ name: args.author });
                try {
                    await author.save();
                } catch (error) {
                    throw new GraphQLError('Failed adding author', {
                        extensions: {
                            code: 'BAD_USER_INPUT',
                            invalidArgs: args.author,
                            error,
                        },
                    });
                }
            }
            const book = new Book({
                title: args.title,
                author: author._id,
                published: args.published,
                genres: args.genres,
            });
            try {
                await book.save();
            } catch (error) {
                throw new GraphQLError('Failed adding book', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        error,
                    },
                });
            }
            return book;
        },
        editAuthor: async (root, args, { user }) => {
            if (!user) {
                throw new GraphQLError('Not authorized', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                });
            }
            const author = await Author.findOne({ name: args.name });
            if (!author) {
                throw new GraphQLError('Author not found', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args.name,
                    },
                });
            }
            author.born = args.setBornTo;
            return author.save();
        },
        createUser: async (root, args) => {
            const user = new User({
                username: args.username,
                favoriteGenre: args.favoriteGenre,
            });
            return user.save().catch((error) => {
                throw new GraphQLError('Failed adding user', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        error,
                    },
                });
            });
        },
        login: async (root, args) => {
            const user = await User.findOne({ username: args.username });
            if (!user || args.password !== 'salasana') {
                throw new GraphQLError('Bad auth', {
                    extensions: { code: 'BAD_USER_INPUT' },
                });
            }
            return {
                value: jwt.sign(
                    { username: user.username, id: user._id },
                    process.env.SECRET
                ),
            };
        },
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req, res }) => {
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.startsWith('Bearer ')) {
            const { id } = jwt.verify(auth.substring(7), process.env.SECRET);
            const user = await User.findById(id);
            return { user };
        }
    },
}).then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
