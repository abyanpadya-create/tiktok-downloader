const urlInput = document.getElementById('urlInput');
const downloadBtn = document.getElementById('downloadBtn');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const resultDiv = document.getElementById('result');

// Elemen hasil
const videoPlayer = document.getElementById('videoPlayer');
const videoTitle = document.getElementById('videoTitle');
const videoAuthor = document.getElementById('videoAuthor');
const videoDuration = document.getElementById('videoDuration');
const videoStats = document.getElementById('videoStats');
const downloadVideoLink = document.getElementById('downloadVideoLink');
const downloadMusicLink = document.getElementById('downloadMusicLink');

// Fungsi untuk menyembunyikan semua state
function hideAll() {
  loading.classList.add('hidden');
  errorDiv.classList.add('hidden');
  resultDiv.classList.add('hidden');
}

// Fungsi untuk menampilkan error
function showError(message) {
  hideAll();
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
}

// Fungsi untuk memformat angka (juta, ribu)
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Fungsi untuk memproses download
async function processDownload() {
  const url = urlInput.value.trim();

  // Validasi sederhana
  if (!url) {
    showError('Masukkan link TikTok terlebih dahulu');
    return;
  }

  if (!url.includes('tiktok.com')) {
    showError('Link harus dari TikTok (tiktok.com)');
    return;
  }

  // Tampilkan loading
  hideAll();
  loading.classList.remove('hidden');
  downloadBtn.disabled = true;

  try {
    const response = await fetch('/api/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Gagal memproses video');
    }

    // Tampilkan hasil
    displayResult(data.data);

  } catch (err) {
    showError(err.message || 'Terjadi kesalahan. Coba lagi.');
  } finally {
    downloadBtn.disabled = false;
  }
}

// Fungsi untuk menampilkan hasil
function displayResult(data) {
  hideAll();

  // Set video source
  videoPlayer.src = data.videoNoWatermark || data.video;
  videoPlayer.poster = data.cover || '';

  // Set info
  videoTitle.textContent = data.title || 'TikTok Video';
  videoAuthor.textContent = data.author ? `@${data.author}` : '';
  
  if (data.duration) {
    videoDuration.textContent = `⏱️ ${data.duration} detik`;
  } else {
    videoDuration.textContent = '';
  }

  // Set stats
  videoStats.innerHTML = '';
  if (data.stats) {
    const { plays, likes, comments, shares } = data.stats;
    if (plays) videoStats.innerHTML += `<span>▶️ ${formatNumber(plays)}</span>`;
    if (likes) videoStats.innerHTML += `<span>❤️ ${formatNumber(likes)}</span>`;
    if (comments) videoStats.innerHTML += `<span>💬 ${formatNumber(comments)}</span>`;
    if (shares) videoStats.innerHTML += `<span>🔄 ${formatNumber(shares)}</span>`;
  }

  // Set download links
  downloadVideoLink.href = data.videoNoWatermark || data.video;
  downloadVideoLink.setAttribute('download', `tiktok_${data.id || 'video'}.mp4`);

  if (data.music) {
    downloadMusicLink.href = data.music;
    downloadMusicLink.classList.remove('hidden');
    downloadMusicLink.setAttribute('download', `tiktok_audio_${data.id || 'music'}.mp3`);
  } else {
    downloadMusicLink.classList.add('hidden');
  }

  resultDiv.classList.remove('hidden');
}

// Event listeners
downloadBtn.addEventListener('click', processDownload);

urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    processDownload();
  }
});

// Auto-paste detection (opsional)
urlInput.addEventListener('paste', () => {
  // Clear error saat user paste
  errorDiv.classList.add('hidden');
});