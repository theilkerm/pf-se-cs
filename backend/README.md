# E-Commerce Platform - Backend API

## 1. Overview

This repository contains the backend API for a full-featured e-commerce platform. It is built with Node.js and Express, follows RESTful principles, and provides all the necessary functionalities for a modern online store, including user authentication, product management, a shopping cart, an order processing system, and a product review engine.

The API is designed to be scalable, secure, and easy to integrate with any client-side application.

## 2. Core Features

-   **User Authentication & Authorization:**
    -   Secure user registration with password hashing (`bcryptjs`).
    -   JWT-based authentication for stateless sessions.
    -   Email verification flow for new user accounts.
    -   Role-based access control (RBAC) to distinguish between `customer` and `admin` permissions.
    -   Functionality for users to manage their profiles and addresses.
-   **Product & Category Management:**
    -   Full CRUD (Create, Read, Update, Delete) operations for products and categories, restricted to admins.
    -   Support for multiple image uploads for products using `multer`.
    -   Product variants (e.g., color, size) with individual stock tracking.
    -   Ability to mark products as "featured" and add descriptive tags.
-   **Shopping Cart System:**
    -   Persistent, user-specific shopping carts.
    -   Add, update, and remove items from the cart.
-   **Order Management:**
    -   Create orders from the user's shopping cart.
    -   Users can view their own order history.
    -   Admins can view and update the status of all orders (e.g., from "Processing" to "Shipped").
-   **Product Reviews and Ratings:**
    -   Authenticated users can submit reviews and a 1-5 star rating for products they have purchased.
    -   Product pages can display an average rating and a list of all reviews.
-   **Wishlist Management:**
    -   Users can add/remove products to/from their wishlist.
    -   View and manage wishlist items.
-   **Newsletter Subscription:**
    -   Public endpoint for users to subscribe to newsletters.
    -   Admin management of subscribers.
-   **Dashboard Analytics:**
    -   Sales trends and order status distribution for admin dashboard.
    -   Related products suggestions.
-   **Robust Infrastructure:**
    -   Centralized error handling middleware.
    -   Input validation for incoming requests using `zod`.
    -   Containerized with Docker for consistent development and deployment environments.

## 3. Technology Stack

-   **Runtime Environment:** Node.js
-   **Web Framework:** Express.js
-   **Database:** MongoDB
-   **ODM (Object-Document Mapper):** Mongoose
-   **Authentication:** JSON Web Tokens (JWT)
-   **File Uploads:** Multer
-   **Validation:** Zod
-   **Email Service:** Nodemailer
-   **Testing:** Jest, Supertest
-   **Containerization:** Docker & Docker Compose
-   **Language:** TypeScript

## 4. Setup and Installation

Follow these steps to get the backend server running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 18.x or higher is recommended)
-   [Docker](https://www.docker.com/products/docker-desktop/) and [Docker Compose](https://docs.docker.com/compose/)

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-name>/backend
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend` directory by copying the example file.

```bash
cp .env.example .env
```

Now, open the `.env` file and fill in the required values.

```dotenv
# Application Configuration
NODE_ENV=development
PORT=3001
MONGO_URI=mongodb://mongo:27017/e-commerce-db
FRONTEND_URL=http://localhost:3000

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=90d

# Email Service (e.g., Mailtrap.io for development)
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USERNAME=your_mailtrap_username
EMAIL_PASSWORD=your_mailtrap_password
EMAIL_FROM=My E-Commerce <noreply@ecommerce.com>
```

**Note:** For the `MONGO_URI`, `mongo` is the name of the service defined in `docker-compose.yml`. If you are not using Docker, replace it with `localhost` or your MongoDB host address.

### Step 3: Run the Application

#### Option A: Using Docker (Recommended)

This is the simplest way to get the entire application stack (backend, frontend, and database) running. Navigate to the **root directory** of the project (the one containing `docker-compose.yml`) and run:

**Development:**
```bash
docker-compose up -d --build
```

**Production:**
```bash
# First time only: Create persistent volume
docker volume create pf-se-cs-mongo-data

# Start production services
docker-compose -f docker-compose.prod.yml up -d --build

# Seed production database
docker compose -f docker-compose.prod.yml exec backend npm run seed:prod
```

-   The `--build` flag ensures that Docker images are rebuilt if there are any changes.
-   The `-d` flag runs the containers in detached mode.

To view the logs for the backend service:
```bash
# Development
docker-compose logs -f backend

# Production
docker compose -f docker-compose.prod.yml logs -f backend
```

#### Option B: Running Locally without Docker

If you prefer to run the server directly on your machine, you'll need a local MongoDB instance.

```bash
# Install dependencies
npm install

# Start the development server (with hot-reloading)
npm run dev

# Or, start the production-ready server
npm start
```

## 5. API Endpoints

The base URL for all API routes is `/api/v1`.

### Authentication (`/auth`)

| Method | Endpoint                    | Description                                  | Access  |
| :----- | :-------------------------- | :------------------------------------------- | :------ |
| `POST` | `/register`                 | Registers a new user.                        | Public  |
| `POST` | `/login`                    | Logs in a user and returns a JWT.            | Public  |
| `GET`  | `/verify-email/:token`      | Verifies a user's email address.             | Public  |
| `POST` | `/forgot-password`          | Sends a password reset link to the user's email. | Public  |
| `PATCH`| `/reset-password/:token`    | Resets the user's password.                  | Public  |

### Users (`/users`)

| Method | Endpoint                    | Description                                  | Access  |
| :----- | :-------------------------- | :------------------------------------------- | :------ |
| `GET`  | `/me`                       | Get details of the currently logged-in user. | Private |
| `PATCH`| `/update-me`                | Update details of the logged-in user.        | Private |
| `PATCH`| `/update-my-password`       | Update the password of the logged-in user.   | Private |
| `POST` | `/me/addresses`             | Add a new address to the user's address book.| Private |
| `PATCH`| `/me/addresses/:addressId`  | Update an existing address.                  | Private |
| `DELETE`| `/me/addresses/:addressId`  | Delete an address.                           | Private |
| `GET`  | `/`                         | Get a list of all users.                     | Admin   |
| `GET`  | `/:id`                      | Get a specific user by ID.                   | Admin   |
| `PATCH`| `/:id`                      | Update a user (admin only).                  | Admin   |
| `DELETE`| `/:id`                      | Delete a user (admin only).                  | Admin   |

### Products (`/products`)

| Method | Endpoint                    | Description                                  | Access  |
| :----- | :-------------------------- | :------------------------------------------- | :------ |
| `GET`  | `/`                         | Get a list of all products.                  | Public  |
| `GET`  | `/:id`                      | Get a single product by its ID.              | Public  |
| `POST` | `/`                         | Create a new product.                        | Admin   |
| `PATCH`| `/:id`                      | Update an existing product.                  | Admin   |
| `DELETE`| `/:id`                      | Delete a product.                            | Admin   |
| `GET`  | `/:productId/reviews`       | Get reviews for a specific product.          | Public  |
| `POST` | `/:productId/reviews`       | Add a review to a product.                   | Private |
| `GET`  | `/:productId/related`       | Get related products.                        | Public  |

### Categories (`/categories`)

| Method | Endpoint                    | Description                                  | Access  |
| :----- | :-------------------------- | :------------------------------------------- | :------ |
| `GET`  | `/`                         | Get a list of all categories.                | Public  |
| `POST` | `/`                         | Create a new category.                       | Admin   |
| `PATCH`| `/:id`                      | Update an existing category.                 | Admin   |
| `DELETE`| `/:id`                      | Delete a category.                           | Admin   |

### Cart (`/cart`)

| Method | Endpoint                    | Description                                  | Access  |
| :----- | :-------------------------- | :------------------------------------------- | :------ |
| `GET`  | `/`                         | Get the contents of the user's cart.         | Private |
| `POST` | `/`                         | Add an item to the cart.                     | Private |
| `PATCH`| `/`                         | Update the quantity of an item in the cart.  | Private |
| `DELETE`| `/:cartItemId`              | Remove an item from the cart.                | Private |
| `DELETE`| `/`                         | Clear the entire cart.                       | Private |

### Orders (`/orders`)

| Method | Endpoint                    | Description                                  | Access  |
| :----- | :-------------------------- | :------------------------------------------- | :------ |
| `GET`  | `/my-orders`                | Get the order history for the logged-in user.| Private |
| `POST` | `/`                         | Create a new order from the cart.            | Private |
| `GET`  | `/:id`                      | Get a specific order by ID.                  | Private/Admin |
| `GET`  | `/`                         | Get a list of all orders in the system.      | Admin   |
| `PATCH`| `/:id`                      | Update the status of an order.               | Admin   |

### Wishlist (`/wishlist`)

| Method | Endpoint                    | Description                                  | Access  |
| :----- | :-------------------------- | :------------------------------------------- | :------ |
| `GET`  | `/`                         | Get the user's wishlist.                     | Private |
| `POST` | `/`                         | Add a product to the wishlist.               | Private |
| `DELETE`| `/:productId`               | Remove a product from the wishlist.          | Private |

### Newsletter (`/newsletter`)

| Method | Endpoint                    | Description                                  | Access  |
| :----- | :-------------------------- | :------------------------------------------- | :------ |
| `POST` | `/`                         | Subscribe to the newsletter.                 | Public  |
| `GET`  | `/`                         | Get all newsletter subscribers.              | Admin   |

### Dashboard (`/dashboard`)

| Method | Endpoint                    | Description                                  | Access  |
| :----- | :-------------------------- | :------------------------------------------- | :------ |
| `GET`  | `/stats`                    | Get dashboard statistics and charts data.    | Admin   |

## 6. Data Models

### User Model
```typescript
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  phone?: string;
  addresses: Address[];
  favoriteCategories: string[];
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  cart: CartItem[];
  wishlist: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface CartItem {
  product: string;
  quantity: number;
  price: number;
  variant: {
    type: string;
    value: string;
  };
}
```

### Product Model
```typescript
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  variants: Variant[];
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  averageRating: number;
  numReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Variant {
  type: string;
  value: string;
  stock: number;
}
```

### Order Model
```typescript
interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  totalPrice: number;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}
```

## 7. Error Handling

The API uses a centralized error handling system with consistent error responses:

```typescript
interface ApiError {
  message: string;
  status?: number;
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 8. Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode (automatically restarts on file changes)
npm test
```

**Note:** The test script automatically runs in watch mode with `--watchAll` flag.

### Test Structure
- **Unit Tests**: Individual function and middleware testing
- **Integration Tests**: API endpoint testing with Supertest
- **Test Files**: Located in `src/__tests__/` directory

## 9. Development Scripts

```bash
# Development
npm run dev          # Start development server with tsx watch
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server

# Testing
npm test             # Run tests in watch mode

# Database
npm run seed:import  # Import sample data
npm run seed:delete  # Clear all data
npm run seed:prod    # Production seeding (after building)
npm run seed:delete:prod  # Production data clearing
```

## 10. Docker

### Building the Image
```bash
docker build -t ecommerce-backend .
```

### Running with Docker Compose
```bash
# Development
docker-compose up -d
docker-compose logs -f backend
docker-compose down

# Production
docker volume create pf-se-cs-mongo-data  # First time only
docker-compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml down
```

## 11. Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `development` |
| `PORT` | Server port | `3001` |
| `MONGO_URI` | MongoDB connection string | `mongodb://mongo:27017/e-commerce-db` (Docker) |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `90d` |
| `EMAIL_HOST` | SMTP host | Required |
| `EMAIL_PORT` | SMTP port | Required |
| `EMAIL_USERNAME` | SMTP username | Required |
| `EMAIL_PASSWORD` | SMTP password | Required |

## 12. Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 13. License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Built with ❤️ using Node.js and Express**