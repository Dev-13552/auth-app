# Auth App (MERN)

- **Sign up** with email or phone, date of birth, surname and a 6-digit code
- **Log in** with the 6-digit code, or Face ID / fingerprint / Windows Hello
- **One device at a time**: logging in on a new device logs the old one out
- **Lockout**: 5 wrong attempts block login for 1 hour (code and biometrics share the same counter)

```
auth-app/
├── server/            Express + MongoDB
│   ├── index.js       starts the server
│   ├── helpers.js     sessions, lockout, login check
│   ├── models/User.js
│   └── routes/        auth.js (sign up, log in, log out), biometric.js
└── client/            React (Vite)
    └── src/           App.jsx, api.js, pages/ (Signup, Login, Home)
```

```bash
# terminal 1
cd server
npm install
npm run dev

# terminal 2
cd client
npm install
npm run dev
```

Open http://localhost:5173

## Settings (`server/.env`)

| Name | What it is |
|---|---|
| `PORT` | port of the server (5000) |
| `MONGO_URI` | MongoDB link |
| `JWT_SECRET` | any long random text. Change it before deploying |
| `ORIGIN` | the address people open in the browser, e.g. `https://myapp.com` |

## Deploy

One server runs everything:

```bash
cd client && npm install && npm run build     # makes client/dist
cd ../server && npm install && npm start      # serves the API and the website
```

On the host set `MONGO_URI`, `JWT_SECRET`, `ORIGIN` (your https address) and `NODE_ENV=production`.
