// نظام إدارة الأجهزة والاستجابة للشاشات المختلفة
class DeviceManager {
  constructor() {
    this.deviceType = 'desktop';
    this.screenSize = 'large';
    this.orientation = 'landscape';
    this.touchSupport = false;
    this.isTV = false;
    this.isMobile = false;
    this.isTablet = false;
    this.isDesktop = false;
    
    // إعدادات الجهاز
    this.settings = {
      autoRotate: true,
      adaptiveUI: true,
      touchOptimization: true,
      tvMode: false,
      highDPI: false,
      reducedMotion: false
    };
    
    this.init();
  }

  // تهيئة النظام
  init() {
    this.detectDevice();
    this.setupMediaQueries();
    this.setupOrientationChange();
    this.setupTouchDetection();
    this.setupTVDetection();
    this.setupHighDPIDetection();
    this.applyDeviceOptimizations();
    this.loadSettings();
  }

  // اكتشاف نوع الجهاز
  detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const maxDimension = Math.max(screenWidth, screenHeight);
    const minDimension = Math.min(screenWidth, screenHeight);
    
    // اكتشاف التلفزيون
    this.isTV = this.detectTV();
    
    // اكتشاف الهاتف المحمول
    this.isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
                    (maxDimension <= 768 && minDimension <= 414);
    
    // اكتشاف الجهاز اللوحي
    this.isTablet = !this.isMobile && (
      /ipad|android(?!.*mobile)|tablet/i.test(userAgent) ||
      (maxDimension <= 1024 && minDimension >= 600)
    );
    
    // اكتشاف سطح المكتب
    this.isDesktop = !this.isMobile && !this.isTablet && !this.isTV;
    
    // تحديد نوع الجهاز الرئيسي
    if (this.isTV) {
      this.deviceType = 'tv';
      this.screenSize = 'xlarge';
    } else if (this.isMobile) {
      this.deviceType = 'mobile';
      this.screenSize = 'small';
    } else if (this.isTablet) {
      this.deviceType = 'tablet';
      this.screenSize = 'medium';
    } else {
      this.deviceType = 'desktop';
      this.screenSize = maxDimension >= 1920 ? 'xlarge' : 'large';
    }
    
    // اكتشاف دعم اللمس
    this.touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // تحديد الاتجاه
    this.orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    
    console.log('تم اكتشاف الجهاز:', {
      deviceType: this.deviceType,
      screenSize: this.screenSize,
      orientation: this.orientation,
      touchSupport: this.touchSupport,
      isTV: this.isTV
    });
  }

  // اكتشاف التلفزيون
  detectTV() {
    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const maxDimension = Math.max(screenWidth, screenHeight);
    
    // اكتشاف بناءً على User Agent
    const tvUserAgents = [
      'smart-tv', 'smarttv', 'googletv', 'appletv', 'hbbtv', 'pov_tv',
      'netcast', 'nettv', 'roku', 'dlnadoc', 'ce-html', 'webos',
      'tizen', 'opera tv', 'sonydtv', 'philips', 'panasonic', 'samsung',
      'lg', 'viera', 'bravia'
    ];
    
    const isTVUserAgent = tvUserAgents.some(tv => userAgent.includes(tv));
    
    // اكتشاف بناءً على حجم الشاشة (التلفزيونات عادة أكبر من 1080p)
    const isTVSize = maxDimension >= 1920 && window.devicePixelRatio <= 1.5;
    
    // اكتشاف بناءً على نسبة العرض إلى الارتفاع
    const aspectRatio = maxDimension / Math.min(screenWidth, screenHeight);
    const isTVAspectRatio = aspectRatio >= 1.7; // 16:9 أو أوسع
    
    // اكتشاف عدم وجود لمس (معظم التلفزيونات لا تدعم اللمس)
    const noTouch = !('ontouchstart' in window) && navigator.maxTouchPoints === 0;
    
    return isTVUserAgent || (isTVSize && isTVAspectRatio && noTouch);
  }

  // إعداد Media Queries
  setupMediaQueries() {
    // شاشات صغيرة (هواتف)
    this.mobileQuery = window.matchMedia('(max-width: 768px)');
    this.mobileQuery.addListener(() => this.handleScreenChange());
    
    // شاشات متوسطة (أجهزة لوحية)
    this.tabletQuery = window.matchMedia('(min-width: 769px) and (max-width: 1024px)');
    this.tabletQuery.addListener(() => this.handleScreenChange());
    
    // شاشات كبيرة (سطح المكتب)
    this.desktopQuery = window.matchMedia('(min-width: 1025px)');
    this.desktopQuery.addListener(() => this.handleScreenChange());
    
    // شاشات عالية الدقة
    this.highDPIQuery = window.matchMedia('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)');
    this.highDPIQuery.addListener(() => this.handleDPIChange());
    
    // تفضيل تقليل الحركة
    this.reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotionQuery.addListener(() => this.handleMotionPreference());
  }

  // إعداد تغيير الاتجاه
  setupOrientationChange() {
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    });
    
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  // إعداد اكتشاف اللمس
  setupTouchDetection() {
    // اكتشاف أول لمسة
    document.addEventListener('touchstart', () => {
      if (!this.touchSupport) {
        this.touchSupport = true;
        this.applyTouchOptimizations();
      }
    }, { once: true });
  }

  // إعداد اكتشاف التلفزيون
  setupTVDetection() {
    if (this.isTV) {
      this.applyTVOptimizations();
    }
  }

  // إعداد اكتشاف الشاشات عالية الدقة
  setupHighDPIDetection() {
    this.settings.highDPI = window.devicePixelRatio > 1.5;
    if (this.settings.highDPI) {
      this.applyHighDPIOptimizations();
    }
  }

  // معالجة تغيير الشاشة
  handleScreenChange() {
    this.detectDevice();
    this.applyDeviceOptimizations();
    this.dispatchDeviceChangeEvent();
  }

  // معالجة تغيير الاتجاه
  handleOrientationChange() {
    const newOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    
    if (newOrientation !== this.orientation) {
      this.orientation = newOrientation;
      this.applyOrientationOptimizations();
      this.dispatchOrientationChangeEvent();
    }
  }

  // معالجة تغيير حجم النافذة
  handleResize() {
    // تحديث حجم الشاشة
    const width = window.innerWidth;
    let newScreenSize;
    
    if (width <= 768) {
      newScreenSize = 'small';
    } else if (width <= 1024) {
      newScreenSize = 'medium';
    } else if (width <= 1920) {
      newScreenSize = 'large';
    } else {
      newScreenSize = 'xlarge';
    }
    
    if (newScreenSize !== this.screenSize) {
      this.screenSize = newScreenSize;
      this.applyScreenSizeOptimizations();
    }
  }

  // معالجة تغيير DPI
  handleDPIChange() {
    this.settings.highDPI = this.highDPIQuery.matches;
    this.applyHighDPIOptimizations();
  }

  // معالجة تفضيل الحركة
  handleMotionPreference() {
    this.settings.reducedMotion = this.reducedMotionQuery.matches;
    this.applyMotionPreferences();
  }

  // تطبيق تحسينات الجهاز
  applyDeviceOptimizations() {
    const body = document.body;
    
    // إزالة الفئات السابقة
    body.classList.remove('device-mobile', 'device-tablet', 'device-desktop', 'device-tv');
    body.classList.remove('screen-small', 'screen-medium', 'screen-large', 'screen-xlarge');
    
    // إضافة فئات جديدة
    body.classList.add(`device-${this.deviceType}`);
    body.classList.add(`screen-${this.screenSize}`);
    
    if (this.touchSupport) {
      body.classList.add('touch-enabled');
    } else {
      body.classList.add('no-touch');
    }
    
    // تطبيق تحسينات خاصة بكل جهاز
    switch (this.deviceType) {
      case 'mobile':
        this.applyMobileOptimizations();
        break;
      case 'tablet':
        this.applyTabletOptimizations();
        break;
      case 'desktop':
        this.applyDesktopOptimizations();
        break;
      case 'tv':
        this.applyTVOptimizations();
        break;
    }
  }

  // تحسينات الهاتف المحمول
  applyMobileOptimizations() {
    // تكبير أحجام الأزرار والعناصر التفاعلية
    document.documentElement.style.setProperty('--touch-target-size', '48px');
    document.documentElement.style.setProperty('--font-size-base', '16px');
    document.documentElement.style.setProperty('--spacing-unit', '8px');
    
    // تحسين لوح الشطرنج للهواتف
    document.documentElement.style.setProperty('--board-size', 'min(90vw, 90vh)');
    document.documentElement.style.setProperty('--piece-size', '12vw');
  }

  // تحسينات الجهاز اللوحي
  applyTabletOptimizations() {
    document.documentElement.style.setProperty('--touch-target-size', '44px');
    document.documentElement.style.setProperty('--font-size-base', '18px');
    document.documentElement.style.setProperty('--spacing-unit', '12px');
    
    document.documentElement.style.setProperty('--board-size', 'min(70vw, 80vh)');
    document.documentElement.style.setProperty('--piece-size', '8vw');
  }

  // تحسينات سطح المكتب
  applyDesktopOptimizations() {
    document.documentElement.style.setProperty('--touch-target-size', '32px');
    document.documentElement.style.setProperty('--font-size-base', '16px');
    document.documentElement.style.setProperty('--spacing-unit', '16px');
    
    document.documentElement.style.setProperty('--board-size', 'min(60vw, 80vh)');
    document.documentElement.style.setProperty('--piece-size', '6vw');
  }

  // تحسينات التلفزيون
  applyTVOptimizations() {
    // أحجام أكبر للتلفزيون
    document.documentElement.style.setProperty('--touch-target-size', '60px');
    document.documentElement.style.setProperty('--font-size-base', '24px');
    document.documentElement.style.setProperty('--spacing-unit', '24px');
    
    // لوح شطرنج أكبر للتلفزيون
    document.documentElement.style.setProperty('--board-size', 'min(50vw, 70vh)');
    document.documentElement.style.setProperty('--piece-size', '5vw');
    
    // تفعيل وضع التلفزيون
    document.body.classList.add('tv-mode');
    this.settings.tvMode = true;
    
    // تحسينات خاصة بالتلفزيون
    this.enableTVNavigation();
    this.adjustForViewingDistance();
  }

  // تحسينات اللمس
  applyTouchOptimizations() {
    if (this.touchSupport) {
      // تحسين أحجام الأهداف للمس
      document.documentElement.style.setProperty('--min-touch-target', '44px');
      
      // إضافة مساحة إضافية بين العناصر
      document.documentElement.style.setProperty('--touch-spacing', '8px');
      
      // تحسين لوح الشطرنج للمس
      document.body.classList.add('touch-optimized');
    }
  }

  // تحسينات الشاشات عالية الدقة
  applyHighDPIOptimizations() {
    if (this.settings.highDPI) {
      document.body.classList.add('high-dpi');
      
      // استخدام صور عالية الدقة
      document.documentElement.style.setProperty('--image-quality', 'high');
      
      // تحسين حدة النصوص
      document.documentElement.style.setProperty('--font-smoothing', 'antialiased');
    }
  }

  // تطبيق تفضيلات الحركة
  applyMotionPreferences() {
    if (this.settings.reducedMotion) {
      document.body.classList.add('reduced-motion');
      
      // تقليل أو إلغاء الانتقالات
      document.documentElement.style.setProperty('--transition-duration', '0s');
      document.documentElement.style.setProperty('--animation-duration', '0s');
    } else {
      document.body.classList.remove('reduced-motion');
      
      // استعادة الانتقالات العادية
      document.documentElement.style.setProperty('--transition-duration', '0.3s');
      document.documentElement.style.setProperty('--animation-duration', '0.5s');
    }
  }

  // تفعيل التنقل للتلفزيون
  enableTVNavigation() {
    // تفعيل التحكم بالريموت
    if (window.remoteControlManager) {
      window.remoteControlManager.activate();
    }
    
    // تحسين التركيز للتلفزيون
    this.setupTVFocus();
  }

  // إعداد التركيز للتلفزيون
  setupTVFocus() {
    // إضافة مؤشرات تركيز واضحة
    const style = document.createElement('style');
    style.textContent = `
      .tv-mode *:focus {
        outline: 3px solid #007bff !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 6px rgba(0, 123, 255, 0.25) !important;
      }
      
      .tv-mode .chess-square:focus {
        background-color: rgba(0, 123, 255, 0.3) !important;
        transform: scale(1.05) !important;
      }
    `;
    document.head.appendChild(style);
  }

  // تعديل للمسافة المشاهدة
  adjustForViewingDistance() {
    // زيادة أحجام النصوص والعناصر للمشاهدة من بعيد
    const scaleFactor = 1.5;
    document.documentElement.style.setProperty('--tv-scale-factor', scaleFactor.toString());
  }

  // إرسال حدث تغيير الجهاز
  dispatchDeviceChangeEvent() {
    const event = new CustomEvent('devicechange', {
      detail: {
        deviceType: this.deviceType,
        screenSize: this.screenSize,
        touchSupport: this.touchSupport,
        isTV: this.isTV
      }
    });
    document.dispatchEvent(event);
  }

  // إرسال حدث تغيير الاتجاه
  dispatchOrientationChangeEvent() {
    const event = new CustomEvent('orientationchange', {
      detail: {
        orientation: this.orientation
      }
    });
    document.dispatchEvent(event);
  }

  // الحصول على معلومات الجهاز
  getDeviceInfo() {
    return {
      deviceType: this.deviceType,
      screenSize: this.screenSize,
      orientation: this.orientation,
      touchSupport: this.touchSupport,
      isTV: this.isTV,
      isMobile: this.isMobile,
      isTablet: this.isTablet,
      isDesktop: this.isDesktop,
      settings: this.settings
    };
  }

  // حفظ الإعدادات
  saveSettings() {
    localStorage.setItem('deviceManagerSettings', JSON.stringify(this.settings));
  }

  // تحميل الإعدادات
  loadSettings() {
    const saved = localStorage.getItem('deviceManagerSettings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
  }
}

// إنشاء مثيل واحد من مدير الأجهزة
const deviceManager = new DeviceManager();

export default deviceManager;
export { DeviceManager };
