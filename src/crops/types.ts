// Cấu hình cho mỗi loại cây trồng. Thêm loại cây mới = thêm 1 file config,
// không phải sửa logic các trang.

// [min tốt, max tốt, min cảnh báo, max cảnh báo] — ngoài dải cảnh báo = nguy hiểm
export type Threshold = [number, number, number, number];

export type MetricKey = 'temp' | 'humidity' | 'moisture' | 'ph' | 'ec' | 'n' | 'p' | 'k';

export interface CropDisease {
  id: string;
  nameVi: string;
  name: string;
  symptoms: string[];
  causes: string[];
  treatment: string[];
  prevention: string[];
}

export interface CropPest {
  id: string;
  nameVi: string;
  name: string;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
}

// Ngữ cảnh truyền vào để dựng prompt tư vấn cảm biến
export interface AdvisorContext {
  sensorSummary: string;   // tóm tắt các chỉ số + trạng thái
  measuredAt: string;      // thời điểm đo (đã format)
  plantCount: number;
  healthBreakdown: { good: number; warning: number; danger: number };
  stageName?: string;      // tên giai đoạn sinh trưởng đang chọn (nếu có)
  stageNote?: string;      // ghi chú nhu cầu dinh dưỡng của giai đoạn
}

// Giai đoạn sinh trưởng — mỗi giai đoạn có bộ ngưỡng + nhu cầu riêng
export interface CropStage {
  id: string;
  name: string;
  thresholds: Record<MetricKey, Threshold>;
  promptNote: string;      // mô tả nhu cầu dinh dưỡng để chèn vào prompt AI
}

export interface CropConfig {
  id: string;              // 'orchid' | 'durian' | ...
  name: string;            // tên hiển thị (tiếng Việt)
  emoji: string;
  thresholds: Record<MetricKey, Threshold>;
  // Dựng prompt cho AI tư vấn cảm biến (trang Cảm biến)
  buildAdvisorPrompt: (ctx: AdvisorContext) => string;
  // Prompt cho AI chẩn đoán bệnh qua ảnh (trang Bệnh)
  diagnosePrompt: string;
  diseases: CropDisease[];
  pests: CropPest[];
  stages?: CropStage[];    // giai đoạn sinh trưởng (tùy chọn — lan không có)
}
