# Atlas V1.9.3 — status sinkronisasi diperjelas

## Perbaikan terverifikasi lokal
- Konektor autentikasi PHP yang berhasil tetapi tidak mendapatkan satupun pasaran tidak lagi ditandai CONNECTED / sinkronisasi sukses.
- Status autentikasi valid tanpa katalog sekarang `AUTH_OK_NO_MARKETS`, ditampilkan sebagai `Login valid, katalog kosong`.
- `CONNECTED` hanya jika konektor mengembalikan minimal satu pasaran yang berhasil dibaca. Artinya juga bukan bukti nilai PT MENANG/KALAH tersedia.
- Tes regression `tests/session-sync-status.test.js`; `npm run check` lulus 21/21 pada lingkungan lokal.

## Belum terverifikasi / batasan
- Session terhadap server agent live dan Railway produksi belum diuji.
- Pengambilan PT MENANG/KALAH per nomor dari halaman prediksi agent tidak dibuat dalam paket ini.
- Konten hasil yang tidak ada tidak akan ditampilkan sebagai nilai benar atau angka nol.
- Status `CONNECTED` mengacu hanya pada autentikasi dan katalog, bukan ketersediaan hasil PT.

## Deployment
Pertahankan ADMIN_ID, ADMIN_PASSWORD_SALT, ADMIN_PASSWORD_HASH, SESSION_SECRET, SESSION_CREDENTIAL_KEY dan volume DATA_DIR=/data yang sudah digunakan. Jangan mempublikasikan token atau cookie.
