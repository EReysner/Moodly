# Moodly

A mental health and wellness app built with React Native and Expo.

## Features

- **Mood Tracking** - Track your daily mood and emotional patterns
- **AI Chat Assistant** - Get psychological support through conversations
- **Wellness Activities** - Access curated mental health activities
- **Community** - Connect with others on wellness journeys
- **Voice Integration** - Use voice-to-text for natural interaction
- **Progress Analytics** - View charts and statistics of your progress
- **Cross-Platform** - Works on iOS, Android, and Web

## Screenshots

| Home Screen | Activities Screen |
|-------------|-------------------|
| ![Moodly Home Screen](./assets/images/MoodlyInicio.png) | ![Moodly Activities Screen](./assets/images/MoodlyActividades.png) |

## Tech Stack

- **React Native** with **Expo**
- **TypeScript**
- **Supabase** (Backend & Database)
- **React Native Reanimated** (Animations)
- **React Native Voice** (Speech recognition)
- **React Native Paper** (UI Components)



## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Add your credentials to `app/utils/supabase.ts`

3. **Run the app**
   ```bash
   npm start
   ```

4. **Platform-specific builds**
   ```bash
   npm run ios     # iOS
   npm run android # Android  
   npm run web     # Web
   ```

## Project Structure

```
app/
├── components/         # UI components
├── utils/             # Utilities and Supabase config
├── index.tsx          # Welcome screen
├── login.tsx          # Authentication
└── inicio.tsx         # Main dashboard
```

## Development

```bash
npm test        # Run tests
npm run lint    # Run linting
```
