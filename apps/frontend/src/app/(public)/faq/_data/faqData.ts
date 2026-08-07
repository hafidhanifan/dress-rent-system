export type FaqItem = { q: string; a: string };
export type FaqCategory = { id: string; label: string; items: FaqItem[] };

export const faqCategories: FaqCategory[] = [
  {
    id: "pemesanan",
    label: "Pemesanan & Pembayaran",
    items: [
      {
        q: "Bagaimana cara menyewa gaun di Naia?",
        a: 'Pilih gaun yang kamu suka, tentukan ukuran dan tanggal sewa di halaman detail produk, lalu lanjutkan ke checkout. Setelah pembayaran berhasil lewat Midtrans (transfer bank, e-wallet, QRIS, atau kartu kredit), pesananmu akan berstatus "Menunggu Konfirmasi" — tim kami akan mengonfirmasi dalam 1x24 jam dan menyiapkan gaunmu.',
      },
      {
        q: "Berapa lama sebelum acara saya harus memesan?",
        a: "Kami sarankan memesan minimal H-7 sebelum acara supaya ada cukup waktu untuk pengecekan dan pengiriman. Pemesanan mendadak (H-1 atau H-2) tetap bisa dilakukan selama ukuran dan tanggal yang kamu pilih masih tersedia di sistem — kalau sudah tidak ada slot, sistem otomatis akan menandainya sebagai tidak tersedia.",
      },
      {
        q: "Metode pembayaran apa saja yang bisa saya pakai?",
        a: "Kami menerima transfer virtual account (BCA, BNI, BRI, Mandiri, dan bank lainnya), e-wallet (GoPay, OVO, DANA, ShopeePay), QRIS, serta kartu kredit/debit — semuanya diproses aman lewat Midtrans sebagai payment gateway resmi.",
      },
      {
        q: "Apakah saya bisa membatalkan atau mengubah tanggal pesanan?",
        a: 'Pesanan yang masih berstatus "Menunggu Pembayaran" bisa dibatalkan sendiri lewat halaman Pesanan Saya. Untuk perubahan tanggal setelah pembayaran berhasil, hubungi admin kami minimal H-2 sebelum tanggal mulai sewa — perubahan tunduk pada ketersediaan gaun di tanggal baru yang kamu minta.',
      },
      {
        q: "Bagaimana kalau ukuran yang saya pilih ternyata kurang pas?",
        a: "Setiap gaun punya detail ukuran lengkap (lingkar dada, pinggang, pinggul, dan panjang) di halaman produk — kami sarankan mengukur badan sendiri dulu sebelum memesan. Kalau setelah pesan kamu ragu dengan ukuran yang dipilih, segera hubungi admin sebelum tanggal pengiriman; penukaran ukuran masih bisa dilakukan selama stok ukuran lain tersedia.",
      },
    ],
  },
  {
    id: "pengiriman",
    label: "Pengambilan & Pengiriman",
    items: [
      {
        q: "Apakah gaun dikirim, atau saya harus mengambil sendiri?",
        a: "Keduanya bisa. Kami menyediakan layanan antar untuk wilayah Semarang dan sekitarnya, atau kamu bisa mengambil langsung di studio kami sesuai jadwal yang disepakati. Pilihan ini bisa dikonfirmasi lewat chat admin setelah pesanan dibuat.",
      },
      {
        q: "Berapa biaya pengiriman?",
        a: "Pengiriman gratis untuk area dalam kota Semarang. Untuk area di luar itu, akan dikenakan biaya tambahan sesuai jarak yang dihitung saat konfirmasi pesanan — admin akan menginformasikan nominalnya sebelum gaun dikirim.",
      },
      {
        q: "Kapan gaun akan saya terima?",
        a: "Gaun biasanya dikirim atau siap diambil H-1 sebelum tanggal mulai sewa, supaya kamu punya waktu untuk mengecek kondisi dan mencoba sebelum hari-H. Untuk pemesanan mendadak, waktu pengiriman akan disesuaikan dan dikonfirmasi langsung oleh admin.",
      },
      {
        q: "Apa yang harus saya lakukan begitu gaun sampai?",
        a: "Segera periksa kondisi gaun — jahitan, kebersihan, dan kelengkapan aksesorisnya. Kalau ada hal yang tidak sesuai, laporkan ke admin dalam 3 jam setelah gaun diterima supaya bisa segera kami tindak lanjuti sebelum acaramu berlangsung.",
      },
    ],
  },
  {
    id: "pengembalian",
    label: "Pengembalian & Denda",
    items: [
      {
        q: "Kapan saya harus mengembalikan gaun?",
        a: "Gaun harus dikembalikan paling lambat pada tanggal selesai sewa yang tertera di halaman pesananmu, maksimal pukul 20.00 WIB pada hari tersebut — baik lewat pengambilan oleh kurir kami maupun diantar sendiri ke studio.",
      },
      {
        q: "Bagaimana cara mengembalikan gaun?",
        a: "Kamu bisa mengantar langsung ke studio Naia, atau menjadwalkan penjemputan oleh kurir kami (biaya sama seperti tarif pengiriman). Jadwal penjemputan bisa diatur lewat chat admin minimal 1 hari sebelum tanggal pengembalian.",
      },
      {
        q: "Apa yang terjadi kalau saya terlambat mengembalikan?",
        a: "Keterlambatan dikenakan denda sebesar 50% dari harga sewa per hari, dihitung mulai hari pertama setelah tanggal jatuh tempo. Contoh: kalau harga sewa Rp 300.000/hari dan kamu telat 2 hari, dendanya Rp 300.000 (2 hari × Rp 150.000). Kalau keterlambatan lebih dari 5 hari tanpa konfirmasi, gaun akan dianggap hilang dan dikenakan biaya penggantian penuh sesuai harga gaun.",
      },
      {
        q: "Bagaimana kalau gaun kotor atau rusak saat dikembalikan?",
        a: "Noda ringan yang wajar (bekas riasan, keringat, debu) sudah termasuk dalam biaya sewa — dry cleaning menjadi tanggung jawab kami. Untuk kerusakan seperti robek, jahitan lepas parah, atau noda permanen yang tidak bisa dibersihkan, kamu akan dikenakan biaya perbaikan sesuai tingkat kerusakan, atau biaya penggantian penuh kalau gaun sudah tidak bisa diperbaiki.",
      },
      {
        q: "Apakah saya perlu membayar deposit di awal?",
        a: "Untuk sebagian besar gaun, kami tidak mewajibkan deposit terpisah — cukup pembayaran sewa penuh di muka. Untuk gaun dengan kategori premium atau harga tinggi, admin kami mungkin akan menginformasikan kebijakan deposit tambahan secara khusus saat konfirmasi pesanan.",
      },
    ],
  },
  {
    id: "ukuran",
    label: "Ukuran & Ketersediaan",
    items: [
      {
        q: "Bagaimana saya tahu ukuran yang tepat untuk saya?",
        a: "Setiap halaman detail gaun menampilkan ukuran lengkap per label (S, M, L, dst) meliputi lingkar dada, pinggang, pinggul, dan panjang gaun dalam sentimeter. Ukur badanmu dengan meteran kain dan bandingkan dengan angka tersebut — kalau masih ragu, chat admin kami untuk konsultasi ukuran secara personal.",
      },
      {
        q: "Bagaimana kalau ukuran saya di antara dua pilihan?",
        a: "Kami sarankan memilih ukuran yang sedikit lebih besar, karena penyesuaian kecil (misalnya dengan peniti mode atau clip) lebih mudah dilakukan dibanding gaun yang terlalu ketat. Tim kami juga bisa membantu menyarankan ukuran terbaik berdasarkan detail ukuran badanmu.",
      },
      {
        q: "Bagaimana saya tahu gaun tersedia di tanggal yang saya inginkan?",
        a: "Sistem kami otomatis mengecek ketersediaan setiap ukuran berdasarkan jadwal sewa yang sudah ada. Kalau ukuran dan tanggal yang kamu pilih sudah dipesan orang lain, kalender pemesanan akan menandainya sebagai tidak tersedia sebelum kamu checkout — jadi tidak akan terjadi pemesanan ganda.",
      },
    ],
  },
  {
    id: "akun",
    label: "Akun & Wishlist",
    items: [
      {
        q: "Apakah saya harus membuat akun untuk menyewa gaun?",
        a: "Ya, kamu perlu membuat akun terlebih dahulu. Akun ini digunakan untuk menyimpan riwayat pesanan, wishlist gaun favorit, dan mempermudah proses checkout di kemudian hari.",
      },
      {
        q: "Bagaimana cara menyimpan gaun favorit saya?",
        a: "Klik ikon hati di kartu gaun atau di halaman detail produk. Gaun yang kamu simpan bisa dilihat kembali kapan saja lewat menu Wishlist di navbar bagian atas.",
      },
      {
        q: "Di mana saya bisa melihat riwayat pesanan saya?",
        a: 'Buka menu "Pesanan Saya" dari ikon profil di navbar. Di sana kamu bisa melihat status setiap pesanan — mulai dari menunggu pembayaran, dikonfirmasi, sedang disewa, hingga selesai dikembalikan.',
      },
    ],
  },
];
