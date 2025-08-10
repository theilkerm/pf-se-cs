# E-Commerce Platform - Frontend Application

## 1. Overview

This is the frontend for the E-Commerce Platform, built with Next.js and TypeScript. It provides a modern, responsive, and user-friendly interface for both customers and administrators. The application leverages the Next.js App Router, server components, and client components to create a fast and interactive user experience.

## 2. Features

### Customer-Facing Features

-   **Dynamic Homepage:** Features product listings, categories, and promotional sections.
-   **Product Discovery:**
    -   Advanced product Browse with filtering by category and sorting by price.
    -   A powerful search functionality to find products easily.
-   **Product Details:** A comprehensive view for each product, including image galleries, descriptions, variants (e.g., color, size), stock status, and customer reviews.
-   **Shopping Cart:** A fully functional cart to add, update quantities, and remove products.
-   **Seamless Checkout:** A multi-step checkout process with address selection from a user's saved address book.
-   **User Accounts:**
    -   Secure registration, login, and password reset functionality.
    -   A personal account dashboard to manage profile details and an address book.
    -   A dedicated page to view order history and track order status.
-   **Wishlist:** Ability for users to save products they are interested in for future purchase.
-   **Reviews & Ratings:** Users can submit ratings and written reviews for products they have purchased.

### Admin Panel Features

-   **Dashboard:** An overview dashboard with key metrics and charts visualizing sales data and order statuses.
-   **Product Management:** Full CRUD interface to add, view, update, and delete products, including managing images, variants, tags, and featured status.
-   **Order Management:** A comprehensive view to manage all customer orders and update their fulfillment status.
-   **Category Management:** Full CRUD interface for managing product categories.
-   **Customer Management:** A list of all registered customers with search functionality.
-   **Review Management:** Admins can view and approve or delete customer-submitted reviews.

## 3. Technology Stack

This project is built with a modern frontend stack to ensure performance and a great developer experience.

-   **Framework:** Next.js (with App Router)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS
-   **UI Components:** Custom components built with React.
-   **State Management:** React Context API
-   **Form Handling:** React Hook Form with Zod for validation.
-   **Data Visualization:** Chart.js with `react-chartjs-2` for admin dashboard charts.
-   **Linting & Formatting:** ESLint

## 4. Architecture and Component Structure

The frontend application follows a structured and scalable architecture based on the features of the Next.js App Router.

-   **/src/app/**: This is the core of the application, handling all routing.
    -   Each folder represents a route (e.g., `/app/products` maps to the `/products` URL).
    -   Special files like `layout.tsx` and `page.tsx` define the UI for each route.
    -   The `/app/admin` directory is a route group containing all pages for the administration panel, which uses its own shared layout (`/admin/layout.tsx`).

-   **/src/components/**: This directory contains all reusable UI components that are shared across different pages.
    -   `Header.tsx`: The main site navigation bar, which is present on almost all pages.
    -   `SalesChart.tsx` & `OrderStatusChart.tsx`: Reusable chart components used in the admin dashboard for data visualization.
    -   `ReviewForm.tsx` & `ReviewList.tsx`: Components dedicated to submitting and displaying product reviews.

-   **/src/context/**: This directory holds the global state management logic.
    -   `AuthContext.tsx`: Manages the application-wide state for user authentication, including the user object and JWT token. It provides this state to all components wrapped within it, avoiding prop-drilling.

-   **/src/lib/**: Contains utility functions and shared logic.
    -   `api.ts`: A centralized API fetcher function. This provides a single, consistent way to make requests to the backend API, handle headers (like the `Authorization` token), and process responses.

-   **/src/schemas/**: Contains Zod schema definitions for form validation.
    -   This centralizes validation logic, making it reusable between different forms and ensuring data consistency.

## 5. Setup and Installation

Follow these steps to get the frontend server running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 18.x or higher is recommended)
-   [Docker](https://www.docker.com/products/docker-desktop/) and [Docker Compose](https://docs.docker.com/compose/)

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-name>/frontend
```

### Step 2: Configure Environment Variables

Create a `.env.local` file in the `frontend` directory. This file will contain the URL of your backend API.

```dotenv
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```
This URL must match the address where your backend API is accessible. The default is set for the Docker environment.

### Step 3: Run the Application

#### Option A: Using Docker (Recommended)

This is the simplest way to get the entire application stack (backend, frontend, and database) running together. Navigate to the **root directory** of the project (the one containing `docker-compose.yml`) and run:

```bash
docker-compose up -d --build
```
The frontend will be available at `http://localhost:3000`.

To view the logs for the frontend service:
```bash
docker-compose logs -f frontend
```

#### Option B: Running Locally without Docker

If you prefer to run the server directly on your machine:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```
The application will be available at `http://localhost:3000`.

## 6. Available Scripts

Inside the `frontend` directory, you can run several scripts:

-   `npm run dev`: Starts the development server.
-   `npm run build`: Creates an optimized production build of the application.
-   `npm run start`: Starts the production server from the build files.
-   `npm run lint`: Runs ESLint to check for code quality and style issues.