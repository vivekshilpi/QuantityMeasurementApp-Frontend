
# Quantity Measurement Frontend

A modern, responsive web application for unit conversion and comparison with Google OAuth authentication.

## Features

- **Unit Conversion**: Convert between various units of measurement
  - Length (Inch, Foot, Yard, Centimeter)
  - Weight (Gram, Kilogram, Milligram, Pound, Tonne)
  - Volume (Litre, Millilitre, Gallon)
  - Temperature (Celsius, Fahrenheit, Kelvin)

- **Unit Comparison**: Compare two values in different units with live results
- **Arithmetic Operations**: Perform addition, subtraction, and division on quantities
- **Authentication**:
  - Email/Password registration and login
  - Google Sign-In integration
  - JWT-based secure authentication

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Authentication**: Google Identity Services (GIS)
- **Backend API**: Spring Boot REST API (separate repository)
- **Styling**: Custom CSS with responsive design

## Project Structure

```
quantity-measurement-frontend/
├── pages/
│   ├── index.html         # Registration/Sign-up page (entry point)
│   ├── login.html         # Login page
│   └── app.html           # Main application page
├── css/
│   └── styles.css         # All application styles
├── js/
│   └── script.js          # Main application logic
├── images/
│   ├── favicon.png        # App icon
│   └── logo-white.png     # White logo for gradient backgrounds
├── README.md
└── .gitignore
```

## Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Backend API running on `http://localhost:8080`
- Google Cloud Console project with OAuth 2.0 credentials (for Google Sign-In)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd quantity-measurement-frontend
```

### 2. Backend Setup

Ensure the Spring Boot backend is running on `http://localhost:8080`.

Backend repository: [Link to backend repo]

### 3. Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google Identity Services
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins:
     - `http://localhost:5500`
     - `http://127.0.0.1:5500`
   - Authorized redirect URIs: (if needed)
     - `http://localhost:5500`
5. Copy the Client ID and update it in:
   - `index.html` (line ~109)
   - `pages/login.html` (line ~96)

### 4. Run the Application

#### Option 1: Using VS Code Live Server

1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. Application will open at `http://127.0.0.1:5500`

#### Option 2: Using Python HTTP Server

```bash
# Python 3
python3 -m http.server 5500

# Python 2
python -m SimpleHTTPServer 5500
```

Then open `http://localhost:5500` in your browser.

#### Option 3: Using Node.js http-server

```bash
npm install -g http-server
http-server -p 5500
```

Then open `http://localhost:5500` in your browser.

## Usage

### Registration

1. Navigate to `index.html` (homepage)
2. Fill in your details (Full Name, Email, Password)
3. Password requirements:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one number
   - At least one special character
4. Click "Create Account" or use "Continue with Google"

### Login

1. Click "Login" link from registration page
2. Enter your email and password OR
3. Click Google Sign-In button

### Unit Operations

1. **Select Type**: Choose Length, Weight, Temperature, or Volume
2. **Select Action**:
   - **Conversion**: Convert from one unit to another
   - **Comparison**: Compare two values (live results)
   - **Arithmetic**: Add, subtract, or divide quantities

#### Conversion Example
- Type: Length
- Action: Conversion
- FROM: 12 Inch
- TO: Foot
- Result: 1

#### Comparison Example
- Type: Length
- Action: Comparison
- VALUE 1: 13 Inch
- VALUE 2: 1 Foot
- Result: "13 Inch is GREATER than 1 Foot" (updates live as you type)

#### Arithmetic Example
- Type: Weight
- Action: Arithmetic
- VALUE 1: 500 Gram
- Operator: +
- VALUE 2: 1 Kilogram
- Result: 1500 Gram

## API Integration

The frontend communicates with the backend REST API:

### Authentication Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Email/password login
- `POST /api/v1/auth/google-login` - Google OAuth login
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/auth/status` - API health check

### Quantity Measurement Endpoints

- `POST /api/v1/quantities/convert` - Convert units
- `POST /api/v1/quantities/compare` - Compare quantities
- `POST /api/v1/quantities/add` - Add quantities
- `POST /api/v1/quantities/subtract` - Subtract quantities
- `POST /api/v1/quantities/divide` - Divide quantities

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt-token>
```

## Responsive Design

The application is fully responsive with breakpoints at:
- Desktop: > 768px
- Tablet: 481px - 768px
- Mobile: ≤ 480px

### Mobile Optimizations
- Compact type selection cards (4-column grid)
- Shortened header title ("QM App")
- Icon-only logout button
- Hidden user greeting
- Stacked form layouts
- Touch-friendly button sizes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Security Features

- JWT-based authentication
- Password strength validation
- Google OAuth 2.0 integration
- CORS-enabled API communication
- Secure token storage (localStorage)

## Known Limitations

- Temperature arithmetic operations not supported (by design)
- Multiply operation not available (backend limitation)
- Local storage used for token (consider httpOnly cookies for production)
