import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import soundManager from '../utils/soundManager';
import { 
  Volume2, 
  VolumeX, 
  Volume1,
  Play,
  Settings,
  TestTube,
  CheckCircle
} from 'lucide-react';

const SoundSettings = ({ onClose }) => {
  const [isEnabled, setIsEnabled] = useState(soundManager.isEnabled());
  const [volume, setVolume] = useState(soundManager.getVolume() * 100);
  const [testingSound, setTestingSound] = useState(null);

  // تحديث الحالة عند تغيير الإعدادات
  useEffect(() => {
    setIsEnabled(soundManager.isEnabled());
    setVolume(soundManager.getVolume() * 100);
  }, []);

  // تفعيل/إلغاء الأصوات
  const toggleSound = () => {
    const newState = soundManager.toggle();
    setIsEnabled(newState);
    
    if (newState) {
      soundManager.playUISound('success');
    }
  };

  // تغيير مستوى الصوت
  const handleVolumeChange = (newVolume) => {
    const volumeValue = newVolume[0];
    setVolume(volumeValue);
    soundManager.setVolume(volumeValue / 100);
  };

  // اختبار الأصوات
  const testSound = (soundType) => {
    setTestingSound(soundType);
    
    switch (soundType) {
      case 'move':
        soundManager.playMoveSound('move');
        break;
      case 'capture':
        soundManager.playMoveSound('capture');
        break;
      case 'check':
        soundManager.playMoveSound('check');
        break;
      case 'checkmate':
        soundManager.playMoveSound('checkmate');
        break;
      case 'castle':
        soundManager.playMoveSound('castle');
        break;
      case 'promotion':
        soundManager.playMoveSound('promotion');
        break;
      case 'gameStart':
        soundManager.playGameSound('start');
        break;
      case 'gameEnd':
        soundManager.playGameSound('end');
        break;
      case 'success':
        soundManager.playUISound('success');
        break;
      case 'error':
        soundManager.playUISound('error');
        break;
      case 'victory':
        soundManager.playVictorySound();
        break;
    }
    
    setTimeout(() => setTestingSound(null), 1000);
  };

  const soundTests = [
    { id: 'move', name: 'نقلة عادية', icon: '♟️' },
    { id: 'capture', name: 'أسر قطعة', icon: '⚔️' },
    { id: 'check', name: 'كش', icon: '⚠️' },
    { id: 'checkmate', name: 'كش مات', icon: '👑' },
    { id: 'castle', name: 'تبييت', icon: '🏰' },
    { id: 'promotion', name: 'ترقية بيدق', icon: '⬆️' },
    { id: 'gameStart', name: 'بداية اللعبة', icon: '🎯' },
    { id: 'gameEnd', name: 'نهاية اللعبة', icon: '🏁' },
    { id: 'success', name: 'نجاح', icon: '✅' },
    { id: 'error', name: 'خطأ', icon: '❌' },
    { id: 'victory', name: 'انتصار', icon: '🎉' }
  ];

  const getVolumeIcon = () => {
    if (!isEnabled) return VolumeX;
    if (volume === 0) return VolumeX;
    if (volume < 50) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Settings className="h-6 w-6" />
              <CardTitle>إعدادات الصوت</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              إغلاق
            </Button>
          </div>
          <CardDescription>
            تخصيص الأصوات والتأثيرات الصوتية في اللعبة
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* تفعيل/إلغاء الأصوات */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <VolumeIcon className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">تفعيل الأصوات</h3>
                <p className="text-sm text-muted-foreground">
                  تشغيل/إيقاف جميع الأصوات في اللعبة
                </p>
              </div>
            </div>
            <Button
              onClick={toggleSound}
              variant={isEnabled ? "default" : "outline"}
              className="flex items-center space-x-2 rtl:space-x-reverse"
            >
              {isEnabled ? (
                <>
                  <Volume2 className="h-4 w-4" />
                  <span>مفعل</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4" />
                  <span>معطل</span>
                </>
              )}
            </Button>
          </div>

          {/* مستوى الصوت */}
          {isEnabled && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">مستوى الصوت</h3>
                <Badge variant="outline">{Math.round(volume)}%</Badge>
              </div>
              
              <div className="px-4">
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>صامت</span>
                <span>عالي</span>
              </div>
            </div>
          )}

          {/* اختبار الأصوات */}
          {isEnabled && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <TestTube className="h-5 w-5" />
                <h3 className="font-semibold">اختبار الأصوات</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {soundTests.map((sound) => (
                  <Button
                    key={sound.id}
                    variant="outline"
                    onClick={() => testSound(sound.id)}
                    disabled={testingSound === sound.id}
                    className="flex items-center justify-between p-3 h-auto"
                  >
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="text-lg">{sound.icon}</span>
                      <span className="text-sm">{sound.name}</span>
                    </div>
                    
                    {testingSound === sound.id ? (
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                        <span className="text-xs">تشغيل...</span>
                      </div>
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* معلومات إضافية */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-start space-x-2 rtl:space-x-reverse">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">نصائح الأصوات:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• الأصوات تساعد في فهم نوع النقلة دون النظر للوح</li>
                  <li>• يمكن تعديل مستوى الصوت حسب البيئة المحيطة</li>
                  <li>• الأصوات مصممة لتكون واضحة وغير مزعجة</li>
                  <li>• يتم حفظ إعداداتك تلقائياً</li>
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
              soundManager.playUISound('success');
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

export default SoundSettings;
