const API_BASE = 'https://api.nexadev.my.id/maker/fakeff';

let busy = false, currentNick = '';

// By VanX
(function initTheme() {
    const saved = localStorage.getItem('nxTheme') || 'dark';
    if (saved === 'light') document.documentElement.classList.remove('dark');
    document.getElementById('themeIcon').className = saved === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
})();
function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    document.getElementById('themeIcon').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('nxTheme', isDark ? 'dark' : 'light');
}

// By VanX
const inp = document.getElementById('nickname');
inp.addEventListener('input', function () {
    document.getElementById('charCount').textContent = this.value.length;
    this.classList.remove('error');
});
inp.addEventListener('keypress', e => { if (e.key === 'Enter') generate(); });

// By VanX
function toast(msg, type = 'success', ms = 3000) {
    const el = document.getElementById('toast');
    const ico = { success:'fa-check-circle', error:'fa-times-circle', warning:'fa-exclamation-circle', info:'fa-info-circle' };
    el.className = `toast ${type}`;
    el.querySelector('i').className = `fas ${ico[type] || 'fa-info-circle'}`;
    document.getElementById('toastMsg').textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), ms);
}

function apiUrl(nick) { return `${API_BASE}?nickname=${encodeURIComponent(nick)}`; }

// ── GENERATE ──
async function generate() {
    if (busy) return;
    const nick = inp.value.trim();
    if (!nick) { toast('Masukkan nickname terlebih dahulu!', 'warning'); inp.classList.add('error'); inp.focus(); return; }
    if (!navigator.onLine) { toast('Kamu sedang offline!', 'error'); return; }

    currentNick = nick;
    busy = true;

    document.getElementById('generateBtn').disabled = true;
    document.getElementById('loading').classList.add('show');
    document.getElementById('errorWrap').classList.remove('show');
    document.getElementById('resultWrap').classList.remove('show');

    try {
        // Load gambar untuk preview (langsung dari API, tampilan saja)
        const img = document.getElementById('resultImg');
        img.onload = () => {
            document.getElementById('loading').classList.remove('show');
            document.getElementById('resultWrap').classList.add('show');
            setTimeout(() => document.getElementById('resultWrap').scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
            busy = false;
            document.getElementById('generateBtn').disabled = false;
            toast('Berhasil membuat Fake FF!', 'success');
        };
        img.onerror = () => showError('Gagal memuat gambar dari server.');
        img.src = apiUrl(nick);
        
    } catch (err) {
        showError(err.message || 'Gagal menghubungi server.');
    }
}

// ── SHARE ──
async function shareImage() {
    if (!currentNick) {
        toast('Generate dulu!', 'warning');
        return;
    }

    if (navigator.share) {
        try {
            await navigator.share({
                title: `Fake FF - ${currentNick}`,
                text: `Cek fake FF ku: ${currentNick}`,
                url: window.location.href
            });
        } catch (e) {
            if (e.name !== 'AbortError') {
                await navigator.clipboard.writeText(apiUrl(currentNick));
                toast('Link disalin!', 'success');
            }
        }
    } else {
        await navigator.clipboard.writeText(apiUrl(currentNick));
        toast('Link disalin ke clipboard!', 'success');
    }
}

function openImage() {
    if (!currentNick) return;
    window.open(apiUrl(currentNick), '_blank');
}
function showError(msg) {
    document.getElementById('loading').classList.remove('show');
    document.getElementById('generateBtn').disabled = false;
    document.getElementById('errorDesc').textContent = msg;
    document.getElementById('errorWrap').classList.add('show');
    toast('Gagal membuat gambar', 'error');
    busy = false;
}
function retry() { document.getElementById('errorWrap').classList.remove('show'); generate(); }
function openDirect() {
    const nick = currentNick || inp.value.trim();
    if (!nick) { toast('Masukkan nickname!', 'warning'); return; }
    window.open(apiUrl(nick), '_blank');
    toast('Buka tab baru, tahan gambar untuk simpan', 'info', 4000);
}
function reset() {
    ['resultWrap','errorWrap','loading'].forEach(id => document.getElementById(id).classList.remove('show'));
    document.getElementById('resultImg').src = '';
    document.getElementById('generateBtn').disabled = false;
    inp.value = '';
    document.getElementById('charCount').textContent = '0';
    inp.classList.remove('error');
    inp.focus();
    busy = false; currentNick = '';
}
