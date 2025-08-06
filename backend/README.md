# E-Commerce Platform API - Backend

This repository contains the backend source code for a full-featured e-commerce platform, developed as part of a software engineer case study. The API is built with Node.js, Express, and MongoDB, following modern development practices and a RESTful architecture.

## Features Implemented

- [x] **User Authentication**: JWT-based registration and login system.
- [x] **Role-Based Access Control**: Differentiated access for `customer` and `admin` roles.
- [x] **Product Management (Admin)**: Full CRUD operations for products, including image uploads.
- [x] **Category Management (Admin)**: Full CRUD operations for product categories.
- [x] **Customer Management (Admin)**: Full CRUD operations for customer accounts.
- [x] **Shopping Cart**: Persistent, user-specific shopping cart functionality.
- [x] **Order Processing**: Checkout process to convert a cart into an order, with stock management.
- [x] **Order History**: Users can view their past orders.
- [x] **Review System**: Users can review products they have purchased, with admin approval.
- [x] **Admin Dashboard**: An endpoint to aggregate key statistics (total sales, counts, etc.).
- [x] **Automated Testing**: Comprehensive integration test suite using Jest and Supertest.

## Technology Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT), bcryptjs
- **File Uploads**: Multer
- **Testing**: Jest, Supertest
- **Containerization**: Docker, Docker Compose
- **Development**: `tsx` for hot-reloading

## Getting Started

Follow these instructions to get the project set up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- An API testing tool like Postman or Insomnia

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd pf-se-cs
    ```

2.  **Configure Environment Variables:**
    Navigate to the `backend` directory. Copy the example environment file and fill in your details.
    ```bash
    cd backend
    cp .env.example .env
    ```
    The default values in `.env.example` are configured to work with the Docker setup and do not need to be changed for local development.

    **`.env.example`**
    ```env
    PORT=3001
    MONGO_URI=mongodb://mongo:27017/e-commerce-db
    JWT_SECRET=this-is-a-super-secret-key-change-it-later
    JWT_EXPIRES_IN=90d
    ```

3.  **Build and Run with Docker Compose:**
    From the **root project directory** (`pf-se-cs`), run the following command. This will build the Node.js image and start the backend server and the MongoDB database containers.
    ```bash
    docker-compose up --build -d
    ```
    Your API will now be running and accessible at `http://localhost:3001`.

4.  **Install Local Dependencies (for IDE support):**
    To ensure your code editor (like VS Code) recognizes the installed packages for IntelliSense and type-checking, run `npm install` inside the `backend` directory.
    ```bash
    cd backend
    npm install
    ```

## Running the Application

-   **Development Server**: The `docker-compose up` command starts the server in development mode with `tsx` for hot-reloading. Any changes you make in the `src` directory will automatically restart the server.
-   **Automated Tests**: To run the entire test suite, navigate to the `backend` directory and run:
    ```bash
    # Run tests once and exit
    npm run test:single
    
    # Run tests in interactive watch mode
    npm test
    ```

## Demo Credentials

You can register new users via the API. To create an admin, you can manually update a user's `role` in the database to `"admin"`.

-   **Admin User:**
    -   **Email:** `admin@example.com`
    -   **Password:** `password123`
-   **Customer User:**
    -   **Email:** `customer@example.com`
    -   **Password:** `password123`

## API Documentation

All endpoints are prefixed with `/api/v1`.

---

#### **Authentication (`/auth`)**

-   **`POST /register`**: Register a new user.
    -   **Access**: Public
    -   **Body**: `{ "firstName": "John", "lastName": "Doe", "email": "john@example.com", "password": "password123" }`

-   **`POST /login`**: Log in a user and receive a JWT.
    -   **Access**: Public
    -   **Body**: `{ "email": "john@example.com", "password": "password123" }`

---

#### **Products (`/products`)**

-   **`GET /`**: Get a list of all products.
    -   **Access**: Public
-   **`GET /:id`**: Get a single product by its ID.
    -   **Access**: Public
-   **`POST /`**: Create a new product.
    -   **Access**: Admin
    -   **Body**: `form-data` with fields for `name`, `description`, `price`, `stock`, `category` (ID), and `images` (file upload).

---

#### **Cart (`/cart`)**

-   **`GET /`**: Get the current user's shopping cart.
    -   **Access**: Private (Customer)
-   **`POST /`**: Add an item to the cart.
    -   **Access**: Private (Customer)
    -   **Body**: `{ "productId": "...", "quantity": 1 }`

---

#### **Orders (`/orders`)**

-   **`POST /`**: Create a new order from the user's cart (checkout).
    -   **Access**: Private (Customer)
    -   **Body**: `{ "shippingAddress": { ... } }`
-   **`GET /my-orders`**: Get the logged-in user's order history.
    -   **Access**: Private (Customer)

*(Other endpoints for Categories, Reviews, Admin User Management, and Dashboard follow similar RESTful patterns.)*

---

## Deployment

To deploy this application to a production environment:

1.  Ensure you have a production-ready server (e.g., AWS EC2, DigitalOcean Droplet) with Docker installed.
2.  Set up production environment variables in a `.env` file on the server (especially a strong `JWT_SECRET`).
3.  Build the production Docker image.
4.  Run the containers using `docker-compose -f docker-compose.prod.yml up -d` (assuming a separate production compose file).
5.  It's recommended to use a process manager like PM2 inside the container for production to handle restarts and clustering.