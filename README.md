# ✦ AspenFashion – AI Style Intelligence

> AI-powered fashion intelligence app built with Google AI Studio and Gemini API

![AspenFashion](https://img.shields.io/badge/Powered%20by-Google%20Gemini%20AI-blueviolet?style=for-the-badge)
![License](https://img.shields.io/github/license/idigitalpro1/Aspen-Fashion?style=for-the-badge)

## 🌟 Features

- **💬 Style Chat** – Ask anything about fashion, trends, and outfit coordination
- **📸 Outfit Analysis** – Upload photos for AI-powered outfit feedback
- **🎨 Color Intelligence** – Personalized color palette and tone matching
- **📅 Occasion Styling** – Tailored outfits for any event or setting
- **🌍 Trend Reports** – AI-curated insights from global fashion
- **👤 Body Type Guide** – Styling tips that flatter your unique shape

## 🚀 Quick Start

### Option 1 – Open in Browser (no install)

1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Enter your free [Google AI Studio API key](https://aistudio.google.com/app/apikey)
4. Start chatting with your AI stylist!

```bash
git clone https://github.com/idigitalpro1/Aspen-Fashion.git
cd Aspen-Fashion
# Open index.html in your browser
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

### Option 2 – Serve Locally

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .

# Then visit http://localhost:8080
```

## 🔑 Getting Your API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account (free)
3. Click **Create API key**
4. Copy the key and paste it into the AspenFashion app

> **Privacy**: Your API key is stored only in your browser's session storage and is never transmitted to any server other than Google's Gemini API.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Google Gemini 2.0 Flash** | AI language model for fashion advice |
| **Google AI Studio** | API key management & model access |
| **HTML5 / CSS3 / JavaScript** | Frontend (no frameworks, no build step) |
| **Gemini REST API** | Real-time AI responses with conversation history |

## 📁 Project Structure

```
Aspen-Fashion/
├── index.html    # Main app shell & UI
├── styles.css    # Dark-mode fashion-forward design
├── app.js        # Gemini API integration & app logic
└── README.md     # This file
```

## 🎨 Using the App

1. **API Setup** – Connect your Gemini API key on first launch
2. **Quick Prompts** – Tap a suggestion to instantly ask about trends, capsule wardrobes, body types, and more
3. **Free Chat** – Type any fashion question and press **Send** (or `Enter`)
4. **Image Analysis** – Click 📸 **Add Photo** to upload an outfit photo for AI analysis
5. **Clear Chat** – Reset the conversation with the 🗑️ button

## 📜 License

[MIT](LICENSE)

---

Built with ❤️ using [Google AI Studio](https://aistudio.google.com) & the Gemini API
