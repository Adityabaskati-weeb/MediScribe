# Native Speech Setup

MediScribe now supports native speech recognition through
`@react-native-voice/voice`. Standard Expo Go does not include this native
module, so real microphone speech-to-text requires a custom development build.

## Expo Go Behavior

Expo Go uses the in-app demo/manual transcript fallback. This keeps the voice
intake workflow usable during quick demos.

## Native Android Build

From `mobile/`:

```bash
npm install
npx expo prebuild
npx expo run:android
npm run start:dev-client
```

Then open the installed MediScribe development build on the Android device. The
voice button will use the native recognizer when the module is available.

## Permissions

The app declares:

- Android `RECORD_AUDIO`
- iOS microphone usage description
- iOS speech recognition usage description

These are configured in `app.json`.
