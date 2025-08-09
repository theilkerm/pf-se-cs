export interface ICategory {
  _id: string;
  name: string;
}

export interface Variant {
  type: string;
  value: string;
  stock: number;
  _id: string;
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: ICategory;
  variants: Variant[];
  averageRating: number;
  numReviews: number;
}

export interface IReview {
  _id: string;
  rating: number;
  comment: string;
  user: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

// These are new/updated interfaces for Cart and Order items
export interface CartItem {
  product: IProduct;
  quantity: number;
  price: number;
  variant?: Variant; // Variant is now part of the cart item
  _id: string;
}

export interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    image: string;
    product: string;
    variant?: Variant; // And also part of the order item
}

export interface IOrder {
    _id: string;
    user: { 
        _id: string;
        firstName: string;
        lastName: string;
    };
    totalPrice: number;
    orderStatus: string;
    createdAt: string;
}