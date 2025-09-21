import { Chess } from 'chess.js';

// تقييم القطع
const PIECE_VALUES = {
  'p': 100,   // بيدق
  'n': 320,   // حصان
  'b': 330,   // فيل
  'r': 500,   // قلعة
  'q': 900,   // ملكة
  'k': 20000  // ملك
};

// جداول الموضع للقطع (من منظور الأبيض)
const POSITION_TABLES = {
  'p': [ // البيادق
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ],
  'n': [ // الحصان
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  'b': [ // الفيل
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  'r': [ // القلعة
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ],
  'q': [ // الملكة
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  'k': [ // الملك (وسط اللعبة)
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
  ]
};

class ChessEngine {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
    this.maxDepth = this.getDepthByDifficulty(difficulty);
    this.transpositionTable = new Map();
  }

  // تحديد عمق البحث حسب مستوى الصعوبة
  getDepthByDifficulty(difficulty) {
    switch (difficulty) {
      case 'easy': return 2;
      case 'medium': return 3;
      case 'hard': return 4;
      case 'expert': return 5;
      default: return 3;
    }
  }

  // تقييم الموضع
  evaluatePosition(game) {
    if (game.isCheckmate()) {
      return game.turn() === 'w' ? -9999 : 9999;
    }
    
    if (game.isDraw()) {
      return 0;
    }

    let score = 0;
    const board = game.board();

    // تقييم المواد والمواضع
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          const pieceValue = PIECE_VALUES[piece.type];
          const positionValue = this.getPositionValue(piece, i, j);
          const totalValue = pieceValue + positionValue;
          
          if (piece.color === 'w') {
            score += totalValue;
          } else {
            score -= totalValue;
          }
        }
      }
    }

    // تقييمات إضافية
    score += this.evaluateKingSafety(game);
    score += this.evaluatePawnStructure(game);
    score += this.evaluateMobility(game);

    return score;
  }

  // الحصول على قيمة الموضع للقطعة
  getPositionValue(piece, row, col) {
    const table = POSITION_TABLES[piece.type];
    if (!table) return 0;

    // قلب الجدول للقطع السوداء
    const actualRow = piece.color === 'w' ? 7 - row : row;
    return table[actualRow][col];
  }

  // تقييم أمان الملك
  evaluateKingSafety(game) {
    let score = 0;
    const whiteKing = this.findKing(game, 'w');
    const blackKing = this.findKing(game, 'b');

    if (whiteKing) {
      score += this.getKingSafetyScore(game, whiteKing, 'w');
    }
    
    if (blackKing) {
      score -= this.getKingSafetyScore(game, blackKing, 'b');
    }

    return score;
  }

  // العثور على الملك
  findKing(game, color) {
    const board = game.board();
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece && piece.type === 'k' && piece.color === color) {
          return { row: i, col: j };
        }
      }
    }
    return null;
  }

  // حساب نقاط أمان الملك
  getKingSafetyScore(game, kingPos, color) {
    let safety = 0;
    
    // فحص البيادق الواقية
    const pawnShield = this.evaluatePawnShield(game, kingPos, color);
    safety += pawnShield * 10;

    // فحص المربعات المفتوحة حول الملك
    const openSquares = this.countOpenSquaresAroundKing(game, kingPos);
    safety -= openSquares * 15;

    return safety;
  }

  // تقييم درع البيادق
  evaluatePawnShield(game, kingPos, color) {
    let shield = 0;
    const direction = color === 'w' ? -1 : 1;
    const board = game.board();

    for (let col = Math.max(0, kingPos.col - 1); col <= Math.min(7, kingPos.col + 1); col++) {
      const pawnRow = kingPos.row + direction;
      if (pawnRow >= 0 && pawnRow < 8) {
        const piece = board[pawnRow][col];
        if (piece && piece.type === 'p' && piece.color === color) {
          shield++;
        }
      }
    }

    return shield;
  }

  // عد المربعات المفتوحة حول الملك
  countOpenSquaresAroundKing(game, kingPos) {
    let openSquares = 0;
    const board = game.board();

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        
        const row = kingPos.row + i;
        const col = kingPos.col + j;
        
        if (row >= 0 && row < 8 && col >= 0 && col < 8) {
          if (!board[row][col]) {
            openSquares++;
          }
        }
      }
    }

    return openSquares;
  }

  // تقييم هيكل البيادق
  evaluatePawnStructure(game) {
    let score = 0;
    const board = game.board();

    // فحص البيادق المضاعفة والمعزولة
    for (let col = 0; col < 8; col++) {
      let whitePawns = 0;
      let blackPawns = 0;

      for (let row = 0; row < 8; row++) {
        const piece = board[row][col];
        if (piece && piece.type === 'p') {
          if (piece.color === 'w') whitePawns++;
          else blackPawns++;
        }
      }

      // خصم نقاط للبيادق المضاعفة
      if (whitePawns > 1) score -= (whitePawns - 1) * 50;
      if (blackPawns > 1) score += (blackPawns - 1) * 50;

      // فحص البيادق المعزولة
      if (whitePawns > 0 && this.isIsolatedPawn(board, col, 'w')) {
        score -= 20;
      }
      if (blackPawns > 0 && this.isIsolatedPawn(board, col, 'b')) {
        score += 20;
      }
    }

    return score;
  }

  // فحص البيدق المعزول
  isIsolatedPawn(board, col, color) {
    const leftCol = col - 1;
    const rightCol = col + 1;

    for (let checkCol of [leftCol, rightCol]) {
      if (checkCol >= 0 && checkCol < 8) {
        for (let row = 0; row < 8; row++) {
          const piece = board[row][checkCol];
          if (piece && piece.type === 'p' && piece.color === color) {
            return false;
          }
        }
      }
    }

    return true;
  }

  // تقييم الحركة
  evaluateMobility(game) {
    const currentTurn = game.turn();
    
    // حساب النقلات للأبيض
    const whiteMoves = game.moves().length;
    
    // تبديل الدور مؤقتاً لحساب نقلات الأسود
    const tempGame = new Chess(game.fen());
    tempGame.load(game.fen().replace(currentTurn === 'w' ? ' w ' : ' b ', currentTurn === 'w' ? ' b ' : ' w '));
    const blackMoves = tempGame.moves().length;

    return (whiteMoves - blackMoves) * 10;
  }

  // خوارزمية Minimax مع Alpha-Beta Pruning
  minimax(game, depth, alpha, beta, maximizingPlayer) {
    const positionKey = game.fen();
    
    // فحص جدول التبديل
    if (this.transpositionTable.has(positionKey)) {
      const entry = this.transpositionTable.get(positionKey);
      if (entry.depth >= depth) {
        return entry.score;
      }
    }

    if (depth === 0 || game.isGameOver()) {
      const score = this.evaluatePosition(game);
      this.transpositionTable.set(positionKey, { score, depth });
      return score;
    }

    const moves = game.moves();
    
    if (maximizingPlayer) {
      let maxEval = -Infinity;
      
      for (const move of moves) {
        game.move(move);
        const evaluation = this.minimax(game, depth - 1, alpha, beta, false);
        game.undo();
        
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        
        if (beta <= alpha) {
          break; // Alpha-beta pruning
        }
      }
      
      this.transpositionTable.set(positionKey, { score: maxEval, depth });
      return maxEval;
    } else {
      let minEval = Infinity;
      
      for (const move of moves) {
        game.move(move);
        const evaluation = this.minimax(game, depth - 1, alpha, beta, true);
        game.undo();
        
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        
        if (beta <= alpha) {
          break; // Alpha-beta pruning
        }
      }
      
      this.transpositionTable.set(positionKey, { score: minEval, depth });
      return minEval;
    }
  }

  // ترتيب النقلات لتحسين Alpha-Beta
  orderMoves(game, moves) {
    return moves.map(move => {
      const moveObj = game.move(move);
      let score = 0;

      // إعطاء أولوية للأسر
      if (moveObj.captured) {
        score += PIECE_VALUES[moveObj.captured] - PIECE_VALUES[moveObj.piece];
      }

      // إعطاء أولوية للكش
      if (moveObj.san.includes('+')) {
        score += 50;
      }

      // إعطاء أولوية للترقية
      if (moveObj.promotion) {
        score += PIECE_VALUES[moveObj.promotion];
      }

      game.undo();
      return { move, score };
    }).sort((a, b) => b.score - a.score).map(item => item.move);
  }

  // العثور على أفضل نقلة
  findBestMove(game) {
    const moves = game.moves();
    if (moves.length === 0) return null;

    // إضافة عشوائية للمستويات السهلة
    if (this.difficulty === 'easy' && Math.random() < 0.3) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    const orderedMoves = this.orderMoves(game, moves);
    let bestMove = orderedMoves[0];
    let bestScore = -Infinity;

    const isMaximizing = game.turn() === 'b'; // الكمبيوتر يلعب بالأسود

    for (const move of orderedMoves) {
      game.move(move);
      const score = this.minimax(game, this.maxDepth - 1, -Infinity, Infinity, !isMaximizing);
      game.undo();

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  // تحديث مستوى الصعوبة
  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    this.maxDepth = this.getDepthByDifficulty(difficulty);
    this.transpositionTable.clear(); // مسح الجدول عند تغيير المستوى
  }

  // مسح جدول التبديل
  clearTranspositionTable() {
    this.transpositionTable.clear();
  }
}

export default ChessEngine;
