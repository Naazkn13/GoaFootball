# Football Auth Website

A Next.js website with authentication features including signup, login, and profile pages.

## Project Structure

```
football-auth-app/
├── pages/
│   ├── _app.js          # App wrapper with providers
│   ├── _document.js     # HTML document wrapper
│   ├── _error.js        # Error page
│   ├── index.js         # Home page (redirects to login)
│   ├── login.js         # Login/Signup combined page
│   ├── signup.js        # Standalone signup page
│   ├── profile.js       # User profile page
│   └── api/             # API routes (to be implemented)
├── styles/
│   ├── globals.css      # Global styles
│   ├── Auth.module.css  # Auth pages styles
│   └── Profile.module.css # Profile page styles
├── components/          # Reusable components (to be added)
├── services/
│   ├── apis.js          # API service layer
│   └── auth.service.js  # Authentication service
├── store/
│   └── AuthContext.js   # Auth state management
├── config/
│   ├── config.json      # App configuration
│   └── config_api.json  # API endpoints configuration
└── public/              # Static assets

```

## Features

### Pages

1. **Login Page** (`/login`)
   - Email and password login
   - Switch to signup form
   - Form validation
   - Loading states

2. **Signup Page** (`/signup`)
   - Full name
   - Email
   - Phone number (10 digits)
   - Aadhaar number (12 digits) with verification button
   - Password
   - Form validation
   - Loading states

3. **Profile Page** (`/profile`)
   - User information display
   - Edit profile button
   - Payment section with amount
   - Logout functionality
   - Responsive design

### Styling

- Beautiful gradient backgrounds
- Smooth animations and transitions
- Responsive design for mobile and desktop
- Modern UI with rounded corners and shadows
- Loading spinners for async operations

### State Management

- React Context API for auth state
- LocalStorage for persistence
- User authentication flow

## Getting Started

### Installation

```bash
cd football-auth-app
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Build for Deployment

The project includes build scripts for different environments:

```bash
# Development build
./build-dev.sh

# SIT build
./build-sit.sh

# UAT build
./build-uat.sh

# Production build
./build-prod.sh
```

Each script creates a deployable zip file in the `build/` directory.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## TODO - Backend Integration

The following needs to be implemented:

1. **API Routes** (in `pages/api/`)
   - `/api/auth/login` - User login
   - `/api/auth/signup` - User registration
   - `/api/auth/verify-aadhaar` - Aadhaar verification
   - `/api/user/profile` - Get user profile
   - `/api/user/update` - Update user profile
   - `/api/payment/initiate` - Initialize payment
   - `/api/payment/verify` - Verify payment

2. **Database Integration**
   - User model
   - Session management
   - Secure password hashing

3. **Authentication**
   - JWT tokens
   - Protected routes
   - Session management

4. **Payment Gateway**
   - Razorpay/Stripe integration
   - Payment verification
   - Receipt generation

5. **Aadhaar Verification**
   - Integration with Aadhaar verification API
   - OTP verification

## Technologies Used

- **Next.js 14.0.3** - React framework
- **React 18** - UI library
- **Express** - Server with API proxy
- **CSS Modules** - Scoped styling
- **Context API** - State management

## Project Reference

This project structure is based on `vpc_axs_frontend` with similar folder organization and follows Next.js best practices.

## Notes

- All API calls are currently mocked with timeouts
- Replace the placeholder logic with actual API integrations
- Add environment variables for sensitive data
- Implement proper error handling
- Add form validation libraries if needed (e.g., Formik, React Hook Form)
