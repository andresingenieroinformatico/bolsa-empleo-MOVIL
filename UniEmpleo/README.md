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

The mobile app calls the Next.js API gateway using `EXPO_PUBLIC_API_URL`. Copy
`.env.example` to `.env.local` and set that variable to the gateway URL ending
in `/api/v1`. Do not put Laravel secrets or private OAuth keys in Expo variables:
`EXPO_PUBLIC_*` values are included in the client bundle.

The gateway is a separate package in `src/Api`. From this directory, copy
`src/Api/.env.example` to `src/Api/.env.local`, set its `DATABASE_URL`,
`LARAVEL_API_URL`, and a private random `JWT_SECRET`, then run `npm install` and
`npm run dev` inside `src/Api`. Start Expo from this directory in a second
terminal. `LARAVEL_API_URL` is the server side Laravel base URL without
`/api/v1`; `EXPO_PUBLIC_API_URL` is the mobile facing gateway URL with `/api/v1`.

Students sign in with their institutional Google account; companies and
administrators use their registered email and password. The API response
determines the account role and opens that role's panel after authentication.
Google sign-in is available only in the student access flow; Android, iOS, and
web OAuth client IDs must be configured for the platforms you use. In
particular, set `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` to the Android OAuth
client for the app's package and signing certificate. Restart Metro with
`npx expo start -c` after changing local environment variables.

For Google sign-in, configure the Android, iOS, and web OAuth client IDs in the
matching `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` variables. Google OAuth requires an
Expo development build; Expo Go cannot complete the configured redirect flow.

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
