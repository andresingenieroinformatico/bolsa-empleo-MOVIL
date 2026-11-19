# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Backend connection

The mobile app calls Laravel directly using `EXPO_PUBLIC_API_URL`; the default
in `.env.example` is the production API ending in `/api/v1`. Copy
`.env.example` to `.env.local` and set that variable to your API base URL.
`EXPO_PUBLIC_*` values are included in the client bundle, so never put Laravel
secrets or private OAuth keys there.

The optional Next.js gateway is a separate package in `src/Api`. To use it
instead of the direct Laravel API, configure its `DATABASE_URL`,
`LARAVEL_API_URL`, and private `JWT_SECRET` from `src/Api/.env.example`, run
`npm run dev` in `src/Api`, and point `EXPO_PUBLIC_API_URL` to the gateway.
`LARAVEL_API_URL` is the server-side Laravel base URL without `/api/v1`.

Students sign in with their institutional Google account; companies and
administrators use their registered email and password. The API response
determines the account role and opens that role's panel after authentication.
Google sign-in is available only in the student access flow. Android uses the
native Google account chooser; set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` to a Web
OAuth client ID so the app can obtain an ID token for Laravel. Register the
Android package (`com.unipaz.uniempleo`) and the SHA-1 fingerprint of each
build's signing certificate in Google Cloud. The Laravel API must accept that
Web client ID as the token audience.

iOS and web continue to use browser OAuth and need their respective
`EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` and `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
values. Restart Metro with `npx expo start -c` after changing local
environment variables.

Expo Go cannot run the native Google account chooser or test this app's Google
OAuth redirect locally. Use email and password while running in Expo Go. To
test Google sign-in, generate and install a development build after installing
dependencies with
`npx expo run:android`; rebuilding and reinstalling the app is required whenever
native dependencies change. Restarting Metro only updates JavaScript and does
not add native modules to an already-installed app. For later sessions, start
Metro with `npx expo start --dev-client`.
On Windows, keep the project path ASCII-only (for example,
`C:\dev\UniEmpleo`) because the Android native build tools fail on paths with
accented characters. Register the SHA-1 shown by `.\gradlew signingReport`
from the `android` directory in the Android OAuth client settings.

For a local gateway on a physical phone, use the computer's LAN IP instead of
`localhost`. For an Android emulator, use `http://10.0.2.2:3000/api/v1`.

The admin KPIs and user-management panel remain demonstration data because the
API currently has no corresponding endpoints.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
