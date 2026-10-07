# Football E-commerce Store ⚽🛒

Welcome to the Football E-commerce Store repository! This project is a full-stack web application designed for football enthusiasts to browse, purchase, and manage football-related merchandise, gear, and apparel.

## 🚀 Project Overview

The project is structured into two main parts:
- **Client**: A modern frontend application built with Vite, React, and Tailwind CSS.
- **Server**: A robust backend API built with Node.js, Express, and Docker support.

## 📁 Repository Structure

```text
.
├── client/          # Frontend source code (Vite + React + Tailwind)
├── server/          # Backend source code (Node.js + Express + Docker)
└── README.md        # This documentation file
```

## ✨ Features

- **Modern UI/UX:** Built with Tailwind CSS for a fully responsive and beautiful design.
- **Product Catalog:** Browse football jerseys, boots, accessories, and training gear.
- **Shopping Cart & Checkout:** Add products to the cart and process orders.
- **RESTful API Backend:** Fast and scalable backend serving product details and handling user data.
- **Containerized:** Includes Docker and Docker Compose setup for easy backend deployment.

## 🛠️ Tech Stack

### Frontend (`/client`)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

### Backend (`/server`)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Docker](https://www.docker.com/) & Docker Compose
- [Jest](https://jestjs.io/) (for testing)

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Docker (optional, for backend containerization)

### Running the Client
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Running the Server
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables example file:
   ```bash
   cp .env.example .env
   ```
4. Start the backend server:
   ```bash
   npm start
   ```

*(Alternatively, you can run the server using Docker Compose if preferred: `docker-compose up -d`)*

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests for new features, bug fixes, and general improvements.

## 📄 License

This project is open-source and available under the MIT License.
