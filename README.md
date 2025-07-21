# AlgoTrack

AlgoTrack is a web application that helps you track and visualize your progress on competitive programming platforms like Codeforces, LeetCode, and CodeChef. It provides a dashboard with insightful analytics to help you monitor your performance and identify areas for improvement.

## Features

- **Multi-platform Tracking**: Connect your accounts from Codeforces, LeetCode, and CodeChef.
- **Data Visualization**: View your submission history, problem-solving statistics, and rating changes over time with interactive charts and graphs.
- **Performance Analysis**: Get a detailed breakdown of your submissions by status, difficulty, and programming language.
- **Recent Activity**: A filterable table of your recent submissions across all connected platforms.
- **User Authentication**: Securely sign in with your email or Google account.

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
- **Charting**: [Recharts](https://recharts.org/)
- **Deployment**: Vercel/Next.js compatible hosting

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (version 18.x or later)
- npm, yarn, or pnpm

### Installation

1.  Clone the repo
    ```sh
    git clone [https://github.com/arijeet-10/algo-tracker-website.git](https://github.com/arijeet-10/algo-tracker-website.git)
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Start the development server
    ```sh
    npm run dev
    ```
4.  Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Project Structure

The application code is organized within the `src` directory as follows:

-   `src/app/`: Contains the main page and layout of the application.
-   `src/components/`: Reusable React components used throughout the application.
    -   `src/components/ui/`: UI components from shadcn/ui.
-   `src/hooks/`: Custom React hooks.
-   `src/lib/`: Utility functions.
-   `src/services/`: Functions for interacting with the Codeforces, LeetCode, and CodeChef APIs.
