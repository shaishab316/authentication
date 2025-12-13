# 🔐 TOTP Authenticator

A modern, secure, and feature-rich **Time-based One-Time Password (TOTP)** authenticator application built with **Next.js 15** and **TypeScript**. Manage your two-factor authentication codes with style and efficiency.

![Next.js](https://img.shields.io/badge/Next.js-15.2.8-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-latest-green?style=flat-square&logo=mongodb)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## ✨ Features

### 🔒 **Authentication & Security**
- **Secure User Authentication** - JWT-based authentication system
- **Password Management** - Change password and forgot password functionality
- **Encrypted Storage** - Environment variables encryption with dotenvx
- **Token-based Sessions** - Secure session management with local storage

### 🎯 **TOTP Management**
- **Generate TOTP Codes** - Real-time generation of 6-digit authentication codes
- **QR Code Scanner** - Scan QR codes directly from your device camera
- **Manual Entry** - Add accounts manually with secret keys
- **Multiple Accounts** - Manage unlimited TOTP accounts
- **Custom Periods** - Support for custom time periods (default 30s)
- **Live Countdown** - Visual progress indicators for code expiration

### 🎨 **User Experience**
- **Modern UI** - Beautiful gradient design with animated backgrounds
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Ready** - Built with theme switching capability
- **Search & Filter** - Search by name, issuer, or tags
- **Tag System** - Organize accounts with custom tags
- **Pagination** - Efficient handling of large account collections
- **Toast Notifications** - Real-time feedback for user actions

### 🔍 **Advanced Features**
- **Account Organization** - Group accounts by tags (org:, tag: prefixes)
- **Copy to Clipboard** - One-click code copying
- **Account Removal** - Easy account management and deletion
- **Email Verification** - Password reset via email with Nodemailer
- **Optimistic Updates** - Smooth UI updates without page reloads

---

## 🛠️ Tech Stack

### **Frontend**
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - Latest React with concurrent features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[React Hook Form](https://react-hook-form.com/)** - Performant form validation
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

### **Backend**
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database with Mongoose ODM
- **[JWT](https://jwt.io/)** - JSON Web Tokens for authentication
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** - Password hashing
- **[Nodemailer](https://nodemailer.com/)** - Email sending for password reset

### **TOTP & Security**
- **[totp-generator](https://www.npmjs.com/package/totp-generator)** - TOTP code generation
- **[jsQR](https://github.com/cozmo/jsQR)** - QR code scanning
- **[qrcode.react](https://www.npmjs.com/package/qrcode.react)** - QR code rendering
- **[@dotenvx/dotenvx](https://dotenvx.com/)** - Encrypted environment variables

### **UI Components**
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[React Toastify](https://fkhadra.github.io/react-toastify/)** - Additional toast system
- **[Embla Carousel](https://www.embla-carousel.com/)** - Carousel functionality
- **[React Day Picker](https://react-day-picker.js.org/)** - Date picker component

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **pnpm** (recommended)
- **MongoDB** (local instance or MongoDB Atlas)
- **Git**

---

## 🚀 Installation

### 1. **Clone the Repository**
```bash
git clone https://github.com/shaishab316/authentication.git
cd authentication
```

### 2. **Install Dependencies**
```bash
npm install
# or
pnpm install
```

### 3. **Configure Environment Variables**

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Encryption Keys (for TOTP secrets)
ENCRYPTION_KEY=your_32_character_encryption_key
NEXT_PUBLIC_ENCRYPTION_KEY=your_32_character_encryption_key

# Email Configuration (for password reset)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_FROM=noreply@yourdomain.com

# JWT Secret
JWT_SECRET=your_jwt_secret_key
```

**Optional:** Encrypt your `.env` file using dotenvx:
```bash
npm run env-encrypt
```

### 4. **Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

---

## 🎮 Usage

### **Getting Started**

1. **Register an Account**
   - Navigate to the login page
   - Click "Register" and create your account
   - Log in with your credentials

2. **Add Your First TOTP Account**
   - Click the **+ Add Account** button (bottom right)
   - Choose one of two methods:
     - **Scan QR Code**: Use your camera to scan a QR code
     - **Manual Entry**: Enter account details manually
   - Fill in the required fields:
     - Account Name (e.g., "GitHub")
     - Issuer (optional, e.g., "github.com")
     - Secret Key (Base32 encoded)
     - Tags (optional, comma-separated)
     - Period (default: 30 seconds)

3. **View and Use Codes**
   - See all your accounts on the main dashboard
   - TOTP codes refresh automatically every 30 seconds
   - Click on a code to copy it to clipboard
   - Progress bar shows time remaining

4. **Search and Filter**
   - Use the search bar to find accounts
   - Filter by name, issuer, or tags
   - Use special prefixes:
     - `tag:work` - Show accounts with "work" tag
     - `org:company` - Show accounts with "company" in tags

5. **Manage Accounts**
   - Click the trash icon to remove an account
   - Navigate between pages if you have many accounts
   - Change your password from the user menu

---

## 🏗️ Project Structure

```
authentication/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── change-password/
│   │   │   └── forgot-password/
│   │   └── accounts/             # TOTP account management
│   │       ├── route.ts          # GET (list), POST (create)
│   │       └── [id]/route.ts     # DELETE account
│   ├── login/                    # Login/Register page
│   ├── add-account/              # Add TOTP account page
│   ├── page.tsx                  # Main dashboard
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/                   # React Components
│   ├── auth/                     # Authentication components
│   │   ├── ChangePasswordDialog.tsx
│   │   └── ForgotPasswordDialog.tsx
│   ├── authenticator/            # TOTP app components
│   │   ├── Header.tsx
│   │   ├── SearchBar.tsx
│   │   ├── AccountList.tsx
│   │   └── AccountCard.tsx
│   ├── ui/                       # Reusable UI components (Radix)
│   ├── theme-provider.tsx        # Theme management
│   └── toast-provider.tsx        # Toast notifications
│
├── services/                     # Service layer
│   ├── authService.ts            # Authentication logic
│   ├── accountService.ts         # Account management
│   └── totpService.ts            # TOTP generation
│
├── models/                       # Database models
│   ├── User.ts                   # User schema
│   └── Account.ts                # TOTP account schema
│
├── types/                        # TypeScript types
│   ├── auth.ts                   # Auth types
│   └── account.ts                # Account types
│
├── lib/                          # Utility functions
│   ├── db.ts                     # Database connection
│   ├── jwt.ts                    # JWT utilities
│   └── sentmail.ts               # Email sending
│
├── hooks/                        # Custom React hooks
├── public/                       # Static assets
├── styles/                       # Additional styles
│
├── .env                          # Environment variables (encrypted)
├── .env.keys                     # Encryption keys
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

---

## 🔌 API Documentation

### **Authentication Endpoints**

#### **POST** `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "username": "string"
}
```

#### **POST** `/api/auth/login`
Login to existing account.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "username": "string"
}
```

#### **POST** `/api/auth/change-password`
Change user password (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

#### **POST** `/api/auth/forgot-password`
Send password reset email.

**Request Body:**
```json
{
  "username": "string",
  "email": "string"
}
```

### **Account Endpoints**

#### **GET** `/api/accounts?page=1&limit=10`
Get paginated list of TOTP accounts.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "accounts": [
    {
      "_id": "string",
      "name": "string",
      "issuer": "string",
      "secret": "encrypted_string",
      "period": 30,
      "tags": ["string"],
      "createdAt": "date"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

#### **POST** `/api/accounts`
Create a new TOTP account.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "string",
  "issuer": "string",
  "secret": "base32_string",
  "period": 30,
  "tags": ["string"]
}
```

#### **DELETE** `/api/accounts/[id]`
Delete a TOTP account.

**Headers:**
```
Authorization: Bearer <token>
```

---

## 🎨 Features Showcase

### **Dashboard**
- Clean, modern interface with animated gradients
- Real-time TOTP code generation
- Progress bars showing code expiration
- Quick search and filtering

### **QR Code Scanner**
- Camera-based QR code scanning
- Automatic account creation from scanned codes
- Support for standard TOTP URI format

### **Account Management**
- Add accounts via QR code or manual entry
- Organize with tags for easy filtering
- Pagination for large collections
- One-click code copying

### **Security Features**
- Encrypted secret storage
- JWT-based authentication
- Password hashing with bcrypt
- Secure session management
- Environment variable encryption

---

## 🔐 Security Best Practices

This application follows security best practices:

1. **Password Hashing** - All passwords are hashed using bcryptjs
2. **JWT Tokens** - Secure, stateless authentication
3. **Encrypted Secrets** - TOTP secrets are encrypted before storage
4. **Environment Encryption** - Sensitive data encrypted with dotenvx
5. **Input Validation** - All inputs validated with Zod schemas
6. **XSS Protection** - React's built-in XSS protection
7. **CSRF Protection** - API routes use proper HTTP methods

---

## 🧪 Scripts

```bash
# Development
npm run dev              # Start development server with dotenvx

# Production
npm run build            # Build for production
npm run start            # Start production server with dotenvx

# Linting
npm run lint             # Run ESLint

# Environment Variables
npm run env-encrypt      # Encrypt .env file
npm run env-decrypt      # Decrypt .env file
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### **Coding Standards**
- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for important warnings (`//!`) and explanations (`//?`)
- Write clean, readable code
- Test your changes thoroughly

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Shaishab316**

- GitHub: [@shaishab316](https://github.com/shaishab316)
- Repository: [authentication](https://github.com/shaishab316/authentication)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [totp-generator](https://www.npmjs.com/package/totp-generator) for TOTP implementation
- All open-source contributors who made this project possible

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [existing issues](https://github.com/shaishab316/authentication/issues)
2. Create a [new issue](https://github.com/shaishab316/authentication/issues/new) with detailed information
3. Provide steps to reproduce any bugs

---

## 🗺️ Roadmap

Future enhancements planned:

- [ ] **Export/Import** - Backup and restore accounts
- [ ] **Biometric Auth** - Fingerprint/Face ID support
- [ ] **Browser Extension** - Chrome/Firefox extension
- [ ] **Mobile Apps** - Native iOS and Android apps
- [ ] **Cloud Sync** - Sync accounts across devices
- [ ] **Account Icons** - Custom icons for each service
- [ ] **Backup Codes** - Generate and store backup codes
- [ ] **2FA for App** - Add 2FA to the authenticator itself
- [ ] **Dark Mode** - Full dark theme support
- [ ] **PWA Support** - Installable Progressive Web App

---

## ⚠️ Disclaimer

This application is designed for educational and personal use. While security best practices have been implemented, please review the code and ensure it meets your security requirements before using in production environments.

---

<div align="center">

**Made with ❤️ and TypeScript**

⭐ Star this repo if you find it useful!

</div>
