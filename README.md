# Aurelia

A native React Native wallet UI built with Expo. The app includes welcome and login screens, a multi-step signup flow, a wallet overview, AI chat, cards, recipients, and a guided send-money experience.

## Run the app

```bash
npm install
npm start
```

Install Expo Go on an iPhone and scan the QR code shown by Expo, or run `npm run ios` with Xcode and the iOS Simulator installed. Android and web previews are also available with `npm run android` and `npm run web`.

## Deploy to Vercel

Import this repository into Vercel with the repository root as the Root Directory.
Use Node.js 24.x in the project settings. The included `vercel.json` builds the
Expo web app with `npm run build`, serves `dist`, and routes browser requests to
the app. After pushing these files, create a new deployment to apply the configuration.

To check the production build locally, run `npm run build`.

## Create a native iOS project

For a generated Xcode project, run:

```bash
npx expo prebuild --platform ios
```

## Prototype notice

Authentication, account details, face scanning, phone verification, AI responses, and money movement are UI demonstrations only. Connect secure services and implement the required native permissions and compliance before handling real accounts, biometric data, or payments.
