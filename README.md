# Voice Chat App

A ChatGPT-style voice chat mobile app with a warm aurora animation, powered by Ollama.

## Architecture

- **Backend**: NestJS + Socket.IO + TypeORM/SQLite + Ollama streaming
- **Mobile**: React Native (Expo) + Skia GPU shader + Reanimated + Speech Recognition

## Quick Start

### 1. Start Ollama

```bash
ollama serve
```

### 2. Start Backend

```bash
cd backend
npm install
npm run start:dev
```

Or with Docker:

```bash
cd backend
docker compose up --build
```

### 3. Start Mobile

```bash
cd mobile
npx expo run:ios
# or
npx expo run:android
```

> **Note**: This app requires a dev client build (not Expo Go) because it uses
> native modules: `expo-speech-recognition`, `@shopify/react-native-skia`.

## Voice Flow

1. Tap the mic button to enter voice mode
2. **Listening** – speak and watch the aurora glow react to your voice
3. **Thinking** – speech is sent to Ollama; aurora pulses purple
4. **Answering** – AI response streams in and is spoken aloud; aurora glows pink
5. When TTS finishes, returns to idle

## Configuration

Set `OLLAMA_MODEL` environment variable to change the model (default: `llama3.1:8b-instruct-q4_K_M`).
