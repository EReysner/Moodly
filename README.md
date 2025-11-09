# Moodly

Modern mental health and wellness application built with React Native and Expo, designed to help users track their emotional well-being and access psychological support.

## Description

Moodly is a comprehensive mental health platform that allows users to monitor their daily mood, access wellness activities, and connect with a supportive community. The app offers an interactive experience with AI chat assistance, voice integration, and detailed progress analytics.

## Features

- Mood tracking with emotional pattern analysis
- AI Chat Assistant for psychological support
- Curated wellness activities and resources
- Community features to connect with others
- Voice-to-text integration for natural interaction
- Progress analytics with charts and statistics
- Cross-platform compatibility (iOS, Android, Web)
- Real-time data synchronization

## Screenshots

| Home Screen | Activities Screen |
|-------------|-------------------|
| ![Moodly Home Screen](./assets/images/MoodlyInicio.png) | ![Moodly Activities Screen](./assets/images/MoodlyActividades.png) |

## Technologies Used

- **Frontend**: React Native, Expo, TypeScript
- **Backend**: Supabase (Database & Authentication)
- **Libraries**: React Native Reanimated, React Native Voice, React Native Paper
- **UI Components**: React Native Paper, Bootstrap Icons equivalent

## Project Structure

```
Moodly/
├── app/                     # Main application folder
│   ├── components/          # Reusable UI components
│   │   ├── activities/      # Activity-related components
│   │   ├── comunidad/       # Community features
│   │   ├── perfil/          # Profile components
│   │   └── hooks/           # Custom React hooks
│   ├── utils/               # Utilities and configurations
│   ├── assets/              # Images and animations
│   ├── index.tsx            # Welcome screen
│   ├── login.tsx            # Authentication screen
│   ├── register.tsx         # Registration screen
│   └── inicio.tsx           # Main dashboard
├── assets/                  # Static assets
├── package.json             # Project dependencies
└── tsconfig.json           # TypeScript configuration
```

## App Screens

- **index.tsx** - Welcome and onboarding screen
- **login.tsx** - User authentication
- **register.tsx** - New user registration
- **inicio.tsx** - Main dashboard with mood tracking

## Features

- Mood tracking system with data visualization
- AI-powered chat assistant for mental health support
- Community features for peer connection
- Activity recommendations based on user preferences
- Voice recognition for accessibility
- Real-time progress tracking and analytics

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

