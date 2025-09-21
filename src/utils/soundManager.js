// نظام إدارة الأصوات للشطرنج
class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.7;
    this.loadSounds();
    
    // تحميل الإعدادات من التخزين المحلي
    const savedSettings = localStorage.getItem('chessSoundSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.enabled = settings.enabled !== false;
      this.volume = settings.volume || 0.7;
    }
  }

  // تحميل الأصوات
  loadSounds() {
    // إنشاء الأصوات باستخدام Web Audio API
    this.createSounds();
  }

  // إنشاء الأصوات برمجياً
  createSounds() {
    // صوت النقلة العادية
    this.sounds.move = this.createTone(800, 0.1, 'sine');
    
    // صوت الأسر
    this.sounds.capture = this.createTone(400, 0.2, 'square');
    
    // صوت الكش
    this.sounds.check = this.createTone(1200, 0.3, 'triangle');
    
    // صوت الكش مات
    this.sounds.checkmate = this.createComplexTone([600, 800, 1000], 0.5);
    
    // صوت التبييت
    this.sounds.castle = this.createTone(600, 0.15, 'sawtooth');
    
    // صوت ترقية البيدق
    this.sounds.promotion = this.createComplexTone([800, 1000, 1200], 0.3);
    
    // صوت بداية اللعبة
    this.sounds.gameStart = this.createComplexTone([440, 554, 659], 0.4);
    
    // صوت انتهاء اللعبة
    this.sounds.gameEnd = this.createComplexTone([659, 554, 440], 0.6);
    
    // صوت النقر على الزر
    this.sounds.click = this.createTone(1000, 0.05, 'sine');
    
    // صوت التحذير
    this.sounds.warning = this.createTone(300, 0.2, 'square');
    
    // صوت النجاح
    this.sounds.success = this.createComplexTone([523, 659, 784], 0.3);
    
    // صوت الخطأ
    this.sounds.error = this.createTone(200, 0.3, 'square');
  }

  // إنشاء نغمة بسيطة
  createTone(frequency, duration, waveType = 'sine') {
    return () => {
      if (!this.enabled) return;
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = waveType;
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };
  }

  // إنشاء نغمة معقدة (وتر)
  createComplexTone(frequencies, duration) {
    return () => {
      if (!this.enabled) return;
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(masterGain);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        const delay = index * 0.05;
        const volume = this.volume * 0.2 / frequencies.length;
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + delay + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + duration);
        
        oscillator.start(audioContext.currentTime + delay);
        oscillator.stop(audioContext.currentTime + delay + duration);
      });
    };
  }

  // تشغيل صوت
  playSound(soundName, options = {}) {
    if (!this.enabled || !this.sounds[soundName]) return;
    
    try {
      // تأخير اختياري
      if (options.delay) {
        setTimeout(() => this.sounds[soundName](), options.delay);
      } else {
        this.sounds[soundName]();
      }
    } catch (error) {
      console.warn('خطأ في تشغيل الصوت:', error);
    }
  }

  // تشغيل صوت النقلة حسب النوع
  playMoveSound(moveType, piece = null) {
    switch (moveType) {
      case 'move':
        this.playSound('move');
        break;
      case 'capture':
        this.playSound('capture');
        break;
      case 'check':
        this.playSound('check');
        break;
      case 'checkmate':
        this.playSound('checkmate');
        break;
      case 'castle':
        this.playSound('castle');
        break;
      case 'promotion':
        this.playSound('promotion');
        break;
      case 'enpassant':
        this.playSound('capture');
        break;
      default:
        this.playSound('move');
    }
  }

  // تشغيل أصوات اللعبة
  playGameSound(eventType) {
    switch (eventType) {
      case 'start':
        this.playSound('gameStart');
        break;
      case 'end':
        this.playSound('gameEnd');
        break;
      case 'draw':
        this.playSound('gameEnd');
        break;
      case 'resign':
        this.playSound('gameEnd');
        break;
    }
  }

  // تشغيل أصوات الواجهة
  playUISound(eventType) {
    switch (eventType) {
      case 'click':
        this.playSound('click');
        break;
      case 'success':
        this.playSound('success');
        break;
      case 'error':
        this.playSound('error');
        break;
      case 'warning':
        this.playSound('warning');
        break;
    }
  }

  // تفعيل/إلغاء الأصوات
  toggle() {
    this.enabled = !this.enabled;
    this.saveSettings();
    return this.enabled;
  }

  // تعيين مستوى الصوت
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  // الحصول على مستوى الصوت
  getVolume() {
    return this.volume;
  }

  // التحقق من تفعيل الأصوات
  isEnabled() {
    return this.enabled;
  }

  // حفظ الإعدادات
  saveSettings() {
    const settings = {
      enabled: this.enabled,
      volume: this.volume
    };
    localStorage.setItem('chessSoundSettings', JSON.stringify(settings));
  }

  // تشغيل تسلسل أصوات
  playSequence(sounds, interval = 200) {
    sounds.forEach((sound, index) => {
      setTimeout(() => this.playSound(sound), index * interval);
    });
  }

  // تشغيل صوت النصر
  playVictorySound() {
    this.playSequence(['success', 'success', 'success'], 150);
  }

  // تشغيل صوت الهزيمة
  playDefeatSound() {
    this.playSound('error');
  }

  // تشغيل صوت التعادل
  playDrawSound() {
    this.playSound('warning');
  }

  // تشغيل أصوات التعليم
  playLessonSound(eventType) {
    switch (eventType) {
      case 'correct':
        this.playSound('success');
        break;
      case 'incorrect':
        this.playSound('error');
        break;
      case 'hint':
        this.playSound('click');
        break;
      case 'complete':
        this.playVictorySound();
        break;
      case 'next':
        this.playSound('click');
        break;
      case 'previous':
        this.playSound('click');
        break;
    }
  }

  // تشغيل أصوات التكتيكات
  playTacticsSound(eventType) {
    switch (eventType) {
      case 'puzzle_start':
        this.playSound('gameStart');
        break;
      case 'puzzle_solved':
        this.playVictorySound();
        break;
      case 'puzzle_failed':
        this.playSound('error');
        break;
      case 'hint_used':
        this.playSound('warning');
        break;
    }
  }

  // تنظيف الموارد
  cleanup() {
    // تنظيف أي موارد صوتية إذا لزم الأمر
  }
}

// إنشاء مثيل واحد من مدير الأصوات
const soundManager = new SoundManager();

export default soundManager;

// تصدير الفئة أيضاً للاستخدام المتقدم
export { SoundManager };
