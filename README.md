# Networkers

Networkers is a full-stack subscription-based chapter business community platform. Admins create chapters, members, events, and gallery updates. Members exchange referrals across chapters and track confirmed business revenue.

## Tech Stack

- Backend: Spring Boot 3, Java 17, Spring Security, JWT, Spring Data JPA, PostgreSQL (Neon), Maven
- Frontend: React, Vite, Tailwind CSS, Axios, React Router
- Backend port: `8080`
- Frontend port: `5173`

## Database

The backend is currently configured for Neon PostgreSQL:

```properties
spring.datasource.url=jdbc:postgresql://ep-blue-mouse-atyf8r3f-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channelBinding=require
spring.datasource.username=neondb_owner
```

Hibernate creates or updates the application tables automatically. The previous MySQL datasource settings and connector remain commented in the backend configuration, so they can be restored without recreating them.

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

If npm lifecycle scripts fail on Windows because `cmd.exe` is not found, run this once in PowerShell before installing:

```powershell
$env:npm_config_script_shell='C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe'
npm install
```

## Seeded User

Only the Super Admin is seeded automatically:

- Email: `admin@networkers.com`
- Password: `admin123`
- Role: `SUPER_ADMIN`

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
