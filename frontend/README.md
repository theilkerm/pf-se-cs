# E-Commerce Platform - Frontend Application

## 1. Overview

This is the frontend for the E-Commerce Platform, built with Next.js and TypeScript. It provides a modern, responsive, and user-friendly interface for both customers and administrators. The application leverages the Next.js App Router, server components, and client components to create a fast and interactive user experience.

## 2. Features

### Customer-Facing Features

-   **Dynamic Homepage:** Features product listings, categories, and promotional sections.
-   **Product Discovery:**
    -   Advanced product browsing with filtering by category and sorting by price.
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
-   **Newsletter Management:** View and manage newsletter subscribers.

## 3. Technology Stack

This project is built with a modern frontend stack to ensure performance and a great developer experience.

-   **Framework:** Next.js 15 (with App Router)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS
-   **UI Components:** Custom components built with React
-   **State Management:** React Context API
-   **Form Handling:** React Hook Form with Zod for validation
-   **Data Visualization:** Chart.js with `react-chartjs-2` for admin dashboard charts
-   **Linting & Formatting:** ESLint with TypeScript rules
-   **Build Tool:** Next.js built-in bundler
-   **Package Manager:** npm

## 4. Architecture and Component Structure

The frontend application follows a structured and scalable architecture based on the features of the Next.js App Router.

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes (login, register, etc.)
│   ├── admin/             # Admin panel routes
│   │   ├── categories/    # Category management
│   │   ├── customers/     # Customer management
│   │   ├── dashboard/     # Admin dashboard
│   │   ├── newsletter/    # Newsletter management
│   │   ├── orders/        # Order management
│   │   ├── products/      # Product management
│   │   └── reviews/       # Review management
│   ├── account/           # User account management
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   ├── my-orders/         # User order history
│   ├── products/          # Product browsing and details
│   └── wishlist/          # User wishlist
├── components/             # Reusable UI components
│   ├── Header.tsx         # Main navigation bar
│   ├── OrderStatusChart.tsx # Doughnut chart for order status
│   ├── ReviewForm.tsx     # Product review submission form
│   ├── ReviewList.tsx     # Product reviews display
│   └── SalesChart.tsx     # Line chart for sales data
├── context/                # React Context providers
│   └── AuthContext.tsx    # Authentication state management
├── lib/                    # Utility functions and shared logic
│   └── api.ts             # Centralized API fetcher functions
├── schemas/                # Zod validation schemas
│   └── checkout.schema.ts # Checkout form validation
└── types/                  # TypeScript type definitions
    └── index.ts           # All application types and interfaces
```

### Key Components

-   **`Header.tsx`**: The main site navigation bar, present on almost all pages.
-   **`SalesChart.tsx` & `OrderStatusChart.tsx`**: Reusable chart components used in the admin dashboard for data visualization.
-   **`ReviewForm.tsx` & `ReviewList.tsx`**: Components dedicated to submitting and displaying product reviews.
-   **`AuthContext.tsx`**: Manages the application-wide state for user authentication, including the user object and JWT token.

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

-   `npm run dev`: Starts the development server with hot reloading.
-   `npm run build`: Creates an optimized production build of the application.
-   `npm run start`: Starts the production server from the build files.
-   `npm run lint`: Runs ESLint to check for code quality and style issues.

## 7. Building for Production

### Development Build
```bash
npm run dev
```
- Starts development server with hot reloading
- Includes development-specific optimizations
- Source maps enabled for debugging

### Production Build
```bash
npm run build
```
- Creates optimized production build
- Minifies JavaScript and CSS
- Generates static assets
- Tree-shaking and code splitting
- Builds all pages and components

### Production Server
```bash
npm start
```
- Serves the production build
- Optimized for performance
- No hot reloading

## 8. TypeScript Configuration

The project uses strict TypeScript configuration for better type safety:

- **Strict Mode**: Enabled for all TypeScript checks
- **ESLint Integration**: TypeScript-specific linting rules
- **Type Definitions**: Comprehensive interfaces for all data structures
- **API Types**: Strongly typed API responses and requests

### Key Type Definitions

```typescript
// Product and variant types
interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  variants: Variant[];
  tags: string[];
  isFeatured: boolean;
  stock: number;
}

interface Variant {
  _id?: string;
  type: string;
  value: string;
  stock: number;
}

// Chart data types
interface OrderStatusData {
  _id: string;
  count: number;
}

interface SalesData {
  _id: string;
  dailySales: number;
}
```

## 9. Styling and UI

### Tailwind CSS
- Utility-first CSS framework
- Responsive design system
- Custom color palette and spacing
- Component-based styling approach

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl, 2xl
- Flexible grid system
- Touch-friendly interactions

## 10. State Management

### React Context API
- **`AuthContext`**: Manages user authentication state
- Global state for user information
- JWT token management
- Login/logout functionality

### Local State
- Component-level state with `useState`
- Form state management with React Hook Form
- Optimized re-renders with `useCallback` and `useMemo`

## 11. API Integration

### Centralized API Functions
- **`fetcher`**: Public API calls
- **`authedFetcher`**: Authenticated API calls with JWT
- Consistent error handling
- Type-safe responses

### Error Handling
- Network error handling
- API error responses
- User-friendly error messages
- Fallback UI states

## 12. Testing and Quality

### ESLint Configuration
- TypeScript-specific rules
- React best practices
- Consistent code style
- Import/export validation

### Build Validation
- Type checking during build
- Linting integration
- Bundle analysis
- Performance optimization

## 13. Performance Optimizations

### Next.js Features
- Automatic code splitting
- Image optimization
- Static generation where possible
- Incremental Static Regeneration

### React Optimizations
- Memoized components
- Optimized re-renders
- Lazy loading
- Bundle size optimization

## 14. Deployment

### Docker Deployment
```bash
# Build production image
docker build -t ecommerce-frontend .

# Run container
docker run -p 3000:3000 ecommerce-frontend
```

### Environment Configuration
- Production API URLs
- Build-time optimizations
- Static asset optimization
- CDN integration ready

## 15. Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 16. Troubleshooting

### Common Issues

**Build Errors:**
- Ensure all TypeScript types are properly defined
- Check for unused variables and expressions
- Verify React Hook dependencies

**Runtime Errors:**
- Check browser console for JavaScript errors
- Verify API endpoint configuration
- Ensure environment variables are set correctly

### Getting Help

1. Check the existing documentation
2. Review the issue tracker
3. Create a new issue with detailed information about your problem

## 17. License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Built with ❤️ using Next.js and React**