# Quantity Measurement App - Frontend

Angular frontend for a Quantity Measurement application. The app lets users convert, compare, and calculate quantities across length, weight, volume, and temperature units. It also supports email/password authentication, Google Sign-In, JWT-based API calls, and saved calculation history for logged-in users.

## Features

- Convert quantities between supported units.
- Compare two quantities and show whether they are equal, greater, or less.
- Perform arithmetic operations on compatible units.
- Register and log in with email/password.
- Continue as a guest without saving history.
- Sign in with Google Identity Services.
- Store JWT and user details in `localStorage`.
- Attach JWT tokens to authenticated API requests through an Angular HTTP interceptor.
- Save the latest 50 logged-in calculations in browser storage.
- View, delete, and clear calculation history.

## Supported Measurements

| Measurement | Units |
| --- | --- |
| Length | `INCH`, `FOOT`, `YARD`, `CENTIMETER` |
| Weight | `GRAM`, `KILOGRAM`, `MILLIGRAM`, `POUND`, `TONNE` |
| Volume | `LITRE`, `MILLILITRE`, `GALLON` |
| Temperature | `CELSIUS`, `FAHRENHEIT`, `KELVIN` |

Temperature supports conversion and comparison. Arithmetic is disabled for temperature.

## Tech Stack

- Angular 18
- TypeScript
- Angular standalone components
- Angular Router
- Angular Forms
- Angular HttpClient
- RxJS
- SCSS
- Google Identity Services

## Project Structure

```text
.
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard/      # Calculator UI and quantity workflows
│   │   │   ├── history/        # Saved calculation history
│   │   │   ├── login/          # Email/password and Google login
│   │   │   └── register/       # Registration and password validation
│   │   ├── guards/             # Route guards for authenticated pages
│   │   ├── interceptors/       # JWT authorization interceptor
│   │   ├── models/             # Auth, quantity, unit, and history models
│   │   ├── services/           # Auth, quantity API, and history services
│   │   ├── app.config.ts       # App providers
│   │   └── app.routes.ts       # Route definitions
│   ├── assets/                 # App images and favicon
│   ├── environments/           # API URL and Google client configuration
│   ├── index.html              # Angular host page
│   ├── main.ts                 # Application bootstrap
│   └── styles.scss             # Global styles
├── pages/                      # Legacy/static HTML screens
├── css/                        # Legacy/static styles
├── js/                         # Legacy/static JavaScript
├── angular.json
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js and npm
- Angular CLI, or use the local CLI through `npm run`
- Quantity Measurement backend running on `http://localhost:8080`
- Google OAuth client ID if Google Sign-In is used

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

Open the app:

```text
http://localhost:4200
```

Build the app:

```bash
npm run build
```

Create a development build in watch mode:

```bash
npm run watch
```

## Configuration

Environment settings are defined in:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Current defaults:

```ts
apiUrl: 'http://localhost:8080'
googleClientId: '<google-client-id>'
```

Update `apiUrl` if the backend runs on a different host or port. Update `googleClientId` with the OAuth client ID configured in Google Cloud Console.

## Routes

| Route | Component | Access |
| --- | --- | --- |
| `/` | Dashboard | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/history` | History | Authenticated only |

Unknown routes redirect to `/`.

## Backend API

The frontend expects a REST API under `http://localhost:8080`.

### Authentication

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Create a new account |
| `POST` | `/api/v1/auth/login` | Log in with email/password |
| `POST` | `/api/v1/auth/google-login` | Log in with Google credential token |
| `GET` | `/api/v1/auth/me` | Fetch current user |
| `GET` | `/api/v1/auth/status` | Check API availability |

### Quantity Operations

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/quantities/convert` | Convert one quantity to another unit |
| `POST` | `/api/v1/quantities/compare` | Compare two quantities |
| `POST` | `/api/v1/quantities/add` | Add quantities |
| `POST` | `/api/v1/quantities/subtract` | Subtract quantities |
| `POST` | `/api/v1/quantities/divide` | Divide quantities |

Authenticated requests include:

```http
Authorization: Bearer <jwt-token>
```

Quantity requests are sent in this shape:

```json
{
  "thisQuantityDTO": {
    "value": 12,
    "unit": "INCH",
    "measurementType": "LengthUnit"
  },
  "thatQuantityDTO": {
    "value": 0,
    "unit": "FOOT",
    "measurementType": "LengthUnit"
  }
}
```

## Usage

### Convert Units

1. Select a measurement type.
2. Select `Conversion`.
3. Enter a value and source unit.
4. Select the target unit.
5. Click `Convert`.

Example: `12 INCH` converts to `1 FOOT`.

### Compare Units

1. Select a measurement type.
2. Select `Comparison`.
3. Enter both quantities.
4. Click `Compare`, or update inputs to trigger debounced comparison.

Example: `13 INCH` is greater than `1 FOOT`.

### Arithmetic

1. Select length, weight, or volume.
2. Select `Arithmetic`.
3. Enter two quantities.
4. Choose add, subtract, or divide.
5. Click `Calculate`.
6. Optionally change the result unit for add/subtract results.

## Authentication and History

- Guests can use the calculator without logging in.
- Logged-in users can access `/history`.
- Calculation history is stored in browser `localStorage` under `quantity_history`.
- The history service keeps the most recent 50 operations.
- Logging out removes `token` and `currentUser` from `localStorage`.

## Notes

- The Angular app under `src/` is the primary implementation.
- The `pages/`, `css/`, and `js/` folders contain legacy/static screens from an earlier implementation.
- No test script is currently defined in `package.json`.
