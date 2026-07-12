import type { CropConfig } from './types';

// Sầu riêng — cây ăn trái lâu năm. Ngưỡng đất/dinh dưỡng theo khuyến cáo canh
// tác sầu riêng ở ĐBSCL/Đông Nam Bộ (đất tơi xốp, thoát nước tốt, hơi chua).
export const durianCrop: CropConfig = {
  id: 'durian',
  name: 'Sầu riêng',
  emoji: '🌰',

  thresholds: {
    // Sầu riêng ưa nóng ẩm, sợ úng rễ
    temp:     [24, 32, 20, 38],     // °C — tối ưu 24-32
    humidity: [60, 85, 50, 95],     // % không khí
    moisture: [50, 75, 35, 85],     // % ẩm đất — đủ ẩm nhưng KHÔNG úng (Phytophthora)
    ph:       [5.5, 6.5, 5.0, 7.0], // hơi chua tới trung tính
    ec:       [1.0, 2.5, 0.5, 3.0], // mS/cm — nhu cầu dinh dưỡng cao hơn lan
    n:        [40, 100, 20, 140],   // mg/kg — cây lớn, cần đạm nhiều
    p:        [20, 60, 10, 90],     // mg/kg — lân cho ra hoa, nuôi trái
    k:        [50, 120, 30, 160],   // mg/kg — kali rất quan trọng giai đoạn nuôi trái
  },

  // Ngưỡng theo giai đoạn sinh trưởng — nhu cầu dinh dưỡng đổi rõ rệt
  stages: [
    {
      id: 'kien-thiet',
      name: 'Kiến thiết cơ bản',
      promptNote: 'Giai đoạn kiến thiết cơ bản (cây non): ưu tiên ĐẠM (N) cao để phát triển thân lá, bộ rễ và tán. Cần đủ ẩm, chưa cần nhiều kali.',
      thresholds: {
        temp:     [24, 32, 20, 38],
        humidity: [60, 85, 50, 95],
        moisture: [55, 78, 40, 88],   // giữ ẩm tốt cho cây non
        ph:       [5.5, 6.5, 5.0, 7.0],
        ec:       [0.8, 2.0, 0.4, 2.5],
        n:        [60, 120, 35, 160],  // N cao nhất
        p:        [15, 45, 8, 70],
        k:        [30, 80, 20, 110],
      },
    },
    {
      id: 'ra-hoa',
      name: 'Ra hoa',
      promptNote: 'Giai đoạn ra hoa: cần LÂN (P) và KALI (K) cao, GIẢM đạm để không ra đọt cạnh tranh với hoa. Giữ khô hạn nhẹ (ẩm đất thấp hơn) để kích thích phân hóa mầm hoa.',
      thresholds: {
        temp:     [24, 32, 20, 38],
        humidity: [55, 80, 45, 92],
        moisture: [35, 60, 25, 72],   // giữ khô nhẹ để kích hoa
        ph:       [5.5, 6.5, 5.0, 7.0],
        ec:       [1.0, 2.5, 0.5, 3.0],
        n:        [25, 60, 15, 90],    // giảm đạm
        p:        [35, 80, 20, 110],   // lân cao
        k:        [60, 130, 40, 170],  // kali cao
      },
    },
    {
      id: 'nuoi-trai',
      name: 'Nuôi trái',
      promptNote: 'Giai đoạn nuôi trái: KALI (K) rất cao để trái to, chắc, ngọt và tăng chất lượng cơm. Cần đủ ẩm ổn định (tránh nứt trái do khô-ẩm thất thường), đạm vừa phải.',
      thresholds: {
        temp:     [24, 32, 20, 38],
        humidity: [60, 85, 50, 95],
        moisture: [50, 75, 40, 85],   // ẩm ổn định
        ph:       [5.5, 6.5, 5.0, 7.0],
        ec:       [1.2, 3.0, 0.6, 3.5],
        n:        [35, 80, 20, 110],   // đạm vừa
        p:        [20, 55, 12, 80],
        k:        [80, 160, 50, 200],  // kali rất cao
      },
    },
  ],

  buildAdvisorPrompt: (ctx) =>
    `Bạn là kỹ sư nông nghiệp chuyên canh tác sầu riêng tại Việt Nam (Ri6, Monthong/Dona, Musang King), am hiểu vùng ĐBSCL, Đông Nam Bộ và Tây Nguyên. Kinh nghiệm thực tiễn trên 20 năm về dinh dưỡng, tưới tiêu và phòng bệnh xì mủ (Phytophthora).
${ctx.stageName ? `\nGiai đoạn cây hiện tại: ${ctx.stageName}. ${ctx.stageNote ?? ''}\n` : ''}
Dữ liệu cảm biến vườn sầu riêng hiện tại (đo lúc ${ctx.measuredAt}):
${ctx.sensorSummary}

Thông tin vườn:
- Tổng số cây: ${ctx.plantCount} cây
- Tình trạng: ${ctx.healthBreakdown.good} cây khỏe, ${ctx.healthBreakdown.warning} cần chú ý, ${ctx.healthBreakdown.danger} cảnh báo

Hãy phân tích toàn diện và đưa lời khuyên cụ thể, thực tế cho vườn sầu riêng này. Tập trung vào:
1. Đánh giá môi trường (nhiệt độ, độ ẩm) và nguy cơ úng rễ / xì mủ do độ ẩm đất cao
2. Dinh dưỡng đất (NPK, pH, EC) — cần bón bổ sung gì cho giai đoạn hiện tại (kiến thiết cơ bản / ra hoa / nuôi trái)
3. Kế hoạch tưới nước và bón phân cụ thể, chú ý thoát nước mùa mưa
4. Cảnh báo sâu bệnh dựa trên điều kiện hiện tại (xì mủ, thán thư, rầy, rệp sáp)
5. Hành động ưu tiên cần làm ngay hôm nay

Trả lời bằng tiếng Việt, ngắn gọn súc tích, dùng emoji để dễ đọc. Xưng là "tôi" và nói chuyện thân thiện như đang tư vấn trực tiếp.`,

  diagnosePrompt:
    'Bạn là kỹ sư nông nghiệp chuyên về cây sầu riêng với 20 năm kinh nghiệm tại Việt Nam, am hiểu các bệnh phổ biến: xì mủ (Phytophthora), thán thư, cháy lá, đốm rong, và các loại sâu rầy hại sầu riêng.',

  // Bệnh chính trên sầu riêng (text hiển thị lấy qua i18n key diseasesDurian.*)
  diseases: [
    {
      id: 'phytophthora',
      nameVi: 'Xì mủ (Phytophthora)',
      name: 'Phytophthora foot/stem rot',
      symptoms: [
        'Vết nứt dọc thân, chảy nhựa nâu đỏ như gỉ sắt',
        'Vỏ thân thâm đen, ướt, bong tróc',
        'Lá vàng, rụng dần từ trên xuống, cây suy kiệt',
      ],
      causes: [
        'Nấm Phytophthora palmivora trong đất',
        'Đất úng nước, thoát nước kém, độ ẩm đất cao kéo dài',
        'Vườn rậm rạp, ẩm thấp, thiếu thông thoáng',
      ],
      treatment: [
        'Cạo sạch phần vỏ bệnh, quét thuốc gốc Phosphonate (Agri-fos) hoặc Metalaxyl',
        'Tiêm/tưới gốc Phosphonate theo liều khuyến cáo',
        'Cải thiện thoát nước quanh gốc ngay lập tức',
      ],
      prevention: [
        'Trồng trên mô cao, đảm bảo thoát nước tốt',
        'Không tưới quá ẩm, tránh để nước đọng gốc',
        'Bón vôi cân bằng pH, bổ sung nấm đối kháng Trichoderma',
      ],
    },
    {
      id: 'anthracnose-durian',
      nameVi: 'Thán thư',
      name: 'Anthracnose',
      symptoms: [
        'Đốm nâu tròn trên lá, lan rộng thành mảng cháy',
        'Lá khô mép, rụng nhiều',
        'Hoa và trái non bị thối đen, rụng',
      ],
      causes: [
        'Nấm Colletotrichum gloeosporioides',
        'Thời tiết nóng ẩm, mưa nhiều',
        'Vườn thiếu dinh dưỡng, cây yếu',
      ],
      treatment: [
        'Cắt bỏ lá/cành bệnh, tiêu hủy',
        'Phun thuốc gốc đồng, Azoxystrobin hoặc Mancozeb',
        'Bón cân đối, tăng sức đề kháng cho cây',
      ],
      prevention: [
        'Tỉa cành tạo tán thông thoáng',
        'Phun phòng vào đầu mùa mưa',
        'Bón đủ kali, canxi giúp lá cứng cáp',
      ],
    },
    {
      id: 'leaf-blight-durian',
      nameVi: 'Cháy lá / Đốm lá',
      name: 'Leaf blight / Leaf spot',
      symptoms: [
        'Đốm nâu vàng trên lá, viền sẫm',
        'Lá cháy khô từ mép vào, quăn queo',
        'Lá rụng sớm, cây quang hợp kém',
      ],
      causes: [
        'Nấm Rhizoctonia / Phomopsis',
        'Ẩm độ cao, tán lá rậm rạp',
        'Thiếu vi lượng (kẽm, magie)',
      ],
      treatment: [
        'Cắt tỉa lá bệnh',
        'Phun Hexaconazole hoặc Difenoconazole',
        'Bổ sung phân bón lá vi lượng',
      ],
      prevention: [
        'Tạo tán thông thoáng, vệ sinh vườn',
        'Bón cân đối NPK + trung vi lượng',
        'Tránh tưới lên lá vào chiều tối',
      ],
    },
    {
      id: 'pink-disease-durian',
      nameVi: 'Nấm hồng',
      name: 'Pink disease',
      symptoms: [
        'Mảng nấm màu hồng nhạt phủ trên vỏ cành, thân',
        'Cành bị bệnh khô dần, lá héo rụng',
        'Vỏ nứt nẻ, cành chết khô từ ngọn',
      ],
      causes: [
        'Nấm Erythricium salmonicolor (Corticium salmonicolor)',
        'Ẩm độ cao, mưa nhiều kéo dài',
        'Vườn rậm rạp, cành đan chéo thiếu nắng',
      ],
      treatment: [
        'Cắt bỏ cành bệnh, tiêu hủy xa vườn',
        'Quét/phun thuốc gốc đồng (Copper) hoặc Validamycin lên vết bệnh',
        'Phun lặp lại sau 7–10 ngày nếu còn',
      ],
      prevention: [
        'Tỉa cành tạo tán thông thoáng, đủ nắng',
        'Quét vôi gốc và cành lớn đầu mùa mưa',
        'Kiểm tra vườn định kỳ, xử lý sớm khi mới chớm',
      ],
    },
    {
      id: 'algal-spot-durian',
      nameVi: 'Đốm rong (tảo đỏ)',
      name: 'Algal leaf spot',
      symptoms: [
        'Đốm tròn màu cam/nâu đỏ nhô lên mặt lá, như nhung',
        'Đốm lan trên lá già, cành nhỏ',
        'Lá suy yếu, giảm quang hợp khi bị nặng',
      ],
      causes: [
        'Tảo ký sinh Cephaleuros virescens',
        'Ẩm độ cao, vườn ẩm thấp thiếu nắng',
        'Cây thiếu dinh dưỡng, sinh trưởng yếu',
      ],
      treatment: [
        'Phun thuốc gốc đồng (Copper oxychloride)',
        'Cắt tỉa cành lá bị nặng',
        'Bón phân phục hồi sức cây',
      ],
      prevention: [
        'Tỉa tán thông thoáng, tăng ánh sáng',
        'Thoát nước tốt, giảm ẩm trong vườn',
        'Bón cân đối giúp cây khỏe',
      ],
    },
    {
      id: 'bacterial-leaf-blight-durian',
      nameVi: 'Cháy lá vi khuẩn',
      name: 'Bacterial leaf blight',
      symptoms: [
        'Vết cháy ướt màu nâu đen, viền vàng lan nhanh',
        'Lá thối mềm, có mùi, rụng hàng loạt',
        'Chồi non thâm đen, chết ngọn',
      ],
      causes: [
        'Vi khuẩn (Xanthomonas / Erwinia)',
        'Mưa gió gây xây xát tạo đường xâm nhập',
        'Ẩm độ cao, bón thừa đạm',
      ],
      treatment: [
        'Cắt bỏ phần bệnh, tiêu hủy',
        'Phun thuốc gốc đồng hoặc kháng sinh nông nghiệp (Kasugamycin, Streptomycin)',
        'Ngưng bón đạm, tăng kali giúp lá cứng',
      ],
      prevention: [
        'Tránh làm xây xát cây khi chăm sóc',
        'Không tưới lên lá vào chiều tối',
        'Bón cân đối, tránh dư đạm; vệ sinh dụng cụ cắt tỉa',
      ],
    },
  ],

  pests: [
    {
      id: 'mealybug-durian',
      nameVi: 'Rệp sáp',
      name: 'Mealybug',
      symptoms: [
        'Đốm trắng như bông gòn trên cành, cuống trái, lá',
        'Trái bị rệp bám kém phát triển, méo mó',
        'Có nấm bồ hóng đen do dịch rệp tiết ra',
      ],
      treatment: [
        'Phun dầu khoáng hoặc thuốc gốc Imidacloprid',
        'Cắt bỏ cành/trái bị hại nặng',
        'Diệt kiến (kiến cộng sinh phát tán rệp)',
      ],
      prevention: [
        'Thường xuyên kiểm tra cuống trái, nách lá',
        'Giữ vườn sạch, tỉa cành thông thoáng',
        'Bảo vệ thiên địch (bọ rùa)',
      ],
    },
    {
      id: 'mite-durian',
      nameVi: 'Nhện đỏ',
      name: 'Red spider mite',
      symptoms: [
        'Lá vàng lấm tấm như bụi, mặt dưới có mạng nhện mịn',
        'Lá bạc màu, khô, rụng',
        'Cây suy yếu vào mùa khô nóng',
      ],
      treatment: [
        'Phun nước rửa mặt dưới lá',
        'Dùng thuốc trừ nhện chuyên biệt (Abamectin)',
        'Luân phiên hoạt chất tránh kháng thuốc',
      ],
      prevention: [
        'Tưới đủ ẩm mùa khô, giữ vườn mát',
        'Kiểm tra định kỳ mặt dưới lá',
        'Bảo vệ nhện thiên địch',
      ],
    },
    {
      id: 'planthopper-durian',
      nameVi: 'Rầy phấn (rầy nhảy)',
      name: 'Planthopper / Psyllid',
      symptoms: [
        'Lá non xoăn, cháy mép, rụng nhiều — hại nặng đợt ra đọt',
        'Có lớp phấn trắng và dịch mật trên lá non',
        'Đọt non không phát triển, cây chậm lớn',
      ],
      treatment: [
        'Phun thuốc khi cây nhú đọt (Imidacloprid, Thiamethoxam)',
        'Phun tập trung vào đợt ra đọt non — giai đoạn rầy hại mạnh nhất',
        'Luân phiên hoạt chất tránh kháng thuốc',
      ],
      prevention: [
        'Điều khiển ra đọt đồng loạt để dễ phòng trừ',
        'Kiểm tra đọt non thường xuyên trong mùa ra lá',
        'Bảo vệ thiên địch (ong ký sinh, bọ rùa)',
      ],
    },
    {
      id: 'borer-durian',
      nameVi: 'Sâu đục thân / đục trái',
      name: 'Stem & fruit borer',
      symptoms: [
        'Lỗ đục trên thân/cành có mùn gỗ và phân đùn ra ngoài',
        'Trái có lỗ đục, chảy nhựa, thối bên trong',
        'Cành suy yếu, dễ gãy; trái rụng non',
      ],
      treatment: [
        'Bơm thuốc vào lỗ đục rồi bịt lại (Chlorpyrifos/Cypermethrin theo khuyến cáo)',
        'Cắt bỏ cành, thu gom trái bị đục đem tiêu hủy',
        'Bao trái sớm để chống sâu đục trái',
      ],
      prevention: [
        'Thăm vườn thường xuyên phát hiện lỗ đục sớm',
        'Vệ sinh vườn, thu dọn trái rụng',
        'Bao trái non; đặt bẫy đèn/pheromone bắt trưởng thành',
      ],
    },
  ],
};
