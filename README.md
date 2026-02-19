# 🏆 AI Debate Arena

A **Full Stack MERN web application** for AI-powered structured debate practice. Users can debate against an intelligent AI opponent in both **voice and text modes**, with automatic scoring, winner declaration, and debate history tracking.

---

## 🌐 Live Demo

> Run locally using the setup instructions below.

---

## 📸 Features

- 🎙️ **Voice & Text Debate Modes** — Speak or type your arguments
- 🤖 **Real-time AI Counter-Arguments** — Powered by Google Gemini 2.5 Flash
- 📊 **Quality-Based Automatic Scoring** — Multi-factor argument analysis
- 🏆 **Winner Declaration** — With key points extracted from the debate
- 🎓 **Three Difficulty Levels** — School, College, and Professional
- 🔐 **Google OAuth Login** — Secure authentication via Google account
- 📜 **Debate History** — All completed debates saved and viewable anytime
- ⏱️ **Customizable Timer** — Set debate duration from 1 to 60 minutes
- 🎨 **Animated UI** — Smooth transitions using Framer Motion
- 🔄 **Fallback System** — Pre-written responses if AI API is unavailable

---

## 🛠️ Tech Stack

### Frontend

| Technology          | Purpose                       |
| ------------------- | ----------------------------- |
| React.js            | UI and state management       |
| Tailwind CSS        | Responsive styling            |
| Framer Motion       | Animations and transitions    |
| Lucide React        | Icons                         |
| Web Speech API      | Voice input (speech to text)  |
| SpeechSynthesis API | Voice output (text to speech) |

### Backend

| Technology    | Purpose                            |
| ------------- | ---------------------------------- |
| Node.js       | Runtime environment                |
| Express.js    | REST API server                    |
| MongoDB Atlas | Cloud database                     |
| Mongoose      | Schema and query handling          |
| Passport.js   | Google OAuth 2.0 authentication    |
| JWT           | Secure token-based sessions        |
| CORS          | Cross-origin request handling      |
| Dotenv        | Environment variable management    |
| Nodemon       | Auto server restart in development |

### AI & APIs

| Technology              | Purpose                       |
| ----------------------- | ----------------------------- |
| Google Gemini 2.5 Flash | AI debate response generation |
| Google OAuth 2.0        | User login via Google account |

---

## 📁 Project Structure

```
ai-debate-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── DebateApp.js        ← Main debate logic & UI
│   ├── utils/
│   │   ├── aiService.js
│   │   └── speechUtils.js
│   ├── App.js                  ← Auth + routing + history
│   ├── App.css
│   └── index.js
├── debate-backend/             ← Node.js backend
│   ├── config/
│   │   └── passport.js         ← Google OAuth setup
│   ├── middleware/
│   │   └── authMiddleware.js   ← JWT verification
│   ├── models/
│   │   ├── User.js             ← User schema
│   │   └── Debate.js           ← Debate history schema
│   ├── routes/
│   │   ├── auth.js             ← Login/logout routes
│   │   └── debates.js          ← Save/fetch debate routes
│   ├── .env                    ← Backend environment variables (not pushed)
│   ├── .gitignore
│   ├── package.json
│   └── server.js               ← Express server entry point
├── .env                        ← Frontend environment variables (not pushed)
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js installed
- MongoDB Atlas account (free)
- Google Cloud Console account (free)
- Google Gemini API key (free)

---

### 1. Clone the Repository

```bash
git clone https://github.com/vasavimotupalli444/ai-debate-arena.git
cd ai-debate-arena
```

---

### 2. Frontend Setup

```bash
npm install
```

Create a `.env` file in the **root folder**:

```env
REACT_APP_GOOGLE_AI_API_KEY=your_gemini_api_key_here
```

Start the React app:

```bash
npm start
```

Runs on → `http://localhost:3000`

---

### 3. Backend Setup

```bash
cd debate-backend
npm install
```

Create a `.env` file inside the **debate-backend folder**:

```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/debateapp?appName=Cluster0
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
JWT_SECRET=any_long_random_string_here
SESSION_SECRET=another_long_random_string_here
CLIENT_URL=http://localhost:3000
PORT=5000
```

Start the backend server:

```bash
npm run dev
```

Runs on → `http://localhost:5000`

---

## 🔑 Environment Variables Guide

### Frontend — `.env` (root folder)

| Variable                      | Description           | How to Get                                                       |
| ----------------------------- | --------------------- | ---------------------------------------------------------------- |
| `REACT_APP_GOOGLE_AI_API_KEY` | Google Gemini API key | [aistudio.google.com](https://aistudio.google.com) → Get API Key |

---

### Backend — `debate-backend/.env`

| Variable               | Description                | How to Get                                                                                   |
| ---------------------- | -------------------------- | -------------------------------------------------------------------------------------------- |
| `MONGO_URI`            | MongoDB connection string  | [mongodb.com](https://mongodb.com) → Cluster → Connect → Drivers                             |
| `GOOGLE_CLIENT_ID`     | Google OAuth Client ID     | [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Same as above                                                                                |
| `JWT_SECRET`           | Secret key for JWT tokens  | Type any long random string                                                                  |
| `SESSION_SECRET`       | Secret key for sessions    | Type any other long random string                                                            |
| `CLIENT_URL`           | Frontend URL               | `http://localhost:3000` for development                                                      |
| `PORT`                 | Backend server port        | `5000`                                                                                       |

---

## 🔐 Getting API Keys

### Google Gemini API Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **"Get API Key"**
3. Create a new key and copy it
4. Paste into frontend `.env` as `REACT_APP_GOOGLE_AI_API_KEY`

---

### Google OAuth Credentials

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. Go to **APIs & Services → OAuth Consent Screen** → External → Fill details
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
5. Application type: **Web application**
6. Authorized redirect URI: `http://localhost:5000/auth/google/callback`
7. Copy **Client ID** and **Client Secret**
8. Paste into `debate-backend/.env`

---

### MongoDB URI

1. Go to [mongodb.com](https://mongodb.com) → Create free account
2. Create a free **M0 cluster**
3. Go to **Database Access** → Add a user with username and password
4. Go to **Network Access** → Allow access from anywhere
5. Click **Connect → Drivers** → Copy the connection string
6. Replace `<password>` with your actual password and add `/debateapp` before `?`
7. Paste into `debate-backend/.env` as `MONGO_URI`

---

## 🚀 Running the Project

Open **two terminals** simultaneously:

**Terminal 1 — Backend:**

```bash
cd debate-backend
npm run dev
```

**Terminal 2 — Frontend:**

```bash
cd ai-debate-app
npm start
```

Open `http://localhost:3000` in **Chrome or Edge** (required for voice features).

---

## 🎯 How to Use

1. Open the app and click **"Continue with Google"** to login
2. Select a **debate topic** or enter a custom one
3. Choose your **difficulty level** — School, College, or Professional
4. Select **debate mode** — Voice or Text
5. Set the **debate timer** (1–60 minutes)
6. Click **"Start Debate"** and share your opening argument
7. AI will respond with a counter-argument
8. Continue debating until the timer ends
9. View **results, scores, and key points** on the summary screen
10. Click **"📜 My History"** to view all past debates

---

## ⚠️ Important Notes

- Voice mode works only on **Chrome or Edge** browsers
- Gemini free tier allows **15 requests per minute**
- All `.env` files are excluded from Git for security
- Never share your API keys publicly
- MongoDB free tier (M0) is sufficient for this project

---

## 👩‍💻 Developer

**Vasavi Motupalli**

- GitHub: [@vasavimotupalli444](https://github.com/vasavimotupalli444)

---

## 📄 License

This project is for educational purposes.
