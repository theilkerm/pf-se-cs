import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import AppError from '../utils/appError.js';
import { IProduct } from '../models/product.model.js';

interface CustomRequest extends Request {
  user?: any;
}

const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// --- Helper Functions (Not Exported) ---

const findUserById = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

const findProductById = async (productId: string): Promise<IProduct> => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
};

const checkStockAvailability = (product: IProduct, user: any, requestedQuantity: number, variant: any) => {
  const itemIndex = user.cart.findIndex((item: any) => 
    item.product.toString() === (product._id as any).toString() &&
    item.variant?.value === variant.value &&
    item.variant?.type === variant.type
  );
  const quantityInCart = itemIndex > -1 ? user.cart[itemIndex].quantity : 0;
  const totalQuantity = quantityInCart + requestedQuantity;
  const productVariant = product.variants.find((v: any) => v.value === variant.value && v.type === variant.type);

  if (!productVariant || productVariant.stock < totalQuantity) {
    throw new AppError(`Insufficient stock for the selected variant. Only ${productVariant?.stock || 0} items available.`, 400);
  }
  return { itemIndex, totalQuantity };
};

const updateUserCart = (user: any, product: IProduct, quantity: number, itemIndex: number, totalQuantity: number, variant: any) => {
  if (itemIndex > -1) {
    user.cart[itemIndex].quantity = totalQuantity;
  } else {
    user.cart.push({ product: (product._id as any), quantity, price: product.price, variant });
  }
  return user.save({ validateBeforeSave: false });
};


// --- EXPORTED CONTROLLER FUNCTIONS ---

export const getCart = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user!._id).populate({
    path: 'cart.product',
    select: 'name images price variants'
  });
  if (!user) { return next(new AppError('User not found', 404)); }
  res.status(200).json({ status: 'success', data: { cart: user.cart } });
});

export const addItemToCart = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { productId, quantity, variant } = req.body;
    if (!variant || !variant.type || !variant.value) { return next(new AppError('Please select a product variant.', 400)); }
    
    const user = await findUserById(req.user!._id);
    const product = await findProductById(productId as string);
    const { itemIndex, totalQuantity } = checkStockAvailability(product, user, quantity, variant);
    
    await updateUserCart(user, product, quantity, itemIndex, totalQuantity, variant);
    
    await user.populate({ path: 'cart.product', select: 'name images price variants' });
    res.status(200).json({ status: 'success', message: 'Item added to cart', data: { cart: user.cart } });
});

export const updateItemQuantity = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { productId, quantity, variant } = req.body;
    if (!variant) { return next(new AppError('Variant information is missing.', 400)); }
    
    const user = await findUserById(req.user!._id);
    
    const itemIndex = user.cart.findIndex((item: any) => 
        item.product.toString() === productId &&
        item.variant?.value === variant.value &&
        item.variant?.type === variant.type
    );

    if (itemIndex > -1) {
        const product = await findProductById(productId as string);
        const productVariant = product.variants.find((v: any) => v.value === variant.value && v.type === variant.type);

        if (!productVariant || productVariant.stock < quantity) {
            return next(new AppError('Insufficient stock for this variant.', 400));
        }
        
        user.cart[itemIndex].quantity = quantity;
    } else {
        return next(new AppError('Product with specified variant not found in cart.', 404));
    }

    await user.save({ validateBeforeSave: false });
    await user.populate({ path: 'cart.product', select: 'name images price variants' });

    res.status(200).json({ status: 'success', data: { cart: user.cart } });
});

export const removeItemFromCart = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    // Note: To remove a specific variant of a product, we should use the unique cart item _id.
    // The frontend should send this _id. For now, this is a placeholder.
    // Let's assume frontend sends productId and variant info to identify the item.
    // A better approach is to use the cart item's own unique _id.
    const { cartItemId } = req.params;
    const user = await findUserById(req.user!._id);

    user.cart = user.cart.filter((item: any) => item._id.toString() !== cartItemId);
    await user.save({ validateBeforeSave: false });

    res.status(204).json({ status: 'success', data: null });
});

export const clearCart = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = await findUserById(req.user!._id);
    user.cart = [];
    await user.save({ validateBeforeSave: false });
    res.status(204).json({ status: 'success', data: null });
});