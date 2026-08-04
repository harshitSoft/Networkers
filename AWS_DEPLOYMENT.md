# AWS deployment

The backend is ready to deploy as a Docker container to AWS App Runner (or ECS).
The real local credentials remain in `backend/.env`; that file is ignored by Git
and excluded from Docker builds.

## 1. Verify locally

From the repository root:

```bash
docker build -t networkers-backend ./backend
docker run --env-file ./backend/.env -p 8080:8080 networkers-backend
```

Verify:

```text
GET http://localhost:8080/actuator/health
```

The response should have status `UP`.

## 2. Push the backend image to Amazon ECR

Create a private ECR repository named `networkers-backend`, then use the ECR
"View push commands" instructions for your AWS account and region. Build commands
must use `backend` as the Docker build context.

## 3. Create an AWS App Runner service

Create the service from the ECR image with:

- Container port: `8080`
- Health check protocol: `HTTP`
- Health check path: `/actuator/health`
- Health check interval: `10` seconds
- Health check timeout: `5` seconds

Configure these runtime values using the exact values from `backend/.env`:

```text
PORT
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
JWT_EXPIRATION_MS
ADMIN_EMAIL
ADMIN_PASSWORD
MAIL_HOST
MAIL_PORT
MAIL_USERNAME
MAIL_PASSWORD
MAIL_FROM
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_FOLDER_ROOT
APP_CORS_ALLOWED_ORIGINS
```

Use App Runner environment variables for non-secret configuration. Put passwords,
the JWT secret, the admin password, and Cloudinary credentials in AWS Secrets Manager and reference
them as App Runner runtime secrets. The App Runner instance role needs permission
to read those secrets.

Set `APP_CORS_ALLOWED_ORIGINS` to a comma-separated list containing the final frontend
origin, for example:

```text
https://your-cloudfront-domain.example,https://networkers-new.netlify.app
```

Do not add paths or a trailing slash to an origin.

## 4. Build and host the frontend

Set the frontend build variable to the public HTTPS App Runner URL plus `/api`:

```text
VITE_API_BASE_URL=https://your-app-runner-service.awsapprunner.com/api
```

Then build:

```bash
cd frontend
npm ci
npm run build
```

Upload the contents of `frontend/dist` to an S3 bucket served through CloudFront.
For this React single-page application, configure the CloudFront/S3 fallback so
HTTP 403 and 404 responses serve `/index.html`; otherwise direct navigation to
client-side routes will fail.

After CloudFront is available, update `CORS_ALLOWED_ORIGINS` on App Runner with its
HTTPS origin and redeploy.

## 5. Production checks

- `GET /actuator/health` returns HTTP 200 and does not expose component details.
- Login succeeds through the deployed frontend.
- Browser requests go to the AWS backend URL, not localhost or the old host.
- HTTPS is used for both frontend and backend.
- The real `.env` files are absent from Git, ECR images, S3, and deployment archives.
