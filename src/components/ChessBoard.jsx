import { useState, useEffect, useCallback, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import soundManager from '../utils/soundManager';
import { Chess } from 'chess.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  SkipForward, 
  SkipBack, 
  Play, 
  Pause,
  Download,
  Upload,
  Eye,
  EyeOff,
  Clock,
  Target
} from 'lucide-react';

const ChessBoard = ({ 
  gameMode = 'human', 
  onGameEnd, 
  onMove,
  boardOrientation = 'white',
  showCoordinates = true,
  aiLevel = 'medium',
  timeControl = 'unlimited'
}) => {
  const [game, setGame] = useState(new Chess());
  const [gamePosition, setGamePosition] = useState(game.fen());
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameStatus, setGameStatus] = useState('');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [isAnalysisMode, setIsAnalysisMode] = useState(false);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [whiteTime, setWhiteTime] = useState(null);
  const [blackTime, setBlackTime] = useState(null);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
  const [lastMove, setLastMove] = useState(null);
  const [threatenedSquares, setThreatenedSquares] = useState([]);
  const [showThreats, setShowThreats] = useState(false);
  
  const timerRef = useRef(null);

  // إعداد الوقت حسب نوع التحكم
  const getTimeControl = useCallback(() => {
    switch (timeControl) {
      case 'blitz': return 5 * 60 * 1000; // 5 دقائق
      case 'rapid': return 15 * 60 * 1000; // 15 دقيقة
      case 'classical': return 30 * 60 * 1000; // 30 دقيقة
      default: return null; // بدون حد زمني
    }
  }, [timeControl]);

  // تحديث حالة اللعبة
  const updateGameStatus = useCallback((currentGame) => {
    let status = '';
    
    if (currentGame.isCheckmate()) {
      status = currentGame.turn() === 'w' ? 'الأسود يفوز بالكش مات!' : 'الأبيض يفوز بالكش مات!';
    } else if (currentGame.isDraw()) {
      if (currentGame.isStalemate()) {
        status = 'تعادل - جمود!';
      } else if (currentGame.isThreefoldRepetition()) {
        status = 'تعادل - تكرار ثلاثي!';
      } else if (currentGame.isInsufficientMaterial()) {
        status = 'تعادل - قطع غير كافية!';
      } else {
        status = 'تعادل!';
      }
    } else if (currentGame.isCheck()) {
      status = currentGame.turn() === 'w' ? 'الأبيض في كش!' : 'الأسود في كش!';
    } else {
      status = currentGame.turn() === 'w' ? 'دور الأبيض' : 'دور الأسود';
    }
    
    setGameStatus(status);
    
    if (currentGame.isGameOver() && onGameEnd) {
      onGameEnd({
        winner: currentGame.isCheckmate() ? (currentGame.turn() === 'w' ? 'black' : 'white') : 'draw',
        reason: status,
        pgn: currentGame.pgn(),
        moves: moveHistory.length
      });
    }
  }, [onGameEnd, moveHistory.length]);

  // حساب القطع المأسورة
  const updateCapturedPieces = useCallback((move) => {
    if (move.captured) {
      const piece = move.captured;
      const color = move.color === 'w' ? 'black' : 'white';
      setCapturedPieces(prev => ({
        ...prev,
        [color]: [...prev[color], piece]
      }));
    }
  }, []);

  // حساب المربعات المهددة
  const calculateThreatenedSquares = useCallback((currentGame) => {
    const threats = [];
    const squares = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
    
    squares.forEach(file => {
      ranks.forEach(rank => {
        const square = file + rank;
        const piece = currentGame.get(square);
        if (piece && piece.color !== currentGame.turn()) {
          const moves = currentGame.moves({ square, verbose: true });
          moves.forEach(move => {
            if (move.captured) {
              threats.push(move.to);
            }
          });
        }
      });
    });
    
    setThreatenedSquares(threats);
  }, []);

  // معالجة النقلة
  const makeMove = useCallback((sourceSquare, targetSquare, piece) => {
    if (isAnalysisMode) return false;
    
    const gameCopy = new Chess(game.fen());
    
    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece?.[1]?.toLowerCase() ?? 'q'
      });

      if (move) {
        setGame(gameCopy);
        setGamePosition(gameCopy.fen());
        setMoveHistory(prev => [...prev, move]);
        setLastMove({ from: sourceSquare, to: targetSquare });
        updateGameStatus(gameCopy);
        updateCapturedPieces(move);
        calculateThreatenedSquares(gameCopy);
        
        // تشغيل الصوت المناسب للنقلة
        let moveType = 'move';
        if (gameCopy.isCheckmate()) {
          moveType = 'checkmate';
        } else if (gameCopy.isCheck()) {
          moveType = 'check';
        } else if (move.captured) {
          moveType = 'capture';
        } else if (move.flags.includes('k') || move.flags.includes('q')) {
          moveType = 'castle';
        } else if (move.promotion) {
          moveType = 'promotion';
        }
        
        soundManager.playMoveSound(moveType, move.piece);
        
        if (onMove) {
          onMove(move, gameCopy.fen());
        }
        
        return true;
      }
    } catch (error) {
      console.log('نقلة غير صحيحة:', error);
    }
    
    return false;
  }, [game, onMove, updateGameStatus, updateCapturedPieces, calculateThreatenedSquares, isAnalysisMode]);

  // معالجة إسقاط القطعة
  const onDrop = useCallback((sourceSquare, targetSquare, piece) => {
    return makeMove(sourceSquare, targetSquare, piece);
  }, [makeMove]);

  // معالجة النقر على المربع
  const onSquareClick = useCallback((square) => {
    if (isAnalysisMode) return;
    
    if (!selectedSquare) {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true });
        setPossibleMoves(moves.map(move => move.to));
      }
    } else {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setPossibleMoves([]);
      } else {
        const moved = makeMove(selectedSquare, square);
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    }
  }, [selectedSquare, game, makeMove, isAnalysisMode]);

  // تخصيص مظهر المربعات
  const customSquareStyles = {};
  
  // تمييز المربع المختار
  if (selectedSquare) {
    customSquareStyles[selectedSquare] = {
      backgroundColor: 'rgba(255, 255, 0, 0.4)'
    };
  }
  
  // تمييز النقلة الأخيرة
  if (lastMove) {
    customSquareStyles[lastMove.from] = {
      backgroundColor: 'rgba(155, 199, 0, 0.41)'
    };
    customSquareStyles[lastMove.to] = {
      backgroundColor: 'rgba(155, 199, 0, 0.41)'
    };
  }
  
  // تمييز النقلات الممكنة
  possibleMoves.forEach(square => {
    customSquareStyles[square] = {
      background: 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
      borderRadius: '50%'
    };
  });

  // تمييز المربعات المهددة
  if (showThreats) {
    threatenedSquares.forEach(square => {
      customSquareStyles[square] = {
        ...customSquareStyles[square],
        boxShadow: 'inset 0 0 3px 3px rgba(255, 0, 0, 0.3)'
      };
    });
  }

  // إعادة تعيين اللعبة
  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setGamePosition(newGame.fen());
    setMoveHistory([]);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove(null);
    setCapturedPieces({ white: [], black: [] });
    setThreatenedSquares([]);
    setCurrentMoveIndex(-1);
    setIsAnalysisMode(false);
    setGameStartTime(new Date());
    
    const timeLimit = getTimeControl();
    if (timeLimit) {
      setWhiteTime(timeLimit);
      setBlackTime(timeLimit);
    }
    
    updateGameStatus(newGame);
    soundManager.playGameSound('start');
  };

  // التراجع عن النقلة
  const undoMove = () => {
    if (moveHistory.length === 0 || isAnalysisMode) return;
    
    const gameCopy = new Chess(game.fen());
    const undoneMove = gameCopy.undo();
    
    if (undoneMove) {
      setGame(gameCopy);
      setGamePosition(gameCopy.fen());
      setMoveHistory(prev => prev.slice(0, -1));
      setSelectedSquare(null);
      setPossibleMoves([]);
      
      // إزالة القطعة المأسورة من القائمة
      if (undoneMove.captured) {
        const color = undoneMove.color === 'w' ? 'black' : 'white';
        setCapturedPieces(prev => ({
          ...prev,
          [color]: prev[color].slice(0, -1)
        }));
      }
      
      updateGameStatus(gameCopy);
      calculateThreatenedSquares(gameCopy);
    }
  };

  // وضع التحليل
  const toggleAnalysisMode = () => {
    setIsAnalysisMode(!isAnalysisMode);
    setSelectedSquare(null);
    setPossibleMoves([]);
  };

  // التنقل في تاريخ النقلات
  const goToMove = (moveIndex) => {
    if (moveIndex < -1 || moveIndex >= moveHistory.length) return;
    
    setCurrentMoveIndex(moveIndex);
    
    if (moveIndex === -1) {
      // العودة لبداية اللعبة
      const newGame = new Chess();
      setGamePosition(newGame.fen());
    } else {
      // إعادة تشغيل النقلات حتى النقلة المحددة
      const newGame = new Chess();
      for (let i = 0; i <= moveIndex; i++) {
        newGame.move(moveHistory[i]);
      }
      setGamePosition(newGame.fen());
    }
  };

  // تصدير اللعبة
  const exportGame = () => {
    const pgn = game.pgn();
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess-game-${new Date().toISOString().split('T')[0]}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // تحميل لعبة
  const importGame = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const pgn = e.target.result;
          const newGame = new Chess();
          newGame.loadPgn(pgn);
          
          setGame(newGame);
          setGamePosition(newGame.fen());
          setMoveHistory(newGame.history({ verbose: true }));
          updateGameStatus(newGame);
        } catch (error) {
          console.error('خطأ في تحميل الملف:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  // تحديث حالة اللعبة عند البداية
  useEffect(() => {
    updateGameStatus(game);
    setGameStartTime(new Date());
    
    const timeLimit = getTimeControl();
    if (timeLimit) {
      setWhiteTime(timeLimit);
      setBlackTime(timeLimit);
    }
  }, [game, updateGameStatus, getTimeControl]);

  // تنسيق الوقت
  const formatTime = (milliseconds) => {
    if (!milliseconds) return '--:--';
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // رسم القطع المأسورة
  const renderCapturedPieces = (color) => {
    const pieces = capturedPieces[color];
    const pieceSymbols = {
      'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚'
    };
    
    return (
      <div className="flex flex-wrap gap-1">
        {pieces.map((piece, index) => (
          <span key={index} className="text-lg">
            {pieceSymbols[piece]}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      {/* اللوح الرئيسي */}
      <div className="flex flex-col items-center space-y-4">
        {/* معلومات اللاعب الأسود */}
        <Card className="w-full max-w-md">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                <span className="font-semibold">الأسود</span>
                {blackTime && (
                  <Badge variant="outline" className="flex items-center space-x-1 rtl:space-x-reverse">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(blackTime)}</span>
                  </Badge>
                )}
              </div>
              <div className="text-right">
                {renderCapturedPieces('black')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* معلومات اللعبة */}
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">{gameStatus}</h2>
          <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse text-sm text-muted-foreground">
            <span>النقلات: {moveHistory.length}</span>
            {gameMode === 'computer' && (
              <Badge variant="secondary">مستوى {aiLevel}</Badge>
            )}
            {isAnalysisMode && (
              <Badge variant="outline" className="text-blue-600">
                <Eye className="h-3 w-3 mr-1" />
                وضع التحليل
              </Badge>
            )}
          </div>
        </div>

        {/* لوح الشطرنج */}
        <div className="chess-board-container relative">
          <Chessboard
            position={gamePosition}
            onPieceDrop={onDrop}
            onSquareClick={onSquareClick}
            boardOrientation={boardOrientation}
            showBoardNotation={showCoordinates}
            customSquareStyles={customSquareStyles}
            boardWidth={400}
            animationDuration={200}
            arePiecesDraggable={!game.isGameOver() && !isAnalysisMode}
          />
        </div>

        {/* معلومات اللاعب الأبيض */}
        <Card className="w-full max-w-md">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-3 h-3 bg-white border border-gray-300 rounded-full"></div>
                <span className="font-semibold">الأبيض</span>
                {whiteTime && (
                  <Badge variant="outline" className="flex items-center space-x-1 rtl:space-x-reverse">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(whiteTime)}</span>
                  </Badge>
                )}
              </div>
              <div className="text-right">
                {renderCapturedPieces('white')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* أزرار التحكم الرئيسية */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            onClick={resetGame}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <RotateCcw className="h-4 w-4" />
            <span>لعبة جديدة</span>
          </Button>
          
          <Button
            onClick={undoMove}
            disabled={moveHistory.length === 0 || isAnalysisMode}
            variant="outline"
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <SkipBack className="h-4 w-4" />
            <span>تراجع</span>
          </Button>

          <Button
            onClick={toggleAnalysisMode}
            variant={isAnalysisMode ? "default" : "outline"}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            {isAnalysisMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>تحليل</span>
          </Button>

          <Button
            onClick={() => setShowThreats(!showThreats)}
            variant={showThreats ? "default" : "outline"}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Target className="h-4 w-4" />
            <span>التهديدات</span>
          </Button>
        </div>
      </div>

      {/* اللوحة الجانبية */}
      <div className="flex-1 space-y-4">
        {/* تاريخ النقلات */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">تاريخ النقلات</CardTitle>
          </CardHeader>
          <CardContent>
            {moveHistory.length > 0 ? (
              <div className="max-h-64 overflow-y-auto">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="font-semibold text-center">#</div>
                  <div className="font-semibold text-center">الأبيض</div>
                  <div className="font-semibold text-center">الأسود</div>
                  
                  {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => {
                    const whiteMove = moveHistory[i * 2];
                    const blackMove = moveHistory[i * 2 + 1];
                    
                    return (
                      <React.Fragment key={i}>
                        <div className="text-center text-muted-foreground">
                          {i + 1}.
                        </div>
                        <button
                          onClick={() => goToMove(i * 2)}
                          className={`text-center hover:bg-muted p-1 rounded ${
                            currentMoveIndex === i * 2 ? 'bg-primary text-primary-foreground' : ''
                          }`}
                        >
                          {whiteMove?.san}
                        </button>
                        <button
                          onClick={() => goToMove(i * 2 + 1)}
                          className={`text-center hover:bg-muted p-1 rounded ${
                            currentMoveIndex === i * 2 + 1 ? 'bg-primary text-primary-foreground' : ''
                          }`}
                          disabled={!blackMove}
                        >
                          {blackMove?.san || ''}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                لم تبدأ اللعبة بعد
              </p>
            )}
          </CardContent>
        </Card>

        {/* أدوات إضافية */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">أدوات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button
                onClick={exportGame}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 rtl:space-x-reverse"
              >
                <Download className="h-4 w-4" />
                <span>تصدير</span>
              </Button>
              
              <label className="cursor-pointer">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 rtl:space-x-reverse"
                  asChild
                >
                  <span>
                    <Upload className="h-4 w-4" />
                    <span>استيراد</span>
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".pgn"
                  onChange={importGame}
                  className="hidden"
                />
              </label>
            </div>

            {isAnalysisMode && (
              <div className="flex gap-2">
                <Button
                  onClick={() => goToMove(-1)}
                  variant="outline"
                  size="sm"
                  disabled={currentMoveIndex <= -1}
                >
                  البداية
                </Button>
                <Button
                  onClick={() => goToMove(currentMoveIndex - 1)}
                  variant="outline"
                  size="sm"
                  disabled={currentMoveIndex <= -1}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => goToMove(currentMoveIndex + 1)}
                  variant="outline"
                  size="sm"
                  disabled={currentMoveIndex >= moveHistory.length - 1}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => goToMove(moveHistory.length - 1)}
                  variant="outline"
                  size="sm"
                  disabled={currentMoveIndex >= moveHistory.length - 1}
                >
                  النهاية
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChessBoard;
