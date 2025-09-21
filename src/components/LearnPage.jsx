import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ChessBoard from './ChessBoard';
import { Chess } from 'chess.js';
import { 
  BookOpen, 
  Target, 
  Crown, 
  Zap, 
  Trophy,
  Play,
  CheckCircle,
  Lock,
  Star,
  Clock,
  Users,
  Brain,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Eye,
  Award,
  Castle
} from 'lucide-react';

const LearnPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('basics');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({});
  const [userLevel, setUserLevel] = useState('beginner');
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [currentStep, setCurrentStep] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // تحميل التقدم من التخزين المحلي
  useEffect(() => {
    const savedProgress = localStorage.getItem('chessLearningProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setLessonProgress(progress.lessons || {});
      setCompletedLessons(new Set(progress.completed || []));
      setUserLevel(progress.level || 'beginner');
    }
  }, []);

  // حفظ التقدم
  const saveProgress = (lessonId, completed = false) => {
    const newProgress = {
      lessons: { ...lessonProgress, [lessonId]: completed ? 100 : (lessonProgress[lessonId] || 0) + 10 },
      completed: completed ? [...completedLessons, lessonId] : Array.from(completedLessons),
      level: userLevel
    };
    
    if (completed) {
      setCompletedLessons(prev => new Set([...prev, lessonId]));
    }
    
    setLessonProgress(newProgress.lessons);
    localStorage.setItem('chessLearningProgress', JSON.stringify(newProgress));
  };

  const categories = [
    {
      id: 'basics',
      title: 'الأساسيات',
      description: 'تعلم قواعد الشطرنج الأساسية',
      icon: BookOpen,
      color: 'bg-blue-500',
      level: 'beginner'
    },
    {
      id: 'openings',
      title: 'الافتتاحيات',
      description: 'أشهر افتتاحيات الشطرنج',
      icon: Crown,
      color: 'bg-green-500',
      level: 'intermediate'
    },
    {
      id: 'middlegame',
      title: 'وسط اللعبة',
      description: 'استراتيجيات وسط اللعبة',
      icon: Target,
      color: 'bg-orange-500',
      level: 'intermediate'
    },
    {
      id: 'endgame',
      title: 'النهايات الخاصة',
      description: 'تقنيات النهايات المتقدمة',
      icon: Trophy,
      color: 'bg-purple-500',
      level: 'advanced'
    },
    {
      id: 'tactics',
      title: 'التكتيكات',
      description: 'حل الألغاز التكتيكية',
      icon: Zap,
      color: 'bg-red-500',
      level: 'all'
    }
  ];

  const lessons = {
    basics: [
      {
        id: 'setup',
        title: 'إعداد الرقعة',
        description: 'تعلم كيفية ترتيب القطع على الرقعة',
        duration: 5,
        difficulty: 'مبتدئ',
        content: {
          theory: 'رقعة الشطرنج تتكون من 64 مربعاً، 32 مربعاً فاتحاً و32 مربعاً داكناً. يجب أن يكون المربع الأيمن السفلي فاتح اللون.',
          positions: [
            {
              fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
              explanation: 'الوضع الابتدائي للشطرنج. لاحظ ترتيب القطع والبيادق.'
            }
          ],
          steps: [
            'ضع الرقعة بحيث يكون المربع الأيمن السفلي فاتح اللون',
            'ضع القلاع في الزوايا',
            'ضع الأحصنة بجانب القلاع',
            'ضع الفيلة بجانب الأحصنة',
            'ضع الملكة في مربعها (الملكة البيضاء في المربع الفاتح)',
            'ضع الملك في المربع المتبقي',
            'ضع البيادق في الصف الثاني'
          ]
        }
      },
      {
        id: 'piece-movement',
        title: 'حركة القطع',
        description: 'تعلم كيف تتحرك كل قطعة',
        duration: 10,
        difficulty: 'مبتدئ',
        content: {
          theory: 'كل قطعة في الشطرنج لها طريقة حركة مختلفة ومميزة.',
          positions: [
            {
              fen: '8/8/8/3Q4/8/8/8/8 w - - 0 1',
              explanation: 'الملكة تتحرك في جميع الاتجاهات (أفقياً، عمودياً، قطرياً)'
            },
            {
              fen: '8/8/8/3R4/8/8/8/8 w - - 0 1',
              explanation: 'القلعة تتحرك أفقياً وعمودياً فقط'
            },
            {
              fen: '8/8/8/3B4/8/8/8/8 w - - 0 1',
              explanation: 'الفيل يتحرك قطرياً فقط'
            },
            {
              fen: '8/8/8/3N4/8/8/8/8 w - - 0 1',
              explanation: 'الحصان يتحرك على شكل حرف L'
            }
          ],
          steps: [
            'الملكة: أقوى القطع، تتحرك في جميع الاتجاهات',
            'القلعة: تتحرك أفقياً وعمودياً',
            'الفيل: يتحرك قطرياً',
            'الحصان: يتحرك على شكل L ويقفز فوق القطع',
            'الملك: يتحرك مربعاً واحداً في أي اتجاه',
            'البيدق: يتحرك للأمام مربعاً واحداً، ويأسر قطرياً'
          ]
        }
      },
      {
        id: 'special-moves',
        title: 'النقلات الخاصة',
        description: 'التبييت، الأسر بالمرور، والترقية',
        duration: 8,
        difficulty: 'مبتدئ',
        content: {
          theory: 'هناك ثلاث نقلات خاصة في الشطرنج: التبييت، الأسر بالمرور، وترقية البيدق.',
          positions: [
            {
              fen: 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1',
              explanation: 'التبييت: نقلة خاصة تحرك الملك والقلعة معاً'
            },
            {
              fen: '8/8/8/3pP3/8/8/8/8 w - d6 0 1',
              explanation: 'الأسر بالمرور: أسر البيدق الذي تحرك مربعين'
            },
            {
              fen: '8/P7/8/8/8/8/8/8 w - - 0 1',
              explanation: 'ترقية البيدق: تحويل البيدق إلى قطعة أخرى'
            }
          ],
          steps: [
            'التبييت: يحرك الملك مربعين نحو القلعة، والقلعة تقفز فوقه',
            'شروط التبييت: الملك والقلعة لم يتحركا، لا توجد قطع بينهما، الملك ليس في كش',
            'الأسر بالمرور: عندما يتحرك بيدق الخصم مربعين، يمكن أسره كأنه تحرك مربعاً واحداً',
            'ترقية البيدق: عندما يصل البيدق للصف الأخير، يجب ترقيته لقطعة أخرى'
          ]
        }
      },
      {
        id: 'check-checkmate',
        title: 'الكش والكش مات',
        description: 'فهم الكش والكش مات والجمود',
        duration: 12,
        difficulty: 'مبتدئ',
        content: {
          theory: 'الكش هو تهديد الملك، والكش مات هو تهديد لا يمكن تجنبه، والجمود هو عدم وجود نقلات قانونية.',
          positions: [
            {
              fen: '8/8/8/8/8/8/8/R3K3 b - - 0 1',
              explanation: 'الملك الأسود في كش من القلعة'
            },
            {
              fen: '8/8/8/8/8/8/8/RR2K3 b - - 0 1',
              explanation: 'كش مات! الملك الأسود لا يستطيع الهروب'
            },
            {
              fen: '8/8/8/8/8/8/p7/k1K5 b - - 0 1',
              explanation: 'جمود! الملك الأسود لا يستطيع التحرك لكنه ليس في كش'
            }
          ],
          steps: [
            'الكش: عندما يكون الملك مهدداً بالأسر',
            'يجب الخروج من الكش بإحدى الطرق: تحريك الملك، حجب الهجوم، أسر القطعة المهاجمة',
            'الكش مات: عندما يكون الملك في كش ولا يمكن الخروج منه',
            'الجمود: عندما لا توجد نقلات قانونية والملك ليس في كش (تعادل)',
            'الهدف من الشطرنج هو تحقيق الكش مات'
          ]
        }
      }
    ],
    openings: [
      {
        id: 'italian-game',
        title: 'اللعبة الإيطالية',
        description: 'افتتاحية كلاسيكية للمبتدئين',
        duration: 15,
        difficulty: 'متوسط',
        content: {
          theory: 'اللعبة الإيطالية هي إحدى أقدم الافتتاحيات وأكثرها شعبية. تركز على التطوير السريع والسيطرة على المركز.',
          positions: [
            {
              fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
              explanation: '1. e4 - نقلة الافتتاح الكلاسيكية'
            },
            {
              fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
              explanation: '1...e5 - الرد المتماثل'
            },
            {
              fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
              explanation: '2. Nf3 - تطوير الحصان ومهاجمة البيدق'
            },
            {
              fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
              explanation: '2...Nc6 - تطوير الحصان والدفاع عن البيدق'
            },
            {
              fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
              explanation: '3. Bc4 - اللعبة الإيطالية! الفيل يهاجم f7'
            }
          ],
          steps: [
            'ابدأ بـ 1. e4 للسيطرة على المركز',
            'طور الحصان بـ 2. Nf3',
            'ضع الفيل في c4 لمهاجمة النقطة الضعيفة f7',
            'استمر في التطوير مع 0-0 و d3',
            'ابحث عن فرص الهجوم على الملك',
            'حافظ على التوازن بين الهجوم والدفاع'
          ]
        }
      },
      {
        id: 'ruy-lopez',
        title: 'افتتاحية روي لوبيز',
        description: 'الافتتاحية الإسبانية الكلاسيكية',
        duration: 20,
        difficulty: 'متوسط',
        content: {
          theory: 'روي لوبيز هي إحدى أقوى الافتتاحيات وأكثرها عمقاً. تركز على الضغط طويل المدى.',
          positions: [
            {
              fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
              explanation: '3. Bb5 - روي لوبيز! الضغط على الحصان'
            }
          ],
          steps: [
            'ابدأ بالنقلات الكلاسيكية 1. e4 e5 2. Nf3 Nc6',
            'العب 3. Bb5 للضغط على الحصان',
            'الهدف هو إضعاف دفاع الأسود عن e5',
            'استمر مع 0-0 و Re1 و d3',
            'ابحث عن الضغط في المركز',
            'كن صبوراً - هذه افتتاحية استراتيجية'
          ]
        }
      }
    ],
    middlegame: [
      {
        id: 'pawn-structure',
        title: 'هيكل البيادق',
        description: 'فهم نقاط القوة والضعف في هيكل البيادق',
        duration: 18,
        difficulty: 'متوسط',
        content: {
          theory: 'هيكل البيادق هو الأساس الاستراتيجي للموضع. البيادق المضاعفة والمعزولة والمتأخرة لها تأثير كبير.',
          positions: [
            {
              fen: '8/pp1p1ppp/8/8/8/8/PP1P1PPP/8 w - - 0 1',
              explanation: 'بيادق مضاعفة في عمود c - ضعف هيكلي'
            },
            {
              fen: '8/pp1ppppp/8/8/8/8/PP1P1PPP/8 w - - 0 1',
              explanation: 'بيدق معزول في d2 - يحتاج حماية'
            }
          ],
          steps: [
            'تجنب البيادق المضاعفة إلا إذا كان هناك تعويض',
            'البيادق المعزولة ضعيفة لكن قد تعطي نشاطاً للقطع',
            'البيادق المتأخرة هدف للهجوم',
            'البيادق المتصلة قوية',
            'سلاسل البيادق تحدد طبيعة الموضع'
          ]
        }
      }
    ],
    endgame: [
      {
        id: 'king-pawn-endgame',
        title: 'نهايات الملك والبيدق',
        description: 'أساسيات نهايات الملك والبيدق',
        duration: 25,
        difficulty: 'متقدم',
        content: {
          theory: 'نهايات الملك والبيدق هي أساس جميع النهايات. فهم المربعات الحرجة والمعارضة أمر ضروري.',
          positions: [
            {
              fen: '8/8/8/8/8/8/4P3/4K3 w - - 0 1',
              explanation: 'الملك أمام البيدق - موضع فائز'
            },
            {
              fen: '8/8/8/8/8/4k3/4P3/4K3 w - - 0 1',
              explanation: 'المعارضة - مفهوم أساسي في النهايات'
            }
          ],
          steps: [
            'الملك يجب أن يدعم البيدق',
            'المعارضة: الملوك تواجه بعضها بمربع فارغ بينهما',
            'المربعات الحرجة: المربعات التي يجب على الملك الوصول إليها',
            'قاعدة المربع: تحديد إذا كان البيدق سيرقى',
            'الملك النشط أهم من البيدق الإضافي أحياناً'
          ]
        }
      }
    ],
    tactics: [
      {
        id: 'pins-skewers',
        title: 'التسمير والتشويك',
        description: 'تكتيكات التسمير والتشويك',
        duration: 12,
        difficulty: 'متوسط',
        content: {
          theory: 'التسمير والتشويك من أهم التكتيكات. التسمير يمنع القطعة من التحرك، والتشويك يجبرها على التحرك.',
          positions: [
            {
              fen: '8/8/8/3r4/3K4/3Q4/8/8 w - - 0 1',
              explanation: 'تسمير: الملك مسمر بواسطة القلعة'
            },
            {
              fen: '8/8/8/3Q4/3K4/3r4/8/8 w - - 0 1',
              explanation: 'تشويك: الملك يجب أن يتحرك وسيفقد القلعة'
            }
          ],
          steps: [
            'التسمير: قطعة لا تستطيع التحرك لأنها تحمي قطعة أهم',
            'التشويك: إجبار قطعة قيمة على التحرك لكشف قطعة أقل قيمة',
            'ابحث عن القطع على نفس الخط',
            'استخدم القطع بعيدة المدى (ملكة، قلعة، فيل)',
            'التسمير المطلق: عندما تكون القطعة المحمية هي الملك'
          ]
        }
      },
      {
        id: 'forks',
        title: 'الشوكة',
        description: 'مهاجمة قطعتين في نفس الوقت',
        duration: 10,
        difficulty: 'مبتدئ',
        content: {
          theory: 'الشوكة هي مهاجمة قطعتين أو أكثر في نفس الوقت. الحصان ممتاز في هذا التكتيك.',
          positions: [
            {
              fen: '8/8/8/3N4/2K1R3/8/8/8 w - - 0 1',
              explanation: 'شوكة الحصان: يهاجم الملك والقلعة'
            },
            {
              fen: '8/8/8/8/3P4/2K1R3/8/8 w - - 0 1',
              explanation: 'شوكة البيدق: يهاجم الملك والقلعة'
            }
          ],
          steps: [
            'ابحث عن قطعتين غير محميتين',
            'الحصان أفضل قطعة للشوكة',
            'البيادق يمكنها عمل شوكة أيضاً',
            'الشوكة الملكية: عندما يكون الملك إحدى القطع المهاجمة',
            'تحقق من جميع نقلات الحصان الممكنة'
          ]
        }
      }
    ]
  };

  // حساب التقدم الإجمالي
  const calculateOverallProgress = () => {
    const allLessons = Object.values(lessons).flat();
    const completedCount = allLessons.filter(lesson => completedLessons.has(lesson.id)).length;
    return Math.round((completedCount / allLessons.length) * 100);
  };

  // بدء الدرس
  const startLesson = (lesson) => {
    setSelectedLesson(lesson);
    setCurrentStep(0);
    setShowHint(false);
  };

  // إنهاء الدرس
  const completeLesson = () => {
    if (selectedLesson) {
      saveProgress(selectedLesson.id, true);
      setSelectedLesson(null);
    }
  };

  // الانتقال للخطوة التالية
  const nextStep = () => {
    if (selectedLesson && currentStep < selectedLesson.content.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowHint(false);
    }
  };

  // الانتقال للخطوة السابقة
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowHint(false);
    }
  };

  // إعادة تعيين الدرس
  const resetLesson = () => {
    setCurrentStep(0);
    setShowHint(false);
  };

  if (selectedLesson) {
    const currentPosition = selectedLesson.content.positions?.[currentStep] || selectedLesson.content.positions?.[0];
    const currentStepText = selectedLesson.content.steps[currentStep];
    
    return (
      <div className="container mx-auto px-4 py-8">
        {/* شريط التحكم في الدرس */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Button
              variant="outline"
              onClick={() => setSelectedLesson(null)}
              className="flex items-center space-x-2 rtl:space-x-reverse"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>العودة للدروس</span>
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold">{selectedLesson.title}</h1>
              <p className="text-muted-foreground">{selectedLesson.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {selectedLesson.duration} دقيقة
            </Badge>
            <Badge variant="secondary">{selectedLesson.difficulty}</Badge>
          </div>
        </div>

        {/* تقدم الدرس */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">تقدم الدرس</span>
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} من {selectedLesson.content.steps.length}
              </span>
            </div>
            <Progress value={((currentStep + 1) / selectedLesson.content.steps.length) * 100} className="h-2" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* لوح الشطرنج */}
          <div className="flex flex-col items-center space-y-4">
            <Card className="w-full">
              <CardContent className="p-4">
                {currentPosition && (
                  <div className="chess-lesson-board flex justify-center">
                    <div style={{ width: '400px', height: '400px' }}>
                      <ChessBoard
                        gameMode="lesson"
                        initialPosition={currentPosition.fen}
                        boardOrientation="white"
                        showCoordinates={true}
                        interactive={false}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* أزرار التحكم */}
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button
                onClick={prevStep}
                disabled={currentStep === 0}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={resetLesson}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={() => setShowHint(!showHint)}
                variant="outline"
                size="sm"
              >
                <Lightbulb className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={nextStep}
                disabled={currentStep === selectedLesson.content.steps.length - 1}
                variant="outline"
                size="sm"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* محتوى الدرس */}
          <div className="space-y-4">
            {/* النظرية */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <BookOpen className="h-5 w-5" />
                  <span>النظرية</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedLesson.content.theory}
                </p>
              </CardContent>
            </Card>

            {/* الخطوة الحالية */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Target className="h-5 w-5" />
                  <span>الخطوة {currentStep + 1}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{currentStepText}</p>
                
                {currentPosition && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">شرح الموضع:</p>
                    <p className="text-sm text-muted-foreground">
                      {currentPosition.explanation}
                    </p>
                  </div>
                )}

                {showHint && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">تلميح</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      انظر بعناية إلى الموضع وحاول فهم سبب هذه النقلة أو المفهوم.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* إنهاء الدرس */}
            {currentStep === selectedLesson.content.steps.length - 1 && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">أحسنت! أكملت الدرس</span>
                    </div>
                    <Button onClick={completeLesson} className="bg-green-600 hover:bg-green-700">
                      <Award className="h-4 w-4 mr-2" />
                      إنهاء الدرس
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">أكاديمية الشطرنج</h1>
        <p className="text-muted-foreground mb-6">
          تعلم الشطرنج من الأساسيات إلى الاحتراف، كل ما تحتاجه لتصبح لاعب شطرنج ماهر
        </p>

        {/* التقدم الإجمالي */}
        <Card className="max-w-md mx-auto">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">التقدم في الأساسيات</span>
              <span className="text-sm text-muted-foreground">{calculateOverallProgress()}% مكتمل</span>
            </div>
            <Progress value={calculateOverallProgress()} className="h-2" />
            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
              <span>{Array.from(completedLessons).length} درس مكتمل</span>
              <span>من {Object.values(lessons).flat().length} درس</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* فئات التعلم */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {categories.map((category) => {
          const Icon = category.icon;
          const categoryLessons = lessons[category.id] || [];
          const completedInCategory = categoryLessons.filter(lesson => completedLessons.has(lesson.id)).length;
          
          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedCategory === category.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`${category.color} text-white p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-1">{category.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">{category.description}</p>
                <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-xs">{completedInCategory}/{categoryLessons.length}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* الدروس */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">
          {categories.find(cat => cat.id === selectedCategory)?.title || 'الدروس'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(lessons[selectedCategory] || []).map((lesson, index) => {
            const isCompleted = completedLessons.has(lesson.id);
            const progress = lessonProgress[lesson.id] || 0;
            const isLocked = index > 0 && !completedLessons.has(lessons[selectedCategory][index - 1].id);
            
            return (
              <Card
                key={lesson.id}
                className={`transition-all hover:shadow-md ${
                  isLocked ? 'opacity-50' : 'cursor-pointer hover:scale-105'
                }`}
                onClick={() => !isLocked && startLesson(lesson)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse text-lg">
                        {isLocked ? (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        ) : isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Play className="h-5 w-5 text-primary" />
                        )}
                        <span>{lesson.title}</span>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {lesson.description}
                      </CardDescription>
                    </div>
                    
                    {isCompleted && (
                      <Badge variant="default" className="bg-green-600">
                        <Star className="h-3 w-3 mr-1" />
                        مكتمل
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <Clock className="h-4 w-4" />
                        <span>{lesson.duration} دقيقة</span>
                      </div>
                      <Badge variant="outline" size="sm">
                        {lesson.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  {!isCompleted && progress > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>التقدم</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1" />
                    </div>
                  )}
                  
                  {isLocked && (
                    <p className="text-xs text-muted-foreground mt-2">
                      أكمل الدرس السابق لفتح هذا الدرس
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LearnPage;
