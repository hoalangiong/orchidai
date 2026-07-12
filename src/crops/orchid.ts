import type { CropConfig } from './types';

// Cây lan — cấu hình gốc, trích từ hardcode cũ trong SensorPage/DiagnoseModal.
export const orchidCrop: CropConfig = {
  id: 'orchid',
  name: 'Lan',
  emoji: '🌺',

  thresholds: {
    temp:     [18, 30, 15, 35],
    humidity: [50, 80, 40, 90],
    moisture: [40, 70, 30, 85],
    ph:       [5.5, 6.5, 5.0, 7.0],
    ec:       [0.8, 2.0, 0.5, 2.5],
    n:        [20, 60, 10, 80],
    p:        [15, 50, 10, 70],
    k:        [20, 50, 10, 70],
  },

  buildAdvisorPrompt: (ctx) =>
    `Bạn là chuyên gia trồng lan lâu năm tại Việt Nam, chuyên sâu về Dendrobium (Hoàng Thảo), Phalaenopsis (Hồ Điệp), Mokara và các giống lan phổ biến. Kinh nghiệm thực tiễn trên 20 năm.

Dữ liệu cảm biến vườn lan hiện tại (đo lúc ${ctx.measuredAt}):
${ctx.sensorSummary}

Thông tin vườn:
- Tổng số cây: ${ctx.plantCount} chậu
- Tình trạng: ${ctx.healthBreakdown.good} cây khỏe, ${ctx.healthBreakdown.warning} cần chú ý, ${ctx.healthBreakdown.danger} cảnh báo

Hãy phân tích toàn diện và đưa ra lời khuyên chăm sóc cụ thể, thực tế cho vườn lan này. Tập trung vào:
1. Đánh giá tổng thể môi trường vườn (nhiệt độ, độ ẩm, ánh sáng)
2. Tình trạng dinh dưỡng trong giá thể (NPK, pH, EC) — cần bổ sung gì không
3. Kế hoạch tưới nước và bón phân cụ thể cho giai đoạn này
4. Cảnh báo nguy cơ bệnh dịch dựa trên điều kiện hiện tại
5. Hành động ưu tiên cần làm ngay hôm nay

Trả lời bằng tiếng Việt, ngắn gọn súc tích, dùng emoji để dễ đọc. Xưng là "tôi" và nói chuyện thân thiện như đang tư vấn trực tiếp.`,

  diagnosePrompt:
    'Bạn là chuyên gia hoa lan Dendrobium (Hoàng Thảo) với 20 năm kinh nghiệm tại Việt Nam.',

  // Danh sách bệnh/sâu của lan hiện đang render trong DiseasesPage (SVG + i18n).
  // Giữ rỗng ở đây: DiseasesPage vẫn dùng getDiseases/getPests cũ cho lan.
  diseases: [],
  pests: [],
};
