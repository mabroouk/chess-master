import { useState, useEffect } from 'react';
import Header from './components/Header';
import deviceManager from './utils/deviceManager';
import remoteControlManager from './utils/remoteControl';
import PlayPage from './components/PlayPage';
import LearnPage from './components/LearnPage';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Trophy, BookOpen, Target } from 'lucide-react';
import './App.css';
import './styles/responsive.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(deviceManager.getDeviceInfo());
  const [remoteControlEnabled, setRemoteControlEnabled] = useState(false);

  // تحميل إعدادات الوضع المظلم من التخزين المحلي
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // تطبيق الوضع المظلم
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // إعداد مديري الأجهزة والريموت
  useEffect(() => {
    // مراقبة تغييرات الجهاز
    const handleDeviceChange = (event) => {
      setDeviceInfo(event.detail);
      
      // تفعيل التحكم بالريموت تلقائياً للتلفزيون
      if (event.detail.isTV && !remoteControlEnabled) {
        setRemoteControlEnabled(true);
        remoteControlManager.activate();
      }
    };

    // مراقبة أحداث الريموت
    const handleRemoteBack = () => {
      if (currentPage !== 'home') {
        setCurrentPage('home');
      }
    };

    // إضافة مستمعي الأحداث
    document.addEventListener('devicechange', handleDeviceChange);
    document.addEventListener('remoteBack', handleRemoteBack);

    // تنظيف المستمعين عند إلغاء التحميل
    return () => {
      document.removeEventListener('devicechange', handleDeviceChange);
      document.removeEventListener('remoteBack', handleRemoteBack);
    };
  }, [currentPage, remoteControlEnabled]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'play':
        return <PlayPage />;
      case 'learn':
        return <LearnPage />;
      case 'tactics':
        return <TacticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        onNavigate={handleNavigation}
        currentPage={currentPage}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <main>
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}

// الصفحة الرئيسية
const HomePage = ({ onNavigate }) => {
  const features = [
    {
      icon: Crown,
      title: 'العب الشطرنج',
      description: 'العب ضد الكمبيوتر أو أصدقائك',
      action: () => onNavigate('play'),
      color: 'bg-blue-500'
    },
    {
      icon: BookOpen,
      title: 'تعلم الشطرنج',
      description: 'دروس شاملة من المبتدئ إلى المحترف',
      action: () => onNavigate('learn'),
      color: 'bg-green-500'
    },
    {
      icon: Target,
      title: 'حل التكتيكات',
      description: 'تحسن مهاراتك بحل الألغاز',
      action: () => onNavigate('tactics'),
      color: 'bg-purple-500'
    },
    {
      icon: Trophy,
      title: 'تتبع التقدم',
      description: 'راقب تطورك وإنجازاتك',
      action: () => onNavigate('settings'),
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* القسم الترحيبي */}
      <div className="text-center mb-16">
        <div className="bg-primary text-primary-foreground p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <Crown className="h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          أستاذ الشطرنج
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          منصة شاملة لتعلم ولعب الشطرنج. من الأساسيات إلى الاحتراف، 
          كل ما تحتاجه لتصبح لاعب شطرنج ماهر.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onNavigate('play')}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            ابدأ اللعب الآن
          </button>
          <button
            onClick={() => onNavigate('learn')}
            className="bg-secondary text-secondary-foreground px-8 py-3 rounded-lg text-lg font-semibold hover:bg-secondary/90 transition-colors"
          >
            تعلم الشطرنج
          </button>
        </div>
      </div>

      {/* الميزات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card 
              key={index}
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
              onClick={feature.action}
            >
              <CardContent className="p-6 text-center">
                <div className={`${feature.color} text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* إحصائيات */}
      <div className="bg-muted rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-6">لماذا أستاذ الشطرنج؟</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-3xl font-bold text-primary mb-2">100+</div>
            <div className="text-muted-foreground">درس تفاعلي</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">1000+</div>
            <div className="text-muted-foreground">لغز تكتيكي</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">10+</div>
            <div className="text-muted-foreground">مستوى صعوبة</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// صفحة التكتيكات (مؤقتة)
const TacticsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-4">التكتيكات والألغاز</h1>
        <p className="text-muted-foreground">
          قريباً... سيتم إضافة مجموعة شاملة من الألغاز التكتيكية
        </p>
      </div>
    </div>
  );
};

// صفحة الإعدادات (مؤقتة)
const SettingsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-4">الإعدادات والإحصائيات</h1>
        <p className="text-muted-foreground">
          قريباً... سيتم إضافة إعدادات مفصلة وتتبع التقدم
        </p>
      </div>
    </div>
  );
};

// الفوتر
const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mb-4">
            <Crown className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">أستاذ الشطرنج</span>
          </div>
          <p className="text-muted-foreground mb-4">
            منصة شاملة لتعلم ولعب الشطرنج
          </p>
          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              من برمجة وتصميم <span className="font-semibold">المحاسب أحمد مبروك</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              © 2025 جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default App;
