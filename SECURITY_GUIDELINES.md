# 🔐 Credit Assist Security Guidelines

## GitHub

-   Never commit tokens
-   Store secrets in environment variables
-   Revoke leaked tokens immediately

## Render

Store these securely: - MONGO_URI - JWT_SECRET - GITHUB_TOKEN - VAPID
keys

Redeploy after any env change.

## MongoDB

-   Use strong password
-   Enable IP whitelist
-   Use least privilege DB user

## JWT

-   Expire tokens (recommended 1 hour)
-   Protect all sensitive routes

## Image Upload

-   Allow only jpg, jpeg, png
-   Validate file size
-   Do not allow executable files

## API Security

-   Restrict CORS in production
-   Add rate limiting for login

## Incident Response

1.  Revoke token
2.  Rotate DB password
3.  Change JWT secret
4.  Redeploy
