# Networkers

Networkers is a full-stack subscription-based chapter business community platform. Admins create chapters, members, events, and gallery updates. Members exchange referrals across chapters and track confirmed business revenue.

## Tech Stack

- Backend: Spring Boot 3, Java 17, Spring Security, JWT, Spring Data JPA, PostgreSQL (Neon), Maven
- Frontend: React, Vite, Tailwind CSS, Axios, React Router
- Backend port: `8080`
- Frontend port: `5173`

## Configuration

Runtime configuration is read from environment variables. The existing local values
were migrated to ignored `backend/.env` and `frontend/.env` files. Safe templates are
available as `.env.example` in each application directory.

Do not commit or upload either real `.env` file. On AWS, set the same backend variable
names in the service configuration and store secret values in AWS Secrets Manager.

## Run Backend

```bash
cd backend
mvn spring-boot:run
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

The backend health endpoint is `GET http://localhost:8080/actuator/health`.

For the container-based AWS deployment procedure, see
[`AWS_DEPLOYMENT.md`](AWS_DEPLOYMENT.md).

If npm lifecycle scripts fail on Windows because `cmd.exe` is not found, run this once in PowerShell before installing:

```powershell
$env:npm_config_script_shell='C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe'
npm install
```

## Seeded User

Only the Super Admin is seeded automatically. Its email and initial password come
from `ADMIN_EMAIL` and `ADMIN_PASSWORD`; its role is `SUPER_ADMIN`. Change the
initial password for production.

No demo chapters, users, referrals, events, opportunities, or community posts are created automatically.

## Optional Old Data Cleanup

If an older local database already contains demo data, clean it manually after backing up anything you need. Keep the Super Admin row.

Example MySQL cleanup shape:

```sql
DELETE FROM referral_revenue;
DELETE FROM referral;
DELETE FROM event_image;
DELETE FROM event;
DELETE FROM opportunity;
DELETE FROM post;
DELETE FROM meeting_request;
DELETE FROM meetup_attendee;
DELETE FROM meetup;
DELETE FROM connection;
DELETE FROM business_profile;
DELETE FROM users WHERE email <> 'admin@networkers.com';
DELETE FROM chapter;
```

## Key API Areas

- Auth: `/api/auth/login`, `/api/auth/me`
- Chapters: `/api/chapters/**`, `/api/admin/chapters/**`, `/api/user/chapters/**`
- Events: `/api/events/**`, `/api/admin/events/**`
- Members: `/api/members`
- Business profiles: `/api/business/**`
- Connections: `/api/connections/**`
- Referrals: `/api/referrals/**`
- Opportunities: `/api/opportunities/**`
- Meetups: `/api/meetups/**`
- Meetings: `/api/meetings/**`
- Community: `/api/community/posts/**`
- Notifications: `/api/notifications/**`
- Admin: `/api/admin/**`

All non-public APIs are JWT protected. Admin-only APIs require `SUPER_ADMIN` or `ADMIN`.
# Render environment

For a production Render deployment, configure `DB_URL`, `DB_USERNAME`,
`DB_PASSWORD`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Set `JWT_SECRET` to a
stable random value of at least 32 characters. The backend has a stable
database-secret-derived fallback so a missing `JWT_SECRET` no longer prevents
startup, but a dedicated value is recommended.

Mail is optional at startup. To enable credential and notification emails, set
`MAIL_USERNAME`, `MAIL_PASSWORD` (a Gmail App Password), and `MAIL_FROM`.
`MAIL_HOST` and `MAIL_PORT` default to `smtp.gmail.com` and `587`.

For Vercel, set `BACKEND_API_URL` to the Render backend origin without `/api`
(for example, `https://your-service.onrender.com`). The included edge proxy
forwards `https://networkers.family/api/*` to Render while the filesystem-first
SPA fallback keeps direct page loads and refreshes working.
