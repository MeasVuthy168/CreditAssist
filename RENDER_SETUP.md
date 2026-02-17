# ⚙️ Render Setup Guide -- Credit Assist

## Create Web Service

1.  Connect GitHub repository
2.  Select secure-backend repo
3.  Set Environment to Node
4.  Set Build Command: npm install
5.  Set Start Command: node server.js

## Environment Variables

Add: - MONGO_URI - JWT_SECRET - GITHUB_TOKEN - PUBLIC_VAPID_KEY -
PRIVATE_VAPID_KEY

## After Setup

-   Click Save
-   Click Manual Deploy
-   Monitor logs

## Testing

Open: https://your-render-service.onrender.com/

If you see: "Credit Assist Backend is Running." Setup is successful.
