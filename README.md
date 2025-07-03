# 🎬 Movie App - React Native & Expo

A comprehensive movie discovery and management app built with React Native, Expo, and modern technologies. Discover trending movies, search for your favorites, save them to your collection, and manage your viewing preferences.

## ✨ Features

### 🔐 Authentication
- User registration and login
- Secure session management with Appwrite
- Password reset functionality
- User profile management

### 🎥 Movie Discovery
- Browse trending and popular movies
- Advanced search functionality
- Detailed movie information (ratings, overview, release date)
- High-quality movie posters and images

### 💾 Personal Collection
- Save/unsave movies to your personal collection
- View all saved movies in a dedicated tab
- Real-time sync across devices

### ⚙️ Settings & Preferences
- Account settings management
- Notification preferences
- Privacy settings
- User profile customization

### 📱 Modern UI/UX
- Beautiful, responsive design with NativeWind (Tailwind CSS)
- Smooth animations and transitions
- Dark theme optimized for movie viewing
- Tab-based navigation with custom icons

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Appwrite (Authentication, Database, Storage)
- **API**: The Movie Database (TMDB) API
- **State Management**: React Context API
- **Storage**: AsyncStorage for local data persistence
- **TypeScript**: Full TypeScript support

## 📁 Project Structure

```
mobile_movie_app/
├── app/                    # Main app screens (Expo Router)
│   ├── (auth)/            # Authentication screens
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/            # Main tab navigation
│   │   ├── index.tsx      # Home/Trending
│   │   ├── search.tsx     # Search movies
│   │   ├── saved.tsx      # Saved movies
│   │   └── profile.tsx    # User profile
│   ├── movies/            # Movie details
│   │   └── [id].tsx       # Dynamic movie details page
│   ├── settings/          # Settings screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── MovieCard.tsx
│   ├── SearchBar.tsx
│   └── TrendingCard.tsx
├── services/              # API and backend services
│   ├── api.tsx           # TMDB API integration
│   ├── auth.ts           # Authentication service
│   └── appwrite.ts       # Appwrite configuration
├── contexts/              # React Context providers
│   ├── SessionContext.tsx
│   └── SavedMoviesContext.tsx
├── constants/             # App constants
│   ├── icons.ts
│   └── images.ts
└── assets/               # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mobile_movie_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory and add the following:
   ```env
   # TMDB API
   EXPO_PUBLIC_MOVIE_API_KEY=your_tmdb_api_key

   # Appwrite Configuration
   EXPO_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
   EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id

   # Database Configuration
   EXPO_PUBLIC_DATABASE_ID=your_database_id
   EXPO_PUBLIC_USERS_COLLECTION_ID=your_users_collection_id
   EXPO_PUBLIC_SESSIONS_COLLECTION_ID=your_sessions_collection_id
   EXPO_PUBLIC_SAVED_MOVIES_COLLECTION_ID=your_saved_movies_collection_id
   EXPO_PUBLIC_METRICS_COLLECTION_ID=your_metrics_collection_id
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

### Running on Different Platforms

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Web**: Press `w` in the terminal
- **Expo Go**: Scan the QR code with the Expo Go app

## 🔧 Configuration

### TMDB API Setup

1. Visit [The Movie Database (TMDB)](https://www.themoviedb.org/)
2. Create an account and get your API key
3. Add the API key to your `.env` file

### Appwrite Setup

1. Create an [Appwrite](https://appwrite.io/) account
2. Create a new project
3. Set up the following collections in your database:
   - **Users**: Store user information
   - **Sessions**: Manage user sessions
   - **Saved Movies**: Store user's saved movies
   - **Metrics**: Track app usage (optional)

## 🎯 Key Features Implementation

### Authentication Flow
- Session-based authentication with Appwrite
- Secure password hashing and validation
- Automatic session refresh and validation

### Movie Data Management
- Real-time fetching from TMDB API
- Local caching for better performance
- Offline support for saved movies

### State Management
- Global state management using React Context
- Persistent storage with AsyncStorage
- Real-time updates across components

## 📱 Screens Overview

1. **Home/Trending**: Display popular and trending movies
2. **Search**: Search for movies with real-time results
3. **Saved Movies**: View and manage saved movie collection
4. **Movie Details**: Detailed information about selected movies
5. **Profile**: User account and preferences
6. **Settings**: App configuration and user preferences
7. **Authentication**: Login, signup, and password reset

## 🧪 Testing

Run the app in development mode:
```bash
npx expo start --clear
```

For production builds:
```bash
npx expo build
```

## 🔒 Security

- Secure API key management
- Session-based authentication
- Input validation and sanitization
- Secure storage of sensitive data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for the movie data API
- [Appwrite](https://appwrite.io/) for backend services
- [Expo](https://expo.dev/) for the development platform
- [NativeWind](https://www.nativewind.dev/) for styling

## 📧 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using React Native and Expo**
