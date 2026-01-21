# Lost & Found App

A full-stack mobile app for reporting and finding lost items. Users can post lost or found items with images, categorize them, and mark items as resolved when recovered.

## Problem Statement

People often lose personal belongings or find items that others have lost. This app bridges that gap by allowing users to:
- Report lost items with details and photos
- Report found items to help return them
- Browse and search through listings
- Contact and coordinate returns

## Tech Stack Used

### Frontend (React Native/Expo)
- **Framework**: Expo Router with file-based routing
- **Language**: TypeScript
- **State Management**: React Context (AuthContext)
- **Storage**: AsyncStorage for token persistence
- **UI**: React Native components, expo-image-picker, expo-status-bar
- **HTTP**: Axios with interceptors for auth and 401 handling
- **Image Hosting**: Cloudinary (signed uploads)

### Backend (Node.js/Express)
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT with bcrypt for password hashing
- **Image Upload**: Cloudinary SDK with signature generation
- **Validation**: Input validation and error handling

## Features Implemented

- **Authentication**: Secure JWT-based login/registration with case-insensitive emails.
- **Item Management**:
  - Post lost or found items with title, description, location, optional category, and image.
  - View items in a feed with filters (All/Lost/Found).
  - Pull-to-refresh on lists.
  - View item details with poster information and full-screen image viewer.
- **Image Upload**:
  - Secure signed Cloudinary uploads.
  - Choose from library or take a photo with camera.
  - Image previews in cards and item details.
- **User Dashboard**:
  - View own posts (My Posts) with resolved status indicator.
  - Profile page with post counts and resolved items.
  - Owner actions: Mark as Resolved, Delete.
- **UI/UX**:
  - Consistent headers across the app.
  - SafeAreaView support to avoid system UI overlaps.
  - Loading states and error handling.
  - Responsive design with modern components.

## How to Run the Project Locally

### Prerequisites

- Node.js (v18+)
- npm or yarn
- MongoDB (local or cloud)
- Expo CLI (`npx expo install`)
- Cloudinary account (for image uploads)

### 1. Clone the repository
```bash
git clone https://github.com/KKartikay-27/lost-n-found
cd lost-n-found
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
MONGO_URI=mongodb://localhost:27017/lostnfound
JWT_SECRET=your-super-secret-jwt-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Start the backend:
```bash
npm run dev
```
The server runs on `http://localhost:5050`.

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

Update `app.config.ts` to include any additional Expo extras if needed.

Start the frontend:
```bash
npx expo start
```
Scan the QR code with Expo Go (Android) or the Camera app (iOS).

## Basic API Documentation

### Authentication Endpoints
- `POST /api/auth/register` – Register a new user
- `POST /api/auth/login` – Login a user
- `GET /api/auth/verify` – Verify token and get user data

### Item Endpoints
- `GET /api/items` – Get all unresolved items (optional `?type=lost|found`)
- `GET /api/items/my-items` – Get current user’s items
- `GET /api/items/:id` – Get item details
- `POST /api/items` – Create a new item
- `PATCH /api/items/:id/resolve` – Mark item as resolved
- `DELETE /api/items/:id` – Delete an item (owner only)

### Upload Endpoint
- `POST /api/upload/sign` – Get Cloudinary signed upload params (auth required)

## Project Structure

```
lost-n-found/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── config/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (tabs)/
│   │   ├── item/
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── constants/
│   │   ├── utils/
│   │   └── config/
│   ├── app.config.ts
│   └── package.json
└── README.md
```
