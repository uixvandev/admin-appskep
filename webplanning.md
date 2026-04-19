# Web Admin Frontend Planning

Dokumen ini berisi daftar penyesuaian yang perlu dilakukan oleh Frontend Developer (Web Admin) untuk menyelaraskan dengan pembaruan database schema v2 (Backend API).

## 1. Modul Manajemen Kelas
*   **Penambahan Field `kode_kelas`**: 
    *   API `CreateKelas` (`POST /api/v1/kelas`) dan `UpdateKelas` (`PUT /api/v1/kelas/:id`) sekarang mendukung field request `kode_kelas` (string).
    *   **Action**: Tambahkan input teks opsional untuk "Kode Kelas" di form create/edit kelas. Jika admin mengosongkannya, backend akan membuatkannya secara otomatis (contoh: `KLS-001`).
    *   **Tampilan**: Tampilkan `kode_kelas` pada tabel daftar kelas dan halaman detail kelas.

## 2. Modul Manajemen Paket
*   **Penambahan Field `kode_paket`**:
    *   Sama seperti kelas, API `CreatePaket` dan `UpdatePaket` sekarang mendukung `kode_paket` (string).
    *   **Action**: Tambahkan input teks opsional untuk "Kode Paket" di form. Jika kosong otomatis ke-generate (`PKT-001`).
    *   **Tampilan**: Tampilkan `kode_paket` pada tabel daftar paket.

## 3. Modul Manajemen Soal
*   **Penambahan Field `kode_soal` & `kategori_soal_id`**:
    *   API `CreateSoal` dan `UpdateSoal` sekarang menerima `kode_soal` (string, opsional) dan `kategori_soal_id` (integer, opsional).
    *   **Action**: 
        1. Tambahkan input "Kode Soal".
        2. Tambahkan dropdown "Kategori Soal" (misal: TPA, TBI, TWK).
    *   **Tampilan**: Tampilkan kolom kategori dan kode soal di tabel bank soal.

## 4. (Baru) Modul Manajemen Kategori Soal
*   Terdapat tabel baru `kategori_soal` di database.
*   **Action**: Kedepannya Admin membutuhkan halaman baru (Master Data) untuk Create, Read, Update, Delete (CRUD) "Kategori Soal". *(Catatan: Repository backend sudah siap, endpoint API khusus CRUD kategori soal dapat di-request ke tim backend jika UI sudah siap).*

## 5. Konsep Soft Delete
*   Data Kelas, Paket, dan Soal sekarang menggunakan fitur **Soft Delete**.
*   **Apa yang berubah?** Saat Admin menekan tombol Hapus, data tidak akan hilang total dari database, melainkan disembunyikan (`deleted_at` terisi).
*   **Dampak ke UI**: Pada dasarnya tidak ada perubahan flow. Data yang dihapus akan otomatis hilang dari daftar tabel. Namun, ini membuka peluang untuk membuat fitur "Recycle Bin / Tong Sampah" di masa mendatang jika Admin tidak sengaja menghapus data. Khusus untuk *Soal*, pilihan jawaban yang menyertainya tetap aman tersimpan, agar histori nilai tryout mahasiswa yang terlanjur menjawab soal tersebut tidak rusak.
