# 🚀 FlowState — AI-Powered Learning & Roadmap Platform

**FlowState** is an AI-powered learning platform designed to help engineering students transform broad learning goals into **structured, personalized, and actionable learning roadmaps**.

Instead of forcing students to figure out *what to learn, in what order, and how to practice*, FlowState uses AI to understand the learner's intent and guide them through an organized learning workflow.

🌐 **Live Website:**
https://flowstate-two-steel.vercel.app/

---

## 📌 Table of Contents

* [About FlowState](#-about-flowstate)
* [Problem Statement](#-problem-statement)
* [Our Solution](#-our-solution)
* [Key Features](#-key-features)
* [Workflow](#-workflow)
* [Website Walkthrough](#-website-walkthrough)
* [Technology Stack](#-technology-stack)
* [Project Architecture](#-project-architecture)
* [Prerequisites](#-prerequisites)
* [Installation & Setup](#-installation--setup)
* [Environment Variables & API Keys](#-environment-variables--api-keys)
* [Firebase Setup](#-firebase-setup)
* [AI API Setup](#-ai-api-setup)
* [Running the Project Locally](#-running-the-project-locally)
* [Production Deployment](#-production-deployment)
* [Project Structure](#-project-structure)
* [Workflow Gallery](#-workflow-gallery)
* [Authentication](#-authentication)
* [AI Roadmap Generation](#-ai-roadmap-generation)
* [Security](#-security)
* [Troubleshooting](#-troubleshooting)
* [Future Enhancements](#-future-enhancements)
* [Contributing](#-contributing)
* [License](#-license)

---

# 🧠 About FlowState

FlowState is an **AI Tutor and learning-roadmap platform** built primarily for engineering students.

A student may know that they want to:

> "Learn Web Development"

but may not know:

* Where to begin
* Which technologies to learn first
* What prerequisites are required
* How HTML, CSS, JavaScript, React, and backend technologies connect
* What projects they should build
* How to progress from beginner to advanced topics

FlowState addresses this problem by converting a broad learning intention into a **structured learning journey**.

For example:

```text
User Intent
     ↓
"Learn Web Development"
     ↓
AI understands the topic
     ↓
Structured roadmap
     ↓
HTML
  ↓
CSS
  ↓
JavaScript
  ↓
Git & GitHub
  ↓
React
  ↓
Backend
  ↓
Database
  ↓
Full-Stack Projects
```

The goal is to reduce the gap between:

**"I want to learn something"**

and

**"I know exactly what I should do next."**

---

# 🎯 Problem Statement

Students frequently encounter several problems while learning technical subjects independently:

1. Too many learning resources
2. Lack of a clear learning sequence
3. Difficulty identifying prerequisites
4. Uncertainty about what to learn next
5. Difficulty converting theory into projects
6. Lack of personalized guidance
7. Difficulty tracking their learning journey

Traditional search engines provide information, but they generally don't provide a **personalized learning workflow**.

FlowState attempts to solve this by combining:

* Artificial Intelligence
* Personalized learning paths
* Structured workflows
* Interactive UI
* Authentication
* Learning progression

---

# 💡 Our Solution

FlowState acts as an **AI-powered learning companion**.

The platform allows students to explore learning topics and receive structured roadmaps containing:

* Learning objectives
* Topics
* Subtopics
* Recommended progression
* Practice activities
* Project ideas
* Skill progression

The system is designed around the idea that learning should happen as a **flow**, rather than as a random collection of tutorials.

---

# ✨ Key Features

## 🤖 AI Tutor

The core feature of FlowState is its AI Tutor.

Students can describe what they want to learn using natural language.

Example:

```text
I want to learn React.
```

The AI can transform this broad request into an organized learning path.

---

## 🗺️ Personalized Learning Roadmaps

FlowState generates structured learning roadmaps instead of returning only a conventional text answer.

A roadmap can contain:

```text
Topic
 ├── Fundamentals
 │    ├── Concept 1
 │    ├── Concept 2
 │    └── Concept 3
 │
 ├── Intermediate
 │    ├── Concept 4
 │    └── Concept 5
 │
 ├── Advanced
 │    ├── Concept 6
 │    └── Concept 7
 │
 └── Projects
      ├── Project 1
      └── Project 2
```

---

## 🔎 Intent-Based Learning

FlowState is designed to understand the user's **learning intent**.

Instead of requiring the user to know exactly what to search for, the system can help break down broad intentions into more specific learning directions.

Example:

```text
Study
 │
 ├── Study HTML
 ├── Study JavaScript
 ├── Study React
 ├── Study Python
 └── Study Machine Learning
```

This makes the learning experience more accessible to beginners.

---

## 🧩 Workflow Gallery

FlowState contains a **Workflow Gallery** where users can explore predefined learning workflows.

The gallery provides a visual way of discovering different learning journeys.

Workflows can represent paths such as:

* Web Development
* Programming
* Artificial Intelligence
* Machine Learning
* Data Science
* Other technical learning paths

The workflow interface is designed to make learning journeys more visual and interactive.

---

## 🔐 Authentication

FlowState uses Firebase Authentication to provide secure user authentication.

Depending on the configured authentication methods, users can sign in using supported authentication providers.

Authentication allows FlowState to provide a more personalized experience for individual users.

---

# 🔄 Workflow

The overall FlowState experience can be represented as:

```text
                 ┌─────────────────┐
                 │      User       │
                 └────────┬────────┘
                          │
                          ▼
                ┌───────────────────┐
                │ Enter Learning    │
                │      Intent       │
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐
                │   Intent / Topic  │
                │   Understanding   │
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐
                │    AI Tutor       │
                │    Processing     │
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐
                │ Learning Roadmap  │
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐
                │ Learn → Practice  │
                │ → Build Projects  │
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐
                │ Continue Learning │
                └───────────────────┘
```

---

# 🌐 Website Walkthrough

## 1. Landing Page

Visit:

**https://flowstate-two-steel.vercel.app/**

The landing page introduces FlowState and explains its purpose as an AI-powered learning platform.

The landing experience is designed to communicate the central idea:

> Turn your learning goal into a structured journey.

---

## 2. Explore the Platform

Navigate through the available sections of the website to understand the FlowState ecosystem.

The interface introduces the platform's major capabilities and how AI can assist students with learning.

---

## 3. AI Tutor

The **AI Tutor** is the central learning functionality.

A student can provide a learning objective such as:

```text
I want to learn Python.
```

or:

```text
I want to become a full-stack developer.
```

The AI then processes the request and produces a structured learning direction.

---

## 4. Generate a Roadmap

After providing a learning objective, the AI Tutor generates a roadmap.

The roadmap organizes the subject into a logical sequence.

For example:

```text
Python
 │
 ├── Syntax & Fundamentals
 ├── Data Types
 ├── Control Flow
 ├── Functions
 ├── Object-Oriented Programming
 ├── File Handling
 ├── Libraries
 └── Projects
```

---

## 5. Workflow Gallery

The **Workflow Gallery** allows users to explore learning workflows visually.

Each workflow represents a structured path that can guide the learner through a particular technical domain.

The gallery is intended to become an interactive discovery layer of FlowState rather than simply a collection of static cards.

---

## 6. Learn More

The **Learn More** section provides additional information about the purpose and capabilities of FlowState.

It can be used to understand:

* Why FlowState was created
* The problem it addresses
* How AI is integrated
* How students can use the platform
* The overall learning philosophy

---

# 🛠️ Technology Stack

The project can be organized around the following technologies.

### Frontend

* React
* JavaScript / TypeScript, depending on implementation
* HTML
* CSS
* Vite, if used by the current frontend
* Modern responsive UI

### Authentication

* Firebase Authentication

### AI

* AI model/API provider configured by the project
* Prompt-based roadmap generation
* Natural-language intent understanding

### Deployment

* Vercel

### Version Control

* Git
* GitHub

---

# 🏗️ Project Architecture

A simplified architecture is:

```text
                     FLOWSTATE
                         │
             ┌───────────┴───────────┐
             │                       │
             ▼                       ▼
        Frontend                 Firebase
             │                  Authentication
             │
             ▼
        AI Tutor UI
             │
             ▼
       API / AI Layer
             │
             ▼
        AI Model/API
             │
             ▼
      Generated Roadmap
             │
             ▼
         User UI
```

If a separate backend is present in your current source code, the architecture becomes:

```text
User
 │
 ▼
React Frontend
 │
 ▼
Backend / API
 │
 ├──────────────► Firebase
 │
 └──────────────► AI Provider
                       │
                       ▼
                  AI Response
                       │
                       ▼
                  Roadmap Data
                       │
                       ▼
                   Frontend
```

---

# 📋 Prerequisites

Before running FlowState locally, install:

### 1. Node.js

Install a current LTS version of Node.js.

Verify:

```bash
node --version
```

and:

```bash
npm --version
```

---

### 2. Git

Verify:

```bash
git --version
```

---

### 3. Firebase Account

A Firebase project is required if authentication is enabled.

---

### 4. AI API Account

An API key for the AI provider configured by the project is required.

---

# 📥 Installation & Setup

## Step 1 — Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Move into the project:

```bash
cd flowstate
```

---

## Step 2 — Install Dependencies

Run:

```bash
npm install
```

---

## Step 3 — Configure Environment Variables

Create a `.env` file in the appropriate project directory.

For a Vite frontend, this will typically be:

```text
.env
```

Example:

```env
# Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# AI Provider
VITE_AI_API_KEY=your_ai_api_key
```

**Important:** Use the exact variable names expected by the source code. If your project currently uses different names, keep those names instead of copying the example blindly.

---

# 🔑 Environment Variables & API Keys

FlowState may require the following credentials depending on the current implementation.

| Variable                     | Purpose                                 | Required                            |
| ---------------------------- | --------------------------------------- | ----------------------------------- |
| Firebase API Key             | Connects the frontend to Firebase       | Yes, if Firebase is used            |
| Firebase Auth Domain         | Firebase authentication configuration   | Yes                                 |
| Firebase Project ID          | Identifies Firebase project             | Yes                                 |
| Firebase Storage Bucket      | Firebase storage configuration          | If storage is used                  |
| Firebase Messaging Sender ID | Firebase configuration                  | Usually required by Firebase config |
| Firebase App ID              | Identifies the Firebase web application | Yes                                 |
| AI API Key                   | Authenticates AI API requests           | Yes, if AI API is used              |
| Backend URL                  | Connects frontend to backend            | Only if separate backend exists     |

### Do NOT commit API keys

Never upload:

```text
.env
```

to GitHub if it contains private credentials.

Add it to `.gitignore`:

```gitignore
.env
.env.local
.env.*.local
```

---

# 🔥 Firebase Setup

FlowState uses Firebase for authentication.

## Step 1 — Open Firebase Console

Go to:

https://console.firebase.google.com/

Create a new Firebase project or select the project already associated with FlowState.

---

## Step 2 — Open Project Settings

Inside Firebase:

```text
Firebase Console
      ↓
Project
      ↓
Project Settings
      ↓
General
      ↓
Your Apps
```

---

## Step 3 — Create / Select Web App

Under **Your Apps**, select the Web application.

If you haven't created one:

```text
Add App
   ↓
Web
   ↓
Register App
```

Firebase will provide configuration values similar to:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

These values should correspond to the Firebase environment variables used by FlowState.

---

## Step 4 — Enable Authentication

Go to:

```text
Firebase Console
      ↓
Authentication
      ↓
Sign-in method
```

Enable the authentication providers used by the application.

For example:

```text
Google
```

if Google authentication is implemented.

---

# 🤖 AI API Setup

FlowState requires an AI model/API to generate intelligent learning-roadmap responses.

The exact provider depends on the implementation currently used by the project.

Typical configuration:

```env
VITE_AI_API_KEY=your_api_key
```

If the AI API is called through a backend rather than directly from the browser, the key should instead be stored **only on the backend**.

### Recommended architecture

```text
Frontend
   │
   │ User request
   ▼
Backend API
   │
   │ API key stored securely
   ▼
AI Provider
   │
   ▼
AI response
   │
   ▼
Frontend
```

Avoid exposing private server-side API keys in browser-side JavaScript.

---

# ▶️ Running the Project Locally

After configuring the environment variables:

```bash
npm run dev
```

Vite-based projects typically display a local address similar to:

```text
http://localhost:5173
```

Open the displayed URL in your browser.

---

# 🏭 Production Build

To create a production build:

```bash
npm run build
```

Then preview it locally if supported:

```bash
npm run preview
```

---

# ☁️ Production Deployment with Vercel

FlowState is deployed using Vercel.

Live website:

**https://flowstate-two-steel.vercel.app/**

To deploy your own version:

### Step 1

Push the project to GitHub.

```bash
git add .
git commit -m "Initial FlowState deployment"
git push
```

### Step 2

Open Vercel and import the GitHub repository.

### Step 3

Configure the required environment variables in:

```text
Vercel
 → Project
 → Settings
 → Environment Variables
```

Add the same variables required by the application.

### Step 4

Redeploy the application.

---

# 🧩 Project Structure

A typical FlowState structure may look like:

```text
flowstate/
│
├── public/
│   ├── images/
│   └── assets/
│
├── src/
│   ├── components/
│   │   ├── Navbar/
│   │   ├── Hero/
│   │   ├── WorkflowGallery/
│   │   ├── AITutor/
│   │   └── Roadmap/
│   │
│   ├── pages/
│   │   ├── Home/
│   │   ├── Tutor/
│   │   └── LearnMore/
│   │
│   ├── services/
│   │   ├── firebase.js
│   │   └── ai.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

**Note:** The exact directory structure should follow the actual repository.

---

# 🖼️ Workflow Gallery

The Workflow Gallery is one of FlowState's visual discovery features.

Its purpose is to allow users to explore predefined learning workflows.

A workflow can represent:

```text
Learning Goal
      ↓
Prerequisites
      ↓
Fundamentals
      ↓
Intermediate Skills
      ↓
Advanced Skills
      ↓
Projects
      ↓
Career / Further Learning
```

### Example

A Web Development workflow might contain:

```text
Web Development
       │
       ├── HTML
       │
       ├── CSS
       │
       ├── JavaScript
       │
       ├── Git & GitHub
       │
       ├── React
       │
       ├── Backend
       │
       ├── Databases
       │
       └── Full-Stack Projects
```

The gallery can therefore act as a visual entry point into the AI Tutor and roadmap system.

---

# 🔐 Authentication Flow

The authentication system follows a general flow:

```text
User
 │
 ▼
Login / Sign Up
 │
 ▼
Firebase Authentication
 │
 ├── Successful
 │       ↓
 │   Authenticated User
 │       ↓
 │   FlowState Dashboard
 │
 └── Failed
         ↓
      Error Message
```

Firebase handles authentication while FlowState uses the authenticated state to provide the appropriate user experience.

---

# 🧠 AI Roadmap Generation

The AI Tutor can be conceptually divided into three stages.

## Stage 1 — Understand

The system receives the user's learning goal.

Example:

```text
"I want to learn machine learning."
```

---

## Stage 2 — Structure

The AI identifies the relevant learning progression.

Example:

```text
Python
   ↓
Mathematics
   ↓
Statistics
   ↓
NumPy / Pandas
   ↓
Machine Learning Fundamentals
   ↓
Algorithms
   ↓
Model Evaluation
   ↓
Projects
```

---

## Stage 3 — Present

The generated learning structure is converted into a user-friendly roadmap.

The result should be easier to follow than a generic AI response because the information is organized into a progression.

---

# 🛡️ Security

## Never expose private API keys

Do not place private server-side API keys directly inside frontend source code.

Avoid:

```javascript
const API_KEY = "actual-secret-key";
```

Instead use environment variables.

---

## Do not commit `.env`

Make sure:

```gitignore
.env
.env.local
.env.*.local
```

is present in `.gitignore`.

---

## Rotate exposed keys

If an API key has accidentally been pushed to GitHub:

1. Revoke the exposed key.
2. Generate a new key.
3. Update your environment variables.
4. Remove the exposed credential from the repository history if necessary.

---

# 🐛 Troubleshooting

## Firebase configuration error

If Firebase authentication does not work, verify:

```text
API Key
Auth Domain
Project ID
App ID
```

Also verify that the required authentication provider is enabled in Firebase.

---

## AI API error

Check:

```text
1. API key exists
2. API key is correctly named
3. Environment variables loaded
4. AI provider endpoint is correct
5. API quota is available
6. Development server was restarted
```

After changing `.env`, restart the development server:

```bash
npm run dev
```

---

## Environment variables are undefined

If using Vite, frontend environment variables normally need the appropriate public prefix, commonly:

```text
VITE_
```

Example:

```env
VITE_FIREBASE_API_KEY=...
```

After changing environment variables, restart the development server.

---

## Deployment works locally but not on Vercel

Check:

```text
Vercel
 → Project
 → Settings
 → Environment Variables
```

Make sure the required variables are configured for the appropriate deployment environment.

Then trigger a new deployment.

---

# 🚀 Future Enhancements

Potential future improvements include:

### 📊 Learning Progress Tracking

Allow students to mark roadmap sections as:

```text
Not Started
      ↓
In Progress
      ↓
Completed
```

---

### 🧠 More Personalized AI

The AI could consider:

* Current skill level
* Available study time
* Previous knowledge
* Learning goals
* Preferred learning style
* Completed roadmap sections

---

### 🏆 Gamification

Possible additions:

* XP
* Streaks
* Achievements
* Milestones
* Progress levels

---

### 📚 Resource Recommendations

Each roadmap section could contain curated:

* Documentation
* Tutorials
* Videos
* Articles
* Practice exercises
* Projects

---

### 📈 Progress Dashboard

A dedicated dashboard could display:

```text
Overall Progress
████████████░░░░ 75%

Topics Completed
12 / 16

Current Goal
React Development

Current Module
State Management
```

---

### 🤝 Community Learning

Future versions could allow students to:

* Share roadmaps
* Share projects
* Collaborate
* Discuss topics
* Compare learning progress

---

# 🤝 Contributing

Contributions are welcome.

### 1. Fork the repository

```bash
git clone <YOUR_REPOSITORY_URL>
```

### 2. Create a branch

```bash
git checkout -b feature/new-feature
```

### 3. Make your changes

Implement and test the feature.

### 4. Commit

```bash
git add .
git commit -m "Add new feature"
```

### 5. Push

```bash
git push origin feature/new-feature
```

### 6. Open a Pull Request

Describe:

* What you changed
* Why you changed it
* How it was tested

---

# 📄 License

Add the project's chosen license here.

For example:

```text
MIT License
```

If this project is being submitted as an academic/college project, replace this section with the licensing or usage terms required by your institution.

---

# 🌐 Live Demo

## FlowState

**AI-powered learning and roadmap platform**

🔗 **https://flowstate-two-steel.vercel.app/**

---

# 🎓 Project Summary

FlowState is designed around a simple principle:

> **Learning should have a flow.**

Instead of leaving students to navigate an overwhelming collection of disconnected resources, FlowState aims to provide a structured path from **learning intention → roadmap → practice → projects → progress**.

The combination of AI, personalized roadmaps, authentication, and interactive workflows creates a foundation for a modern learning platform designed specifically around the needs of engineering students.

---

## ⭐ Quick Start

For someone who just wants to run the project:

```bash
# Clone
git clone <YOUR_REPOSITORY_URL>

# Enter project
cd flowstate

# Install dependencies
npm install

# Configure environment variables
# Create .env and add the required Firebase + AI credentials

# Start development server
npm run dev
```

Then open the local URL shown in the terminal.

### Live Version

https://flowstate-two-steel.vercel.app/
