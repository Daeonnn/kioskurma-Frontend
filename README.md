---

# **README FRONTEND (kioskurma-Frontend) - FINAL**

```markdown
# Kios Kurma - Frontend Application

Modern web application untuk sistem kasir toko kurma yang dibangun dengan Vue.js 3. Aplikasi ini menyediakan interface yang user-friendly untuk manajemen produk, transaksi penjualan, dan pelaporan.

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Teknologi](#-teknologi)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Struktur Project](#-struktur-project)
- [Build & Deployment](#-build--deployment)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

## ✨ Fitur

### Dashboard
- **Admin Dashboard** - Monitoring stok, alert stok rendah, statistik penjualan
- **Kasir Dashboard** - Transaksi hari ini, quick access ke POS

### Modul Aplikasi
- 🔐 **Autentikasi** - Login multi-role dengan JWT
- 📦 **Manajemen Produk** - CRUD produk dengan upload foto
- 📊 **Master Data** - Kelola distributor, jenis, satuan
- 👥 **Manajemen Pegawai** - Kelola data pegawai dan role
- 💰 **Point of Sale (POS)** - Transaksi dengan keranjang belanja
- 🧾 **Cetak Struk** - Generate dan print struk otomatis
- 📈 **Laporan** - Laporan penjualan dengan export PDF
- 📱 **Responsive Design** - Optimal di desktop & mobile

## 🛠 Teknologi

- **Framework:** Vue.js 3 (Composition API)
- **Build Tool:** Vite 5.x
- **Routing:** Vue Router 4
- **State Management:** Pinia / Vuex 4
- **UI Framework:** Tailwind CSS 3
- **HTTP Client:** Axios
- **Charts:** Chart.js / ApexCharts

## 📌 Persyaratan Sistem

- Node.js >= 16.x
- NPM >= 8.x atau Yarn >= 1.22
- Backend API harus running (lihat [kasirkurmabackend](https://github.com/Daeonnn/kasirkurmabackend))

## 📦 Instalasi

```bash
# Clone Repository
git clone https://github.com/Daeonnn/kioskurma-Frontend.git
cd kioskurma-Frontend

# Install Dependencies
npm install
# atau
yarn install

# Setup Environment
cp .env.example .env

# Edit .env sesuai konfigurasi
# VITE_APP_NAME="Kios Kurma"
# VITE_API_URL=http://localhost:8000/api
# VITE_STORAGE_URL=http://localhost:8000/storage

# Jalankan Development Server
npm run dev
# atau
yarn dev