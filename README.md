# ndisc-mobile

A read-only mobile companion viewer for [ndisc](https://github.com/xjmzx/ndisc)
— browse a Nostr-published music discography on Android.

## What it is

ndisc-mobile is a **viewer**. It reads the owner's `kind:31237` release events
(and `kind:5` deletions) from Nostr relays and renders them in a mobile UI. It
publishes nothing and needs no Nostr key.

It is a sibling of the glmps web viewers — another consumer of the frozen
`release.v1` event contract. `schema/release.v1.json` here is a vendored copy;
the canonical version lives in the ndisc repo.

Adding / editing / deleting releases is intentionally **out of scope for now**
— a possible later phase.

## Stack

- React 18 + Vite + TypeScript + Tailwind
- `nostr-tools` for relay access
- Capacitor for the Android build

## Develop

```sh
npm install
npm run dev      # browser preview
npm run build    # type-check + production build into dist/
```

## Android (Capacitor)

```sh
npm run build
npx cap sync android   # copy the web build into the native project
npx cap open android   # open in Android Studio to run / build an APK
```

Requires Android Studio + the Android SDK. The `android/` project is committed;
build outputs inside it are gitignored.

## Configuration

`src/config.ts` — the owner npub whose discography is shown, the relay set, and
the release event kind (31237).
