const { GraphQLError } = require('graphql');
const jwt = require('jsonwebtoken');
const { PubSub } = require('graphql-subscriptions');
const Author = require('./models/author');
const Book = require('./models/book');
const User = require('./models/user');

const pubsub = new PubSub();

const resolvers = {
    Query: {
        bookCount: async () => Book.collection.countDocuments(),
        authorCount: async () => Author.collection.countDocuments(),
        allBooks: async (root, args) => {
            if (!args.author && !args.genre) {
                return Book.find({}).populate('author');
            } else if (!args.author) {
                return Book.find({ genres: args.genre }).populate('author');
            }
            const author = await Author.findOne({ name: args.author });
            if (!args.genre) {
                return Book.find({ author: author._id }).populate('author');
            }
            return Book.find({
                author: author._id,
                genres: args.genre,
            }).populate('author');
        },
        allAuthors: async () => Author.find({}),
        me: (root, args, { user }) => user,
        allGenres: async () => {
            const genres = (await Book.find({}, { genres: 1, _id: 0 }))
                .map((g) => g.genres)
                .flat();
            return genres.reduce((acc, genre) => {
                if (!acc.includes(genre)) {
                    return [...acc, genre];
                }
                return acc;
            }, []);
        },
        recommendedBooks: async (root, args, { user }) => {
            if (!user) {
                throw new GraphQLError('Not authorized', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                });
            }
            return Book.find({ genres: user.favoriteGenre }).populate('author');
        },
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
            }
            author.bookCount++;
            try {
                await author.save();
            } catch (error) {
                throw new GraphQLError('Failed saving author', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args.author,
                        error,
                    },
                });
            }
            const bookAdded = new Book({
                title: args.title,
                author: author._id,
                published: args.published,
                genres: args.genres,
            });
            try {
                await bookAdded.save();
                await bookAdded.populate('author');
                pubsub.publish('BOOK_ADDED', { bookAdded });
                return bookAdded;
            } catch (error) {
                throw new GraphQLError('Failed adding book', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        error,
                    },
                });
            }
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
    Subscription: {
        bookAdded: {
            subscribe: async () => pubsub.asyncIterator('BOOK_ADDED'),
        },
    },
};

module.exports = resolvers;
