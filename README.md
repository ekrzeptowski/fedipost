# Fedipost

Fedipost is a fediverse post scheduler using builtin scheduling functionality.

It allows you to schedule posts on Mastodon, Pleroma, and other fediverse platforms.

It doesn't require any external services to work.
Server detection is done server-side in order to avoid CORS issues.
All other functionality is done client-side in the browser.

## Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/ekrzeptowski/fedipost.git
cd fedipost
npm install # or yarn install or pnpm install 
```

Create a `.env` file in the root directory and add the following:

```bash
WEBSITE_URL=
```

## Scripts

- `dev`: Starts the development server.
- `build`: Builds the app for production.
- `start`: Runs the built app in production mode.
- `lint`: Runs the linter.

## Tech Stack

- Next.js
- TypeScript
- React
- Redux Toolkit
- shadcn/ui
- tailwindcss
- react-hook-form

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

Created by [Ewelina Krzeptowska](https://github.com/ekrzeptowski)