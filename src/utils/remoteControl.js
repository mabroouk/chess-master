// نظام التحكم بالريموت والاستجابة للأجهزة المختلفة
class RemoteControlManager {
  constructor() {
    this.isEnabled = false;
    this.currentFocus = null;
    this.focusableElements = [];
    this.gamepadConnected = false;
    this.keyboardNavigation = true;
    this.touchNavigation = true;
    this.voiceNavigation = false;
    
    // إعدادات التحكم
    this.settings = {
      sensitivity: 0.5,
      repeatDelay: 300,
      longPressDelay: 1000,
      vibrationEnabled: true,
      soundFeedback: true
    };
    
    this.init();
  }

  // تهيئة النظام
  init() {
    this.setupKeyboardNavigation();
    this.setupGamepadSupport();
    this.setupTouchNavigation();
    this.setupVoiceCommands();
    this.setupAccessibility();
    this.loadSettings();
  }

  // إعداد التنقل بلوحة المفاتيح
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
      if (!this.keyboardNavigation) return;
      
      const { key, ctrlKey, altKey, shiftKey } = event;
      
      // التنقل الأساسي
      switch (key) {
        case 'ArrowUp':
          event.preventDefault();
          this.navigateUp();
          break;
        case 'ArrowDown':
          event.preventDefault();
          this.navigateDown();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          this.navigateLeft();
          break;
        case 'ArrowRight':
          event.preventDefault();
          this.navigateRight();
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          this.activateElement();
          break;
        case 'Escape':
          event.preventDefault();
          this.goBack();
          break;
        case 'Tab':
          if (!shiftKey) {
            event.preventDefault();
            this.focusNext();
          } else {
            event.preventDefault();
            this.focusPrevious();
          }
          break;
      }
      
      // اختصارات لوحة المفاتيح
      if (ctrlKey) {
        switch (key) {
          case 'n':
            event.preventDefault();
            this.newGame();
            break;
          case 'z':
            event.preventDefault();
            this.undoMove();
            break;
          case 'r':
            event.preventDefault();
            this.resetGame();
            break;
          case 'f':
            event.preventDefault();
            this.flipBoard();
            break;
          case 's':
            event.preventDefault();
            this.toggleSound();
            break;
        }
      }
      
      // مفاتيح الوظائف
      switch (key) {
        case 'F1':
          event.preventDefault();
          this.showHelp();
          break;
        case 'F2':
          event.preventDefault();
          this.showSettings();
          break;
        case 'F11':
          event.preventDefault();
          this.toggleFullscreen();
          break;
      }
    });
  }

  // إعداد دعم أذرع التحكم (Gamepad)
  setupGamepadSupport() {
    window.addEventListener('gamepadconnected', (event) => {
      console.log('تم توصيل ذراع التحكم:', event.gamepad.id);
      this.gamepadConnected = true;
      this.startGamepadPolling();
      this.showNotification('تم توصيل ذراع التحكم');
    });

    window.addEventListener('gamepaddisconnected', (event) => {
      console.log('تم قطع ذراع التحكم:', event.gamepad.id);
      this.gamepadConnected = false;
      this.stopGamepadPolling();
      this.showNotification('تم قطع ذراع التحكم');
    });
  }

  // بدء مراقبة ذراع التحكم
  startGamepadPolling() {
    this.gamepadInterval = setInterval(() => {
      const gamepads = navigator.getGamepads();
      for (let gamepad of gamepads) {
        if (gamepad) {
          this.handleGamepadInput(gamepad);
        }
      }
    }, 100);
  }

  // إيقاف مراقبة ذراع التحكم
  stopGamepadPolling() {
    if (this.gamepadInterval) {
      clearInterval(this.gamepadInterval);
      this.gamepadInterval = null;
    }
  }

  // معالجة إدخال ذراع التحكم
  handleGamepadInput(gamepad) {
    const threshold = this.settings.sensitivity;
    
    // العصا اليسرى للتنقل
    const leftStickX = gamepad.axes[0];
    const leftStickY = gamepad.axes[1];
    
    if (Math.abs(leftStickX) > threshold || Math.abs(leftStickY) > threshold) {
      if (Math.abs(leftStickX) > Math.abs(leftStickY)) {
        if (leftStickX > threshold) {
          this.navigateRight();
        } else if (leftStickX < -threshold) {
          this.navigateLeft();
        }
      } else {
        if (leftStickY > threshold) {
          this.navigateDown();
        } else if (leftStickY < -threshold) {
          this.navigateUp();
        }
      }
    }
    
    // الأزرار
    if (gamepad.buttons[0].pressed) { // A/X
      this.activateElement();
    }
    if (gamepad.buttons[1].pressed) { // B/Circle
      this.goBack();
    }
    if (gamepad.buttons[2].pressed) { // X/Square
      this.showContextMenu();
    }
    if (gamepad.buttons[3].pressed) { // Y/Triangle
      this.showHelp();
    }
    
    // أزرار الكتف
    if (gamepad.buttons[4].pressed) { // LB/L1
      this.undoMove();
    }
    if (gamepad.buttons[5].pressed) { // RB/R1
      this.redoMove();
    }
    
    // أزرار الخيارات
    if (gamepad.buttons[8].pressed) { // Select/Share
      this.showSettings();
    }
    if (gamepad.buttons[9].pressed) { // Start/Options
      this.pauseGame();
    }
  }

  // إعداد التنقل باللمس
  setupTouchNavigation() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let longPressTimer = null;
    
    document.addEventListener('touchstart', (event) => {
      if (!this.touchNavigation) return;
      
      const touch = event.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
      
      // اكتشاف الضغط الطويل
      longPressTimer = setTimeout(() => {
        this.handleLongPress(touch.clientX, touch.clientY);
        this.vibrate(200);
      }, this.settings.longPressDelay);
    });
    
    document.addEventListener('touchmove', (event) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });
    
    document.addEventListener('touchend', (event) => {
      if (!this.touchNavigation) return;
      
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const deltaTime = Date.now() - touchStartTime;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // اكتشاف الإيماءات
      if (distance > 50 && deltaTime < 500) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 0) {
            this.handleSwipeRight();
          } else {
            this.handleSwipeLeft();
          }
        } else {
          if (deltaY > 0) {
            this.handleSwipeDown();
          } else {
            this.handleSwipeUp();
          }
        }
      }
    });
    
    // دعم الإيماءات المتعددة
    document.addEventListener('gesturestart', (event) => {
      event.preventDefault();
    });
    
    document.addEventListener('gesturechange', (event) => {
      event.preventDefault();
      if (event.scale > 1.1) {
        this.zoomIn();
      } else if (event.scale < 0.9) {
        this.zoomOut();
      }
    });
  }

  // إعداد الأوامر الصوتية
  setupVoiceCommands() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'ar-SA';
      
      this.recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        this.handleVoiceCommand(command);
      };
      
      this.recognition.onerror = (event) => {
        console.log('خطأ في التعرف على الصوت:', event.error);
      };
    }
  }

  // معالجة الأوامر الصوتية
  handleVoiceCommand(command) {
    const commands = {
      'لعبة جديدة': () => this.newGame(),
      'تراجع': () => this.undoMove(),
      'إعادة': () => this.redoMove(),
      'قلب اللوح': () => this.flipBoard(),
      'إعدادات': () => this.showSettings(),
      'مساعدة': () => this.showHelp(),
      'توقف': () => this.pauseGame(),
      'استمرار': () => this.resumeGame(),
      'حفظ': () => this.saveGame(),
      'تحميل': () => this.loadGame()
    };
    
    for (let [phrase, action] of Object.entries(commands)) {
      if (command.includes(phrase)) {
        action();
        this.showNotification(`تم تنفيذ: ${phrase}`);
        break;
      }
    }
  }

  // إعداد إمكانية الوصول
  setupAccessibility() {
    // دعم قارئ الشاشة
    this.setupScreenReader();
    
    // دعم التباين العالي
    this.setupHighContrast();
    
    // دعم تكبير النص
    this.setupTextScaling();
    
    // دعم تقليل الحركة
    this.setupReducedMotion();
  }

  // إعداد قارئ الشاشة
  setupScreenReader() {
    // إضافة تسميات ARIA
    this.updateAriaLabels();
    
    // إعداد التنقل بالتركيز
    this.setupFocusManagement();
    
    // إعداد الإعلانات الصوتية
    this.setupLiveRegions();
  }

  // التنقل للأعلى
  navigateUp() {
    const currentIndex = this.getCurrentFocusIndex();
    const newIndex = this.findElementAbove(currentIndex);
    if (newIndex !== -1) {
      this.setFocus(newIndex);
    }
  }

  // التنقل للأسفل
  navigateDown() {
    const currentIndex = this.getCurrentFocusIndex();
    const newIndex = this.findElementBelow(currentIndex);
    if (newIndex !== -1) {
      this.setFocus(newIndex);
    }
  }

  // التنقل لليسار
  navigateLeft() {
    const currentIndex = this.getCurrentFocusIndex();
    const newIndex = this.findElementLeft(currentIndex);
    if (newIndex !== -1) {
      this.setFocus(newIndex);
    }
  }

  // التنقل لليمين
  navigateRight() {
    const currentIndex = this.getCurrentFocusIndex();
    const newIndex = this.findElementRight(currentIndex);
    if (newIndex !== -1) {
      this.setFocus(newIndex);
    }
  }

  // تفعيل العنصر الحالي
  activateElement() {
    if (this.currentFocus) {
      this.currentFocus.click();
      this.vibrate(50);
      if (this.settings.soundFeedback) {
        this.playClickSound();
      }
    }
  }

  // العودة للخلف
  goBack() {
    // إرسال حدث العودة
    const backEvent = new CustomEvent('remoteBack');
    document.dispatchEvent(backEvent);
  }

  // عرض الإشعارات
  showNotification(message) {
    // إنشاء إشعار مؤقت
    const notification = document.createElement('div');
    notification.className = 'remote-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 10000;
      font-size: 14px;
      transition: opacity 0.3s;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  }

  // اهتزاز الجهاز
  vibrate(duration) {
    if (this.settings.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  }

  // تشغيل صوت النقر
  playClickSound() {
    // استخدام مدير الأصوات إذا كان متاحاً
    if (window.soundManager) {
      window.soundManager.playUISound('click');
    }
  }

  // تفعيل/إلغاء النظام
  toggle() {
    this.isEnabled = !this.isEnabled;
    if (this.isEnabled) {
      this.activate();
    } else {
      this.deactivate();
    }
    return this.isEnabled;
  }

  // تفعيل النظام
  activate() {
    this.isEnabled = true;
    this.updateFocusableElements();
    this.showNotification('تم تفعيل التحكم بالريموت');
  }

  // إلغاء تفعيل النظام
  deactivate() {
    this.isEnabled = false;
    this.clearFocus();
    this.showNotification('تم إلغاء التحكم بالريموت');
  }

  // تحديث العناصر القابلة للتركيز
  updateFocusableElements() {
    const selectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '.chess-square',
      '.focusable'
    ];
    
    this.focusableElements = Array.from(
      document.querySelectorAll(selectors.join(', '))
    ).filter(el => {
      return el.offsetParent !== null && 
             getComputedStyle(el).visibility !== 'hidden';
    });
  }

  // حفظ الإعدادات
  saveSettings() {
    localStorage.setItem('remoteControlSettings', JSON.stringify(this.settings));
  }

  // تحميل الإعدادات
  loadSettings() {
    const saved = localStorage.getItem('remoteControlSettings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
  }

  // تنظيف الموارد
  cleanup() {
    this.stopGamepadPolling();
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}

// إنشاء مثيل واحد من مدير التحكم بالريموت
const remoteControlManager = new RemoteControlManager();

export default remoteControlManager;
export { RemoteControlManager };
