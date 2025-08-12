# AI Chatbot Application

A simple AI chatbot application that simulates conversation similar to ChatGPT. This application includes a React frontend and Node.js/Express backend.

## Features

- Chat interface similar to ChatGPT
- Conversation history tracking
- Markdown support for messages
- Code syntax highlighting
- Simple AI response generation based on keywords

## Project Structure

```
├── client/             # React frontend
│   ├── public/         # Static files
│   └── src/            # React source code
│       ├── components/ # React components
│       └── App.js      # Main React component
└── server/             # Node.js backend
    ├── controllers/    # Request handlers
    ├── routes/         # API routes
    └── index.js        # Server entry point
```

## Installation

1. Clone the repository
2. Install dependencies for both the server and client:

```bash
npm run install-all
```

## Running the Application

### Development Mode

To run both the server and client in development mode:

```bash
npm run dev
```

This will start the server on port 5000 and the client on port 3000.

### Server Only

To run only the server:

```bash
npm run server
```

### Client Only

To run only the client:

```bash
npm run client
```

## How It Works

1. The frontend sends user messages to the backend API
2. The backend processes the message and generates a response
3. The response is sent back to the frontend and displayed in the chat
4. Conversation history is maintained on the server

## Technologies Used

- **Frontend**:
  - React
  - Styled Components
  - Axios
  - React Markdown
  - React Syntax Highlighter

- **Backend**:
  - Node.js
  - Express
  - CORS
  - dotenv

## License

MIT