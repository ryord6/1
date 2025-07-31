# 1

# Karaokei - Karaoke Web Application (Next.js + Prisma Edition)

## Overview

Karaokei adalah aplikasi karaoke web modern yang memungkinkan pengguna menemukan ribuan lagu karaoke, mencari lagu, menyukai favorit, serta berinteraksi dengan komunitas penyanyi. Aplikasi ini menyediakan pengalaman karaoke berbasis YouTube dengan fitur sosial seperti autentikasi pengguna, manajemen lagu, pencarian cerdas, dan sistem interaksi komunitas.

Dengan penggunaan **Next.js**, Karaokei kini memiliki arsitektur full-stack yang terintegrasi dalam satu proyek monorepo. Frontend dan backend berada dalam struktur proyek yang sama, memungkinkan berbagi tipe data (TypeScript) secara langsung antara client dan server, serta menyederhanakan pengembangan, pengujian, dan deployment.

---

## User Preferences
- **teruskan dan sempurnakan project yang sudah ada** proses yang sudah saya kerjakan (masih butuh perbaikan) contohnya searchClicks masih bersifat global (sama di semua client pengguna) harus di perbaiki menjadi data per client atau per user (untuk user yang login) 
- **Gaya komunikasi**: Bahasa sehari-hari yang sederhana dan mudah dipahami.
- **Target pengguna**: Pengguna biasa hingga pengembang, dengan fokus pada pengalaman intuitif dan performa tinggi.
- **overlay Search moderen = ketika pengguna klik tombol Search, akan muncul slide dari kiri ke kanan 80% untuk interface Search, dan klik tanda panah kiri atau area kosong 20% (menggunakan background black transparant 30%) sebelah kiri untuk kembali (lihat gambar)**
---

## System Architecture

### Full-Stack Architecture with Next.js

| Aspek | Deskripsi |
| --- | --- |
| **Framework** | Next.js 14 (App Router) dengan TypeScript |
| **Runtime** | Node.js (Server Components & Route Handlers) |
| **Rendering** | Hybrid: Static Site Generation (SSG), Server-Side Rendering (SSR), dan Client-Side Rendering (CSR) |
| **Routing** | App Router (file-based routing di `/app`) |
| **API** | Route Handlers (API Routes di `/app/api`) |
| **UI Components** | React Server Components & Client Components |
| **Styling** | Tailwind CSS dengan CSS Custom Properties untuk theming |
| **State Management** | TanStack Query (React Query) untuk state server-side, Zustand opsional untuk state lokal |
| **Forms** | React Hook Form dengan Zod untuk validasi tipe aman |
| **Database** | PostgreSQL dengan Prisma ORM (menggantikan Drizzle ORM) |
| **Authentication** | Replit Auth + OAuth (Google) dengan manajemen sesi menggunakan cookies |
| **Deployment** | Vercel (opsional Replit) dengan integrasi CI/CD otomatis |

> ✅ **Keuntungan Migrasi ke Next.js:**
> 
> - Integrasi penuh frontend dan backend dalam satu proyek.
> - Berbagi tipe TypeScript antara client dan server tanpa konfigurasi tambahan.
> - Performa lebih baik dengan SSR/SSG dan caching bawaan.
> - Route Handlers menggantikan Express.js API secara native.
> - Mudah di-deploy ke Vercel dengan zero-config.

---

## Data Storage & Schema Management

### Primary Database

- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: [Prisma ORM](https://prisma.io) untuk operasi database yang aman secara tipe
- **Schema File**: `prisma/schema.prisma`
- **Migrations**: Dikelola via `prisma migrate dev` dan `prisma migrate deploy`
- **Studio**: `prisma studio` untuk eksplorasi data secara visual

### Session Storage

- Disimpan di database PostgreSQL menggunakan tabel `Session` (dikelola oleh Prisma).
- Cookies digunakan untuk menyimpan session ID di sisi klien.
- Durasi sesi: 7 hari (dapat dikonfigurasi).

### Environment Configuration

- File: `.env.local` untuk konfigurasi lokal
- Variabel penting:
  
  ```env
  DATABASE_URL="postgresql://user:pass@aws-us-east-1-neon.example.com/karaokei?sslmode=require"
  NEXTAUTH_SECRET="your-secure-random-secret"
  REPLIT_AUTH_CLIENT_ID="..."
  REPLIT_AUTH_CLIENT_SECRET="..."
  NODE_ENV="development"
  ```
  

---

## Updated `schema.prisma` (Lengkap & Dioptimalkan)

Berikut adalah skema Prisma yang telah dilengkapi dan dioptimalkan untuk kebutuhan aplikasi Karaokei:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id             String      @id @default(cuid())
  name           String?
  email          String      @unique
  image          String?
  googleId       String?     @unique
  emailVerified  DateTime?
  role           UserRole    @default(USER)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  // Relasi
  accounts       Account[]
  sessions       Session[]
  likes          Like[]
  comments       Comment[]
  searchHistory  SearchQuery[]

  @@map("users")
}

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?
  access_token       String?
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?
  session_state      String?

  user               User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  createdAt    DateTime @default(now())

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

model Song {
  id          String   @id @default(cuid())
  title       String   @db.Text
  artist      String   @db.Text
  youtubeId   String   @unique @db.VarChar(20)
  thumbnail   String?
  duration    Int?     // dalam detik
  lyrics      String?  @db.Text
  viewCount   Int      @default(0)
  likeCount   Int      @default(0)
  category    SongCategory?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relasi
  likes       Like[]
  comments    Comment[]

  @@index([title, artist])
  @@index([category])
  @@index([createdAt desc])
  @@fulltext([title, artist])
  @@map("songs")
}

model Like {
  id        String   @id @default(cuid())
  userId    String
  songId    String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  song      Song     @relation(fields: [songId], references: [id], onDelete: Cascade)

  @@unique([userId, songId])
  @@map("likes")
}

model Comment {
  id        String   @id @default(cuid())
  content   String   @db.Text
  userId    String
  songId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  song      Song     @relation(fields: [songId], references: [id], onDelete: Cascade)

  @@map("comments")
}

model SearchQuery {
  id        String   @id @default(cuid())
  query     String   @db.Text
  userId    String?
  ipAddress String?  // untuk anonim
  count     Int      @default(1)
  lastUsed  DateTime @default(now())

  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([query])
  @@index([userId])
  @@index([lastUsed desc])
  @@map("search_queries")
}

enum UserRole {
  USER
  MODERATOR
  ADMIN
}

enum SongCategory {
  NEW
  POPULAR
  VIRAL
  CLASSIC
  PARTY
  ROMANTIC
}
```

> 💡 **Catatan Skema:**
> 
> - `cuid()` digunakan untuk ID unik yang aman dan ramah URL.
> - Indeks dibuat untuk kolom yang sering di-query (judul, artis, kategori).
> - Full-text search diaktifkan untuk pencarian cerdas di kolom `title` dan `artist`.
> - Relasi diatur dengan `onDelete: Cascade` atau `SetNull` untuk integritas data.

---

## Key Components (Diperbarui untuk Next.js)

### 1. Authentication System

- **Replit Auth + Google OAuth** terintegrasi melalui `next-auth`.
- **Session management** menggunakan database (Prisma) dan cookies.
- **Middleware**: `middleware.ts` untuk proteksi route (contoh: `/profile`, `/api/likes`).
- **Protected API Routes**: Otomatis diverifikasi via `auth()` di Route Handlers.

### 2. Song Management

- Lagu diambil dari YouTube berdasarkan `youtubeId`.
- Metadata disimpan di database: judul, artis, durasi, lirik, thumbnail.
- Kategori dinamis: `NEW`, `POPULAR`, `VIRAL`, dll.
- View count diperbarui saat lagu dibuka (SSR/ISR untuk performa).

### 3. Search System

- **Full-text search** menggunakan `Prisma.$queryRaw` dengan `TO_TSVECTOR`.
- **Debouncing** di sisi klien (React) sebelum kirim ke API.
- **Search history** disimpan per pengguna (atau IP jika anonim).
- **Suggestions**: "Most wanted" berdasarkan `SearchQuery.count`.

### 4. User Engagement

- **Like/Unlike**: API Route Handler dengan optimistic update di klien.
- **Komentar**: CRUD via API dengan validasi Zod.
- **Analytics**: View, like, comment dihitung untuk rekomendasi trending.

### 5. UI/UX Components

- **Dark/Light Mode**: Mendeteksi preferensi sistem via `prefers-color-scheme`.
- **Responsive Design**: Mobile-first dengan Tailwind.
- **Loading States**: Skeleton UI saat data dimuat (SSR/Query).
- **Toast Notifications**: `sonner` atau `react-hot-toast`.
- **Modal**: Menggunakan `@radix-ui/react-dialog`.

---

## Data Flow (Diperbarui)

### Authentication Flow

1. Pengguna klik "Login" → `/api/auth/google`
2. Google OAuth mengarahkan kembali ke `/api/auth/callback`
3. Session dibuat, disimpan di tabel `Session` via Prisma
4. Cookie `next-auth.session-token` dikirim ke klien
5. Middleware memverifikasi sesi untuk akses ke halaman terproteksi

### Song Discovery Flow

1. Halaman `/`, `/popular`, `/viral` menggunakan `generateStaticParams` (SSG) atau `fetch` (SSR)
2. Data diambil dari Prisma: `prisma.song.findMany({ where: { category } })`
3. Di-cache oleh Next.js (ISR opsional)
4. Ditampilkan dengan skeleton loading

### Search Flow

1. Input pencarian → debounce 300ms
2. Fetch ke `/api/search?q=...`
3. Server jalankan:
  
  ```ts
  const results = await prisma.$queryRaw`
    SELECT * FROM "Song"
    WHERE to_tsvector('english', title || ' ' || artist) @@ to_tsquery('english', ${query})
    ORDER BY ts_rank(to_tsvector('english', title || ' ' || artist), to_tsquery('english', ${query})) DESC
  `
  ```
  
4. Simpan query ke `SearchQuery` (tambah count jika sudah ada)
5. Hasil dikirim ke klien

### Engagement Flow

1. Klik "Like" → POST `/api/likes` dengan `songId`
2. Cek session → cari `Like` dengan `userId` + `songId`
3. Jika ada, hapus (unlike), jika tidak, buat baru
4. Update `likeCount` di `Song`
5. Kembalikan status → UI update secara optimistik

---

## External Dependencies

### Core Dependencies

```json
{
  "next": "^14",
  "react": "^18",
  "react-dom": "^18",
  "typescript": "^5",
  "prisma": "^5"
}
```

### UI/UX Libraries

```json
{
  "tailwindcss": "^3.4",
  "class-variance-authority": "^0.7",
  "clsx": "^2.0",
  "lucide-react": "^0.370.0",
  "@radix-ui/react-dialog": "^1.0",
  "@radix-ui/react-toast": "^1.1"
}
```

### Backend & Auth

```json
{
  "next-auth": "^4",
  "zod": "^3.22",
  "react-hook-form": "^7.47"
}
```

### State & Data

```json
{
  "@tanstack/react-query": "^5",
  "sonner": "^1.3"
}
```

---

## Development Workflow

- `npm run dev` → Jalankan Next.js dev server (port 3000)
- `npx prisma studio` → Lihat dan edit data
- `npx prisma migrate dev --name init` → Buat migrasi baru
- Hot Reload: Otomatis untuk komponen dan API
- Shared Types: Semua tipe Prisma tersedia di client dan server via `@prisma/client`

---

## Deployment Strategy

### Build Process

- Frontend: Next.js build otomatis (SSG/SSR)
- Backend: Route Handlers dikompilasi ke fungsi serverless
- Output: Static + Serverless Functions
- Command: `next build`

### Production Environment

- Hosting: Vercel (rekomendasi) atau Replit
- Database: Neon PostgreSQL (serverless, autoscaling)
- Environment Variables: Diatur di dashboard Vercel/Replit
- Caching: Vercel Edge Cache untuk halaman statis

### CI/CD

- Otomatis deploy saat push ke `main`
- Preview deployment untuk setiap PR

---

## Monitoring & Error Handling

- **Logging**: `console.log` & `error` tercapture di Vercel Logs
- **Error Boundaries**: Komponen React untuk tangani error UI
- **API Error Handling**: Try-catch di Route Handlers + response JSON
- **Database Error**: Prisma menangani connection loss & retry
- **Session Cleanup**: Cron job opsional untuk hapus session expired

---

## Kesimpulan

Dengan migrasi ke **Next.js + Prisma**, Karaokei menjadi aplikasi full-stack yang lebih cepat, lebih aman, dan lebih mudah dikembangkan. Integrasi sempurna antara frontend dan backend memungkinkan:

- Berbagi tipe data secara langsung
- Pengembangan lebih cepat dengan HMR & SSR
- Deployment sederhana ke Vercel
- Performa tinggi dengan caching dan optimasi bawaan

Aplikasi siap untuk skala dan pengembangan fitur lanjutan seperti rekomendasi AI, live singing, atau integrasi dengan YouTube API secara real-time.

---

> 📁 **Struktur Proyek Rekomendasi**
> 
> ```
> /app
>   /(main)              - Halaman utama
>   /api                 - Route Handlers
>   /search              - Pencarian
>   /song/[id]           - Detail lagu
>   /profile             - Profil pengguna
> /components            - Komponen UI
> /lib                   - Fungsi bersama, client Prisma, auth
> /public                - Aset statis
> /prisma                - Skema dan migrasi
> next.config.js
> tailwind.config.ts
> tsconfig.json
> ```