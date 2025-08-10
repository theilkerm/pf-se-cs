# Full-Stack E-Commerce Platform

A modern, full-featured e-commerce platform built with Next.js (React) and Node.js (Express) in a monorepo structure. This platform provides both a rich shopping experience for customers and a comprehensive management panel for administrators.

## ✨ Key Features

### Customer Interface
- **User Management**: JWT-based secure user registration, login, email verification, and password reset
- **Product Discovery**: Advanced filtering by category and price, search functionality with URL-based state management
- **Detailed Product Pages**: Multiple product images, variants (color, size), stock status, and user reviews
- **Shopping Cart**: Add, remove, and update product quantities with debounced updates
- **Order Process**: Streamlined checkout with saved address book integration
- **User Dashboard**: Profile management, address book, and order history tracking
- **Wishlist**: Save favorite products for future purchases
- **Review System**: Rate and review purchased products (1-5 stars)

### Admin Panel
- **Dashboard**: Interactive charts showing sales trends, order status distribution, and key metrics
- **Product Management**: Full CRUD operations for products including images, variants, stock, and tags
- **Order Management**: View all orders and update fulfillment status (Processing → Shipped → Delivered)
- **Category Management**: Add, edit, and manage product categories
- **Customer Management**: View and search all registered customers
- **Review Management**: Approve or delete customer-submitted reviews

## 🛠️ Technology Stack

| Area | Technology |
|------|------------|
| **Frontend** | Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, React Hook Form, Zod, Chart.js, React Context |
| **Backend** | Node.js, Express.js, TypeScript, MongoDB, Mongoose, JWT, Zod, Multer, Nodemailer, Jest, Supertest |
| **General** | Docker, Docker Compose, ESLint, TypeScript |

## 🚀 Quick Start

The easiest way to run the entire project (frontend, backend, database) is using Docker.

### Prerequisites
- Git
- Docker and Docker Compose

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/theilkerm/pf-se-cs/
   cd pf-se-cs
   ```

2. **Configure Backend Environment**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   cd ..
   ```

3. **Configure Frontend Environment**
   ```bash
   cd frontend
   echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1" > .env.local
   cd ..
   ```

4. **Start All Services**

   **Development:**
   ```bash
   docker-compose up -d --build
   ```

   **Production:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🧪 Testing & Data Management

### Demo Users
After seeding the database, you can use these test accounts:

- **Admin User**
  - Email: admin@example.com
  - Password: password123

- **Customer User**
  - Email: ilker@example.com
  - Password: password123

### Database Operations
```bash
# Seed database with sample data
docker-compose exec backend npm run seed:import

# Clear all data
docker-compose exec backend npm run seed:delete

# Run backend tests
docker-compose exec backend npm test
```

## 📁 Project Structure

```
pf-se-cs/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Custom middleware
│   │   └── utils/          # Utility functions
│   └── Dockerfile
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React Context providers
│   │   ├── lib/           # Utility functions
│   │   ├── schemas/       # Zod validation schemas
│   │   └── types/         # TypeScript type definitions
│   └── Dockerfile
├── docker-compose.yml      # Multi-service orchestration
└── README.md              # This file
```

## 🔧 Development

### Running Individual Services

**Backend Only:**
```bash
cd backend
npm install
npm run dev
```

**Frontend Only:**
```bash
cd frontend
npm install
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

**Backend:**
```bash
cd backend
npm run build
npm start
```

## 📚 Documentation

For more detailed information about each component:

- [Backend README](backend/README.md) - API documentation, endpoints, and backend setup
- [Frontend README](frontend/README.md) - Component structure, routing, and frontend setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing documentation
2. Review the issue tracker
3. Create a new issue with detailed information about your problem

---

**Built with ❤️ using modern web technologies**