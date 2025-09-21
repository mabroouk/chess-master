import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import deviceManager from '../utils/deviceManager';
import remoteControlManager from '../utils/remoteControl';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Tv,
  Gamepad2,
  Keyboard,
  Mouse,
  TouchpadIcon,
  Settings,
  Info,
  Zap,
  Eye,
  Volume2,
  Accessibility
} from 'lucide-react';

const DeviceSettings = ({ onClose }) => {
  const [deviceInfo, setDeviceInfo] = useState(deviceManager.getDeviceInfo());
  const [remoteEnabled, setRemoteEnabled] = useState(remoteControlManager.isEnabled);
  const [settings, setSettings] = useState({
    ...deviceManager.settings,
    ...remoteControlManager.settings
  });

  // تحديث معلومات الجهاز
  useEffect(() => {
    const handleDeviceChange = (event) => {
      setDeviceInfo(event.detail);
    };

    document.addEventListener('devicechange', handleDeviceChange);
    return () => document.removeEventListener('devicechange', handleDeviceChange);
  }, []);

  // تبديل التحكم بالريموت
  const toggleRemoteControl = () => {
    const newState = remoteControlManager.toggle();
    setRemoteEnabled(newState);
  };

  // تحديث الإعدادات
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // تطبيق الإعدادات على المديرين المناسبين
    if (['sensitivity', 'repeatDelay', 'longPressDelay', 'vibrationEnabled', 'soundFeedback'].includes(key)) {
      remoteControlManager.settings[key] = value;
      remoteControlManager.saveSettings();
    } else {
      deviceManager.settings[key] = value;
      deviceManager.saveSettings();
    }
  };

  // الحصول على أيقونة الجهاز
  const getDeviceIcon = () => {
    switch (deviceInfo.deviceType) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      case 'desktop': return Monitor;
      case 'tv': return Tv;
      default: return Monitor;
    }
  };

  const DeviceIcon = getDeviceIcon();

  // معلومات الجهاز
  const deviceDetails = [
    { label: 'نوع الجهاز', value: deviceInfo.deviceType },
    { label: 'حجم الشاشة', value: deviceInfo.screenSize },
    { label: 'الاتجاه', value: deviceInfo.orientation },
    { label: 'دعم اللمس', value: deviceInfo.touchSupport ? 'نعم' : 'لا' },
    { label: 'تلفزيون', value: deviceInfo.isTV ? 'نعم' : 'لا' },
    { label: 'DPI عالي', value: settings.highDPI ? 'نعم' : 'لا' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Settings className="h-6 w-6" />
              <CardTitle>إعدادات الجهاز والتحكم</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              إغلاق
            </Button>
          </div>
          <CardDescription>
            تخصيص إعدادات الجهاز والتحكم بالريموت
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* معلومات الجهاز */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <DeviceIcon className="h-5 w-5" />
                <span>معلومات الجهاز</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deviceDetails.map((detail, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">{detail.label}:</span>
                    <Badge variant="outline">{detail.value}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* إعدادات التحكم بالريموت */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <Gamepad2 className="h-5 w-5" />
                <span>التحكم بالريموت</span>
              </CardTitle>
              <CardDescription>
                إعدادات التنقل بلوحة المفاتيح وأذرع التحكم
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* تفعيل التحكم بالريموت */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Gamepad2 className="h-6 w-6" />
                  <div>
                    <h3 className="font-semibold">تفعيل التحكم بالريموت</h3>
                    <p className="text-sm text-muted-foreground">
                      التنقل باستخدام لوحة المفاتيح وأذرع التحكم
                    </p>
                  </div>
                </div>
                <Switch
                  checked={remoteEnabled}
                  onCheckedChange={toggleRemoteControl}
                />
              </div>

              {remoteEnabled && (
                <>
                  {/* حساسية التحكم */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="font-medium">حساسية التحكم</label>
                      <Badge variant="outline">{Math.round(settings.sensitivity * 100)}%</Badge>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={settings.sensitivity}
                      onChange={(e) => updateSetting('sensitivity', parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* تأخير التكرار */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="font-medium">تأخير التكرار</label>
                      <Badge variant="outline">{settings.repeatDelay}ms</Badge>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="1000"
                      step="50"
                      value={settings.repeatDelay}
                      onChange={(e) => updateSetting('repeatDelay', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* الاهتزاز */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Zap className="h-5 w-5" />
                      <span>تفعيل الاهتزاز</span>
                    </div>
                    <Switch
                      checked={settings.vibrationEnabled}
                      onCheckedChange={(checked) => updateSetting('vibrationEnabled', checked)}
                    />
                  </div>

                  {/* التغذية الراجعة الصوتية */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Volume2 className="h-5 w-5" />
                      <span>التغذية الراجعة الصوتية</span>
                    </div>
                    <Switch
                      checked={settings.soundFeedback}
                      onCheckedChange={(checked) => updateSetting('soundFeedback', checked)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* إعدادات العرض */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <Eye className="h-5 w-5" />
                <span>إعدادات العرض</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* الواجهة التكيفية */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Monitor className="h-5 w-5" />
                  <span>الواجهة التكيفية</span>
                </div>
                <Switch
                  checked={settings.adaptiveUI}
                  onCheckedChange={(checked) => updateSetting('adaptiveUI', checked)}
                />
              </div>

              {/* تحسين اللمس */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <TouchpadIcon className="h-5 w-5" />
                  <span>تحسين اللمس</span>
                </div>
                <Switch
                  checked={settings.touchOptimization}
                  onCheckedChange={(checked) => updateSetting('touchOptimization', checked)}
                />
              </div>

              {/* وضع التلفزيون */}
              {deviceInfo.isTV && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Tv className="h-5 w-5" />
                    <span>وضع التلفزيون</span>
                  </div>
                  <Switch
                    checked={settings.tvMode}
                    onCheckedChange={(checked) => updateSetting('tvMode', checked)}
                  />
                </div>
              )}

              {/* تقليل الحركة */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Accessibility className="h-5 w-5" />
                  <span>تقليل الحركة</span>
                </div>
                <Switch
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* اختصارات لوحة المفاتيح */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                <Keyboard className="h-5 w-5" />
                <span>اختصارات لوحة المفاتيح</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>الأسهم</span>
                    <Badge variant="outline">التنقل</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Enter/Space</span>
                    <Badge variant="outline">تفعيل</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Escape</span>
                    <Badge variant="outline">رجوع</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Tab</span>
                    <Badge variant="outline">التالي</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Ctrl+N</span>
                    <Badge variant="outline">لعبة جديدة</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Ctrl+Z</span>
                    <Badge variant="outline">تراجع</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Ctrl+F</span>
                    <Badge variant="outline">قلب اللوح</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>F11</span>
                    <Badge variant="outline">ملء الشاشة</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* معلومات إضافية */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-start space-x-2 rtl:space-x-reverse">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">نصائح الاستخدام:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• يتم حفظ جميع الإعدادات تلقائياً</li>
                  <li>• التحكم بالريموت يعمل مع أذرع التحكم المتوافقة</li>
                  <li>• وضع التلفزيون يحسن العرض للشاشات الكبيرة</li>
                  <li>• تقليل الحركة يساعد في تحسين الأداء</li>
                </ul>
              </div>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              إغلاق
            </Button>
            <Button onClick={() => {
              deviceManager.saveSettings();
              remoteControlManager.saveSettings();
              onClose();
            }}>
              حفظ الإعدادات
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceSettings;
