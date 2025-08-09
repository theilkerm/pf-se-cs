export interface ICategory {
  _id: string;
  name: string;
}

export interface Variant {
  type: string;
  value: string;
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: ICategory;
  stock: number;
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