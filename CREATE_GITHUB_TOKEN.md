# 🔐 How to Create a New GitHub Fine-Grained Token

## Step 1 --- Open Developer Settings

1.  Go to GitHub
2.  Click profile picture → Settings
3.  Scroll down → Developer settings
4.  Click Personal access tokens
5.  Select Fine-grained tokens
6.  Click Generate new token

## Step 2 --- Basic Setup

Token name: render-secure-backend Resource owner: Your account (e.g.,
MeasVuthy168) Expiration: 90 days (recommended)

## Step 3 --- Repository Access

Select: Only select repositories Choose: secure-backend

## Step 4 --- Permissions

Repository permissions: - Contents → Read and write - Metadata → Read

## Step 5 --- Generate Token

Click Generate token and copy it immediately.

## Step 6 --- Add to Render

Render → Service → Environment Key: GITHUB_TOKEN Value:
`<paste token>`{=html} Save → Redeploy
