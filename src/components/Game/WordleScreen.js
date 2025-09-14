import React, { useState, useEffect, useCallback } from 'react';
import Button from '../common/Button';
import './WordleScreen.css';
import { gameDataAPI } from '../../services/api';

// Các hằng số trò chơi
const GAME_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  WON: 'WON',
  LOST: 'LOST'
};

const LETTER_STATES = {
  CORRECT: 'correct',
  PRESENT: 'present',
  ABSENT: 'absent',
  UNUSED: 'unused'
};

// Bố cục bàn phím tiếng Việt
const VIETNAMESE_KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['ENTER', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'BACKSPACE']
];

// Simple confetti effect
const createConfetti = () => {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4'];
  const confettiCount = 150;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-10px';
    confetti.style.width = Math.random() * 12 + 4 + 'px';
    confetti.style.height = confetti.style.width;
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '9999';
    confetti.style.animation = `confetti-fall ${Math.random() * 2 + 2}s ease-out forwards`;
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

    document.body.appendChild(confetti);

    setTimeout(() => {
      if (confetti.parentNode) {
        confetti.parentNode.removeChild(confetti);
      }
    }, 4000);
  }
};

// Sound effects (mock - can be replaced with real audio)
const playSound = (type) => {
  // Mock sound effects - có thể thay bằng Web Audio API thực tế
  console.log(`🔊 Playing ${type} sound`);
};

// State ban đầu mặc định
const initialGameState = {
    // Sửa độ dài board từ cố định 5 ký tự thành động, tối đa 8 ký tự
    board: Array(6).fill().map(() => Array(8).fill('')),
    currentRow: 0,
    currentCol: 0,
    targetWord: '',
    wordLength: 5, // Thêm trường để lưu độ dài từ
    gameStatus: GAME_STATUS.IN_PROGRESS,
    letterStates: {},
    cellStates: Array(6).fill().map(() => Array(8).fill(LETTER_STATES.UNUSED)),
    startTime: new Date(),
    hints: [],
    hintCount: 0,
    isInitialized: false // Thêm flag để kiểm tra trạng thái khởi tạo
};

const WordleScreen = () => {
  // State game
  const [gameState, setGameState] = useState({...initialGameState});

  const [message, setMessage] = useState('');
  const [showTutorial, setShowTutorial] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [wordMeaning, setWordMeaning] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [gameTime, setGameTime] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Hiển thị thông báo tạm thời
  const showMessage = useCallback((text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3000);
  }, []);

  // Hiển thị thông báo lỗi
  useEffect(() => {
    if (errorMessage) {
      showMessage(errorMessage, 'error');
      // Tự động xóa lỗi sau 3 giây
      const timer = setTimeout(() => setErrorMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, showMessage]);

  // Khởi tạo game
  const initializeGame = async () => {
    try {
      setIsLoading(true);
      setShowResultModal(false);
      setWordMeaning(null);
      setErrorMessage('');

      // Reset game state về mặc định trước khi lấy từ mới
      setGameState({...initialGameState});

      // Lấy từ mới từ API
      const response = await gameDataAPI.getRandomWordleWord();
      console.log('API trả về:', response);

      // Kiểm tra phản hồi
      if (!response) {
        throw new Error('Không nhận được phản hồi từ server');
      }

      if (!response.success) {
        const errorMsg = response.message || 'Không thể tải từ mới';
        throw new Error(errorMsg);
      }

      // Kiểm tra dữ liệu
      if (!response.data) {
        console.error('Response không có data:', response);
        throw new Error('Dữ liệu từ không hợp lệ - không có response.data');
      }

      if (!response.data.word) {
        console.error('Data không có word:', response.data);
        throw new Error('Dữ liệu từ không hợp lệ - không có response.data.word');
      }

      const word = response.data.word;
      console.log('Từ được chọn:', word);

      // Loại bỏ dấu cách cho việc tính toán độ dài thực tế
      const cleanWord = word.replace(/\s+/g, '');
      const wordLength = cleanWord.length;

      if (wordLength < 2 || wordLength > 8) {
        throw new Error(`Độ dài từ không phù hợp: ${wordLength} ký tự`);
      }

      // Cập nhật state game với từ mới và độ dài từ
      setGameState(prevState => ({
        ...prevState,
        targetWord: word,
        wordLength: wordLength,
        hints: response.data.hints || [],
        startTime: new Date(),
        gameStatus: GAME_STATUS.IN_PROGRESS, // Đảm bảo trạng thái là IN_PROGRESS
        board: Array(6).fill().map(() => Array(8).fill('')),
        cellStates: Array(6).fill().map(() => Array(8).fill(LETTER_STATES.UNUSED)),
        isInitialized: true // Đánh dấu đã khởi tạo thành công
      }));

      console.log(`Khởi tạo game với từ: ${word} (độ dài: ${wordLength})`);
      setIsLoading(false);
    } catch (error) {
      console.error('Lỗi khi khởi tạo game:', error);
      setIsError(true);
      setIsLoading(false);
      setErrorMessage(`Không thể khởi tạo trò chơi: ${error.message}. Vui lòng thử lại sau.`);
    }
  };

  // Reset game
  const resetGame = useCallback(async () => {
    await initializeGame();
    setMessage('');
    setShowResultModal(false);
    setWordMeaning(null);
  }, []);

  // Khởi tạo game khi component mount
  useEffect(() => {
    initializeGame();

    // Cleanup function
    return () => {
      // Dọn dẹp các timeout, event listeners khi component unmount
      setShowResultModal(false);
    };
  }, []);


  // Hiển thị modal kết quả khi game kết thúc
  useEffect(() => {
    if (gameState.gameStatus === GAME_STATUS.WON || gameState.gameStatus === GAME_STATUS.LOST) {
      // Thêm một độ trễ nhỏ để animation hoàn tất
      const timer = setTimeout(() => {
        setShowResultModal(true);
      }, 1200); // 1200ms để chờ animation lật chữ

      return () => clearTimeout(timer);
    }
  }, [gameState.gameStatus]);

  // Tính thời gian đã trôi qua
  const getElapsedTime = () => {
    const now = new Date();
    const elapsedMs = now - new Date(gameState.startTime);
    const minutes = Math.floor(elapsedMs / 60000);
    const seconds = Math.floor((elapsedMs % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Xử lý nhập chữ cái
  const handleLetterInput = async (letter) => {
    if (gameState.gameStatus !== GAME_STATUS.IN_PROGRESS) return;

    const { currentRow, currentCol, board, wordLength } = gameState;

    if (currentCol < wordLength) {
      const newBoard = [...board];
      newBoard[currentRow][currentCol] = letter;

      setGameState(prevState => ({
        ...prevState,
        board: newBoard,
        currentCol: currentCol + 1
      }));

      playSound('key');
    }
  };

  // Xử lý xóa
  const handleBackspace = () => {
    if (gameState.gameStatus !== GAME_STATUS.IN_PROGRESS) return;

    const { currentRow, currentCol, board } = gameState;

    if (currentCol > 0) {
      const newBoard = [...board];
      newBoard[currentRow][currentCol - 1] = '';

      setGameState(prevState => ({
        ...prevState,
        board: newBoard,
        currentCol: currentCol - 1
      }));

      playSound('backspace');
    }
  };

  // Xử lý gửi đoán
  const handleSubmitGuess = async () => {
    if (gameState.gameStatus !== GAME_STATUS.IN_PROGRESS) return;

    const { currentRow, currentCol, board, targetWord, wordLength } = gameState;

    if (currentCol < wordLength) {
      showMessage(`Bạn chưa điền đủ ${wordLength} ký tự!`, 'error');
      return;
    }

    // Lấy đoán hiện tại, chỉ lấy các ký tự đã nhập
    const currentGuessArray = board[currentRow].slice(0, wordLength);
    const currentGuess = currentGuessArray.join('');

    // Hiển thị trạng thái kiểm tra
    setIsAnimating(false);
    showMessage('Đang kiểm tra...', 'info');

    try {
      // Kiểm tra từ hợp lệ
      console.log(`Kiểm tra từ "${currentGuess}"`);
      const validResponse = await gameDataAPI.validateWordleGuess(currentGuess);
      console.log('Kết quả kiểm tra từ hợp lệ:', validResponse);

      // Nếu từ không hợp lệ, thông báo và không tiếp tục
      if (!validResponse.success || (validResponse.data && validResponse.data.valid === false)) {
        const errorMsg = validResponse.data?.message || 'Từ không hợp lệ!';
        showMessage(errorMsg, 'error');
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
        return;
      }

      // Từ hợp lệ, tiếp tục kiểm tra với từ đích
      console.log(`Gửi đoán "${currentGuess}" với từ đích "${targetWord}"`);

      // Hiển thị trạng thái đang xử lý
      showMessage('Đang xử lý...', 'info');

      try {
        // Gửi đoán và nhận kết quả
        const response = await gameDataAPI.checkWordleGuess({
          guess: currentGuess,
          targetWord: targetWord
        });

        // Kiểm tra phản hồi
        if (!response || !response.success || !response.data) {
          throw new Error('Không nhận được phản hồi đúng định dạng từ server');
        }

        // Xử lý kết quả
        const { result, letterStates, isCorrect } = response.data;

        console.log('Kết quả kiểm tra từ:', response.data);

        if (!result || !Array.isArray(result)) {
          throw new Error('Kết quả không hợp lệ - không có mảng result');
        }

        // Xóa thông báo đang xử lý
        setMessage('');

        // Cập nhật trạng thái ô
        const newCellStates = [...gameState.cellStates];
        result.forEach((state, index) => {
          if (index < wordLength) {
            newCellStates[currentRow][index] = state;
          }
        });

        // Cập nhật trạng thái chữ cái
        const newLetterStates = { ...gameState.letterStates };

        // Kết hợp các trạng thái chữ cái mới, ưu tiên trạng thái cao hơn
        if (letterStates) {
          Object.entries(letterStates).forEach(([key, value]) => {
            // Quy tắc ưu tiên: CORRECT > PRESENT > ABSENT > UNUSED
            const currentState = newLetterStates[key] || 'unused';
            const states = ['unused', 'absent', 'present', 'correct'];
            const currentIdx = states.indexOf(currentState);
            const newIdx = states.indexOf(value);

            if (newIdx > currentIdx) {
              newLetterStates[key] = value;
            }
          });
        }

        // Cập nhật trạng thái trò chơi
        let newGameStatus = gameState.gameStatus;

        if (isCorrect) {
          newGameStatus = GAME_STATUS.WON;
          setGameTime(getElapsedTime());
          playSound('win');
          createConfetti();


          // Lấy nghĩa của từ
          try {
            const meaningResponse = await gameDataAPI.getWordMeaning(targetWord);
            if (meaningResponse.success) {
              setWordMeaning(meaningResponse.data);
            }
          } catch (err) {
            console.error('Không thể lấy nghĩa của từ:', err);
          }
        } else if (currentRow === 5) {
          // Hết lượt
          newGameStatus = GAME_STATUS.LOST;
          setGameTime(getElapsedTime());
          playSound('lose');


          // Lấy nghĩa của từ
          try {
            const meaningResponse = await gameDataAPI.getWordMeaning(targetWord);
            if (meaningResponse.success) {
              setWordMeaning(meaningResponse.data);
            }
          } catch (err) {
            console.error('Không thể lấy nghĩa của từ:', err);
          }
        }

        setGameState(prevState => ({
          ...prevState,
          cellStates: newCellStates,
          letterStates: newLetterStates,
          currentRow: currentRow + 1,
          currentCol: 0,
          gameStatus: newGameStatus
        }));

        playSound('submit');
      } catch (checkError) {
        console.error('Lỗi khi kiểm tra đoán với từ đích:', checkError);

        // Cố gắng sử dụng client-side check trong trường hợp lỗi
        try {
          console.log('Thử sử dụng client-side check');

          // Import lại hàm từ api.js
          const clientResult = window.checkWordleGuessClientSide
            ? window.checkWordleGuessClientSide(currentGuess, targetWord)
            : {
                result: Array(wordLength).fill('absent'),
                letterStates: {},
                isCorrect: false
              };

          console.log('Client-side check result:', clientResult);

          if (!clientResult || !clientResult.result) {
            throw new Error('Kiểm tra client-side thất bại');
          }

          // Cập nhật trạng thái ô
          const newCellStates = [...gameState.cellStates];
          clientResult.result.forEach((state, index) => {
            if (index < wordLength) {
              newCellStates[currentRow][index] = state;
            }
          });

          // Cập nhật trạng thái chữ cái
          const newLetterStates = { ...gameState.letterStates };

          if (clientResult.letterStates) {
            Object.entries(clientResult.letterStates).forEach(([key, value]) => {
              const currentState = newLetterStates[key] || 'unused';
              const states = ['unused', 'absent', 'present', 'correct'];
              const currentIdx = states.indexOf(currentState);
              const newIdx = states.indexOf(value);

              if (newIdx > currentIdx) {
                newLetterStates[key] = value;
              }
            });
          }

          // Cập nhật game state
          setGameState(prevState => ({
            ...prevState,
            cellStates: newCellStates,
            letterStates: newLetterStates,
            currentRow: currentRow + 1,
            currentCol: 0
          }));

          playSound('submit');
          setMessage(''); // Xóa thông báo đang xử lý
        } catch (clientSideError) {
          console.error('Cả client-side check cũng thất bại:', clientSideError);
          setErrorMessage('Có lỗi xảy ra khi kiểm tra từ. Vui lòng thử lại.');
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 500);
        }
      }
    } catch (error) {
      console.error('Lỗi khi xử lý đoán:', error);
      setErrorMessage('Có lỗi xảy ra khi kiểm tra từ. Vui lòng thử lại.');
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  // Xử lý gợi ý
  const handleHint = async () => {
    if (gameState.gameStatus !== GAME_STATUS.IN_PROGRESS) return;

    if (gameState.hintCount >= 3) {
      showMessage('Bạn đã sử dụng hết gợi ý!', 'error');
      return;
    }

    try {
      const response = await gameDataAPI.getWordleHint({
        targetWord: gameState.targetWord,
        hintCount: gameState.hintCount
      });

      if (!response.success) {
        throw new Error('Lỗi khi lấy gợi ý');
      }

      showMessage(response.data.hint, 'hint');

      setGameState(prevState => ({
        ...prevState,
        hintCount: prevState.hintCount + 1
      }));
    } catch (error) {
      console.error('Lỗi khi lấy gợi ý:', error);
      showMessage('Không thể lấy gợi ý lúc này', 'error');
    }
  };

  // Xử lý nhấn phím
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();

      if (gameState.gameStatus !== GAME_STATUS.IN_PROGRESS) return;

      if (key === 'enter') {
        handleSubmitGuess();
      } else if (key === 'backspace') {
        handleBackspace();
      } else if (/^[a-z]$/.test(key)) {
        handleLetterInput(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Lấy trạng thái ô
  const getCellState = (rowIndex, colIndex) => {
    return gameState.cellStates[rowIndex][colIndex];
  };

  // Lấy trạng thái phím
  const getKeyState = (key) => {
    return gameState.letterStates[key] || LETTER_STATES.UNUSED;
  };

  // Render bàn phím
  const renderKeyboard = () => (
    <div className="wordle-keyboard">
      {VIETNAMESE_KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={`keyboard-row-${rowIndex}`} className="keyboard-row">
          {row.map(key => (
            <button
              key={`key-${key}`}
              className={`keyboard-key ${key === 'ENTER' || key === 'BACKSPACE' ? 'keyboard-key-wide' : ''} ${getKeyState(key)}`}
              onClick={() => {
                if (key === 'ENTER') handleSubmitGuess();
                else if (key === 'BACKSPACE') handleBackspace();
                else handleLetterInput(key);
              }}
              disabled={gameState.gameStatus !== GAME_STATUS.IN_PROGRESS}
            >
              {key === 'BACKSPACE' ? '⌫' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );

  // Render bảng chơi
  const renderBoard = () => (
    <div className={`wordle-board ${isAnimating ? 'shake' : ''}`}>
      {gameState.board.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="wordle-row">
          {row.slice(0, gameState.wordLength).map((letter, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className={`wordle-cell ${getCellState(rowIndex, colIndex)}`}
            >
              {letter}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  // Modal hướng dẫn
  const TutorialModal = () => (
    <div className={`modal-overlay ${showTutorial ? 'visible' : ''}`}>
      <div className="modal-content tutorial">
        <h2>Hướng dẫn chơi Wordle</h2>
        <p>Đoán từ 5 chữ cái trong 6 lần thử.</p>
        <div className="tutorial-steps">
          <div className="tutorial-step">
            <p>Sau mỗi lần đoán, màu sắc của ô sẽ thay đổi để cho biết gợi ý:</p>
            <div className="examples">
              <div className="example">
                <div className="wordle-cell correct">A</div>
                <p>Chữ cái đúng vị trí.</p>
              </div>
              <div className="example">
                <div className="wordle-cell present">B</div>
                <p>Chữ cái đúng nhưng sai vị trí.</p>
              </div>
              <div className="example">
                <div className="wordle-cell absent">C</div>
                <p>Chữ cái không có trong từ.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="tutorial-buttons">
          <Button
            variant="primary"
            onClick={() => setShowTutorial(false)}
          >
            Bắt đầu chơi
          </Button>
        </div>
      </div>
    </div>
  );

  // Modal kết quả
  const ResultModal = () => {
    // Chỉ hiển thị khi game thực sự kết thúc và đã được khởi tạo thành công
    if (!showResultModal || !gameState.isInitialized) return null;

    // Kiểm tra điều kiện hiển thị kết quả
    if (gameState.gameStatus !== GAME_STATUS.WON && gameState.gameStatus !== GAME_STATUS.LOST) {
      console.warn('Kết quả hiển thị khi game chưa kết thúc!');
      return null;
    }

    const isWon = gameState.gameStatus === GAME_STATUS.WON;

    return (
      <div className="modal-overlay visible">
        <div className="modal-content result">
          <h2>{isWon ? '🎉 Chúc mừng!' : '😞 Rất tiếc!'}</h2>

          <div className="result-details">
            {isWon
              ? <p>Bạn đã đoán đúng từ <strong>{gameState.targetWord}</strong> trong {gameState.currentRow} lượt!</p>
              : <p>Bạn không thể đoán được từ <strong>{gameState.targetWord}</strong>.</p>
            }
            <p>Thời gian chơi: {gameTime}</p>
          </div>

          {wordMeaning && (
            <div className="word-meaning">
              <h4>Ý nghĩa:</h4>
              <p>{wordMeaning.definition || wordMeaning.meaning || 'Không có định nghĩa'}</p>
              {wordMeaning.example && (
                <div className="example">
                  <h4>Ví dụ:</h4>
                  <p>{wordMeaning.example}</p>
                </div>
              )}
            </div>
          )}

          <div className="result-actions">
            <Button onClick={resetGame} variant="primary">Chơi lại</Button>
            <Button onClick={() => setShowResults(!showResults)} variant="secondary">
              {showResults ? 'Ẩn chi tiết' : 'Xem chi tiết'}
            </Button>
          </div>

          {showResults && (
            <div className="result-board">
              {gameState.cellStates.slice(0, gameState.currentRow).map((row, rowIndex) => (
                <div key={`result-row-${rowIndex}`} className="result-row">
                  {row.slice(0, gameState.wordLength).map((state, colIndex) => (
                    <div
                      key={`result-cell-${rowIndex}-${colIndex}`}
                      className={`result-cell ${state}`}
                    >
                      {gameState.board[rowIndex][colIndex]}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render giao diện chính
  return (
    <div className="wordle-container">
      {/* Loading screen */}
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải từ mới...</p>
        </div>
      ) : isError ? (
        // Màn hình lỗi
        <div className="error-container">
          <p className="error-message">{errorMessage}</p>
          <Button onClick={resetGame}>Thử lại</Button>
        </div>
      ) : (
        // Màn hình game
        <>
          <h1 className="game-title">Wordle Tiếng Việt</h1>

          {/* Hiển thị thông báo */}
          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Bảng chơi */}
          {renderBoard()}

          {/* Bàn phím ảo */}
          {renderKeyboard()}

          {/* Nút gợi ý */}
          <div className="hint-container">
            <Button
              onClick={handleHint}
              disabled={gameState.hintCount >= 3 || gameState.gameStatus !== GAME_STATUS.IN_PROGRESS}
            >
              Gợi ý ({3 - gameState.hintCount})
            </Button>
          </div>

          {/* Modal hướng dẫn */}
          {showTutorial && <TutorialModal />}

          {/* Modal kết quả */}
          {showResultModal && <ResultModal />}
        </>
      )}
    </div>
  );
};

export default WordleScreen;