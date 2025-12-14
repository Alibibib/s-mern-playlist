import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import User, { IUser } from '../models/User';

const pubsub = new PubSub();

const USER_CREATED = 'USER_CREATED';

interface Context {
    user?: {
        id: string;
        email: string;
    };
}

interface RegisterInput {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

interface LoginInput {
    email: string;
    password: string;
}

const generateToken = (user: IUser): string => {
    return jwt.sign(
        { id: user._id.toString(), email: user.email },
        process.env.JWT_SECRET || 'unsafe_secret_key',
        { expiresIn: '7d' }
    );
};

const formatUser = (user: IUser) => ({
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
});

const validateRegisterInput = (input: RegisterInput) => {
    const errors: Record<string, string> = {};

    if (!input.username || input.username.trim().length < 3) {
        errors.username = 'Username must be at least 3 characters';
    }
    if (!input.email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(input.email)) {
        errors.email = 'Invalid email format';
    }
    if (!input.password || input.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }
    if (!input.firstName || input.firstName.trim().length === 0) {
        errors.firstName = 'First name is required';
    }
    if (!input.lastName || input.lastName.trim().length === 0) {
        errors.lastName = 'Last name is required';
    }

    if (Object.keys(errors).length > 0) {
        throw new GraphQLError('Validation errors', {
            extensions: {
                code: 'VALIDATION_ERROR',
                errors,
            },
        });
    }
};

export const resolvers = {
    Query: {
        hello: () => 'Hello from MERN Server!',

        me: async (_: any, __: any, context: Context) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            const user = await User.findOne({ 
                _id: context.user.id, 
                isDeleted: false 
            });

            if (!user) {
                throw new GraphQLError('User not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            return formatUser(user);
        },

        users: async (_: any, __: any, context: Context) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            const users = await User.find({ isDeleted: false });
            return users.map((user) => formatUser(user));
        },

        user: async (_: any, { id }: { id: string }, context: Context) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            const user = await User.findOne({ _id: id, isDeleted: false });

            if (!user) {
                throw new GraphQLError('User not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            return formatUser(user);
        },
    },

    Mutation: {
        register: async (_: any, { input }: { input: RegisterInput }) => {
            validateRegisterInput(input);

            const existingUser = await User.findOne({
                $or: [{ email: input.email }, { username: input.username }],
            });

            if (existingUser) {
                throw new GraphQLError('User already exists', {
                    extensions: {
                        code: 'USER_EXISTS',
                        field: existingUser.email === input.email ? 'email' : 'username',
                    },
                });
            }

            const hashedPassword = await bcrypt.hash(input.password, 12);

            const newUser = new User({
                username: input.username,
                email: input.email,
                password: hashedPassword,
                firstName: input.firstName,
                lastName: input.lastName,
            });

            const savedUser = await newUser.save();
            const token = generateToken(savedUser);

            pubsub.publish(USER_CREATED, {
                userCreated: formatUser(savedUser),
            });

            return {
                user: formatUser(savedUser),
                token,
            };
        },

        login: async (_: any, { input }: { input: LoginInput }) => {
            if (!input.email || !input.password) {
                throw new GraphQLError('Email and password are required', {
                    extensions: { code: 'VALIDATION_ERROR' },
                });
            }

            const user = await User.findOne({ 
                email: input.email, 
                isDeleted: false 
            });

            if (!user) {
                throw new GraphQLError('Invalid credentials', {
                    extensions: { code: 'INVALID_CREDENTIALS' },
                });
            }

            const isPasswordValid = await bcrypt.compare(
                input.password,
                user.password
            );

            if (!isPasswordValid) {
                throw new GraphQLError('Invalid credentials', {
                    extensions: { code: 'INVALID_CREDENTIALS' },
                });
            }

            const token = generateToken(user);

            return {
                user: formatUser(user),
                token,
            };
        },

        updateUser: async (
            _: any,
            { id, firstName, lastName }: { id: string; firstName?: string; lastName?: string },
            context: Context
        ) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            if (context.user.id !== id) {
                throw new GraphQLError('Not authorized', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }

            const updateData: Partial<IUser> = {};
            if (firstName) updateData.firstName = firstName;
            if (lastName) updateData.lastName = lastName;

            const user = await User.findOneAndUpdate(
                { _id: id, isDeleted: false },
                updateData,
                { new: true }
            );

            if (!user) {
                throw new GraphQLError('User not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            return formatUser(user);
        },

        deleteUser: async (_: any, { id }: { id: string }, context: Context) => {
            if (!context.user) {
                throw new GraphQLError('Not authenticated', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            if (context.user.id !== id) {
                throw new GraphQLError('Not authorized', {
                    extensions: { code: 'FORBIDDEN' },
                });
            }

            const user = await User.findByIdAndUpdate(
                id,
                { isDeleted: true },
                { new: true }
            );

            if (!user) {
                throw new GraphQLError('User not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            return true;
        },
    },

    Subscription: {
        serverTime: {
            subscribe: async function* () {
                while (true) {
                    yield { serverTime: new Date().toISOString() };
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
            },
        },
        userCreated: {
            subscribe: () => pubsub.asyncIterator([USER_CREATED]),
        },
    },
};