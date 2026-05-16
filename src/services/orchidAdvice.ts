import { DayWeather } from './weatherService';

export type Severity = 'good' | 'warning' | 'danger';

export interface Advice {
  category: string;
  icon: string;
  title: string;
  detail: string;
  severity: Severity;
}

export interface DayAdvice {
  date: string;
  overall: Severity;
  advices: Advice[];
  fertilizer: FertilizerPlan | null;
}

export interface FertilizerPlan {
  shouldFertilize: boolean;
  type: string;
  ratio: string;
  dose: string;
  timing: string;
  reason: string;
}

// ─── Kiến thức chuyên gia Dendrobium ────────────────────────────────────────
// Nguồn: kinh nghiệm trồng Dendrobium (Hoàng Thảo) tại Việt Nam
// Dendrobium thích: nhiệt 18–30°C ban ngày, 15–25°C ban đêm
// Độ ẩm: 60–80%, thoáng gió tốt
// Ánh sáng: 50–70% cường độ, tránh nắng trực tiếp giữa trưa
// Tưới: sáng sớm, để khô trước tối
// Bón phân: 10–14 ngày/lần, theo giai đoạn sinh trưởng

function watringAdvice(day: DayWeather): Advice {
  if (day.rain >= 10) return {
    category: 'Tưới nước', icon: '💧', severity: 'good',
    title: 'Không cần tưới',
    detail: `Mưa ${day.rain}mm đủ cấp ẩm. Kiểm tra thoát nước chậu, tránh ngập úng rễ.`,
  };
  if (day.rain >= 3) return {
    category: 'Tưới nước', icon: '💧', severity: 'good',
    title: 'Tưới ít hoặc bỏ qua',
    detail: `Có mưa nhẹ ${day.rain}mm. Chỉ tưới nếu giá thể đã khô hẳn, tưới vào 6–8h sáng.`,
  };
  if (day.tempMax >= 35 && day.humidity < 55) return {
    category: 'Tưới nước', icon: '💧', severity: 'warning',
    title: 'Tưới 2 lần/ngày',
    detail: `Nắng nóng ${day.tempMax}°C, độ ẩm thấp ${day.humidity}%. Tưới 6h sáng + 4–5h chiều. Phun sương quanh vườn để hạ nhiệt.`,
  };
  if (day.tempMax >= 32) return {
    category: 'Tưới nước', icon: '💧', severity: 'good',
    title: 'Tưới sáng sớm',
    detail: `Tưới 1 lần lúc 6–8h sáng, đủ ướt đẫm giá thể. Để cây khô trước khi tối để tránh thối cổ rễ.`,
  };
  return {
    category: 'Tưới nước', icon: '💧', severity: 'good',
    title: 'Tưới bình thường',
    detail: 'Tưới 6–8h sáng, kiểm tra giá thể. Dendrobium ưa khô giữa 2 lần tưới, không tưới khi còn ẩm.',
  };
}

function lightAdvice(day: DayWeather): Advice {
  if (day.uvIndex >= 9) return {
    category: 'Ánh sáng', icon: '☀️', severity: 'danger',
    title: 'UV rất cao — che bóng gấp',
    detail: `UV index ${day.uvIndex}. Che lưới 50–60% từ 9h–15h. Dendrobium dễ cháy lá khi UV > 8. Kiểm tra mặt lá có vết vàng không.`,
  };
  if (day.uvIndex >= 6) return {
    category: 'Ánh sáng', icon: '☀️', severity: 'warning',
    title: 'Che bóng buổi trưa',
    detail: `UV index ${day.uvIndex}. Che lưới 40–50% từ 10h–14h. Sáng sớm và chiều muộn có thể để lộ sáng trực tiếp.`,
  };
  if (day.weatherCode >= 3) return {
    category: 'Ánh sáng', icon: '⛅', severity: 'good',
    title: 'Ánh sáng vừa đủ',
    detail: 'Trời nhiều mây, ánh sáng khuếch tán lý tưởng cho Dendrobium. Không cần che bóng hôm nay.',
  };
  return {
    category: 'Ánh sáng', icon: '🌤️', severity: 'good',
    title: 'Ánh sáng tốt',
    detail: 'Điều kiện ánh sáng lý tưởng. Dendrobium nhận đủ năng lượng để quang hợp và phát triển chồi mới.',
  };
}

function temperatureAdvice(day: DayWeather): Advice | null {
  if (day.tempMax >= 38) return {
    category: 'Nhiệt độ', icon: '🌡️', severity: 'danger',
    title: `Nắng cực nóng ${day.tempMax}°C`,
    detail: 'Nhiệt độ vượt ngưỡng an toàn! Di chuyển chậu vào bóng mát, phun sương mái vườn, tăng thông gió. Dendrobium chịu nhiệt kém hơn Phalaenopsis.',
  };
  if (day.tempMax >= 34) return {
    category: 'Nhiệt độ', icon: '🌡️', severity: 'warning',
    title: `Nóng ${day.tempMax}°C — tăng thông gió`,
    detail: `Nhiệt độ cao, thoáng gió kém sẽ gây thối nhũn. Mở lưới hai đầu vườn, dùng quạt nếu trong nhà kính. Tưới thêm buổi chiều.`,
  };
  if (day.tempMin <= 15) return {
    category: 'Nhiệt độ', icon: '❄️', severity: 'warning',
    title: `Lạnh về đêm ${day.tempMin}°C`,
    detail: 'Đêm lạnh kích thích Dendrobium ra hoa (tốt!). Giảm tưới nước, ngừng bón phân đạm. Che chắn gió lùa trực tiếp vào rễ.',
  };
  return null;
}

function humidityAdvice(day: DayWeather): Advice | null {
  if (day.humidity > 90 && day.rain > 5) return {
    category: 'Độ ẩm', icon: '💦', severity: 'warning',
    title: 'Độ ẩm quá cao',
    detail: `Độ ẩm ${day.humidity}% — nguy cơ nấm bệnh cao. Tăng thông gió, không tưới thêm, kiểm tra lá có đốm nâu hoặc thối đen không. Phun Mancozeb phòng bệnh nếu cần.`,
  };
  if (day.humidity < 50) return {
    category: 'Độ ẩm', icon: '🏜️', severity: 'warning',
    title: `Độ ẩm thấp ${day.humidity}%`,
    detail: 'Quá khô, rễ khí sinh dễ teo. Phun sương nhẹ quanh vườn (không phun lên lá), kiểm tra giá thể thường xuyên hơn.',
  };
  return null;
}

function windAdvice(day: DayWeather): Advice | null {
  if (day.windSpeed >= 40) return {
    category: 'Gió', icon: '💨', severity: 'danger',
    title: `Gió mạnh ${day.windSpeed} km/h`,
    detail: 'Gió mạnh có thể gãy cành hoa, đổ chậu. Buộc cọc chắc chắn, di chuyển chậu nhỏ vào chỗ kín. Kiểm tra sau khi gió tan.',
  };
  if (day.windSpeed >= 25) return {
    category: 'Gió', icon: '💨', severity: 'warning',
    title: `Gió khá mạnh ${day.windSpeed} km/h`,
    detail: 'Kiểm tra cọc buộc cành hoa. Gió tốt cho thông thoáng nhưng làm khô giá thể nhanh hơn bình thường.',
  };
  return null;
}

// ─── Logic phân bón Dendrobium theo thời tiết ────────────────────────────────
// Giai đoạn sinh trưởng: bón NPK 30-10-10 hoặc 20-20-20
// Giai đoạn chuẩn bị ra hoa: NPK 10-30-20 + giảm đạm
// Không bón khi: mưa to, nhiệt độ > 36°C, cây đang bệnh, sau 15h

function getFertilizerPlan(day: DayWeather, dayIndex: number): FertilizerPlan {
  // Không bón phân khi thời tiết xấu
  if (day.rain >= 10) return {
    shouldFertilize: false,
    type: '', ratio: '', dose: '', timing: '',
    reason: `Mưa to ${day.rain}mm — phân bị rửa trôi, lãng phí và gây hại rễ. Bỏ qua hôm nay.`,
  };

  if (day.tempMax >= 36) return {
    shouldFertilize: false,
    type: '', ratio: '', dose: '', timing: '',
    reason: `Nhiệt độ ${day.tempMax}°C quá cao — rễ bị stress, không hấp thu được phân. Chờ ngày mát hơn.`,
  };

  // Bón phân theo chu kỳ (mỗi 10–12 ngày, tức index 0 và 10–12)
  const shouldFertilize = dayIndex === 0 || dayIndex === 5;

  if (!shouldFertilize) return {
    shouldFertilize: false,
    type: '', ratio: '', dose: '', timing: '',
    reason: 'Chưa đến chu kỳ bón. Dendrobium bón mỗi 10–14 ngày/lần.',
  };

  // Chọn loại phân theo nhiệt độ & mùa
  if (day.tempMin <= 18) {
    // Đêm lạnh → chuẩn bị ra hoa
    return {
      shouldFertilize: true,
      type: 'Phân kali + lân cao (kích hoa)',
      ratio: 'NPK 6-30-30',
      dose: '1g/lít nước, tưới đẫm gốc',
      timing: '6h–8h sáng, sau khi tưới nước 30 phút',
      reason: `Đêm lạnh ${day.tempMin}°C kích thích mầm hoa. Tăng kali-lân để hoa to, màu đẹp. Giảm đạm tránh lá non làm trễ hoa.`,
    };
  }

  if (day.tempMax <= 30 && day.humidity >= 60 && day.humidity <= 80) {
    // Điều kiện lý tưởng → bón cân bằng
    return {
      shouldFertilize: true,
      type: 'Phân cân bằng (tăng trưởng)',
      ratio: 'NPK 20-20-20',
      dose: '1–1.5g/lít nước, tưới đẫm',
      timing: '6h–8h sáng, ngày không mưa',
      reason: 'Thời tiết lý tưởng, cây hấp thu tốt. Bón cân bằng giúp giả hành mập, rễ khỏe, lá xanh đậm.',
    };
  }

  // Mùa nóng → bón đạm thúc tăng trưởng
  return {
    shouldFertilize: true,
    type: 'Phân đạm cao (thúc lá)',
    ratio: 'NPK 30-10-10',
    dose: '0.5–1g/lít nước (loãng hơn bình thường)',
    timing: '6h–7h sáng sớm (trước khi nóng)',
    reason: `Mùa nóng cây tăng trưởng mạnh. Đạm cao giúp đẩy chồi mới. Pha loãng vì nhiệt độ cao dễ cháy rễ.`,
  };
}

// ─── Tổng hợp khuyến cáo cho từng ngày ─────────────────────────────────────
export function generateAdvice(days: DayWeather[]): DayAdvice[] {
  return days.map((day, i) => {
    const advices: Advice[] = [];

    advices.push(watringAdvice(day));
    advices.push(lightAdvice(day));

    const temp = temperatureAdvice(day);
    if (temp) advices.push(temp);

    const hum = humidityAdvice(day);
    if (hum) advices.push(hum);

    const wind = windAdvice(day);
    if (wind) advices.push(wind);

    const fertilizer = getFertilizerPlan(day, i);

    const hasDanger = advices.some(a => a.severity === 'danger');
    const hasWarning = advices.some(a => a.severity === 'warning');
    const overall: Severity = hasDanger ? 'danger' : hasWarning ? 'warning' : 'good';

    return { date: day.date, overall, advices, fertilizer };
  });
}
