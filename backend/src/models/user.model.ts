import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; //

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
    cart: {
        product: mongoose.Types.ObjectId;
        quantity: number;
        price: number;
        variant: {
            type: { type: String };
            value: { type: String };
        };
    }[];
    wishlist: mongoose.Types.ObjectId[];
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
        cart: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                },
                quantity: { type: Number, required: true, min: 1, default: 1 },
                price: { type: Number, required: true, },
                variant: {
                    type: { type: String },
                    value: { type: String }
                }
            }
        ],
        wishlist: [{
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }],
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

// Virtual populate for user's orders
userSchema.virtual('orders', {
    ref: 'Order',
    foreignField: 'user',
    localField: '_id'
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Instance method to check if the provided password is correct
userSchema.methods.correctPassword = async function (
    candidatePassword: string,
    userPassword?: string
): Promise<boolean> {
    if (!userPassword) return false;
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function (): string {
    // 1) Generate a random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 2) Hash the token and save it to the database
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set token to expire in 10 minutes
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    // 3) Return the unhashed token to be sent to the user
    return resetToken;
};


userSchema.methods.createEmailVerificationToken = function (): string {
    const verificationToken = crypto.randomBytes(32).toString('hex');

    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    // You can add an expiry for this token as well if needed
    // this.emailVerificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    return verificationToken;
};

// Using the requested pattern to prevent OverwriteModelError
// and explicitly typing the model to prevent type errors.
const User: mongoose.Model<IUser> =
    models.User || model<IUser>('User', userSchema);

export default User;