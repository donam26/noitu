import { useState, useCallback } from 'react';
import { gameDataAPI } from '../services/api';

/**
 * Hook sử dụng API để lấy và quản lý dữ liệu cho các game
 * @returns {Object} - Dữ liệu và hàm quản lý
 */
const useGameData = () => {
  const [guessWhoData, setGuessWhoData] = useState(null);
  const [universeAnswerData, setUniverseAnswerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usedGuessWhoIds, setUsedGuessWhoIds] = useState([]);

  /**
   * Lấy dữ liệu cho game Guess Who
   */
  const fetchGuessWhoData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await gameDataAPI.getGuessWhoData();
      console.log('fetchGuessWhoData response:', response);
      
      if (response.success && response.characters) {
        setGuessWhoData(response);
      } else {
        setError(response.message || 'Có lỗi khi lấy dữ liệu Guess Who');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
      console.error('Lỗi khi lấy dữ liệu Guess Who:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lấy câu đố ngẫu nhiên cho GuessWho
   * @returns {Object|null} - Câu đố ngẫu nhiên
   */
  const getRandomGuessWhoQuestion = useCallback(() => {
    if (!guessWhoData || !guessWhoData.characters || guessWhoData.characters.length === 0) {
      console.error('Không có dữ liệu nhân vật cho GuessWho');
      return null;
    }
    
    // Lọc các câu hỏi chưa sử dụng
    const availableCharacters = guessWhoData.characters.filter(
      character => !usedGuessWhoIds.includes(character.id)
    );
    
    if (availableCharacters.length === 0) {
      console.warn('Đã sử dụng hết tất cả nhân vật');
      return null;
    }
    
    // Chọn ngẫu nhiên một nhân vật
    const randomIndex = Math.floor(Math.random() * availableCharacters.length);
    const selectedCharacter = availableCharacters[randomIndex];
    
    console.log('Đã chọn nhân vật:', selectedCharacter.name);
    
    // Lấy các gợi ý từ dữ liệu có sẵn nếu có
    // Nếu không có gợi ý sẵn, tạo gợi ý mới
    const hints = selectedCharacter.hints || [
      `Đây là một nhân vật ${selectedCharacter.traits.gender === 'male' ? 'nam' : 'nữ'}.`,
      `Nhân vật này có tóc màu ${selectedCharacter.traits.hairColor}.`,
      `${selectedCharacter.traits.glasses ? 'Nhân vật này đeo kính.' : 'Nhân vật này không đeo kính.'}`,
      `Gợi ý cuối cùng: Tên nhân vật bắt đầu bằng chữ cái "${selectedCharacter.name.charAt(0)}".`
    ];
    
    // Cập nhật danh sách đã sử dụng
    setUsedGuessWhoIds(prev => [...prev, selectedCharacter.id]);
    
    return {
      id: selectedCharacter.id,
      answer: selectedCharacter.name,
      category: selectedCharacter.category || 'Nhân vật',
      hints: hints,
      image: selectedCharacter.image
    };
  }, [guessWhoData, usedGuessWhoIds]);

  /**
   * Reset danh sách câu đố đã sử dụng
   */
  const resetGuessWhoIds = useCallback(() => {
    setUsedGuessWhoIds([]);
  }, []);

  /**
   * Lấy dữ liệu cho game Universe Answer
   */
  const fetchUniverseAnswerData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await gameDataAPI.getUniverseAnswerData();
      
      if (response.success) {
        setUniverseAnswerData(response.data);
      } else {
        setError(response.message || 'Có lỗi khi lấy dữ liệu Universe Answer');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
      console.error('Lỗi khi lấy dữ liệu Universe Answer:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Trả về các data và function
  return {
    guessWhoData,
    universeAnswerData,
    loading,
    error,
    usedGuessWhoIds,
    fetchGuessWhoData,
    fetchUniverseAnswerData,
    getRandomGuessWhoQuestion,
    resetGuessWhoIds
  };
};

export default useGameData; 