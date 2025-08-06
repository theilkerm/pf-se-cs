import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Using default import method as requested
const { model, models, Schema } = mongoose;

// Interface for the User document
// This includes all fields from the case study 
export interface IUser extends mongoose.Document {
    email: string;
    password?: string;
    role: 'customer' | 'admin';
    firstName: string;
    lastName: string;
    phone?: string;
    addresses: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    }[];
    favoriteCategories: string[];
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    correctPassword(candidatePassword: string, userPassword?: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6, // As per security requirements [cite: 82]
            select: false, // Do not return password by default on queries
        },
        role: {
            type: String,
            enum: ['customer', 'admin'],
            default: 'customer',
        },
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        addresses: [
            {
                street: String,
                city: String,
                state: String,
                zipCode: String,
                country: String,
            },
        ],
        favoriteCategories: [String],
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: String,
        passwordResetToken: String,
        passwordResetExpires: Date,
    },
    {
        timestamps: true, // Adds createdAt and updatedAt timestamps
    }
);

// Pre-save middleware to hash the password
// Using bcryptjs as requested
userSchema.pre<IUser>('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Instance method to check if the provided password is correct
userSchema.methods.correctPassword = async function (
    candidatePassword: string,
    userPassword?: string
): Promise<boolean> {
    if (!userPassword) return false;
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Using the requested pattern to prevent OverwriteModelError
// and explicitly typing the model to prevent type errors.
const User: mongoose.Model<IUser> =
    models.User || model<IUser>('User', userSchema);

export default User;