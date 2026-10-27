// ==========================================
// Happy Birthday Web - Interactive Engine
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------------
    // State & Config
    // ------------------------------------------
    const defaultData = {
        name: 'Bintang Kesayangan',
        age: '21',
        sender: 'Dari seseorang yang selalu mendukung & mendoakanmu ✨',
        role: 'Spesial',
        message: `Selamat ulang tahun yang paling hangat! 🎂\n\nSemoga di usia yang baru ini, setiap langkahmu dipenuhi dengan kebahagiaan yang melimpah, kesehatan yang prima, dan ketenangan hati.\n\nTerima kasih sudah menjadi sosok yang selalu membawa senyuman dan energi positif bagi orang-orang di sekitarmu. Tetaplah bermimpi tinggi, tetaplah menjadi dirimu yang luar biasa, dan jangan pernah ragu bahwa hal-hal terbaik sedang menunggumu di depan.\n\nSemoga semua impian, doa, dan harapan yang kamu bisikkan dalam hati hari ini segera menjadi kenyataan. Selamat merayakan hari kelahiranmu! 🥳💖`
    };

    let birthdayData = { ...defaultData };
    let isCandleLit = true;
    let micStream = null;
    let micAnalyser = null;
    let micAnimationId = null;
    let isMicActive = false;
    let wishesUnlocked = 0;

    const balloonWishes = [
        "🌟 Semoga selalu dikelilingi orang-orang yang tulus menyayangimu!",
        "💰 Rezeki berlimpah, berkah, dan mengalir lancar dari segala arah!",
        "🚀 Karier dan segala usahamu makin sukses serta bersinar terang!",
        "💖 Diberi kesehatan prima, umur panjang, dan ketenangan batin!",
        "✈️ Semua impian jalan-jalan dan wishlist tahun ini terwujud!",
        "✨ Awet muda, selalu glowing luar dalam, dan tetap ceria!",
        "🌈 Setiap masalah segera menemukan jalan keluar yang paling indah!",
        "🎁 Kejutan manis dan berkah tak terduga datang menyapamu setiap hari!"
    ];

    // Read URL Parameters if present
    loadFromUrlParams();

    // ------------------------------------------
    // DOM Elements
    // ------------------------------------------
    const introOverlay = document.getElementById('intro-overlay');
    const openGiftBtn = document.getElementById('open-gift-btn');
    const mainContent = document.getElementById('main-content');
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    const musicIcon = document.getElementById('music-icon');
    const musicText = document.getElementById('music-text');
    const confettiBtn = document.getElementById('confetti-btn');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const editBtn = document.getElementById('edit-btn');
    const shareBtn = document.getElementById('share-btn');

    // Cake & Candle Elements
    const candleFlame = document.getElementById('candle-flame');
    const candleSmoke = document.getElementById('candle-smoke');
    const blowBtn = document.getElementById('blow-btn');
    const relightBtn = document.getElementById('relight-btn');
    const micToggleBtn = document.getElementById('mic-toggle-btn');
    const candleStatus = document.getElementById('candle-status');
    const wishModal = document.getElementById('wish-modal');
    const closeWishModalBtn = document.getElementById('close-wish-modal');

    // Envelope & Card
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    const openLetterBtn = document.getElementById('open-letter-btn');
    const cardModal = document.getElementById('card-modal');
    const closeCardModal = document.getElementById('close-card-modal');

    // Customize Modal
    const editModal = document.getElementById('edit-modal');
    const closeEditModal = document.getElementById('close-edit-modal');
    const editForm = document.getElementById('edit-form');
    const inputName = document.getElementById('input-name');
    const inputAge = document.getElementById('input-age');
    const inputSender = document.getElementById('input-sender');
    const inputMessage = document.getElementById('input-message');
    const copyLinkBtn = document.getElementById('copy-link-btn');

    // Toast element
    const toast = document.getElementById('toast');

    // ------------------------------------------
    // Canvas Setup: Confetti & Fireworks
    // ------------------------------------------
    const confettiCanvas = document.getElementById('confetti-canvas');
    const confettiCtx = confettiCanvas.getContext('2d');
    let confettiParticles = [];

    const fireworksCanvas = document.getElementById('fireworks-canvas');
    const fireworksCtx = fireworksCanvas.getContext('2d');
    let fireworksParticles = [];

    function resizeCanvases() {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvases);
    resizeCanvases();

    // ------------------------------------------
    // Init Visual Display with Data
    // ------------------------------------------
    updateDisplayData();

    function updateDisplayData() {
        document.querySelectorAll('.recipient-name-text').forEach(el => el.textContent = birthdayData.name);
        document.querySelectorAll('.recipient-age-text').forEach(el => el.textContent = birthdayData.age);
        document.querySelectorAll('.sender-text').forEach(el => el.textContent = birthdayData.sender);
        
        const cardMsgEl = document.getElementById('card-message-text');
        if (cardMsgEl) {
            cardMsgEl.innerHTML = birthdayData.message.replace(/\n/g, '<br>');
        }
    }

    // ------------------------------------------
    // Intro Unboxing Sequence
    // ------------------------------------------
    openGiftBtn.addEventListener('click', () => {
        // Play fanfare sound & start background melody
        window.birthdayAudio.playFanfare();
        setTimeout(() => {
            window.birthdayAudio.startMelody();
            updateMusicButtonState(true);
        }, 1200);

        // Explode gift box animation
        const giftBox = document.querySelector('.gift-box-3d');
        if (giftBox) {
            giftBox.classList.add('opened');
        }

        // Blast huge confetti
        launchConfettiExplosion(window.innerWidth / 2, window.innerHeight / 2, 120);

        // Hide overlay smoothly
        setTimeout(() => {
            introOverlay.classList.add('hidden');
            mainContent.classList.remove('content-hidden');
            mainContent.classList.add('content-visible');
            
            // Continuous gentle balloons spawn
            startBalloonSpawner();
            // Launch welcoming fireworks
            launchFirework(window.innerWidth * 0.3, window.innerHeight * 0.4);
            launchFirework(window.innerWidth * 0.7, window.innerHeight * 0.35);
        }, 800);
    });

    // ------------------------------------------
    // Music Player Control
    // ------------------------------------------
    musicToggleBtn.addEventListener('click', () => {
        const isPlaying = window.birthdayAudio.toggleMelody();
        updateMusicButtonState(isPlaying);
        showToast(isPlaying ? '🎵 Musik ulang tahun diputar' : '🔇 Musik dijeda');
    });

    function updateMusicButtonState(isPlaying) {
        if (isPlaying) {
            musicToggleBtn.classList.add('playing');
            musicText.textContent = 'Musik: On';
            musicIcon.textContent = '🎶';
        } else {
            musicToggleBtn.classList.remove('playing');
            musicText.textContent = 'Musik: Off';
            musicIcon.textContent = '🔇';
        }
    }

    // ------------------------------------------
    // Theme Switcher (3 Luxury Moods)
    // ------------------------------------------
    const themes = ['theme-twilight', 'theme-rose', 'theme-luxury'];
    let currentThemeIdx = 0;

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.remove(themes[currentThemeIdx]);
        currentThemeIdx = (currentThemeIdx + 1) % themes.length;
        document.body.classList.add(themes[currentThemeIdx]);

        const themeNames = ['🌌 Twilight Indigo', '🌸 Rose Champagne', '✨ Midnight Luxury'];
        showToast(`Tema berganti: ${themeNames[currentThemeIdx]}`);
        window.birthdayAudio.playSparkleChime();
    });

    // ------------------------------------------
    // Confetti Cannon Button
    // ------------------------------------------
    confettiBtn.addEventListener('click', (e) => {
        const rect = confettiBtn.getBoundingClientRect();
        launchConfettiExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2, 80);
        window.birthdayAudio.playConfetti();
    });

    // ------------------------------------------
    // Interactive Candle & Cake
    // ------------------------------------------
    function blowOutCandle() {
        if (!isCandleLit) return;
        isCandleLit = false;

        // Sound & Animation
        window.birthdayAudio.playBlow();
        candleFlame.classList.add('flame-out');
        candleSmoke.classList.add('active');

        candleStatus.textContent = '🎉 Lilin telah ditiup! Doamu sedang melesat ke langit...';
        blowBtn.disabled = true;
        relightBtn.disabled = false;

        // Big celebration effects
        setTimeout(() => {
            window.birthdayAudio.playFanfare();
            launchConfettiExplosion(window.innerWidth / 2, window.innerHeight * 0.45, 140);
            launchFirework(window.innerWidth * 0.25, window.innerHeight * 0.3);
            launchFirework(window.innerWidth * 0.75, window.innerHeight * 0.3);
            launchFirework(window.innerWidth * 0.5, window.innerHeight * 0.2);

            // Pop open the wish celebration dialog
            setTimeout(() => {
                wishModal.classList.add('active');
            }, 600);
        }, 400);

        // Turn off mic if running
        if (isMicActive) {
            stopMicDetection();
        }
    }

    function relightCandle() {
        isCandleLit = true;
        candleFlame.classList.remove('flame-out');
        candleSmoke.classList.remove('active');
        candleStatus.textContent = '🔥 Lilin menyala kembali. Siap ditiup!';
        blowBtn.disabled = false;
        relightBtn.disabled = true;
        window.birthdayAudio.playSparkleChime();
        showToast('Lilin dinyalakan lagi! Silakan buat permohonan lagi ✨');
    }

    blowBtn.addEventListener('click', blowOutCandle);
    relightBtn.addEventListener('click', relightCandle);
    candleFlame.addEventListener('click', blowOutCandle);

    closeWishModalBtn.addEventListener('click', () => {
        wishModal.classList.remove('active');
    });

    // ------------------------------------------
    // Microphone Blow Detection
    // ------------------------------------------
    micToggleBtn.addEventListener('click', () => {
        if (isMicActive) {
            stopMicDetection();
        } else {
            startMicDetection();
        }
    });

    async function startMicDetection() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            micStream = stream;

            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const micSource = audioCtx.createMediaStreamSource(stream);
            micAnalyser = audioCtx.createAnalyser();
            micAnalyser.fftSize = 256;
            micSource.connect(micAnalyser);

            isMicActive = true;
            micToggleBtn.classList.add('active');
            micToggleBtn.innerHTML = '<span>🎙️</span> Mic Aktif: Tiup Sekarang!';
            showToast('🎙️ Dekatkan bibir ke mikrofon lalu tiup!');

            const bufferLength = micAnalyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            function checkBlow() {
                if (!isMicActive) return;
                micAnalyser.getByteFrequencyData(dataArray);

                // Low-frequency wind & breath energy (first ~8 bins)
                let lowEnergySum = 0;
                for (let i = 0; i < 8; i++) {
                    lowEnergySum += dataArray[i];
                }
                const lowAvg = lowEnergySum / 8;

                // Threshold for breath blow detection
                if (lowAvg > 165 && isCandleLit) {
                    blowOutCandle();
                    stopMicDetection();
                    return;
                }

                micAnimationId = requestAnimationFrame(checkBlow);
            }
            checkBlow();
        } catch (err) {
            console.warn('Microphone access rejected or unavailable:', err);
            showToast('⚠️ Izin mic ditolak. Kamu tetap bisa klik tombol "Tiup Lilin"');
            stopMicDetection();
        }
    }

    function stopMicDetection() {
        isMicActive = false;
        micToggleBtn.classList.remove('active');
        micToggleBtn.innerHTML = '<span>🎙️</span> Tiup Pakai Mic';
        if (micStream) {
            micStream.getTracks().forEach(track => track.stop());
            micStream = null;
        }
        if (micAnimationId) {
            cancelAnimationFrame(micAnimationId);
            micAnimationId = null;
        }
    }

    // ------------------------------------------
    // 3D Card / Letter Interaction
    // ------------------------------------------
    openLetterBtn.addEventListener('click', () => {
        cardModal.classList.add('active');
        window.birthdayAudio.playSparkleChime();
        launchConfettiExplosion(window.innerWidth / 2, window.innerHeight * 0.3, 60);
    });

    closeCardModal.addEventListener('click', () => {
        cardModal.classList.remove('active');
    });

    // Stamp Reactions on Card
    document.querySelectorAll('.card-reaction-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const emoji = btn.dataset.emoji || '💖';
            spawnFloatingEmoji(e.clientX, e.clientY, emoji);
            window.birthdayAudio.playPop();
        });
    });

    function spawnFloatingEmoji(x, y, emoji) {
        const floatEl = document.createElement('div');
        floatEl.className = 'floating-emoji';
        floatEl.textContent = emoji;
        floatEl.style.left = `${x}px`;
        floatEl.style.top = `${y}px`;
        document.body.appendChild(floatEl);

        setTimeout(() => {
            floatEl.remove();
        }, 1800);
    }

    // ------------------------------------------
    // Floating Interactive Balloons Mini-Game
    // ------------------------------------------
    const balloonContainer = document.getElementById('balloon-game-container');
    const balloonCounterEl = document.getElementById('wishes-count');
    const balloonColors = ['#ff4d88', '#9d4edd', '#48cae4', '#ffd166', '#06d6a0', '#ff758f'];

    function createBalloon() {
        if (!balloonContainer) return;
        const balloon = document.createElement('div');
        balloon.className = 'interactive-balloon';

        const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
        const leftPercent = Math.random() * 88 + 6; // 6% to 94%
        const duration = Math.random() * 6 + 9; // 9s to 15s

        balloon.style.left = `${leftPercent}%`;
        balloon.style.backgroundColor = color;
        balloon.style.boxShadow = `inset -7px -7px 15px rgba(0,0,0,0.2), 0 8px 20px ${color}66`;
        balloon.style.animationDuration = `${duration}s`;

        // Inner knot and string
        const knot = document.createElement('div');
        knot.className = 'balloon-knot';
        knot.style.borderTopColor = color;
        balloon.appendChild(knot);

        // Click to pop balloon
        balloon.addEventListener('click', (e) => {
            e.stopPropagation();
            popBalloon(balloon, e.clientX, e.clientY, color);
        });

        balloonContainer.appendChild(balloon);

        // Remove when float finishes
        setTimeout(() => {
            if (balloon.parentNode) {
                balloon.remove();
            }
        }, duration * 1000);
    }

    function popBalloon(balloonEl, x, y, color) {
        window.birthdayAudio.playPop();

        // Balloon pop visual effect
        balloonEl.classList.add('popping');
        setTimeout(() => balloonEl.remove(), 200);

        // Particle pop
        launchConfettiExplosion(x, y, 25);

        // Reveal blessing wish
        wishesUnlocked++;
        if (balloonCounterEl) balloonCounterEl.textContent = wishesUnlocked;

        const wishMsg = balloonWishes[Math.floor(Math.random() * balloonWishes.length)];
        showWishBanner(wishMsg, color);
    }

    function showWishBanner(message, color) {
        const banner = document.createElement('div');
        banner.className = 'wish-toast-banner';
        banner.style.borderLeft = `5px solid ${color}`;
        banner.innerHTML = `<strong>✨ Doa Terbuka:</strong><br>${message}`;
        document.body.appendChild(banner);

        setTimeout(() => banner.classList.add('show'), 20);

        setTimeout(() => {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 400);
        }, 4200);
    }

    function startBalloonSpawner() {
        // Spawn immediate wave
        for (let i = 0; i < 5; i++) {
            setTimeout(createBalloon, i * 800);
        }
        // Continuous spawn
        setInterval(() => {
            if (document.querySelectorAll('.interactive-balloon').length < 8) {
                createBalloon();
            }
        }, 2200);
    }

    // ------------------------------------------
    // Polaroid Photo Customizer (Upload / Change)
    // ------------------------------------------
    const photoInputs = document.querySelectorAll('.polaroid-file-input');
    photoInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const card = input.closest('.polaroid-card');
                    const imgSlot = card.querySelector('.polaroid-img-slot');
                    imgSlot.innerHTML = `<img src="${event.target.result}" alt="Foto Kenangan" class="polaroid-custom-img">`;
                    showToast('📷 Foto kenangan berhasil diperbarui!');
                    window.birthdayAudio.playSparkleChime();
                };
                reader.readAsDataURL(file);
            }
        });
    });

    // Polaroid Zoom Modal
    const polaroidZoomModal = document.getElementById('polaroid-zoom-modal');
    const zoomImgContainer = document.getElementById('zoom-img-container');
    const zoomCaption = document.getElementById('zoom-caption');
    const closeZoomBtn = document.getElementById('close-zoom-modal');

    document.querySelectorAll('.polaroid-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // If user clicked file input or label, let it handle
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') return;

            const imgSlot = card.querySelector('.polaroid-img-slot');
            const caption = card.querySelector('.polaroid-caption').textContent;

            zoomImgContainer.innerHTML = imgSlot.innerHTML;
            zoomCaption.textContent = caption;
            polaroidZoomModal.classList.add('active');
            window.birthdayAudio.playSparkleChime();
        });
    });

    closeZoomBtn.addEventListener('click', () => {
        polaroidZoomModal.classList.remove('active');
    });

    // ------------------------------------------
    // Customizer Modal & Share Link Generator
    // ------------------------------------------
    editBtn.addEventListener('click', () => {
        inputName.value = birthdayData.name;
        inputAge.value = birthdayData.age;
        inputSender.value = birthdayData.sender;
        inputMessage.value = birthdayData.message;
        editModal.classList.add('active');
    });

    closeEditModal.addEventListener('click', () => {
        editModal.classList.remove('active');
    });

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        birthdayData.name = inputName.value.trim() || defaultData.name;
        birthdayData.age = inputAge.value.trim() || defaultData.age;
        birthdayData.sender = inputSender.value.trim() || defaultData.sender;
        birthdayData.message = inputMessage.value.trim() || defaultData.message;

        updateDisplayData();
        editModal.classList.remove('active');
        showToast('✨ Halaman ulang tahun berhasil diperbarui!');
        window.birthdayAudio.playSparkleChime();
        launchConfettiExplosion(window.innerWidth / 2, window.innerHeight / 2, 80);
    });

    shareBtn.addEventListener('click', copyShareableLink);
    copyLinkBtn.addEventListener('click', copyShareableLink);

    function copyShareableLink() {
        const url = new URL(window.location.href);
        url.searchParams.set('name', birthdayData.name);
        url.searchParams.set('age', birthdayData.age);
        url.searchParams.set('sender', birthdayData.sender);
        url.searchParams.set('msg', encodeURIComponent(birthdayData.message));

        const shareUrl = url.toString();

        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast('🔗 Link berhasil disalin ke clipboard! Siap dikirim ke WA/IG.');
            window.birthdayAudio.playSparkleChime();
        }).catch(() => {
            prompt('Salin tautan ini untuk dibagikan:', shareUrl);
        });
    }

    function loadFromUrlParams() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('name')) birthdayData.name = params.get('name');
        if (params.has('age')) birthdayData.age = params.get('age');
        if (params.has('sender')) birthdayData.sender = params.get('sender');
        if (params.has('msg')) {
            try {
                birthdayData.message = decodeURIComponent(params.get('msg'));
            } catch (e) {
                birthdayData.message = params.get('msg');
            }
        }
    }

    // ------------------------------------------
    // Toast Notification Utility
    // ------------------------------------------
    let toastTimeout;
    function showToast(text) {
        if (!toast) return;
        toast.textContent = text;
        toast.classList.add('visible');

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('visible');
        }, 3000);
    }

    // ------------------------------------------
    // Confetti Physics Engine
    // ------------------------------------------
    const confettiColors = ['#ff4d88', '#a742f5', '#ffd166', '#06d6a0', '#118ab2', '#ff758f', '#ffffff'];

    function launchConfettiExplosion(originX, originY, count = 70) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 12 + 6;
            confettiParticles.push({
                x: originX,
                y: originY,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 3,
                size: Math.random() * 8 + 6,
                color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 16,
                shape: Math.random() > 0.4 ? 'rect' : 'circle',
                gravity: 0.28,
                drag: 0.96,
                alpha: 1,
                decay: Math.random() * 0.012 + 0.008
            });
        }
    }

    function updateConfetti() {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        for (let i = confettiParticles.length - 1; i >= 0; i--) {
            const p = confettiParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= p.drag;
            p.vy *= p.drag;
            p.rotation += p.rotationSpeed;
            p.alpha -= p.decay;

            if (p.alpha <= 0 || p.y > confettiCanvas.height + 20) {
                confettiParticles.splice(i, 1);
                continue;
            }

            confettiCtx.save();
            confettiCtx.globalAlpha = Math.max(0, p.alpha);
            confettiCtx.fillStyle = p.color;
            confettiCtx.translate(p.x, p.y);
            confettiCtx.rotate((p.rotation * Math.PI) / 180);

            if (p.shape === 'rect') {
                confettiCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            } else {
                confettiCtx.beginPath();
                confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                confettiCtx.fill();
            }
            confettiCtx.restore();
        }

        requestAnimationFrame(updateConfetti);
    }
    requestAnimationFrame(updateConfetti);

    // ------------------------------------------
    // Fireworks Particle Engine
    // ------------------------------------------
    function launchFirework(targetX, targetY) {
        const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        const particleCount = 65;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i + (Math.random() * 0.15);
            const speed = Math.random() * 6 + 3;
            fireworksParticles.push({
                x: targetX,
                y: targetY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                alpha: 1,
                decay: Math.random() * 0.018 + 0.012,
                size: Math.random() * 3.5 + 2,
                gravity: 0.09,
                flicker: Math.random() > 0.5
            });
        }
    }

    function updateFireworks() {
        fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

        for (let i = fireworksParticles.length - 1; i >= 0; i--) {
            const p = fireworksParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.97;
            p.vy *= 0.97;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                fireworksParticles.splice(i, 1);
                continue;
            }

            fireworksCtx.save();
            fireworksCtx.globalAlpha = p.flicker && Math.random() > 0.3 ? p.alpha * 0.6 : p.alpha;
            fireworksCtx.fillStyle = p.color;
            fireworksCtx.shadowColor = p.color;
            fireworksCtx.shadowBlur = 8;
            fireworksCtx.beginPath();
            fireworksCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            fireworksCtx.fill();
            fireworksCtx.restore();
        }

        requestAnimationFrame(updateFireworks);
    }
    requestAnimationFrame(updateFireworks);

    // Modal Background Clicks to Dismiss
    [cardModal, wishModal, editModal, polaroidZoomModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
});
