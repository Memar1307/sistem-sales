let currentLat = null;
let currentLon = null;

document.addEventListener('DOMContentLoaded', async () => {
    const pharmacySelect = document.getElementById('pharmacySelect');
    const gpsStatus = document.getElementById('gpsStatus');
    const submitBtn = document.getElementById('submitBtn');
    const radiusWarning = document.getElementById('radiusWarning');

    // 1. Ambil daftar apotek dari backend dan simpan koordinatnya pada dataset option[cite: 4]
    try {
        const pharmacies = await apiRequest('/visits/pharmacies');
        pharmacySelect.innerHTML = '<option value="">-- Pilih Apotek Tujuan --</option>';
        pharmacies.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.nama_apotek} (${p.alamat})`;
            opt.dataset.lat = p.latitude;
            opt.dataset.lon = p.longitude;
            pharmacySelect.appendChild(opt);
        });
    } catch (err) {
        pharmacySelect.innerHTML = '<option value="">Gagal memuat apotek</option>';
        console.error(err);
    }

    // 2. Dapatkan Lokasi GPS Browser[cite: 4]
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLat = position.coords.latitude;
                currentLon = position.coords.longitude;
                gpsStatus.innerHTML = `📍 GPS Aktif (Lat: ${currentLat.toFixed(4)}, Lon: ${currentLon.toFixed(4)})`;
                gpsStatus.style.background = '#dcfce7';
                gpsStatus.style.color = '#166534';
                submitBtn.disabled = false;
            },
            (error) => {
                gpsStatus.innerHTML = `⚠️ Gagal Mendapatkan GPS: ${error.message}. Pastikan izin lokasi aktif.`;
                gpsStatus.style.background = '#fee2e2';
                gpsStatus.style.color = '#991b1b';
            },
            { enableHighAccuracy: true }
        );
    } else {
        gpsStatus.innerHTML = "⚠️ Browser Anda tidak Mendukung Geolocation.";
    }

    // 3. Handle Submit Form Check-in dengan Validasi Radius & Foto Kamera[cite: 4]
    document.getElementById('visitForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentLat || !currentLon) {
            alert('Menunggu koordinat GPS yang valid...');
            return;
        }

        const selectedOption = pharmacySelect.options[pharmacySelect.selectedIndex];
        if (!selectedOption.value) {
            alert('Silakan pilih apotek terlebih dahulu.');
            return;
        }

        const fotoInput = document.getElementById('fotoKunjungan');
        if (!fotoInput.files || fotoInput.files.length === 0) {
            alert('Anda wajib mengambil foto lokasi menggunakan kamera.');
            return;
        }

        const pharmacy_id = selectedOption.value;
        const targetLat = parseFloat(selectedOption.dataset.lat);
        const targetLon = parseFloat(selectedOption.dataset.lon);

        // Validasi radius lokal (maksimal 150 meter)[cite: 4]
        const distKm = calculateDistance(currentLat, currentLon, targetLat, targetLon);
        const distMeter = distKm * 1000;
        const MAX_RADIUS_METERS = 150;

        if (distMeter > MAX_RADIUS_METERS) {
            if (radiusWarning) {
                radiusWarning.style.display = 'block';
                radiusWarning.innerHTML = `⚠️ Gagal Check-in! Anda berada di luar radius apotek (${Math.round(distMeter)}m). Maksimal jarak adalah ${MAX_RADIUS_METERS} meter.`;
            }
            return; 
        } else {
            if (radiusWarning) {
                radiusWarning.style.display = 'none';
            }
        }

        const activity = document.getElementById('activitySelect').value;
        const keterangan = document.getElementById('catatanInput').value;

        submitBtn.textContent = 'Memproses Check-in...';
        submitBtn.disabled = true;

        try {
            // Menggunakan FormData agar file foto dan data teks terkirim bersamaan
            const formData = new FormData();
            formData.append('pharmacy_id', parseInt(pharmacy_id));
            formData.append('latitude', currentLat);
            formData.append('longitude', currentLon);
            formData.append('activity', activity);
            formData.append('keterangan', keterangan);
            formData.append('foto', fotoInput.files[0]);

            const token = localStorage.getItem('token');
            const response = await fetch('/api/visits/checkin', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Gagal melakukan check-in.');
            }

            alert(result.message || 'Kunjungan berhasil dicatat!');
            window.location.href = '/pages/sales/dashboard.html';
        } catch (err) {
            console.error('Error detail:', err);
            alert(err.message || 'Gagal melakukan check-in.');
            submitBtn.textContent = 'Check-in & Kirim Kunjungan';
            submitBtn.disabled = false;
        }
    });
});

// Fungsi rumus Haversine untuk menghitung jarak GPS (dalam Kilometer) di frontend[cite: 4]
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}