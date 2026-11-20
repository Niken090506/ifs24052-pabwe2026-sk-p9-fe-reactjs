# Delcom Blog — Frontend ReactJS (Studi Kasus P9)

Aplikasi Single Page Application (SPA) **Delcom Blog** dengan arsitektur **Multi-Tier & Clean Architecture (Feature-First)** menggunakan **ReactJS**, **Vite**, **Tailwind CSS**, **Toast UI Editor & Viewer**, serta **Vitest (100% Code Coverage)**.

## Fitur Utama

1. **Tiga Tingkatan Tampilan (Multi-Tier UI)**:
   - **Publik (Guest)**: Beranda galeri artikel (`/`, `/public`) dengan Sticky Top Navbar tanpa sidebar, pencarian kata kunci real-time, filter pill kategori (*Semua, Teknologi, Pendidikan, Gaya Hidup, Bisnis, Opini, Umum*), estimasi waktu baca (*reading time*), dan halaman baca artikel penuh (`/posts/:slug`) menggunakan Toast UI Markdown Viewer.
   - **Anggota / Penulis (`/author`)**: Ruang kerja *full-width* dengan 3 kartu statistik (*Total Artikel, Total Terbit, Belum Selesai/Draf*), tabel manajemen artikel dengan switch toggle publikasi instan, menu aksi kebab (`⋮`), modal editor artikel layar penuh (`max-w-[96vw]`) dengan Toast UI Editor, dan modal **AI Blog Generator** terintegrasi Search Engine.
   - **Admin (`/admin`)**: Panel pengawasan *full-width* untuk memantau statistik pengguna, direktori pengguna, dan arsip seluruh artikel lintas penulis.
2. **Standar Mutu & Aksesibilitas**:
   - Input autentikasi terstandarisasi (`id="login-username"`, `id="login-password"`, `id="login-submit"`).
   - Sinkronisasi penuh History API (`window.history.pushState` & `popstate`).
   - Memenuhi target **Lighthouse** (Performance, Accessibility, Best Practices, SEO) dan **Axe Core Accessibility**.
   - **100% Unit Test Coverage** (Statements, Branches, Functions, Lines) menggunakan Vitest & Testing Library.

## Cara Menjalankan

```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan server pengembangan (http://localhost:5174)
npm run dev

# 3. Jalankan unit test & verifikasi 100% code coverage
npm test

# 4. Build produksi statis
npm run build
```
