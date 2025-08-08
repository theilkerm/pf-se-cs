import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/user.model.js';
import Product from '../models/product.model.js';
import AppError from '../utils/appError.js';

interface CustomRequest extends Request {
  user?: IUser;
}

const catchAsync = (fn: Function) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// --- Helper Functions (Not Exported) ---

/**
 * Finds a user by their ID or throws a 404 error.
 */
const findUserById = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User for this token not found.', 404);
  }
  return user;
};



/**
 * Finds a product by its ID or throws a 404 error.
 */
const findProductById = async (productId: string) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
};

/**
 * Checks if there is enough stock for the requested product.
 */
const checkStockAvailability = (product: any, user: any, requestedQuantity: number) => {
  const itemIndex = user.cart.findIndex((item: any) => item.product.toString() === product._id.toString());
  const quantityInCart = itemIndex > -1 ? user.cart[itemIndex].quantity : 0;
  const totalQuantity = quantityInCart + requestedQuantity;

  if (product.stock < totalQuantity) {
    throw new AppError(`Insufficient stock. Only ${product.stock} items available.`, 400);
  }

  return { itemIndex, totalQuantity };
};

/**
 * Updates the user's cart array and saves the document.
 */
const updateUserCart = (user: any, product: any, quantity: number, itemIndex: number, totalQuantity: number) => {
  if (itemIndex > -1) {
    user.cart[itemIndex].quantity = totalQuantity;
  } else {
    user.cart.push({ product: product._id, quantity, price: product.price });
  }
  return user.save({ validateBeforeSave: false });
};


// --- EXPORTED CONTROLLER FUNCTIONS ---

export const getCart = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user!._id).populate({
    path: 'cart.product',
    select: 'name images price'
  });
  if (!user) { return next(new AppError('User not found', 404)); }
  res.status(200).json({ status: 'success', data: { cart: user.cart } });
});

export const addItemToCart = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const { productId, quantity } = req.body;

  const user = await findUserById(req.user!._id);
  const product = await findProductById(productId);
  const { itemIndex, totalQuantity } = checkStockAvailability(product, user, quantity);

  const updatedUser = await updateUserCart(user, product, quantity, itemIndex, totalQuantity);

  await updatedUser.populate({ path: 'cart.product', select: 'name images price' });

  res.status(200).json({ status: 'success', message: 'Item added to cart', data: { cart: updatedUser.cart } });
});

export const removeItemFromCart = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const { productId } = req.params;
  const user = await findUserById(req.user!._id);
  user.cart = user.cart.filter(item => item.product.toString() !== productId);
  await user.save({ validateBeforeSave: false });
  res.status(204).json({ status: 'success', data: null });
});

export const updateItemQuantity = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {

  const { productId, quantity } = req.body;
  const user = await User.findById(req.user!._id);
  if (!user) { return next(new AppError('User not found', 404)); }

  const itemIndex = user.cart.findIndex(item => item.product.toString() === productId);

  if (itemIndex > -1) {
    const product = await Product.findById(productId);
    if (!product) { return next(new AppError('Product not found in DB', 404)); }
    if (product.stock < quantity) { return next(new AppError('Insufficient stock', 400)); }

    user.cart[itemIndex].quantity = quantity;
  } else {
    return next(new AppError('Product not found in cart', 404));
  }

  await user.save({ validateBeforeSave: false });
  await user.populate({ path: 'cart.product', select: 'name images price stock' });

  res.status(200).json({ status: 'success', data: { cart: user.cart } });
});

export const clearCart = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user!._id);
  if (!user) { return next(new AppError('User not found', 404)); }

  user.cart = [];
  await user.save({ validateBeforeSave: false });

  res.status(204).json({ status: 'success', data: null });
});