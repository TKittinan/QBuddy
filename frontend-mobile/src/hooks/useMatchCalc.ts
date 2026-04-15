import { useCallback } from 'react';

export const useMatchCalc = () => {
  // ฟังก์ชันคำนวณระยะทางระหว่าง 2 พิกัด (กิโลเมตร) ด้วย Haversine Formula
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  }, []);

  // ฟังก์ชันคำนวณอัตราความเข้ากันได้ (Match Rate) และประเมินว่าควรให้ AI แนะนำหรือไม่
  const checkIsAiRecommended = useCallback((successRate: number, sharedInterests: number) => {
    // โลจิกจำลอง: ถ้า successRate เกิน 85% และมีความสนใจตรงกัน จะให้คะแนนเกิน 85%
    let matchScore = 50 + (sharedInterests * 10);
    if (successRate >= 85) {
      matchScore += 25;
    }
    
    // จำกัดคะแนนไม่ให้เกิน 99%
    const finalScore = Math.min(99, matchScore);
    
    return {
      matchRate: finalScore,
      isRecommended: finalScore >= 85 && successRate >= 85
    };
  }, []);

  return { calculateDistance, checkIsAiRecommended };
};