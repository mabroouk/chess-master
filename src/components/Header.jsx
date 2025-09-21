import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Menu, 
  X, 
  Play, 
  BookOpen, 
  Trophy, 
  Settings,
  Moon,
  Sun
} from 'lucide-react';

const Header = ({ onNavigate, currentPage, darkMode, toggleDarkMode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'play', label: 'اللعب', icon: Play },
    { id: 'learn', label: 'التعلم', icon: BookOpen },
    { id: 'tactics', label: 'التكتيكات', icon: Trophy },
    { id: 'settings', label: 'الإعدادات', icon: Settings }
  ];

  const handleNavigation = (pageId) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* الشعار */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Crown className="h-6 w-6" />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold text-foreground">أستاذ الشطرنج</h1>
              <p className="text-xs text-muted-foreground">Chess Master</p>
            </div>
          </div>

          {/* القائمة الرئيسية - سطح المكتب */}
          <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? 'default' : 'ghost'}
                  onClick={() => handleNavigation(item.id)}
                  className="flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>

          {/* أزرار الإعدادات */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* تبديل الوضع المظلم */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="hidden sm:flex"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* قائمة الهاتف المحمول */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* القائمة المنسدلة للهاتف المحمول */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="py-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? 'default' : 'ghost'}
                    onClick={() => handleNavigation(item.id)}
                    className="w-full justify-start space-x-3 rtl:space-x-reverse"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
              
              {/* تبديل الوضع المظلم في القائمة المحمولة */}
              <Button
                variant="ghost"
                onClick={toggleDarkMode}
                className="w-full justify-start space-x-3 rtl:space-x-reverse sm:hidden"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span>{darkMode ? 'الوضع النهاري' : 'الوضع المظلم'}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
