document.addEventListener('DOMContentLoaded', function() {
    const namaInput = document.getElementById('nama');
    const nipInput = document.getElementById('nip');
    const pangkatGolonganInput = document.getElementById('pangkat-golongan');
    const jabatanInput = document.getElementById('jabatan');
    const unitKerjaInput = document.getElementById('unit-kerja');
    const koordinatInput = document.getElementById('koordinat');
    const ambilLokasiButton = document.getElementById('ambil-lokasi');
    const videoElement = document.getElementById('video');
    const canvasElement = document.getElementById('canvas');
    const hasilFotoElement = document.getElementById('hasil-foto');
    const ambilFotoButton = document.getElementById('ambil-foto');
    const absenMasukButton = document.getElementById('absen-masuk');
    const absenKeluarButton = document.getElementById('absen-keluar');
    const riwayatAbsensiList = document.getElementById('riwayat-absensi');
    const formAbsensi = document.getElementById('form-absensi');

    let streamKamera;
    let fotoBase64;
    let lokasiKoordinat;

    // Fungsi untuk mendapatkan lokasi
    function dapatkanLokasi() {
        if (navigator.geolocation) {
            koordinatInput.value = 'Mencari lokasi...';
            navigator.geolocation.getCurrentPosition(posisi => {
                lokasiKoordinat = `${posisi.coords.latitude}, ${posisi.coords.longitude}`;
                koordinatInput.value = lokasiKoordinat;
            }, () => {
                koordinatInput.value = 'Gagal mendapatkan lokasi.';
            });
        } else {
            koordinatInput.value = 'Geolocation tidak didukung oleh browser Anda.';
        }
    }

    // Event listener untuk tombol Ambil Lokasi
    ambilLokasiButton.addEventListener('click', dapatkanLokasi);

    // Fungsi untuk mengaktifkan kamera
    async function aktifkanKamera() {
        try {
            streamKamera = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } }); // Gunakan kamera depan
            videoElement.srcObject = streamKamera;
        } catch (error) {
            console.error('Gagal mengakses kamera.', error);
            alert('Gagal mengakses kamera. Pastikan izin kamera diberikan.');
        }
    }

    // Fungsi untuk mengambil foto
    function ambilFoto() {
        if (streamKamera) {
            const context = canvasElement.getContext('2d');
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
            fotoBase64 = canvasElement.toDataURL('image/png');
            hasilFotoElement.src = fotoBase64;
            hasilFotoElement.style.display = 'block';
        } else {
            alert('Kamera belum aktif.');
        }
    }

    // Event listener untuk tombol Ambil Foto
    ambilFotoButton.addEventListener('click', ambilFoto);
    aktifkanKamera(); // Aktifkan kamera saat halaman dimuat

    // Fungsi untuk menyimpan data absensi ke localStorage
    function simpanAbsensi(nama, nip, pangkat, jabatan, unitKerja, koordinat, foto, waktu, jenis) {
        const absensi = {
            nama: nama,
            nip: nip,
            pangkat: pangkat,
            jabatan: jabatan,
            unitKerja: unitKerja,
            koordinat: koordinat,
            foto: foto,
            waktu: waktu,
            jenis: jenis
        };
        let riwayat = localStorage.getItem('riwayatAbsensi');
        riwayat = riwayat ? JSON.parse(riwayat) : [];
        riwayat.push(absensi);
        localStorage.setItem('riwayatAbsensi', JSON.stringify(riwayat));
        tampilkanRiwayatAbsensi();
    }

    // Fungsi untuk menampilkan riwayat absensi dari localStorage
    function tampilkanRiwayatAbsensi() {
        riwayatAbsensiList.innerHTML = '';
        const riwayat = localStorage.getItem('riwayatAbsensi');
        if (riwayat) {
            const dataAbsensi = JSON.parse(riwayat);
            dataAbsensi.forEach(item => {
                const listItem = document.createElement('li');
                const imgElement = item.foto ? `<img src="${item.foto}" alt="Foto Absensi" style="max-width: 80px; height: auto;">` : 'Tidak ada foto';
                listItem.innerHTML = `
                    <strong>${item.nama}</strong> (${item.nip}) - ${item.jenis} pada ${item.waktu}<br>
                    Pangkat/Golongan: ${item.pangkat}, Jabatan: ${item.jabatan}, Unit Kerja: ${item.unitKerja}<br>
                    Koordinat: ${item.koordinat}<br>
                    Foto: ${imgElement}
                `;
                riwayatAbsensiList.appendChild(listItem);
            });
        }
    }

    // Fungsi untuk melakukan absensi
    function lakukanAbsensi(jenisAbsensi) {
        const nama = namaInput.value.trim();
        const nip = nipInput.value.trim();
        const pangkat = pangkatGolonganInput.value.trim();
        const jabatan = jabatanInput.value.trim();
        const unitKerja = unitKerjaInput.value.trim();

        if (nama && nip && pangkat && jabatan && unitKerja && lokasiKoordinat && fotoBase64) {
            const waktu = new Date().toLocaleString();
            simpanAbsensi(nama, nip, pangkat, jabatan, unitKerja, lokasiKoordinat, fotoBase64, waktu, jenisAbsensi);
            formAbsensi.reset(); // Reset form setelah absensi
            koordinatInput.value = 'Mencari lokasi...';
            hasilFotoElement.style.display = 'none';
            fotoBase64 = null;
            lokasiKoordinat = null;
            dapatkanLokasi(); // Ambil lokasi lagi untuk absensi berikutnya
        } else {
            alert('Harap isi semua data, ambil lokasi, dan ambil foto sebelum absen.');
        }
    }

    // Event listener untuk tombol Absen Masuk
    absenMasukButton.addEventListener('click', function() {
        lakukanAbsensi('Masuk');
    });

    // Event listener untuk tombol Absen Keluar
    absenKeluarButton.addEventListener('click', function() {
        lakukanAbsensi('Keluar');
    });

    // Tampilkan riwayat absensi saat halaman dimuat
    tampilkanRiwayatAbsensi();
    dapatkanLokasi(); // Ambil lokasi awal saat halaman dimuat
});