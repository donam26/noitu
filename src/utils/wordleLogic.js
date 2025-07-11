// import { normalize, analyzeSyllableStructure } from '../data/wordleData';
import { words } from '../data/filteredWordsData';

// Hàm normalize để chuyển từ có dấu thành không dấu
export const normalize = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\s+/g, "")
    .toUpperCase();
};

// Hàm phân tích cấu trúc âm tiết
export const analyzeSyllableStructure = (originalWord) => {
  const syllables = originalWord.trim().split(/\s+/);
  if (syllables.length === 2) {
    const firstLen = syllables[0].length;
    const secondLen = syllables[1].length;
    return `Từ gồm 2 âm tiết: ${firstLen} chữ + ${secondLen} chữ`;
  } else if (syllables.length === 1) {
    return `Từ gồm 1 âm tiết: ${syllables[0].length} chữ`;
  }
  return `Từ gồm ${syllables.length} âm tiết`;
};

// Keyboard layout tiếng Việt
export const VIETNAMESE_KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["BACKSPACE", "Z", "X", "C", "V", "B", "N", "M", "ENTER"],
];

// Các trạng thái của chữ cái
export const LETTER_STATES = {
  CORRECT: "correct",     // 🟩 Đúng vị trí
  PRESENT: "present",     // 🟨 Có trong từ nhưng sai vị trí  
  ABSENT: "absent",       // ⬜ Không có trong từ
  EMPTY: "empty"          // Chưa nhập
};

// Game status
export const GAME_STATUS = {
  PLAYING: "playing",
  WON: "won", 
  LOST: "lost"
};

// Danh sách từ hai âm tiết phổ biến để đảm bảo luôn có từ để chơi
const DEFAULT_WORDS = [
  "học sinh",
  "bàn ghế",
  "máy tính",
  "sách vở",
  "bút chì",
  "bạn bè",
  "gia đình",
  "công việc",
  "nhà cửa",
  "công ty",
  "trường học",
  "con người",
  "hoa quả",
  "cây cối",
  "quê hương",
  "lớp học",
  "bánh mì",
  "cơm gạo",
  "cửa sổ",
  "nhà hàng",
  "bóng đá",
  "thể thao",
  "ca sĩ",
  "võ sĩ",
  "bác sĩ",
  "kinh tế",
  "giáo viên",
  "học viên",
  "nhà vệ sinh"
];

// Lấy ngẫu nhiên từ có đúng 7 ký tự khi bỏ dấu
const getFilteredWords = () => {
  // Tìm từ hai âm tiết tách rời phù hợp từ wordsData
  const filteredTwoSyllables = words.filter(word => {
    try {
      // Kiểm tra xem từ có phải hai âm tiết tách rời không
      const syllables = word.trim().split(/\s+/);
      if (syllables.length !== 2) return false;
      
      // Kiểm tra độ dài khi bỏ dấu
      const normalized = normalize(word);
      return normalized && normalized.length === 7;
    } catch (e) {
      console.error("Lỗi khi xử lý từ:", word, e);
      return false;
    }
  });
  
  // Nếu tìm được từ hai âm tiết thích hợp, ưu tiên sử dụng chúng
  if (filteredTwoSyllables && filteredTwoSyllables.length > 0) {
    return filteredTwoSyllables;
  }
  
  // Nếu vẫn không tìm thấy từ, sử dụng danh sách mặc định
  console.warn("Không tìm thấy từ phù hợp trong filteredWordsData, sử dụng từ mặc định");
  return DEFAULT_WORDS.filter(word => normalize(word).length === 7);
};

// Tạo game state ban đầu
export const createInitialGameState = () => {
  const wordData = getNewWordData();
  return {
    board: Array.from({ length: 6 }, () => Array(7).fill("")),
    currentRow: 0,
    currentCol: 0,
    gameStatus: GAME_STATUS.PLAYING,
    targetWord: wordData.normalized,
    originalWord: wordData.original,
    letterStates: {},
    hintCount: 0,
    hintedLetters: new Set(),
    syllableHint: analyzeSyllableStructure(wordData.original),
    startTime: Date.now(),
    finishTime: null
  };
};

// Lấy từ mới để đoán
export const getNewWordData = () => {
  try {
    const filteredWords = getFilteredWords();
    if (!filteredWords || filteredWords.length === 0) {
      // Fallback nếu vẫn không có từ nào
      const original = "học sinh";
      const normalized = "HOCSINH";
      console.warn("Sử dụng từ fallback:", original);
      return { original, normalized };
    }
    
    const index = Math.floor(Math.random() * filteredWords.length);
    const original = filteredWords[index];
    const normalized = normalize(original);
    
    console.log("Đã chọn từ:", original, "->", normalized);
    return { original, normalized };
  } catch (e) {
    console.error("Lỗi khi lấy từ mới:", e);
    // Fallback an toàn
    return { 
      original: "học sinh", 
      normalized: "HOCSINH" 
    };
  }
};

// Kiểm tra từ có hợp lệ không
export const isValidWord = (word) => {
  try {
    const normalizedInput = normalize(word);
    if (!normalizedInput || normalizedInput.length !== 7) {
      return false;
    }
    
    // Lấy danh sách từ đã được lọc
    const filteredWords = getFilteredWords();
    
    // Kiểm tra từ có trong danh sách không
    return filteredWords.some(validWord => {
      const normalizedValid = normalize(validWord);
      return normalizedValid === normalizedInput;
    });
  } catch (e) {
    console.error("Lỗi khi kiểm tra từ:", word, e);
    return false;
  }
};

// Kiểm tra guess và trả về trạng thái của từng chữ cái
export const checkGuess = (guess, targetWord) => {
  const result = Array(7).fill(LETTER_STATES.ABSENT);
  const targetLetters = targetWord.split("");
  const guessLetters = guess.split("");

  // Đếm số lần xuất hiện của mỗi chữ cái trong target word
  const targetLetterCount = {};
  for (const letter of targetLetters) {
    targetLetterCount[letter] = (targetLetterCount[letter] || 0) + 1;
  }

  // Đầu tiên, đánh dấu các chữ cái đúng vị trí (correct)
  for (let i = 0; i < 7; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = LETTER_STATES.CORRECT;
      targetLetterCount[guessLetters[i]]--;
    }
  }

  // Sau đó, đánh dấu các chữ cái có trong từ nhưng sai vị trí (present)
  for (let i = 0; i < 7; i++) {
    if (result[i] !== LETTER_STATES.CORRECT && targetLetterCount[guessLetters[i]] > 0) {
      result[i] = LETTER_STATES.PRESENT;
      targetLetterCount[guessLetters[i]]--;
    }
  }

  return result;
};

// Cập nhật trạng thái của các chữ cái trên bàn phím
export const updateLetterStates = (currentStates, guess, guessResult) => {
  const newStates = { ...currentStates };
  
  guess.split("").forEach((letter, index) => {
    const state = guessResult[index];
    const currentState = newStates[letter];
    
    // Ưu tiên: correct > present > absent
    if (!currentState) {
      newStates[letter] = state;
    } else if (currentState === LETTER_STATES.ABSENT && state !== LETTER_STATES.ABSENT) {
      newStates[letter] = state;
    } else if (currentState === LETTER_STATES.PRESENT && state === LETTER_STATES.CORRECT) {
      newStates[letter] = LETTER_STATES.CORRECT;
    }
  });
  
  return newStates;
};

// Xử lý nhập chữ cái
export const handleLetterInput = (gameState, letter) => {
  if (gameState.gameStatus !== GAME_STATUS.PLAYING) return gameState;
  if (gameState.currentCol >= 7) return gameState;

  const newBoard = gameState.board.map(row => [...row]);
  newBoard[gameState.currentRow][gameState.currentCol] = letter;

  return {
    ...gameState,
    board: newBoard,
    currentCol: gameState.currentCol + 1
  };
};

// Xử lý xóa chữ cái
export const handleBackspace = (gameState) => {
  if (gameState.gameStatus !== GAME_STATUS.PLAYING) return gameState;
  if (gameState.currentCol <= 0) return gameState;

  const newBoard = gameState.board.map(row => [...row]);
  newBoard[gameState.currentRow][gameState.currentCol - 1] = "";

  return {
    ...gameState,
    board: newBoard,
    currentCol: gameState.currentCol - 1
  };
};

// Xử lý submit guess
export const handleSubmitGuess = (gameState) => {
  if (gameState.gameStatus !== GAME_STATUS.PLAYING) return { gameState, error: null };
  
  const guess = gameState.board[gameState.currentRow].join("");
  
  // Kiểm tra độ dài
  if (guess.length !== 7) {
    return { 
      gameState, 
      error: "Từ phải có đủ 7 chữ cái!" 
    };
  }

  // Kiểm tra từ có hợp lệ không
  if (!isValidWord(guess)) {
    // Xóa hàng hiện tại và reset cột
    const newBoard = gameState.board.map((row, index) => 
      index === gameState.currentRow ? Array(7).fill("") : [...row]
    );
    
    return {
      gameState: {
        ...gameState,
        board: newBoard,
        currentCol: 0
      },
      error: "Từ không tồn tại trong từ điển!"
    };
  }

  // Kiểm tra kết quả
  const guessResult = checkGuess(guess, gameState.targetWord);
  const newLetterStates = updateLetterStates(gameState.letterStates, guess, guessResult);
  
  // Kiểm tra thắng
  const isWin = guess === gameState.targetWord;
  const isLastRow = gameState.currentRow === 5;
  const newGameStatus = isWin ? GAME_STATUS.WON : (isLastRow ? GAME_STATUS.LOST : GAME_STATUS.PLAYING);

  return {
    gameState: {
      ...gameState,
      letterStates: newLetterStates,
      currentRow: gameState.currentRow + 1,
      currentCol: 0,
      gameStatus: newGameStatus,
      finishTime: (isWin || isLastRow) ? Date.now() : null
    },
    error: null,
    isWin,
    guessResult
  };
};

// Xử lý gợi ý
export const handleHint = (gameState) => {
  if (gameState.hintCount >= 3) {
    return { 
      gameState, 
      hintMessage: "Bạn đã hết lượt gợi ý!" 
    };
  }

  // Tạo danh sách các loại gợi ý có thể có
  const hintTypes = [
    // Gợi ý 1: Âm tiết đầu/cuối
    () => {
      // Tách từ gốc thành các âm tiết
      const syllables = gameState.originalWord.trim().split(/\s+/);
      if (syllables.length === 2) {
        // Nếu là từ hai âm tiết
        if (gameState.hintCount === 0) {
          // Gợi ý về âm tiết đầu tiên
          const firstSyllable = syllables[0];
          return `Gợi ý: Âm tiết đầu tiên là một từ chỉ "${getWordCategoryHint(firstSyllable)}"`;
        } else if (gameState.hintCount === 1) {
          // Gợi ý về âm tiết thứ hai
          const secondSyllable = syllables[1];
          return `Gợi ý: Âm tiết thứ hai là một từ chỉ "${getWordCategoryHint(secondSyllable)}"`;
        }
      }
      return null;
    },
    
    // Gợi ý 2: Vị trí chữ cái đầu tiên của từng âm tiết
    () => {
      const syllables = gameState.originalWord.trim().split(/\s+/);
      if (syllables.length === 2) {
        const firstLetter = syllables[0][0].toUpperCase();
        const secondLetter = syllables[1][0].toUpperCase();
        
        if (gameState.hintCount === 0) {
          return `Gợi ý: Từ bắt đầu bằng chữ "${firstLetter}"`;
        } else if (gameState.hintCount === 1) {
          return `Gợi ý: Âm tiết thứ hai bắt đầu bằng chữ "${secondLetter}"`;
        }
      }
      return null;
    },
    
    // Gợi ý 3: Nhóm chủ đề
    () => {
      const category = getWordCategory(gameState.originalWord.toLowerCase());
      return `Gợi ý: Từ này thuộc nhóm "${category}"`;
    }
  ];
  
  // Thử các loại gợi ý theo thứ tự
  let hintMessage = null;
  for (const hintFunc of hintTypes) {
    hintMessage = hintFunc();
    if (hintMessage) break;
  }
  
  // Nếu không có gợi ý khác, quay lại gợi ý chữ cái
  if (!hintMessage) {
    // Tìm chữ cái chưa đoán trong target word
    const guessedLetters = new Set(
      gameState.board
        .slice(0, gameState.currentRow)
        .flat()
        .filter(letter => letter !== "")
    );

    const usedLetters = new Set([
      ...guessedLetters,
      ...Object.keys(gameState.letterStates),
      ...gameState.hintedLetters
    ]);

    const targetLetters = Array.from(new Set(gameState.targetWord.split("")));
    const availableLetters = targetLetters.filter(letter => !usedLetters.has(letter));

    if (availableLetters.length > 0) {
      const randomLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
      const newHintedLetters = new Set(gameState.hintedLetters);
      newHintedLetters.add(randomLetter);

      return {
        gameState: {
          ...gameState,
          hintCount: gameState.hintCount + 1,
          hintedLetters: newHintedLetters
        },
        hintMessage: `Gợi ý: Chữ "${randomLetter}" có trong từ!`
      };
    } else {
      hintMessage = "Không còn chữ nào để gợi ý!";
    }
  }

  return {
    gameState: {
      ...gameState,
      hintCount: gameState.hintCount + 1
    },
    hintMessage
  };
};

// Hàm phụ trợ để xác định nhóm chủ đề của từ
const getWordCategory = (word) => {
  const categories = {
    // Con người và gia đình
    'gia đình': 'người thân',
    'học sinh': 'giáo dục',
    'con người': 'con người',
    'bạn bè': 'mối quan hệ',
    
    // Thiên nhiên và môi trường
    'mặt trời': 'thiên nhiên',
    'mặt trăng': 'thiên nhiên',
    'bầu trời': 'thiên nhiên',
    'cây cối': 'thực vật',
    'hoa quả': 'thực phẩm',
    
    // Đồ vật, vật dụng
    'bàn ghế': 'đồ nội thất',
    'máy tính': 'công nghệ',
    'sách vở': 'học tập',
    'bút chì': 'văn phòng phẩm',
    'bánh mì': 'thực phẩm',
    'cơm gạo': 'thực phẩm',
    'nước lọc': 'đồ uống',
    
    // Địa điểm
    'nhà cửa': 'nơi ở',
    'công ty': 'nơi làm việc',
    'trường học': 'giáo dục',
    'thư viện': 'giáo dục',
    'công viên': 'giải trí',
    'quê hương': 'địa lý',
    'đất nước': 'địa lý',
    'lớp học': 'giáo dục',
    
    // Phương tiện
    'xe buýt': 'phương tiện giao thông',
    'tàu điện': 'phương tiện giao thông',
    
    // Khác
    'cửa sổ': 'kiến trúc',
    'cánh cửa': 'kiến trúc',
    'công việc': 'nghề nghiệp',
    'hạnh phúc': 'tình cảm'
  };
  
  return categories[word] || 'chưa phân loại';
};

// Hàm phụ trợ để lấy gợi ý cho từng âm tiết
const getWordCategoryHint = (syllable) => {
  const syllableHints = {
    // Âm tiết đầu
    'học': 'hoạt động', 
    'bàn': 'đồ vật',
    'máy': 'đồ điện tử',
    'sách': 'giáo dục',
    'bút': 'văn phòng phẩm',
    'bạn': 'con người',
    'gia': 'mối quan hệ',
    'công': 'công việc',
    'nhà': 'nơi ở',
    'mặt': 'bộ phận',
    'bầu': 'hình dạng',
    'con': 'sinh vật',
    'hoa': 'thực vật',
    'cây': 'thực vật',
    'quê': 'địa điểm',
    'đất': 'địa lý',
    'lớp': 'giáo dục',
    'bánh': 'thực phẩm',
    'cơm': 'thức ăn',
    'nước': 'chất lỏng',
    'cửa': 'kiến trúc',
    'cánh': 'bộ phận',
    'thư': 'tri thức',
    'xe': 'phương tiện',
    'tàu': 'phương tiện',
    'hạnh': 'tình cảm',
    
    // Âm tiết sau
    'sinh': 'sự sống',
    'ghế': 'đồ nội thất',
    'tính': 'máy móc',
    'vở': 'học tập',
    'chì': 'vật liệu',
    'bè': 'mối quan hệ',
    'đình': 'gia đình',
    'việc': 'hoạt động',
    'cửa': 'kiến trúc',
    'trời': 'thiên nhiên',
    'trăng': 'thiên nhiên',
    'trời': 'thiên nhiên',
    'người': 'con người',
    'quả': 'thực vật',
    'cối': 'thực vật',
    'hương': 'cảm giác',
    'nước': 'quốc gia',
    'học': 'học tập',
    'mì': 'thực phẩm',
    'gạo': 'thực phẩm',
    'lọc': 'làm sạch',
    'sổ': 'kiến trúc',
    'cửa': 'kiến trúc',
    'viện': 'tổ chức',
    'viên': 'khu vực',
    'buýt': 'giao thông',
    'điện': 'năng lượng',
    'phúc': 'may mắn'
  };
  
  return syllableHints[syllable.toLowerCase()] || 'không xác định';
};

// Tính thời gian đã chơi
export const getElapsedTime = (startTime, finishTime) => {
  if (startTime && finishTime) {
    const timeInSeconds = Math.floor((finishTime - startTime) / 1000);
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  return null;
}; 