// Web Audio API Sound Synthesizer for Happy Birthday Web
// 100% self-contained, no external MP3 dependencies, works completely offline!

class BirthdayAudio {
    constructor() {
        this.ctx = null;
        this.isPlayingMusic = false;
        this.musicTimeout = null;
        this.currentNoteIndex = 0;
        this.isMuted = false;

        // Notes frequency map (Hz)
        this.notes = {
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99,
            'G4': 392.00, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
            'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25,
            'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
            'C6': 1046.50
        };

        // Happy Birthday Melody (Pitch, Duration in beats)
        this.melody = [
            { note: 'G4', dur: 0.75 },
            { note: 'G4', dur: 0.25 },
            { note: 'A4', dur: 1.0 },
            { note: 'G4', dur: 1.0 },
            { note: 'C5', dur: 1.0 },
            { note: 'B4', dur: 2.0 },

            { note: 'G4', dur: 0.75 },
            { note: 'G4', dur: 0.25 },
            { note: 'A4', dur: 1.0 },
            { note: 'G4', dur: 1.0 },
            { note: 'D5', dur: 1.0 },
            { note: 'C5', dur: 2.0 },

            { note: 'G4', dur: 0.75 },
            { note: 'G4', dur: 0.25 },
            { note: 'G5', dur: 1.0 },
            { note: 'E5', dur: 1.0 },
            { note: 'C5', dur: 1.0 },
            { note: 'B4', dur: 1.0 },
            { note: 'A4', dur: 1.5 },

            { note: 'F5', dur: 0.75 },
            { note: 'F5', dur: 0.25 },
            { note: 'E5', dur: 1.0 },
            { note: 'C5', dur: 1.0 },
            { note: 'D5', dur: 1.0 },
            { note: 'C5', dur: 2.5 }
        ];

        // Accompaniment Chords for rich music box feel
        this.chords = [
            { bar: 0, notes: ['C4', 'E4', 'G4'] },
            { bar: 4, notes: ['G3', 'D4', 'B4'] },
            { bar: 6, notes: ['G3', 'D4', 'B4'] },
            { bar: 10, notes: ['C4', 'E4', 'G4'] },
            { bar: 12, notes: ['C4', 'E4', 'G4'] },
            { bar: 16, notes: ['F3', 'A4', 'C5'] },
            { bar: 18, notes: ['C4', 'E4', 'G4'] },
            { bar: 22, notes: ['G3', 'D4', 'B4'] },
            { bar: 24, notes: ['C4', 'E4', 'G4', 'C5'] }
        ];
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Play a gentle music box chime bell note
    playMusicBoxNote(freq, time, duration = 1.2, volume = 0.25) {
        if (!this.ctx || this.isMuted) return;

        // Primary bell tone (sine)
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();

        // Overtone for bell-like sparkle
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, time);

        // Harmonic overtone (2.76x or 4x for celeste/music box shimmer)
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2.76, time);

        // Fast attack, exponential decay (music box style)
        gain1.gain.setValueAtTime(0.0001, time);
        gain1.gain.exponentialRampToValueAtTime(volume, time + 0.015);
        gain1.gain.exponentialRampToValueAtTime(volume * 0.4, time + 0.15);
        gain1.gain.exponentialRampToValueAtTime(0.00001, time + duration);

        gain2.gain.setValueAtTime(0.0001, time);
        gain2.gain.exponentialRampToValueAtTime(volume * 0.35, time + 0.01);
        gain2.gain.exponentialRampToValueAtTime(0.00001, time + duration * 0.45);

        // Master output filter for warmth
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3200, time);

        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(filter);
        gain2.connect(filter);
        filter.connect(this.ctx.destination);

        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + duration);
        osc2.stop(time + duration);
    }

    // Play the full Happy Birthday Song sequence
    startMelody() {
        this.init();
        if (this.isPlayingMusic) return;
        this.isPlayingMusic = true;
        this.currentNoteIndex = 0;
        this.scheduleNextNote();
    }

    scheduleNextNote() {
        if (!this.isPlayingMusic) return;

        const tempo = 480; // ms per beat (warm, relaxing and festive tempo)
        const item = this.melody[this.currentNoteIndex];
        const freq = this.notes[item.note];

        if (freq && this.ctx) {
            const now = this.ctx.currentTime;
            this.playMusicBoxNote(freq, now, item.dur * 1.4, 0.28);

            // Add cute arpeggiated bass accompaniment on phrase starts
            if (this.currentNoteIndex % 6 === 0 || this.currentNoteIndex === 0) {
                const bassFreq = freq / 2;
                if (bassFreq > 60) {
                    this.playMusicBoxNote(bassFreq, now + 0.05, 1.8, 0.15);
                }
            }
        }

        const noteDurationMs = item.dur * tempo;
        this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;

        // Loop seamlessly with a sweet breath pause at the end
        const pauseAfterCycle = (this.currentNoteIndex === 0) ? 1400 : noteDurationMs;

        this.musicTimeout = setTimeout(() => {
            if (this.isPlayingMusic) {
                this.scheduleNextNote();
            }
        }, pauseAfterCycle);
    }

    stopMelody() {
        this.isPlayingMusic = false;
        if (this.musicTimeout) {
            clearTimeout(this.musicTimeout);
            this.musicTimeout = null;
        }
    }

    toggleMelody() {
        if (this.isPlayingMusic) {
            this.stopMelody();
            return false;
        } else {
            this.startMelody();
            return true;
        }
    }

    // Sound FX: Balloon Pop
    playPop() {
        this.init();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);

        // Add small burst noise for realism
        this.playNoiseBurst(0.04, 0.25);
    }

    // Sound FX: White noise burst
    playNoiseBurst(duration = 0.05, vol = 0.2) {
        if (!this.ctx || this.isMuted) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        noise.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
    }

    // Sound FX: Blow Candle Whoosh
    playBlow() {
        this.init();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const duration = 0.6;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.4;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(700, now);
        filter.frequency.exponentialRampToValueAtTime(250, now + duration);
        filter.Q.setValueAtTime(1.5, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
    }

    // Sound FX: Confetti Cannon Boom & Whistle
    playConfetti() {
        this.init();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;

        // Whistle / Pop
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.12);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);

        // Chimes sparkle
        setTimeout(() => this.playSparkleChime(), 100);
    }

    // Sound FX: Magical Sparkle Chimes
    playSparkleChime() {
        if (!this.ctx || this.isMuted) return;
        const chimeNotes = [784, 988, 1175, 1319, 1568, 1976];
        const now = this.ctx.currentTime;

        chimeNotes.forEach((freq, i) => {
            const time = now + (i * 0.06);
            this.playMusicBoxNote(freq, time, 0.6, 0.12);
        });
    }

    // Sound FX: Cheerful Fanfare on Opening Gift / Unfolding Card
    playFanfare() {
        this.init();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const fanfareNotes = [
            { freq: 523.25, delay: 0, dur: 0.2 },
            { freq: 659.25, delay: 0.15, dur: 0.2 },
            { freq: 783.99, delay: 0.3, dur: 0.2 },
            { freq: 1046.50, delay: 0.45, dur: 0.7 }
        ];

        fanfareNotes.forEach(n => {
            this.playMusicBoxNote(n.freq, now + n.delay, n.dur, 0.35);
        });
    }
}

// Global instance
window.birthdayAudio = new BirthdayAudio();
