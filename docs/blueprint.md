# **App Name**: AlgoTrack

## Core Features:

- User Authentication: Allow users to authenticate using Firebase Authentication (Google/email login).
- Data Fetching: Fetch user data from Codeforces, LeetCode, and CodeChef using their public APIs to retrieve the number of problems solved.
- Data Analysis: Analyze fetched data to determine daily streaks and submission history (success/fail/time).
- Dashboard Visualization: Display a dashboard with bar charts for problems solved by difficulty and tag.
- Submission Table: Present a table of recent submissions with their status.

## Style Guidelines:

- Primary color: Dark blue (#1A237E) for a professional look.
- Secondary color: Light gray (#E0E0E0) for backgrounds and subtle contrasts.
- Accent: Teal (#00ACC1) for interactive elements and highlights.
- Clean and modern typography for readability.
- Dashboard-style layout with clear sections for each platform and data visualization.
- Use platform-specific icons (Codeforces, LeetCode, CodeChef) and relevant icons for data representation.
- Subtle transitions and animations for loading data and updating charts.

## Original User Request:
Build a MERN Stack Web App with Firebase Integration

✅ Goal: A dashboard that tracks and visualizes a user’s progress on competitive programming platforms: Codeforces, LeetCode, and CodeChef using their public APIs.

🔍 Features:
User Authentication via Firebase Auth (Google/email login)

Store user profiles and settings in Firestore

Backend: Express.js + Node.js

Fetch user data from Codeforces, LeetCode, and CodeChef using public APIs or scraping (where APIs aren't available)

Analyze:

Number of problems solved

Daily streaks

Rating history (if available)

Submission history (success/fail/time)

Send data to frontend via REST API (JSON)

Frontend: React

Display interactive dashboards with:

Bar/pie charts of problems solved (by difficulty/tag)

Line graph for rating changes over time

Heatmap for streaks (like GitHub contributions)

Table of recent submissions

Use Chart.js or Recharts for visualizations

Deployment: Firebase Hosting + Firebase Functions (optional for Express backend)
  