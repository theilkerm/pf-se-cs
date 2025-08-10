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
-   **Containerization:** Docker & Docker Compose

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
PORT=5000
DATABASE_URL=mongodb://mongodb:27017/ecommerce-db
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
**Note:** For the `DATABASE_URL`, `mongodb` is the name of the service defined in `docker-compose.yml`. If you are not using Docker, replace it with `localhost` or your MongoDB host address.

### Step 3: Run the Application

#### Option A: Using Docker (Recommended)

This is the simplest way to get the entire application stack (backend, frontend, and database) running. Navigate to the **root directory** of the project (the one containing `docker-compose.yml`) and run:

```bash
docker-compose up -d --build
```

-   The `--build` flag ensures that Docker images are rebuilt if there are any changes.
-   The `-d` flag runs the containers in detached mode.

To view the logs for the backend service:
```bash
docker-compose logs -f backend
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

### Products (`/products`)

| Method | Endpoint                    | Description                                  | Access  |
| :----- | :-------------------------- | :------------------------------------------- | :------ |
| `GET`  | `/`                         | Get a list of all products.                  | Public  |
| `GET`  | `/:id`                      | Get a single product by its ID.              | Public  |
| `POST` | `/`                         | Create a new product.                        | Admin   |
| `PATCH`| `/:id`                      | Update an existing product.                  | Admin   |
| `DELETE`| `/:id`                      | Delete a product.                            | Admin   |
| `POST` | `/:productId/reviews`       | Add a review to a product.                   | Private |

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
| `PATCH`| `/:itemId`                  | Update the quantity of an item in the cart.  | Private |
| `DELETE`| `/:itemId`                  | Remove an item from the cart.                | Private |

### Orders (`/orders`)

| Method | Endpoint                    | Description                                  | Access  |
| :----- | :-------------------------- | :------------------------------------------- | :------ |
| `GET`  | `/my-orders`                | Get the order history for the logged-in user.| Private |
| `POST` | `/`                         | Create a new order from the cart.            | Private |
| `GET`  | `/`                         | Get a list of all orders in the system.      | Admin   |
| `PATCH`| `/:id`                      | Update the status of an order.               | Admin   |