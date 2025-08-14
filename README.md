markdown
# Revolt Motors Voice Chat Clone

A complete implementation of a real-time voice assistant for Revolt Motors using Google's Gemini Live API, replicating the functionality of their production chatbot.

## 🌟 Features

- 🎙️ Real-time voice conversations with AI assistant
- ✋ User interruption support (barge-in functionality)
- ⚡ Low latency responses (1-2 seconds target)
- 🖥️ Clean, responsive user interface
- 🔒 Server-to-server architecture
- 🌐 Focused exclusively on Revolt Motors topics

## 🛠️ Prerequisites

Before you begin, ensure you have:

- Node.js v18 or higher
- npm v9 or higher
- Google Cloud account with Gemini API enabled
- Microphone-enabled device
- Modern browser (Chrome recommended)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/revolt-voice-chat.git
   cd revolt-voice-chat
Install dependencies

bash
npm install
Set up environment variables

Create a .env file:

bash
cp .env.example .env
Edit .env with your credentials:

env
GEMINI_API_KEY=your_actual_api_key_here
PORT=3000
NODE_ENV=development
Run the application

bash
npm start
Access the application
Open http://localhost:3000 in your browser

🏗️ Project Structure
text
revolt-voice-chat/
├── public/            # All client-facing assets
│   ├── css/           # Stylesheets
│   ├── js/            # Client-side JavaScript
│   ├── audio/         # Temporary audio storage
│   └── index.html     # Main interface
├── routes/            # API endpoints
│   └── api.js         # Voice chat API routes
├── services/          # Core services
│   ├── gemini.js      # Gemini API wrapper
│   └── audio.js       # Audio processing
├── app.js             # Express application
├── package.json       # Dependencies
└── README.md          # This file
🔧 Configuration
Gemini Models
Edit services/gemini.js to switch models:

javascript
// For production
const model = 'gemini-2.5-flash-preview-native-audio-dialog';

// For development (higher rate limits)
// const model = 'gemini-2.0-flash-live-001';
System Instructions
The AI behavior is controlled by this prompt in services/gemini.js:

javascript
const systemInstructions = `
You are "Rev", the official AI assistant for Revolt Motors. 
Your knowledge is strictly limited to:

- Revolt Motors electric vehicles (RV300, RV400, etc.)
- Charging infrastructure and battery technology
- Company history and leadership
- Dealer network and test drives
- Pricing and financing options

For any off-topic questions, respond with:
"I'm specialized in Revolt Motors products. How can I help you with our electric vehicles?"
`;
🎯 Key Implementation Details
Voice Processing Flow
Browser captures microphone input via Web Audio API

Audio stream sent to backend as chunks

Server processes with Gemini Live API

Text response converted to speech via Web Speech API

Audio streamed back to client

Interruption Handling
The system uses the Gemini API's native interruption support:

javascript
// In services/gemini.js
const handleInterruption = () => {
  // Gemini API automatically handles interruptions
  // We just need to manage the audio streams
  audioProcessor.stopCurrentPlayback();
  startNewSession();
};
🧪 Testing
Manual Tests
Basic Conversation

Ask about Revolt Motors products

Verify relevant responses

Interruption Test

Speak while AI is responding

Verify immediate stop and new response

Latency Test

Measure time between question and response

Should be 1-2 seconds

Off-topic Test

Ask unrelated questions

Verify redirection to Revolt topics

Automated Tests
Run test suite with:

bash
npm test
🚨 Troubleshooting
Issue	Solution
API quota exceeded	Switch to development model or request quota increase
Microphone access blocked	Check browser permissions and HTTPS requirement
High latency	Reduce audio chunk size, check network speed
Audio distortion	Adjust sample rate in services/audio.js
🌍 Deployment
Heroku Example
Create new Heroku app

Set config vars:

bash
heroku config:set GEMINI_API_KEY=your_key
heroku config:set NODE_ENV=production
Push to Heroku:

bash
git push heroku main
Required Production Settings
HTTPS mandatory for microphone access

Environment variables set properly

Process manager (PM2 recommended)

📚 Resources
Gemini Live API Docs
This is the live video you can see https://drive.google.com/file/d/1Z0F8SbteQAiq_JumYeV7knOwoXbMA86L/view?usp=drive_link

Web Audio API

Express.js

Revolt Motors Live Demo

📄 License
MIT License - See LICENSE for details.

📧 Contact
For support, please contact: vaishnavii8319@gmail.com

text

This comprehensive README includes:

1. All setup instructions
2. Detailed configuration options
3. Implementation specifics
4. Testing procedures
5. Deployment guides
6. Troubleshooting help
7. Licensing information

The file is ready to use - just:
1. Replace placeholder values (like GitHub URL, email)
2. Ensure it matches your actual project structure
3. Add a LICENSE file if needed
4. Commit to your repository

5. <img width="1897" height="1045" alt="Screenshot 2025-08-14 121328" src="https://github.com/user-attachments/assets/bc31a175-b23c-49ab-9fde-cd8d761091c9" />

