import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import SoundSettings from './SoundSettings';
import soundManager from '../utils/soundManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ChessBoard from './ChessBoard';
import ChessEngine from './ChessEngine';
import { Chess } from 'chess.js';
import { 
  User, 
  Bot, 
  Users, 
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  Cpu,
  Clock,
  Trophy,
  Target
} from 'lucide-react';

const PlayPage = () => {
  const [gameMode, setGameMode] = useState(null);
  const [gameSettings, setGameSettings] = useState({
    difficulty: 'medium',
    timeControl: 'unlimited',
    soundEnabled: true,
    boardOrientation: 'white',
    aiColor: 'black'
  });
  const [currentGame, setCurrentGame] = useState(null);
  const [chessEngine, setChessEngine] = useState(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0
  });
  const [lastGameResult, setLastGameResult] = useState(null);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  
  const aiTimeoutRef = useRef(null);

  // إنشاء محرك الذكاء الاصطناعي
  useEffect(() => {
    const engine = new ChessEngine(gameSettings.difficulty);
    setChessEngine(engine);
  }, [gameSettings.difficulty]);

  // تحميل الإحصائيات من التخزين المحلي
  useEffect(() => {
    const savedStats = localStorage.getItem('chessStats');
    if (savedStats) {
      setGameStats(JSON.parse(savedStats));
    }
  }, []);

  // حفظ الإحصائيات في التخزين المحلي
  const saveStats = (newStats) => {
    setGameStats(newStats);
    localStorage.setItem('chessStats', JSON.stringify(newStats));
  };

  const gameModes = [
    {
      id: 'computer',
      title: 'اللعب ضد الكمبيوتر',
      description: 'تحدى الذكاء الاصطناعي في مستويات مختلفة',
      icon: Bot,
      color: 'bg-blue-500'
    },
    {
      id: 'human',
      title: 'اللعب ضد صديق',
      description: 'العب مع صديق على نفس الجهاز',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      id: 'online',
      title: 'اللعب عبر الإنترنت',
      description: 'ابحث عن خصم عبر الإنترنت',
      icon: User,
      color: 'bg-purple-500',
      disabled: true
    }
  ];

  const difficultyLevels = [
    { 
      id: 'easy', 
      label: 'سهل', 
      description: 'للمبتدئين',
      details: 'يفكر لثانية واحدة، يرتكب أخطاء أحياناً'
    },
    { 
      id: 'medium', 
      label: 'متوسط', 
      description: 'للاعبين المتوسطين',
      details: 'يفكر لـ 3 ثوان، لعب متوازن'
    },
    { 
      id: 'hard', 
      label: 'صعب', 
      description: 'للخبراء',
      details: 'يفكر لـ 5 ثوان، قوي جداً'
    },
    { 
      id: 'expert', 
      label: 'خبير', 
      description: 'تحدي حقيقي',
      details: 'يفكر لـ 8 ثوان، مستوى احترافي'
    }
  ];

  const timeControls = [
    { id: 'unlimited', label: 'بدون حد زمني', description: 'وقت مفتوح' },
    { id: 'blitz', label: 'برق', description: '5 دقائق لكل لاعب' },
    { id: 'rapid', label: 'سريع', description: '15 دقيقة لكل لاعب' },
    { id: 'classical', label: 'كلاسيكي', description: '30 دقيقة لكل لاعب' }
  ];

  // بدء لعبة جديدة
  const startGame = (mode) => {
    setGameMode(mode);
    setCurrentGame({
      mode,
      startTime: new Date(),
      settings: { ...gameSettings }
    });
    setLastGameResult(null);
  };

  // إنهاء اللعبة
  const endGame = () => {
    setGameMode(null);
    setCurrentGame(null);
    setIsAiThinking(false);
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }
  };

  // معالجة انتهاء اللعبة
  const handleGameEnd = (result) => {
    console.log('انتهت اللعبة:', result);
    setLastGameResult(result);
    
    // تحديث الإحصائيات
    if (gameMode === 'computer') {
      const newStats = { ...gameStats };
      newStats.gamesPlayed++;
      
      if (result.winner === 'draw') {
        newStats.draws++;
      } else if (
        (result.winner === 'white' && gameSettings.aiColor === 'black') ||
        (result.winner === 'black' && gameSettings.aiColor === 'white')
      ) {
        newStats.wins++;
      } else {
        newStats.losses++;
      }
      
      saveStats(newStats);
    }
  };

  // معالجة النقلة
  const handleMove = (move, fen) => {
    console.log('نقلة جديدة:', move);
    
    // تشغيل الصوت إذا كان مفعلاً
    if (gameSettings.soundEnabled) {
      playMoveSound(move);
    }

    // إذا كان وضع اللعب ضد الكمبيوتر، اجعل الكمبيوتر يلعب
    if (gameMode === 'computer' && chessEngine) {
      const game = new Chess(fen);
      
      // تحقق من أن الدور للكمبيوتر
      if (game.turn() === gameSettings.aiColor.charAt(0)) {
        makeAiMove(game);
      }
    }
  };

  // تشغيل صوت النقلة
  const playMoveSound = (move) => {
    // يمكن إضافة أصوات مختلفة حسب نوع النقلة
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // تردد مختلف حسب نوع النقلة
    if (move.captured) {
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // صوت الأسر
    } else if (move.san.includes('+')) {
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime); // صوت الكش
    } else {
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime); // صوت النقلة العادية
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  // تنفيذ نقلة الذكاء الاصطناعي
  const makeAiMove = (game) => {
    setIsAiThinking(true);
    
    // محاكاة وقت التفكير حسب مستوى الصعوبة
    const thinkingTime = {
      'easy': 500,
      'medium': 1500,
      'hard': 3000,
      'expert': 5000
    }[gameSettings.difficulty] || 1500;

    aiTimeoutRef.current = setTimeout(() => {
      const bestMove = chessEngine.findBestMove(game);
      
      if (bestMove) {
        // إرسال النقلة إلى لوح الشطرنج
        const moveEvent = new CustomEvent('aiMove', { 
          detail: { move: bestMove } 
        });
        window.dispatchEvent(moveEvent);
      }
      
      setIsAiThinking(false);
    }, thinkingTime);
  };

  // تبديل الصوت
  const toggleSound = () => {
    const newState = !gameSettings.soundEnabled;
    setGameSettings(prev => ({
      ...prev,
      soundEnabled: newState
    }));
    
    // تحديث إعدادات مدير الأصوات
    if (newState) {
      soundManager.enabled = true;
      soundManager.playUISound('success');
    } else {
      soundManager.enabled = false;
    }
  };

  // قلب اللوح
  const flipBoard = () => {
    setGameSettings(prev => ({
      ...prev,
      boardOrientation: prev.boardOrientation === 'white' ? 'black' : 'white'
    }));
  };

  // تغيير لون الذكاء الاصطناعي
  const toggleAiColor = () => {
    setGameSettings(prev => ({
      ...prev,
      aiColor: prev.aiColor === 'white' ? 'black' : 'white',
      boardOrientation: prev.aiColor === 'white' ? 'black' : 'white'
    }));
  };

  // حساب نسبة الفوز
  const getWinRate = () => {
    const totalGames = gameStats.wins + gameStats.losses + gameStats.draws;
    if (totalGames === 0) return 0;
    return Math.round((gameStats.wins / totalGames) * 100);
  };

  if (gameMode) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* شريط التحكم في اللعبة */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Button
              variant="outline"
              onClick={endGame}
              className="flex items-center space-x-2 rtl:space-x-reverse"
            >
              <RotateCcw className="h-4 w-4" />
              <span>العودة للقائمة</span>
            </Button>
            
            {gameMode === 'computer' && (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                {isAiThinking && (
                  <Badge variant="secondary" className="animate-pulse">
                    <Cpu className="h-3 w-3 mr-1" />
                    الكمبيوتر يفكر...
                  </Badge>
                )}
                <Badge variant="outline">
                  مستوى {gameSettings.difficulty}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSound}
              className="flex items-center"
            >
              {gameSettings.soundEnabled ? 
                <Volume2 className="h-4 w-4" /> : 
                <VolumeX className="h-4 w-4" />
              }
            </Button>
            
            <Button
              variant="outline"
              onClick={flipBoard}
              className="flex items-center space-x-2 rtl:space-x-reverse"
            >
              <RotateCcw className="h-4 w-4" />
              <span>قلب اللوح</span>
            </Button>

            {gameMode === 'computer' && (
              <Button
                variant="outline"
                onClick={toggleAiColor}
                className="flex items-center space-x-2 rtl:space-x-reverse"
              >
                <div className={`w-3 h-3 rounded-full ${
                  gameSettings.aiColor === 'white' ? 'bg-white border border-gray-300' : 'bg-gray-800'
                }`}></div>
                <span>تبديل اللون</span>
              </Button>
            )}
          </div>
        </div>

        {/* نتيجة اللعبة السابقة */}
        {lastGameResult && (
          <Card className="mb-6 border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{lastGameResult.reason}</span>
                </div>
                <Badge variant={
                  lastGameResult.winner === 'draw' ? 'secondary' :
                  (lastGameResult.winner === 'white' && gameSettings.aiColor === 'black') ||
                  (lastGameResult.winner === 'black' && gameSettings.aiColor === 'white') ? 'default' : 'destructive'
                }>
                  {lastGameResult.moves} نقلة
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* لوح الشطرنج */}
        <div className="flex justify-center">
          <ChessBoard
            gameMode={gameMode}
            onGameEnd={handleGameEnd}
            onMove={handleMove}
            boardOrientation={gameSettings.boardOrientation}
            showCoordinates={true}
            aiLevel={gameSettings.difficulty}
            timeControl={gameSettings.timeControl}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">اختر طريقة اللعب</h1>
        <p className="text-muted-foreground">
          اختر الطريقة التي تفضلها للعب الشطرنج
        </p>
      </div>

      {/* الإحصائيات */}
      {gameStats.gamesPlayed > 0 && (
        <Card className="mb-8 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <Trophy className="h-5 w-5" />
              <span>إحصائياتك</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{gameStats.gamesPlayed}</div>
                <div className="text-sm text-muted-foreground">ألعاب</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{gameStats.wins}</div>
                <div className="text-sm text-muted-foreground">فوز</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{gameStats.losses}</div>
                <div className="text-sm text-muted-foreground">خسارة</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{getWinRate()}%</div>
                <div className="text-sm text-muted-foreground">نسبة الفوز</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* أوضاع اللعب */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {gameModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <Card 
              key={mode.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                mode.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
              onClick={() => !mode.disabled && startGame(mode.id)}
            >
              <CardHeader className="text-center">
                <div className={`${mode.color} text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                  <Icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">{mode.title}</CardTitle>
                <CardDescription>{mode.description}</CardDescription>
              </CardHeader>
              {mode.disabled && (
                <CardContent>
                  <p className="text-center text-sm text-muted-foreground">
                    قريباً...
                  </p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* إعدادات اللعبة */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
            <Settings className="h-5 w-5" />
            <span>إعدادات اللعبة</span>
          </CardTitle>
          <CardDescription>
            اضبط إعدادات اللعبة حسب تفضيلاتك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* مستوى الصعوبة */}
          <div>
            <h3 className="text-lg font-semibold mb-3">مستوى الصعوبة (ضد الكمبيوتر)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {difficultyLevels.map((level) => (
                <Card
                  key={level.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    gameSettings.difficulty === level.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setGameSettings(prev => ({ ...prev, difficulty: level.id }))}
                >
                  <CardContent className="p-4 text-center">
                    <div className="font-semibold mb-1">{level.label}</div>
                    <div className="text-xs text-muted-foreground mb-2">{level.description}</div>
                    <div className="text-xs text-muted-foreground">{level.details}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* التحكم في الوقت */}
          <div>
            <h3 className="text-lg font-semibold mb-3">التحكم في الوقت</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {timeControls.map((control) => (
                <Button
                  key={control.id}
                  variant={gameSettings.timeControl === control.id ? 'default' : 'outline'}
                  onClick={() => setGameSettings(prev => ({ ...prev, timeControl: control.id }))}
                  className="flex flex-col h-auto py-3"
                >
                  <span className="font-semibold">{control.label}</span>
                  <span className="text-xs opacity-70">{control.description}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* إعدادات إضافية */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Button
                variant={gameSettings.soundEnabled ? 'default' : 'outline'}
                onClick={toggleSound}
                className="flex items-center space-x-2 rtl:space-x-reverse"
              >
                {gameSettings.soundEnabled ? 
                  <Volume2 className="h-4 w-4" /> : 
                  <VolumeX className="h-4 w-4" />
                }
                <span>الأصوات</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowSoundSettings(true)}
                className="flex items-center space-x-2 rtl:space-x-reverse"
              >
                <Settings className="h-4 w-4" />
                <span>إعدادات الصوت</span>
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <div>اتجاه اللوح: {gameSettings.boardOrientation === 'white' ? 'الأبيض في الأسفل' : 'الأسود في الأسفل'}</div>
              <div>لون الكمبيوتر: {gameSettings.aiColor === 'white' ? 'الأبيض' : 'الأسود'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* نافذة إعدادات الصوت */}
      {showSoundSettings && (
        <SoundSettings onClose={() => setShowSoundSettings(false)} />
      )}
    </div>
  );
};

export default PlayPage;
