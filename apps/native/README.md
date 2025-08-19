# Native Mobile App

This is the mobile application for the Restaurant Management App, built with React Native and Expo. It allows restaurant owners to manage menus and orders from their mobile devices.

## Getting Started

To get started with the native app, you'll need to have the Expo Go app installed on your mobile device or an emulator set up on your development machine.

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Run the development server:**
    ```bash
    pnpm run dev
    ```

3.  **Run on a specific platform:**
    -   **Android:**
        ```bash
        pnpm run android
        ```
    -   **iOS:**
        ```bash
        pnpm run ios
        ```
    -   **Web:**
        ```bash
        pnpm run web
        ```

## Tech Stack

-   **Framework:** [React Native](https://reactnative.dev/docs/getting-started)
-   **Build Tool:** [Expo](https://docs.expo.dev/)
-   **State Management/Data Fetching:** [React Query](https://tanstack.com/query/latest/docs/react/overview)
-   **Styling:** [NativeWind](https://www.nativewind.dev/)
-   **RPC:** [tRPC](https://trpc.io/docs)

## Project Structure

The `native` app is structured as follows:

```
apps/native/
├── app/                # Expo Router pages and layouts
├── assets/             # Static assets like images and fonts
├── components/         # Reusable React components
├── lib/                # Core libraries and helper functions
└── utils/              # Utility functions
```
