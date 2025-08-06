# E-Commerce Platform API - Backend

This repository contains the backend source code for a full-featured e-commerce platform, developed as part of a software engineer case study. The API is built with Node.js, Express, and MongoDB, following modern development practices and a RESTful architecture.

## Features Implemented

- [x] **User Authentication**: JWT-based registration, login, email verification, and password reset.
- [x] **Role-Based Access Control**: Differentiated access for `customer` and `admin` roles.
- [x] **Product Management (Admin)**: Full CRUD operations for products, including image uploads.
- [x] **Category Management (Admin)**: Full CRUD operations for product categories.
- [x] **Customer Management (Admin)**: Full CRUD operations for customer accounts.
- [x] **Shopping Cart**: Persistent, user-specific shopping cart functionality with stock validation.
- [x] **Order Processing**: Checkout process to convert a cart into an order, with stock management.
- [x] **Order History**: Users can view their past orders.
- [x] **Review System**: Users can review products they have purchased, with admin approval and average rating calculation.
- [x] **Admin Dashboard**: An endpoint to aggregate key statistics (total sales, counts, etc.).
- [x] **Advanced Security**: Includes rate limiting, input sanitization (XSS, NoSQL Injection).
- [x] **Schema-Based Validation**: All major input is validated using Zod.
- [x] **Automated Testing**: Comprehensive integration test suite using Jest and Supertest.

## Technology Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT), bcryptjs
- **Validation**: Zod
- **Email**: Nodemailer (with Mailtrap for development)
- **File Uploads**: Multer
- **Security**: `express-rate-limit`, `express-mongo-sanitize`, `xss-clean`
- **Testing**: Jest, Supertest
- **Containerization**: Docker, Docker Compose
- **Development**: `tsx` for hot-reloading

## Getting Started

Follow these instructions to get the project set up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- An API testing tool like Postman or Insomnia
- A free [Mailtrap.io](https://mailtrap.io) account for testing email features.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd pf-se-cs
    ```

2.  **Configure Environment Variables:**
    Navigate to the `backend` directory. Copy the example environment file and fill in your details, especially your Mailtrap credentials.
    ```bash
    cd backend
    cp .env.example .env
    ```

    **`.env.example`**
    ```env
    # Server Port
    PORT=3001
    
    # MongoDB Connection
    MONGO_URI=mongodb://mongo:27017/e-commerce-db
    
    # JWT Secrets
    JWT_SECRET=this-is-a-super-secret-key-change-it-later
    JWT_EXPIPIRES_IN=90d
    
    # EMAIL CONFIGURATION (for Mailtrap.io)
    EMAIL_HOST=
    EMAIL_PORT=
    EMAIL_USERNAME=
    EMAIL_PASSWORD=
    EMAIL_FROM=
    ```

3.  **Build and Run with Docker Compose:**
    From the **root project directory** (`pf-se-cs`), run the following command.
    ```bash
    docker-compose up --build -d
    ```
    Your API will now be running at `http://localhost:3001`.

4.  **Install Local Dependencies (for IDE support):**
    ```bash
    cd backend
    npm install
    ```

## Running the Application

-   **Development Server**: `docker-compose up` starts the server with hot-reloading.
-   **Automated Tests**:
    ```bash
    # Run tests once and exit
    npm run test:single
    
    # Run tests in interactive watch mode
    npm test
    ```

## API Documentation

All endpoints are prefixed with `/api/v1`.

---

#### **Authentication (`/auth`)**

-   **`POST /register`**: Register a new user and send a verification email. (Public)
-   **`POST /login`**: Log in a user and receive a JWT. (Public)
-   **`GET /verify-email/:token`**: Verify a user's email. (Public)
-   **`POST /forgot-password`**: Send a password reset link. (Public)
-   **`PATCH /reset-password/:token`**: Reset the password with a valid token. (Public)

---

#### **Users (`/users`)**

-   **`GET /me`**: Get the profile of the currently logged-in user. (Private)
-   **`GET /`**: Get a list of all customers. (Admin)
-   **`GET /:id`**: Get a single customer's details, including order history. (Admin)
-   **`PATCH /:id`**: Update a user's details. (Admin)
-   **`DELETE /:id`**: Delete a user. (Admin)

---

#### **Categories (`/categories`)**

-   **`GET /`**: Get a list of all active categories. (Public)
-   **`POST /`**: Create a new category. (Admin)
    -   **Body**: `{ "name": "Electronics", "description": "..." }`

*(Note: Full CRUD for categories can be easily extended by adding GET /:id, PATCH /:id, and DELETE /:id routes for admins.)*

---

#### **Products (`/products`)**

-   **`GET /`**: Get a list of all products. Supports filtering by category (e.g., `?category=<category_id>`). (Public)
-   **`GET /:id`**: Get a single product by its ID. (Public)
-   **`POST /`**: Create a new product with images. (Admin)
    -   **Body**: `form-data` with fields for `name`, `description`, `price`, `stock`, `category` (ID), and `images` (file upload).
-   **`PATCH /:id`**: Update a product's details. (Admin)
-   **`DELETE /:id`**: Delete a product and its associated reviews. (Admin)

---

#### **Cart (`/cart`)**

-   **`GET /`**: Get the current user's shopping cart. (Private)
-   **`POST /`**: Add an item to the cart or update its quantity. (Private)
    -   **Body**: `{ "productId": "...", "quantity": 1 }`
-   **`DELETE /:productId`**: Remove an item from the cart. (Private)

---

#### **Orders (`/orders`)**

-   **`POST /`**: Create a new order from the user's cart (checkout). (Private)
    -   **Body**: `{ "shippingAddress": { ... } }`
-   **`GET /my-orders`**: Get the logged-in user's order history. (Private)

---

#### **Reviews (`/reviews`)**

-   **`POST /`**: Create a new review for a purchased product. (Private)
    -   **Body**: `{ "productId": "...", "rating": 5, "comment": "..." }`
-   **`PATCH /:id/approve`**: Approve a pending review. (Admin)

---

#### **Dashboard (`/dashboard`)**

-   **`GET /stats`**: Get aggregated statistics for the admin dashboard. (Admin)

---