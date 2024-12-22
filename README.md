# FTP Client

A modern FTP client with Go backend and Svelte frontend.

![FTP Client GUI](./frontend/src/assets/gui.png)

## Setup

### Backend

1. Clone the repository
2. Navigate to the `backend` directory
3. Copy `.env.example` to `.env` and fill in your FTP credentials
4. Run `go mod download` to install dependencies

### Frontend

1. Navigate to the `frontend` directory
2. Copy `.env.example` to `.env` and update the API endpoint if needed
3. Run `npm install` to install dependencies

## Usage

### Development

1. Start the backend:
   ```bash
   go run cmd/ftp-client/main.go
   ```
2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```
