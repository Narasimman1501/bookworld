# 📚 BookWorld

BookWorld is a modern web application for discovering, tracking, and rating books, inspired by AniList. Users can search for books, add them to personal lists like 'Reading' or 'Completed', and view detailed information for each title.

## ✨ Features

-   **Book Discovery**: Browse trending, top-rated, and random books.
-   **Advanced Search**: Search by title, author, and filter by multiple genres.
-   **Personal Lists**: Track books with statuses like 'Reading', 'Completed', 'Plan to Read', etc.
-   **User Profiles**: View your book collections sorted by status.
-   **Authentication**: Secure user registration and login.
-   **RESTful API**: A Node.js and Express backend powers the application.

## Project Structure

This project is a monorepo containing both the frontend and backend applications.

-   `/` (root): Contains the frontend React application.
-   `/backend`: Contains the backend Node.js/Express/MongoDB server.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/)
-   [Git](https://git-scm.com/)
-   A MongoDB database (you can get a free one from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Installation & Setup

1.  **Clone the repository:**
    - Replace `YOUR_USERNAME` and `YOUR_REPOSITORY_NAME` with your actual GitHub details.
    ```sh
    git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
    cd YOUR_REPOSITORY_NAME
    ```

2.  **Set up the Backend:**
    -   Navigate to the backend directory:
        ```sh
        cd backend
        ```
    -   Install dependencies:
        ```sh
        npm install
        ```
    -   Create an environment file. There should be a `.env.example` file you can copy:
        ```sh
        cp .env.example .env
        ```
    -   Open the new `.env` file and fill in your details, especially your `MONGO_URI` and a new `JWT_SECRET`.
        ```env
        PORT=5000
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=your_super_secret_jwt_key
        CORS_ORIGIN=http://localhost:3000 # Or the port your frontend runs on
        ```

3.  **Set up the Frontend:**
    -   The frontend is set up to run in a specific development environment that serves `index.html` and compiles TypeScript on the fly.
    -   To run it in a standard local environment, you would typically use a tool like [Vite](https://vitejs.dev/). This involves creating a `package.json` in the root directory, installing dependencies (`react`, `react-dom`), and a dev server.

### Running the Application

1.  **Start the Backend Server:**
    -   From the `/backend` directory, run:
        ```sh
        npm run dev
        ```
    -   The server will start, usually on `http://localhost:5000`.

2.  **Start the Frontend Application:**
    -   You will need to serve the root directory using a development server. If you set up Vite, you would run `npm run dev` from the root directory.
    -   Ensure the `CORS_ORIGIN` in the backend's `.env` file matches the URL your frontend is served from.
    -   Also, check that the `API_URL` constant in `services/api.ts` points to your running backend (e.g., `http://localhost:5000/api`).

## ☁️ Deployment

To deploy this application, you need to host the frontend and backend separately.

-   **Backend**: Can be deployed to services like Render, Heroku, or any cloud provider that supports Node.js.
    -   Remember to set your environment variables (`MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`) in the deployment service's dashboard.
    -   The `CORS_ORIGIN` must be updated to the URL of your live frontend.
-   **Frontend**: Can be deployed as a static site to services like Vercel, Netlify, or GitHub Pages.
    -   You will need to set up a build process (e.g., with Vite) to create a production-ready bundle.
    -   The `API_URL` in `services/api.ts` must be updated to point to your live backend URL.