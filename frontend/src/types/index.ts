export interface ICategory {
  _id: string;
  name: string;
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: ICategory;
  stock: number;
  averageRating: number;
  numReviews: number;
}