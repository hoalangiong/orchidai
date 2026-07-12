import { useState } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import DiagnoseModal from './DiagnoseModal';
import { useProducts } from '../../hooks/useProducts';
import { useActiveCrop } from '../../crops';
import type { CropDisease, CropPest } from '../../crops';

// Chuyển bệnh/sâu từ crop config (text tiếng Việt sẵn) sang item hiển thị.
// Không có SVG riêng cho cây khác lan → dùng ảnh thật trong public/diseases-<crop>/
// với fallback emoji (DiseaseImage/DiseaseGallery tự xử lý ảnh thiếu).
const CROP_TAG_STYLES = [
  { tagColor: 'bg-red-100 text-red-700', headerBg: 'from-red-50 to-red-100', accentColor: 'text-red-700', borderColor: 'border-red-200' },
  { tagColor: 'bg-orange-100 text-orange-700', headerBg: 'from-orange-50 to-orange-100', accentColor: 'text-orange-700', borderColor: 'border-orange-200' },
  { tagColor: 'bg-amber-100 text-amber-700', headerBg: 'from-amber-50 to-amber-100', accentColor: 'text-amber-700', borderColor: 'border-amber-200' },
  { tagColor: 'bg-lime-100 text-lime-700', headerBg: 'from-lime-50 to-lime-100', accentColor: 'text-lime-700', borderColor: 'border-lime-200' },
];

function EmojiLeaf({ emoji }: { emoji: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center text-5xl">{emoji}</div>
  );
}

function cropDiseasesToItems(diseases: CropDisease[], cropId: string, emoji: string) {
  return diseases.map((d, i) => ({
    id: `${cropId}-${d.id}`,
    Illustration: () => <EmojiLeaf emoji={emoji} />,
    nameVi: d.nameVi, name: d.name,
    ...CROP_TAG_STYLES[i % CROP_TAG_STYLES.length],
    symptoms: d.symptoms,
    causes: d.causes,
    treatment: d.treatment,
    prevention: d.prevention,
  }));
}

function cropPestsToItems(pests: CropPest[], cropId: string, emoji: string) {
  return pests.map((p, i) => ({
    id: `${cropId}-${p.id}`,
    Illustration: () => <EmojiLeaf emoji={emoji} />,
    nameVi: p.nameVi, name: p.name,
    ...CROP_TAG_STYLES[i % CROP_TAG_STYLES.length],
    description: '',
    symptoms: p.symptoms,
    treatment: p.treatment,
    prevention: p.prevention,
  }));
}

// ─── SVG minh họa lá Dendrobium ──────────────────────────────────────────────

function LeafBlackRot() {
  return (
    <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M40 90 C20 70 10 45 15 20 C20 5 40 2 40 2 C40 2 60 5 65 20 C70 45 60 70 40 90Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5"/>
      <path d="M40 85 L40 8" stroke="#16a34a" strokeWidth="1" opacity="0.5"/>
      <path d="M40 30 C30 28 22 30 18 35" stroke="#16a34a" strokeWidth="0.8" opacity="0.4"/>
      <path d="M40 50 C28 47 20 50 16 56" stroke="#16a34a" strokeWidth="0.8" opacity="0.4"/>
      <path d="M40 30 C50 28 58 30 62 35" stroke="#16a34a" strokeWidth="0.8" opacity="0.4"/>
      <path d="M40 50 C52 47 60 50 64 56" stroke="#16a34a" strokeWidth="0.8" opacity="0.4"/>
      <ellipse cx="30" cy="38" rx="10" ry="8" fill="#1c1917" opacity="0.85"/>
      <ellipse cx="30" cy="38" rx="10" ry="8" fill="none" stroke="#fbbf24" strokeWidth="1.5"/>
      <ellipse cx="30" cy="38" rx="13" ry="11" fill="#fde68a" opacity="0.4"/>
      <ellipse cx="50" cy="55" rx="6" ry="5" fill="#292524" opacity="0.75"/>
      <ellipse cx="50" cy="55" rx="6" ry="5" fill="none" stroke="#fbbf24" strokeWidth="1"/>
      <ellipse cx="50" cy="55" rx="9" ry="7" fill="#fde68a" opacity="0.3"/>
    </svg>
  );
}

function LeafCrownRot() {
  return (
    <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M40 90 C20 70 10 45 15 20 C20 5 40 2 40 2 C40 2 60 5 65 20 C70 45 60 70 40 90Z"
        fill="url(#leafYellow)" stroke="#ca8a04" strokeWidth="1.5"/>
      <defs>
        <linearGradient id="leafYellow" x1="40" y1="90" x2="40" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#713f12"/>
          <stop offset="30%" stopColor="#a16207"/>
          <stop offset="60%" stopColor="#ca8a04"/>
          <stop offset="100%" stopColor="#4ade80"/>
        </linearGradient>
      </defs>
      <path d="M40 85 L40 8" stroke="#92400e" strokeWidth="1" opacity="0.5"/>
      <ellipse cx="40" cy="85" rx="14" ry="8" fill="#431407" opacity="0.9"/>
      <ellipse cx="40" cy="85" rx="14" ry="8" fill="none" stroke="#b45309" strokeWidth="1.5"/>
      <circle cx="35" cy="83" r="2" fill="#78350f" opacity="0.7"/>
      <circle cx="43" cy="87" r="1.5" fill="#78350f" opacity="0.7"/>
      <path d="M32 92 C30 96 28 98 26 99" stroke="#7c2d12" strokeWidth="1.5"/>
      <path d="M40 93 C40 97 39 99 38 100" stroke="#7c2d12" strokeWidth="1.5"/>
      <path d="M48 92 C50 96 52 98 54 99" stroke="#7c2d12" strokeWidth="1.5"/>
    </svg>
  );
}

function LeafSpot() {
  return (
    <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M40 90 C20 70 10 45 15 20 C20 5 40 2 40 2 C40 2 60 5 65 20 C70 45 60 70 40 90Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5"/>
      <path d="M40 85 L40 8" stroke="#16a34a" strokeWidth="1" opacity="0.5"/>
      <circle cx="28" cy="35" r="7" fill="#92400e" opacity="0.85"/>
      <circle cx="28" cy="35" r="7" fill="none" stroke="#fbbf24" strokeWidth="1.5"/>
      <circle cx="28" cy="35" r="10" fill="#fde68a" opacity="0.3"/>
      <circle cx="28" cy="35" r="4" fill="#7c2d12" opacity="0.6"/>
      <circle cx="52" cy="48" r="5" fill="#92400e" opacity="0.85"/>
      <circle cx="52" cy="48" r="5" fill="none" stroke="#fbbf24" strokeWidth="1.2"/>
      <circle cx="52" cy="48" r="8" fill="#fde68a" opacity="0.25"/>
      <circle cx="35" cy="65" r="4" fill="#92400e" opacity="0.7"/>
      <circle cx="48" cy="70" r="3" fill="#92400e" opacity="0.6"/>
    </svg>
  );
}

function LeafBlight() {
  return (
    <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M40 90 C20 70 10 45 15 20 C20 5 40 2 40 2 C40 2 60 5 65 20 C70 45 60 70 40 90Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5"/>
      <path d="M40 85 L40 8" stroke="#16a34a" strokeWidth="1" opacity="0.4"/>
      {/* Vết cháy từ mép lá vào */}
      <path d="M15 30 Q20 25 28 28 Q22 35 18 42 Q13 38 15 30Z" fill="#b45309" opacity="0.85"/>
      <path d="M15 30 Q20 25 28 28 Q22 35 18 42 Q13 38 15 30Z" fill="none" stroke="#fbbf24" strokeWidth="1"/>
      <path d="M62 45 Q67 40 68 50 Q62 55 58 52 Q56 46 62 45Z" fill="#b45309" opacity="0.8"/>
      {/* Mép vàng */}
      <path d="M14 28 Q20 22 30 26" stroke="#fbbf24" strokeWidth="2" opacity="0.6"/>
      <path d="M14 44 Q16 50 18 54" stroke="#fbbf24" strokeWidth="2" opacity="0.5"/>
      {/* Vùng nâu lan vào giữa */}
      <path d="M25 30 Q30 35 27 42 Q22 40 20 35 Q22 30 25 30Z" fill="#92400e" opacity="0.5"/>
    </svg>
  );
}

function LeafRust() {
  return (
    <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M40 90 C20 70 10 45 15 20 C20 5 40 2 40 2 C40 2 60 5 65 20 C70 45 60 70 40 90Z" fill="#86efac" stroke="#16a34a" strokeWidth="1.5"/>
      <path d="M40 85 L40 8" stroke="#16a34a" strokeWidth="1" opacity="0.4"/>
      {/* Đốm gỉ sắt màu cam nâu */}
      {[
        [25,30,4],[38,22,3],[52,35,4.5],[28,50,3.5],[45,48,4],[55,60,3],
        [30,65,3.5],[48,68,3],[35,78,2.5]
      ].map(([cx,cy,r],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill="#c2410c" opacity="0.85"/>
          <circle cx={cx} cy={cy} r={r*0.55} fill="#ea580c" opacity="0.7"/>
          {/* Bào tử nhú lên */}
          <circle cx={cx} cy={cy} r={r+1.5} fill="none" stroke="#fed7aa" strokeWidth="0.7" opacity="0.5"/>
        </g>
      ))}
    </svg>
  );
}

function LeafYellowing() {
  return (
    <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="yellowLeaf" x1="40" y1="2" x2="40" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ade80"/>
          <stop offset="40%" stopColor="#a3e635"/>
          <stop offset="70%" stopColor="#facc15"/>
          <stop offset="100%" stopColor="#ca8a04"/>
        </linearGradient>
      </defs>
      <path d="M40 90 C20 70 10 45 15 20 C20 5 40 2 40 2 C40 2 60 5 65 20 C70 45 60 70 40 90Z"
        fill="url(#yellowLeaf)" stroke="#ca8a04" strokeWidth="1.5"/>
      <path d="M40 85 L40 8" stroke="#a16207" strokeWidth="1" opacity="0.4"/>
      {/* Gân lá vàng */}
      <path d="M40 35 C28 32 20 36 16 42" stroke="#a16207" strokeWidth="0.8" opacity="0.5"/>
      <path d="M40 55 C28 52 20 56 16 62" stroke="#a16207" strokeWidth="0.8" opacity="0.5"/>
      <path d="M40 35 C52 32 60 36 64 42" stroke="#a16207" strokeWidth="0.8" opacity="0.5"/>
      {/* Đốm vàng trên nền xanh nhạt */}
      <ellipse cx="30" cy="28" rx="7" ry="5" fill="#fef08a" opacity="0.7"/>
      <ellipse cx="52" cy="40" rx="6" ry="4" fill="#fef08a" opacity="0.6"/>
      <ellipse cx="35" cy="52" rx="8" ry="5" fill="#fef08a" opacity="0.6"/>
    </svg>
  );
}

function LeafVirus() {
  return (
    <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M40 90 C20 70 10 45 15 20 C20 5 40 2 40 2 C40 2 60 5 65 20 C70 45 60 70 40 90Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5"/>
      <path d="M40 85 L40 8" stroke="#16a34a" strokeWidth="1" opacity="0.4"/>
      {/* Vân khảm virus — sọc xanh đậm nhạt xen kẽ */}
      <path d="M20 25 Q30 20 40 25 Q50 30 60 25" stroke="#86efac" strokeWidth="3" opacity="0.7"/>
      <path d="M18 35 Q28 28 40 35 Q52 42 62 35" stroke="#a7f3d0" strokeWidth="3" opacity="0.6"/>
      <path d="M17 47 Q27 40 40 47 Q53 54 63 47" stroke="#6ee7b7" strokeWidth="3" opacity="0.7"/>
      <path d="M17 59 Q27 52 40 59 Q53 66 63 59" stroke="#86efac" strokeWidth="3" opacity="0.6"/>
      <path d="M19 70 Q29 63 40 70 Q51 77 61 70" stroke="#a7f3d0" strokeWidth="2.5" opacity="0.6"/>
      {/* Đốm hoại tử */}
      <circle cx="32" cy="40" r="4" fill="#7f1d1d" opacity="0.7"/>
      <circle cx="50" cy="52" r="3" fill="#7f1d1d" opacity="0.65"/>
      <circle cx="38" cy="65" r="3.5" fill="#7f1d1d" opacity="0.6"/>
      {/* Lá hơi biến dạng — cong */}
      <path d="M15 20 Q17 12 22 10" stroke="#16a34a" strokeWidth="1" opacity="0.3" strokeDasharray="2,2"/>
    </svg>
  );
}

function LeafFusarium() {
  return (
    <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M40 90 C20 70 10 45 15 20 C20 5 40 2 40 2 C40 2 60 5 65 20 C70 45 60 70 40 90Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5"/>
      <path d="M40 85 L40 8" stroke="#16a34a" strokeWidth="1" opacity="0.4"/>
      {/* Nấm hồng/đỏ Fusarium — vết thối hồng */}
      <path d="M35 55 Q40 45 50 50 Q52 60 44 65 Q36 63 35 55Z" fill="#f9a8d4" opacity="0.85" stroke="#ec4899" strokeWidth="1"/>
      <path d="M35 55 Q40 45 50 50 Q52 60 44 65 Q36 63 35 55Z" fill="url(#fusariumGrad)" opacity="0.6"/>
      <defs>
        <radialGradient id="fusariumGrad" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#be185d"/>
          <stop offset="100%" stopColor="#f9a8d4"/>
        </radialGradient>
      </defs>
      {/* Sợi nấm hồng */}
      <path d="M38 58 Q44 54 48 58" stroke="#db2777" strokeWidth="1" opacity="0.7"/>
      <path d="M37 62 Q43 58 47 62" stroke="#db2777" strokeWidth="0.8" opacity="0.6"/>
      {/* Vết nâu gốc */}
      <ellipse cx="40" cy="80" rx="10" ry="6" fill="#78350f" opacity="0.7"/>
      <ellipse cx="40" cy="80" rx="10" ry="6" fill="none" stroke="#b45309" strokeWidth="1"/>
      {/* Héo từ gốc */}
      <path d="M40 85 L40 68" stroke="#92400e" strokeWidth="2" opacity="0.6"/>
    </svg>
  );
}

function LeafAnthracnose() {
  return (
    <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M40 90 C20 70 10 45 15 20 C20 5 40 2 40 2 C40 2 60 5 65 20 C70 45 60 70 40 90Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5"/>
      <path d="M40 85 L40 8" stroke="#16a34a" strokeWidth="1" opacity="0.4"/>
      {/* Đốm than thư — tròn với vòng đồng tâm rõ */}
      <circle cx="32" cy="38" r="11" fill="#292524" opacity="0.8"/>
      <circle cx="32" cy="38" r="9" fill="#44403c" opacity="0.6"/>
      <circle cx="32" cy="38" r="7" fill="#1c1917" opacity="0.8"/>
      <circle cx="32" cy="38" r="11" fill="none" stroke="#78716c" strokeWidth="1"/>
      <circle cx="32" cy="38" r="14" fill="none" stroke="#d6d3d1" strokeWidth="0.8" opacity="0.5"/>
      {/* Chấm bào tử (acervuli) */}
      {[[29,35],[33,38],[31,41],[35,36]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="1.2" fill="#f97316" opacity="0.8"/>
      ))}
      {/* Đốm phụ */}
      <circle cx="52" cy="58" r="6" fill="#292524" opacity="0.7"/>
      <circle cx="52" cy="58" r="4" fill="#1c1917" opacity="0.7"/>
      <circle cx="52" cy="58" r="8" fill="none" stroke="#d6d3d1" strokeWidth="0.7" opacity="0.4"/>
      {[[50,56],[53,59],[51,61]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="1" fill="#f97316" opacity="0.7"/>
      ))}
    </svg>
  );
}

function LeafBacterialRot() {
  return (
    <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M40 90 C20 70 10 45 15 20 C20 5 40 2 40 2 C40 2 60 5 65 20 C70 45 60 70 40 90Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5"/>
      <path d="M40 85 L40 8" stroke="#16a34a" strokeWidth="1" opacity="0.4"/>
      {/* Vết thối vi khuẩn — màu nâu nhạt có viền nước */}
      <path d="M24 42 Q32 35 42 40 Q46 50 40 58 Q30 60 24 54 Q20 48 24 42Z" fill="#a16207" opacity="0.8"/>
      <path d="M24 42 Q32 35 42 40 Q46 50 40 58 Q30 60 24 54 Q20 48 24 42Z" fill="none" stroke="#fde68a" strokeWidth="1.5"/>
      {/* Viền nước thấm */}
      <path d="M22 40 Q32 32 44 38 Q49 50 42 60 Q30 63 22 55 Q18 47 22 40Z" fill="none" stroke="#fef9c3" strokeWidth="1" opacity="0.7"/>
      {/* Mùi hôi — chấm nâu nhạt nhớt */}
      <ellipse cx="33" cy="49" rx="6" ry="4" fill="#713f12" opacity="0.5"/>
      <path d="M28 48 Q33 45 38 48" stroke="#b45309" strokeWidth="0.8" opacity="0.6"/>
      {/* Vệt thấm nhỏ phụ */}
      <ellipse cx="52" cy="30" rx="5" ry="4" fill="#ca8a04" opacity="0.65"/>
      <ellipse cx="52" cy="30" rx="7" ry="5.5" fill="none" stroke="#fde68a" strokeWidth="0.8" opacity="0.5"/>
    </svg>
  );
}

// ─── SVG sâu hại ─────────────────────────────────────────────────────────────

function LeafSpiderMites() {
  return (
    <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M40 90 C20 70 10 45 15 20 C20 5 40 2 40 2 C40 2 60 5 65 20 C70 45 60 70 40 90Z" fill="#a3e635" stroke="#65a30d" strokeWidth="1.5"/>
      <path d="M40 85 L40 8" stroke="#65a30d" strokeWidth="1" opacity="0.4"/>
      <line x1="20" y1="40" x2="60" y2="40" stroke="white" strokeWidth="0.6" opacity="0.7"/>
      <line x1="22" y1="50" x2="58" y2="50" stroke="white" strokeWidth="0.6" opacity="0.7"/>
      <line x1="24" y1="60" x2="56" y2="60" stroke="white" strokeWidth="0.6" opacity="0.7"/>
      <line x1="25" y1="35" x2="25" y2="65" stroke="white" strokeWidth="0.6" opacity="0.7"/>
      <line x1="35" y1="32" x2="35" y2="68" stroke="white" strokeWidth="0.6" opacity="0.7"/>
      <line x1="45" y1="32" x2="45" y2="68" stroke="white" strokeWidth="0.6" opacity="0.7"/>
      <line x1="55" y1="35" x2="55" y2="65" stroke="white" strokeWidth="0.6" opacity="0.7"/>
      {[28,33,38,44,50,32,40,48,36,44].map((cx,i) => (
        <circle key={i} cx={cx} cy={[38,42,36,41,38,52,55,53,65,63][i]} r="2" fill="#fbbf24" opacity="0.8"/>
      ))}
      {[[30,45],[45,50],[38,60]].map(([cx,cy],i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx="2.5" ry="2" fill="#dc2626" opacity="0.9"/>
          <line x1={cx-3} y1={cy-1} x2={cx-5} y2={cy-3} stroke="#dc2626" strokeWidth="0.6"/>
          <line x1={cx-3} y1={cy+1} x2={cx-5} y2={cy+3} stroke="#dc2626" strokeWidth="0.6"/>
          <line x1={cx+3} y1={cy-1} x2={cx+5} y2={cy-3} stroke="#dc2626" strokeWidth="0.6"/>
          <line x1={cx+3} y1={cy+1} x2={cx+5} y2={cy+3} stroke="#dc2626" strokeWidth="0.6"/>
        </g>
      ))}
    </svg>
  );
}

function LeafMealybugs() {
  return (
    <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M40 90 C20 70 10 45 15 20 C20 5 40 2 40 2 C40 2 60 5 65 20 C70 45 60 70 40 90Z" fill="#86efac" stroke="#16a34a" strokeWidth="1.5"/>
      <path d="M40 85 L40 8" stroke="#16a34a" strokeWidth="1" opacity="0.4"/>
      {([
        [30,40,9,6],[45,35,7,5],[25,55,11,7],[52,58,8,5.5],[35,70,7,4.5],[48,72,6,4]
      ] as [number,number,number,number][]).map(([cx,cy,rx,ry],i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="white" opacity="0.95" stroke="#e2e8f0" strokeWidth="0.8"/>
          <line x1={cx-rx} y1={cy} x2={cx-rx-3} y2={cy-2} stroke="#94a3b8" strokeWidth="0.5"/>
          <line x1={cx-rx} y1={cy} x2={cx-rx-3} y2={cy+2} stroke="#94a3b8" strokeWidth="0.5"/>
          <line x1={cx+rx} y1={cy} x2={cx+rx+3} y2={cy-2} stroke="#94a3b8" strokeWidth="0.5"/>
          <line x1={cx+rx} y1={cy} x2={cx+rx+3} y2={cy+2} stroke="#94a3b8" strokeWidth="0.5"/>
          <ellipse cx={cx} cy={cy} rx={rx*0.7} ry={ry*0.6} fill="#f8fafc" opacity="0.8"/>
        </g>
      ))}
      <path d="M25 50 Q40 52 55 48" stroke="#fef08a" strokeWidth="2" opacity="0.5"/>
      <ellipse cx="38" cy="62" rx="8" ry="3" fill="#1e293b" opacity="0.3"/>
    </svg>
  );
}

function LeafScale() {
  return (
    <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M40 90 C20 70 10 45 15 20 C20 5 40 2 40 2 C40 2 60 5 65 20 C70 45 60 70 40 90Z" fill="#86efac" stroke="#16a34a" strokeWidth="1.5"/>
      <path d="M40 85 L40 8" stroke="#16a34a" strokeWidth="1" opacity="0.4"/>
      {([
        [28,35],[38,28],[50,40],[24,52],[44,55],[55,62],[32,68],[48,72]
      ] as [number,number][]).map(([cx,cy],i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx="5" ry="3.5" fill="#92400e" opacity="0.9"/>
          <ellipse cx={cx} cy={cy} rx="5" ry="3.5" fill="none" stroke="#78350f" strokeWidth="0.8"/>
          <ellipse cx={cx} cy={cy} rx="3" ry="2" fill="#a16207" opacity="0.5"/>
        </g>
      ))}
      <ellipse cx="28" cy="35" rx="10" ry="7" fill="#fde68a" opacity="0.25"/>
      <ellipse cx="50" cy="40" rx="9" ry="7" fill="#fde68a" opacity="0.2"/>
    </svg>
  );
}

function LeafFlowerFly() {
  return (
    <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Hoa lan bị hại */}
      <path d="M40 90 C20 70 10 45 15 20 C20 5 40 2 40 2 C40 2 60 5 65 20 C70 45 60 70 40 90Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5"/>
      <path d="M40 85 L40 8" stroke="#16a34a" strokeWidth="1" opacity="0.4"/>
      {/* Cánh hoa bị hỏng — đốm bạc/nâu trên nụ */}
      <ellipse cx="40" cy="20" rx="10" ry="8" fill="#fde68a" opacity="0.7" stroke="#ca8a04" strokeWidth="1"/>
      <ellipse cx="40" cy="20" rx="6" ry="5" fill="#fbbf24" opacity="0.5"/>
      {/* Vết chích hút trên nụ */}
      {[[37,17],[42,21],[39,23],[43,17]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="1" fill="#92400e" opacity="0.8"/>
      ))}
      {/* Con ruồi chít hoa — thân dài mảnh */}
      <g transform="translate(28,38) rotate(-30)">
        <ellipse cx="0" cy="0" rx="7" ry="2" fill="#78350f" opacity="0.9"/>
        <circle cx="-6" cy="0" r="2.5" fill="#451a03"/>
        {/* Mắt đỏ */}
        <circle cx="-6.5" cy="-0.8" r="1" fill="#dc2626"/>
        <circle cx="-5.5" cy="-0.8" r="1" fill="#dc2626"/>
        {/* Cánh trong suốt */}
        <ellipse cx="1" cy="-4" rx="6" ry="2.5" fill="#bae6fd" opacity="0.5" stroke="#7dd3fc" strokeWidth="0.5"/>
        <ellipse cx="1" cy="4" rx="6" ry="2.5" fill="#bae6fd" opacity="0.5" stroke="#7dd3fc" strokeWidth="0.5"/>
        {/* Chân */}
        <line x1="-3" y1="2" x2="-5" y2="5" stroke="#78350f" strokeWidth="0.6"/>
        <line x1="0" y1="2" x2="-1" y2="5" stroke="#78350f" strokeWidth="0.6"/>
        <line x1="3" y1="2" x2="4" y2="5" stroke="#78350f" strokeWidth="0.6"/>
        {/* Râu */}
        <line x1="-7.5" y1="-1.5" x2="-10" y2="-4" stroke="#451a03" strokeWidth="0.7"/>
        <line x1="-6.5" y1="-1.5" x2="-8" y2="-5" stroke="#451a03" strokeWidth="0.7"/>
      </g>
      {/* Trứng nhỏ trong nụ hoa */}
      {[[38,18],[42,19],[40,22]].map(([cx,cy],i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="1.2" ry="0.8" fill="white" opacity="0.9" stroke="#fbbf24" strokeWidth="0.5"/>
      ))}
      {/* Nụ hoa thứ 2 bị hại */}
      <ellipse cx="55" cy="35" rx="7" ry="6" fill="#fde68a" opacity="0.5" stroke="#ca8a04" strokeWidth="0.8"/>
      <path d="M52 32 Q55 30 58 32 Q57 36 55 38 Q53 36 52 32Z" fill="#fed7aa" opacity="0.6"/>
    </svg>
  );
}

function LeafBoTri() {
  return (
    <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M40 90 C20 70 10 45 15 20 C20 5 40 2 40 2 C40 2 60 5 65 20 C70 45 60 70 40 90Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5"/>
      <path d="M40 85 L40 8" stroke="#16a34a" strokeWidth="1" opacity="0.4"/>
      {/* Vết xước bạc đặc trưng bọ trĩ — sọc dọc theo chiều gân lá */}
      <path d="M22 35 Q30 32 35 38 Q28 44 22 42Z" fill="#e2e8f0" opacity="0.9" stroke="#94a3b8" strokeWidth="0.8"/>
      <path d="M50 28 Q58 25 62 32 Q56 38 50 35Z" fill="#e2e8f0" opacity="0.9" stroke="#94a3b8" strokeWidth="0.8"/>
      <path d="M28 55 Q34 52 38 58 Q32 64 28 61Z" fill="#e2e8f0" opacity="0.85" stroke="#94a3b8" strokeWidth="0.8"/>
      <path d="M48 62 Q55 59 58 65 Q53 70 48 67Z" fill="#e2e8f0" opacity="0.8" stroke="#94a3b8" strokeWidth="0.8"/>
      {/* Con bọ trĩ — thon dài ~1mm, màu vàng nâu */}
      {([[35,30,-20],[55,35,10],[32,65,5],[50,70,-15]] as [number,number,number][]).map(([cx,cy,rot],i) => (
        <g key={i} transform={`translate(${cx},${cy}) rotate(${rot})`}>
          <ellipse cx="0" cy="0" rx="5.5" ry="1.5" fill="#a16207" opacity="0.9"/>
          <circle cx="-4.5" cy="0" r="1.8" fill="#78350f"/>
          {/* Cánh viền đặc trưng của bọ trĩ */}
          <path d="M-1,-1.5 L4,-3.5 L5,-1.5Z" fill="#fde68a" opacity="0.7" stroke="#ca8a04" strokeWidth="0.3"/>
          <path d="M-1,1.5 L4,3.5 L5,1.5Z" fill="#fde68a" opacity="0.7" stroke="#ca8a04" strokeWidth="0.3"/>
          {/* Râu dài */}
          <line x1="-5.5" y1="-1" x2="-8" y2="-3.5" stroke="#78350f" strokeWidth="0.6"/>
          <line x1="-5.5" y1="1" x2="-8" y2="3.5" stroke="#78350f" strokeWidth="0.6"/>
          {/* Chân */}
          <line x1="-2" y1="1.5" x2="-3" y2="3.5" stroke="#92400e" strokeWidth="0.5"/>
          <line x1="1" y1="1.5" x2="1" y2="3.5" stroke="#92400e" strokeWidth="0.5"/>
          <line x1="3" y1="1.5" x2="4" y2="3.5" stroke="#92400e" strokeWidth="0.5"/>
        </g>
      ))}
    </svg>
  );
}

function LeafSnails() {
  return (
    <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M40 90 C20 70 10 45 15 20 C20 5 40 2 40 2 C40 2 60 5 65 20 C70 45 60 70 40 90Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1.5"/>
      <path d="M40 85 L40 8" stroke="#16a34a" strokeWidth="1" opacity="0.4"/>
      <ellipse cx="30" cy="40" rx="8" ry="6" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="3,2"/>
      <ellipse cx="30" cy="40" rx="8" ry="6" fill="white" opacity="0.6"/>
      <ellipse cx="50" cy="55" rx="6" ry="5" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="3,2"/>
      <ellipse cx="50" cy="55" rx="6" ry="5" fill="white" opacity="0.6"/>
      <ellipse cx="36" cy="68" rx="5" ry="4" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="3,2"/>
      <ellipse cx="36" cy="68" rx="5" ry="4" fill="white" opacity="0.6"/>
      <path d="M20 45 Q35 42 48 52 Q56 58 55 65" stroke="#e2e8f0" strokeWidth="2" opacity="0.8"/>
      <g transform="translate(18,56)">
        <path d="M0,4 Q6,0 12,2 Q12,6 6,7 Q0,7 0,4Z" fill="#a3a3a3" opacity="0.9"/>
        <path d="M8,2 Q14,-2 16,2 Q16,7 10,7 Q6,6 8,2Z" fill="#d6d3d1" stroke="#a8a29e" strokeWidth="0.5"/>
        <path d="M10,3 Q13,1 13,4 Q13,6 10,5Z" fill="#a8a29e" opacity="0.5"/>
        <line x1="1" y1="3" x2="-1" y2="0" stroke="#737373" strokeWidth="0.7"/>
        <line x1="3" y1="2" x2="2" y2="-1" stroke="#737373" strokeWidth="0.7"/>
        <circle cx="-1" cy="0" r="0.8" fill="#404040"/>
        <circle cx="2" cy="-1" r="0.8" fill="#404040"/>
      </g>
    </svg>
  );
}

// ─── Component hiển thị ảnh thật + fallback SVG ──────────────────────────────

function DiseaseImage({ id, Illustration, size = 'sm' }: {
  id: string;
  Illustration: () => React.ReactElement;
  size?: 'sm' | 'lg';
}) {
  const [imgError, setImgError] = useState(false);
  const src = `${import.meta.env.BASE_URL}diseases/${id}.jpg`;
  const cls = size === 'lg'
    ? 'w-full h-full object-cover'
    : 'w-full h-full object-cover';

  if (!imgError) {
    return <img src={src} alt={id} className={cls} onError={() => setImgError(true)} />;
  }
  return <Illustration />;
}

function DiseaseGallery({ id, Illustration }: {
  id: string;
  Illustration: () => React.ReactElement;
}) {
  const [active, setActive] = useState(0);
  const [errors, setErrors] = useState<boolean[]>([false, false]);
  const srcs = [`${import.meta.env.BASE_URL}diseases/${id}.jpg`, `${import.meta.env.BASE_URL}diseases/${id}2.jpg`];

  const handleError = (i: number) => {
    const next = [...errors];
    next[i] = true;
    setErrors(next);
  };

  const validSrcs = srcs.filter((_, i) => !errors[i]);

  if (validSrcs.length === 0) {
    return (
      <div className="w-full h-52 flex items-center justify-center p-6">
        <Illustration />
      </div>
    );
  }

  return (
    <div>
      <div className="w-full h-52 bg-black overflow-hidden">
        {srcs.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`${id}-${i}`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${active === i && !errors[i] ? 'block' : 'hidden'}`}
            onError={() => handleError(i)}
          />
        ))}
        {/* nếu ảnh active bị lỗi, tự chuyển sang ảnh kế */}
        {errors[active] && !errors[1 - active] && (() => { setTimeout(() => setActive(1 - active), 0); return null; })()}
      </div>
      {/* Dot chọn ảnh — chỉ hiện nếu có >= 2 ảnh hợp lệ */}
      {validSrcs.length >= 2 && (
        <div className="flex justify-center gap-2 py-2">
          {srcs.map((_, i) => !errors[i] && (
            <button key={i} onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-all ${active === i ? 'bg-green-500 w-4' : 'bg-gray-300'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

function getDiseases(t: any) {
  return [
  {
    id: 'black-rot',
    Illustration: LeafBlackRot,
    nameVi: t('diseases.blackRot.name'), name: 'Black Rot',
    tagColor: 'bg-red-100 text-red-700', headerBg: 'from-red-50 to-red-100',
    accentColor: 'text-red-700', borderColor: 'border-red-200',
    symptoms: [
      t('diseases.blackRot.symptoms.0'),
      t('diseases.blackRot.symptoms.1'),
      t('diseases.blackRot.symptoms.2'),
      t('diseases.blackRot.symptoms.3'),
    ],
    causes: [
      t('diseases.blackRot.causes.0'),
      t('diseases.blackRot.causes.1'),
      t('diseases.blackRot.causes.2'),
    ],
    treatment: [
      t('diseases.blackRot.treatment.0'),
      t('diseases.blackRot.treatment.1'),
      t('diseases.blackRot.treatment.2'),
      t('diseases.blackRot.treatment.3'),
    ],
    prevention: [
      t('diseases.blackRot.prevention.0'),
      t('diseases.blackRot.prevention.1'),
      t('diseases.blackRot.prevention.2'),
    ],
  },
  {
    id: 'crown-rot',
    Illustration: LeafCrownRot,
    nameVi: t('diseases.crownRot.name'), name: 'Crown Rot',
    tagColor: 'bg-orange-100 text-orange-700', headerBg: 'from-orange-50 to-orange-100',
    accentColor: 'text-orange-700', borderColor: 'border-orange-200',
    symptoms: [
      t('diseases.crownRot.symptoms.0'),
      t('diseases.crownRot.symptoms.1'),
      t('diseases.crownRot.symptoms.2'),
      t('diseases.crownRot.symptoms.3'),
    ],
    causes: [
      t('diseases.crownRot.causes.0'),
      t('diseases.crownRot.causes.1'),
      t('diseases.crownRot.causes.2'),
    ],
    treatment: [
      t('diseases.crownRot.treatment.0'),
      t('diseases.crownRot.treatment.1'),
      t('diseases.crownRot.treatment.2'),
      t('diseases.crownRot.treatment.3'),
    ],
    prevention: [
      t('diseases.crownRot.prevention.0'),
      t('diseases.crownRot.prevention.1'),
      t('diseases.crownRot.prevention.2'),
    ],
  },
  {
    id: 'leaf-spot',
    Illustration: LeafSpot,
    nameVi: t('diseases.leafSpot.name'), name: 'Leaf Spot',
    tagColor: 'bg-yellow-100 text-yellow-700', headerBg: 'from-yellow-50 to-yellow-100',
    accentColor: 'text-yellow-700', borderColor: 'border-yellow-200',
    symptoms: [
      t('diseases.leafSpot.symptoms.0'),
      t('diseases.leafSpot.symptoms.1'),
      t('diseases.leafSpot.symptoms.2'),
      t('diseases.leafSpot.symptoms.3'),
    ],
    causes: [
      t('diseases.leafSpot.causes.0'),
      t('diseases.leafSpot.causes.1'),
      t('diseases.leafSpot.causes.2'),
    ],
    treatment: [
      t('diseases.leafSpot.treatment.0'),
      t('diseases.leafSpot.treatment.1'),
      t('diseases.leafSpot.treatment.2'),
      t('diseases.leafSpot.treatment.3'),
    ],
    prevention: [
      t('diseases.leafSpot.prevention.0'),
      t('diseases.leafSpot.prevention.1'),
      t('diseases.leafSpot.prevention.2'),
    ],
  },
  {
    id: 'blight',
    Illustration: LeafBlight,
    nameVi: t('diseases.blight.name'), name: 'Leaf Blight',
    tagColor: 'bg-amber-100 text-amber-700', headerBg: 'from-amber-50 to-amber-100',
    accentColor: 'text-amber-700', borderColor: 'border-amber-200',
    symptoms: [
      t('diseases.blight.symptoms.0'),
      t('diseases.blight.symptoms.1'),
      t('diseases.blight.symptoms.2'),
      t('diseases.blight.symptoms.3'),
    ],
    causes: [
      t('diseases.blight.causes.0'),
      t('diseases.blight.causes.1'),
      t('diseases.blight.causes.2'),
    ],
    treatment: [
      t('diseases.blight.treatment.0'),
      t('diseases.blight.treatment.1'),
      t('diseases.blight.treatment.2'),
      t('diseases.blight.treatment.3'),
    ],
    prevention: [
      t('diseases.blight.prevention.0'),
      t('diseases.blight.prevention.1'),
      t('diseases.blight.prevention.2'),
    ],
  },
  {
    id: 'rust',
    Illustration: LeafRust,
    nameVi: t('diseases.rust.name'), name: 'Leaf Rust',
    tagColor: 'bg-orange-100 text-orange-800', headerBg: 'from-orange-50 to-amber-100',
    accentColor: 'text-orange-800', borderColor: 'border-orange-300',
    symptoms: [
      t('diseases.rust.symptoms.0'),
      t('diseases.rust.symptoms.1'),
      t('diseases.rust.symptoms.2'),
      t('diseases.rust.symptoms.3'),
    ],
    causes: [
      t('diseases.rust.causes.0'),
      t('diseases.rust.causes.1'),
      t('diseases.rust.causes.2'),
    ],
    treatment: [
      t('diseases.rust.treatment.0'),
      t('diseases.rust.treatment.1'),
      t('diseases.rust.treatment.2'),
      t('diseases.rust.treatment.3'),
    ],
    prevention: [
      t('diseases.rust.prevention.0'),
      t('diseases.rust.prevention.1'),
      t('diseases.rust.prevention.2'),
    ],
  },
  {
    id: 'yellowing',
    Illustration: LeafYellowing,
    nameVi: t('diseases.yellowing.name'), name: 'Chlorosis / Nutrient Deficiency',
    tagColor: 'bg-yellow-100 text-yellow-800', headerBg: 'from-yellow-50 to-lime-100',
    accentColor: 'text-yellow-800', borderColor: 'border-yellow-300',
    symptoms: [
      t('diseases.yellowing.symptoms.0'),
      t('diseases.yellowing.symptoms.1'),
      t('diseases.yellowing.symptoms.2'),
      t('diseases.yellowing.symptoms.3'),
    ],
    causes: [
      t('diseases.yellowing.causes.0'),
      t('diseases.yellowing.causes.1'),
      t('diseases.yellowing.causes.2'),
      t('diseases.yellowing.causes.3'),
    ],
    treatment: [
      t('diseases.yellowing.treatment.0'),
      t('diseases.yellowing.treatment.1'),
      t('diseases.yellowing.treatment.2'),
      t('diseases.yellowing.treatment.3'),
    ],
    prevention: [
      t('diseases.yellowing.prevention.0'),
      t('diseases.yellowing.prevention.1'),
      t('diseases.yellowing.prevention.2'),
      t('diseases.yellowing.prevention.3'),
    ],
  },
  {
    id: 'virus',
    Illustration: LeafVirus,
    nameVi: t('diseases.virus.name'), name: 'Orchid Mosaic Virus (CyMV)',
    tagColor: 'bg-purple-100 text-purple-700', headerBg: 'from-purple-50 to-violet-100',
    accentColor: 'text-purple-700', borderColor: 'border-purple-200',
    symptoms: [
      t('diseases.virus.symptoms.0'),
      t('diseases.virus.symptoms.1'),
      t('diseases.virus.symptoms.2'),
      t('diseases.virus.symptoms.3'),
    ],
    causes: [
      t('diseases.virus.causes.0'),
      t('diseases.virus.causes.1'),
      t('diseases.virus.causes.2'),
      t('diseases.virus.causes.3'),
    ],
    treatment: [
      t('diseases.virus.treatment.0'),
      t('diseases.virus.treatment.1'),
      t('diseases.virus.treatment.2'),
    ],
    prevention: [
      t('diseases.virus.prevention.0'),
      t('diseases.virus.prevention.1'),
      t('diseases.virus.prevention.2'),
      t('diseases.virus.prevention.3'),
    ],
  },
  {
    id: 'fusarium',
    Illustration: LeafFusarium,
    nameVi: t('diseases.fusarium.name'), name: 'Fusarium Wilt',
    tagColor: 'bg-pink-100 text-pink-700', headerBg: 'from-pink-50 to-rose-100',
    accentColor: 'text-pink-700', borderColor: 'border-pink-200',
    symptoms: [
      t('diseases.fusarium.symptoms.0'),
      t('diseases.fusarium.symptoms.1'),
      t('diseases.fusarium.symptoms.2'),
      t('diseases.fusarium.symptoms.3'),
    ],
    causes: [
      t('diseases.fusarium.causes.0'),
      t('diseases.fusarium.causes.1'),
      t('diseases.fusarium.causes.2'),
      t('diseases.fusarium.causes.3'),
    ],
    treatment: [
      t('diseases.fusarium.treatment.0'),
      t('diseases.fusarium.treatment.1'),
      t('diseases.fusarium.treatment.2'),
      t('diseases.fusarium.treatment.3'),
    ],
    prevention: [
      t('diseases.fusarium.prevention.0'),
      t('diseases.fusarium.prevention.1'),
      t('diseases.fusarium.prevention.2'),
      t('diseases.fusarium.prevention.3'),
    ],
  },
  {
    id: 'anthracnose',
    Illustration: LeafAnthracnose,
    nameVi: t('diseases.anthracnose.name'), name: 'Anthracnose',
    tagColor: 'bg-gray-200 text-gray-800', headerBg: 'from-gray-50 to-slate-100',
    accentColor: 'text-gray-800', borderColor: 'border-gray-200',
    symptoms: [
      t('diseases.anthracnose.symptoms.0'),
      t('diseases.anthracnose.symptoms.1'),
      t('diseases.anthracnose.symptoms.2'),
      t('diseases.anthracnose.symptoms.3'),
    ],
    causes: [
      t('diseases.anthracnose.causes.0'),
      t('diseases.anthracnose.causes.1'),
      t('diseases.anthracnose.causes.2'),
    ],
    treatment: [
      t('diseases.anthracnose.treatment.0'),
      t('diseases.anthracnose.treatment.1'),
      t('diseases.anthracnose.treatment.2'),
      t('diseases.anthracnose.treatment.3'),
    ],
    prevention: [
      t('diseases.anthracnose.prevention.0'),
      t('diseases.anthracnose.prevention.1'),
      t('diseases.anthracnose.prevention.2'),
    ],
  },
  {
    id: 'bacterial-rot',
    Illustration: LeafBacterialRot,
    nameVi: t('diseases.bacterialRot.name'), name: 'Bacterial Soft Rot',
    tagColor: 'bg-lime-100 text-lime-800', headerBg: 'from-lime-50 to-green-100',
    accentColor: 'text-lime-800', borderColor: 'border-lime-200',
    symptoms: [
      t('diseases.bacterialRot.symptoms.0'),
      t('diseases.bacterialRot.symptoms.1'),
      t('diseases.bacterialRot.symptoms.2'),
      t('diseases.bacterialRot.symptoms.3'),
    ],
    causes: [
      t('diseases.bacterialRot.causes.0'),
      t('diseases.bacterialRot.causes.1'),
      t('diseases.bacterialRot.causes.2'),
      t('diseases.bacterialRot.causes.3'),
    ],
    treatment: [
      t('diseases.bacterialRot.treatment.0'),
      t('diseases.bacterialRot.treatment.1'),
      t('diseases.bacterialRot.treatment.2'),
      t('diseases.bacterialRot.treatment.3'),
    ],
    prevention: [
      t('diseases.bacterialRot.prevention.0'),
      t('diseases.bacterialRot.prevention.1'),
      t('diseases.bacterialRot.prevention.2'),
      t('diseases.bacterialRot.prevention.3'),
    ],
  },
];
}

function getPests(t: any) {
  return [
  {
    id: 'spider-mites',
    Illustration: LeafSpiderMites,
    nameVi: t('pests.spiderMites.name'), name: 'Spider Mites',
    tagColor: 'bg-red-100 text-red-700', headerBg: 'from-red-50 to-red-100',
    accentColor: 'text-red-700', borderColor: 'border-red-200',
    description: t('pests.spiderMites.description'),
    symptoms: [
      t('pests.spiderMites.symptoms.0'),
      t('pests.spiderMites.symptoms.1'),
      t('pests.spiderMites.symptoms.2'),
      t('pests.spiderMites.symptoms.3'),
    ],
    treatment: [
      t('pests.spiderMites.treatment.0'),
      t('pests.spiderMites.treatment.1'),
      t('pests.spiderMites.treatment.2'),
      t('pests.spiderMites.treatment.3'),
    ],
    prevention: [
      t('pests.spiderMites.prevention.0'),
      t('pests.spiderMites.prevention.1'),
      t('pests.spiderMites.prevention.2'),
    ],
  },
  {
    id: 'ruoi-chit',
    Illustration: LeafFlowerFly,
    nameVi: t('pests.flowerFly.name'), name: 'Flower Fly / Blossom Midge',
    tagColor: 'bg-amber-100 text-amber-700', headerBg: 'from-amber-50 to-orange-100',
    accentColor: 'text-amber-700', borderColor: 'border-amber-200',
    description: t('pests.flowerFly.description'),
    symptoms: [
      t('pests.flowerFly.symptoms.0'),
      t('pests.flowerFly.symptoms.1'),
      t('pests.flowerFly.symptoms.2'),
      t('pests.flowerFly.symptoms.3'),
    ],
    causes: [
      t('pests.flowerFly.causes.0'),
      t('pests.flowerFly.causes.1'),
      t('pests.flowerFly.causes.2'),
    ],
    treatment: [
      t('pests.flowerFly.treatment.0'),
      t('pests.flowerFly.treatment.1'),
      t('pests.flowerFly.treatment.2'),
      t('pests.flowerFly.treatment.3'),
    ],
    prevention: [
      t('pests.flowerFly.prevention.0'),
      t('pests.flowerFly.prevention.1'),
      t('pests.flowerFly.prevention.2'),
      t('pests.flowerFly.prevention.3'),
    ],
  },
  {
    id: 'bo-tri',
    Illustration: LeafBoTri,
    nameVi: t('pests.thrips.name'), name: 'Thrips (Frankliniella)',
    tagColor: 'bg-purple-100 text-purple-700', headerBg: 'from-purple-50 to-purple-100',
    accentColor: 'text-purple-700', borderColor: 'border-purple-200',
    description: t('pests.thrips.description'),
    symptoms: [
      t('pests.thrips.symptoms.0'),
      t('pests.thrips.symptoms.1'),
      t('pests.thrips.symptoms.2'),
      t('pests.thrips.symptoms.3'),
    ],
    causes: [
      t('pests.thrips.causes.0'),
      t('pests.thrips.causes.1'),
      t('pests.thrips.causes.2'),
    ],
    treatment: [
      t('pests.thrips.treatment.0'),
      t('pests.thrips.treatment.1'),
      t('pests.thrips.treatment.2'),
      t('pests.thrips.treatment.3'),
    ],
    prevention: [
      t('pests.thrips.prevention.0'),
      t('pests.thrips.prevention.1'),
      t('pests.thrips.prevention.2'),
      t('pests.thrips.prevention.3'),
    ],
  },
  {
    id: 'mealybugs',
    Illustration: LeafMealybugs,
    nameVi: t('pests.mealybugs.name'), name: 'Mealybugs',
    tagColor: 'bg-blue-100 text-blue-700', headerBg: 'from-blue-50 to-blue-100',
    accentColor: 'text-blue-700', borderColor: 'border-blue-200',
    description: t('pests.mealybugs.description'),
    symptoms: [
      t('pests.mealybugs.symptoms.0'),
      t('pests.mealybugs.symptoms.1'),
      t('pests.mealybugs.symptoms.2'),
      t('pests.mealybugs.symptoms.3'),
    ],
    treatment: [
      t('pests.mealybugs.treatment.0'),
      t('pests.mealybugs.treatment.1'),
      t('pests.mealybugs.treatment.2'),
      t('pests.mealybugs.treatment.3'),
    ],
    prevention: [
      t('pests.mealybugs.prevention.0'),
      t('pests.mealybugs.prevention.1'),
      t('pests.mealybugs.prevention.2'),
    ],
  },
  {
    id: 'scale',
    Illustration: LeafScale,
    nameVi: t('pests.scale.name'), name: 'Scale Insects',
    tagColor: 'bg-stone-200 text-stone-700', headerBg: 'from-stone-50 to-stone-100',
    accentColor: 'text-stone-700', borderColor: 'border-stone-200',
    description: t('pests.scale.description'),
    symptoms: [
      t('pests.scale.symptoms.0'),
      t('pests.scale.symptoms.1'),
      t('pests.scale.symptoms.2'),
      t('pests.scale.symptoms.3'),
    ],
    treatment: [
      t('pests.scale.treatment.0'),
      t('pests.scale.treatment.1'),
      t('pests.scale.treatment.2'),
      t('pests.scale.treatment.3'),
    ],
    prevention: [
      t('pests.scale.prevention.0'),
      t('pests.scale.prevention.1'),
      t('pests.scale.prevention.2'),
    ],
  },
  {
    id: 'snails',
    Illustration: LeafSnails,
    nameVi: t('pests.snails.name'), name: 'Snails & Slugs',
    tagColor: 'bg-green-100 text-green-700', headerBg: 'from-green-50 to-green-100',
    accentColor: 'text-green-700', borderColor: 'border-green-200',
    description: t('pests.snails.description'),
    symptoms: [
      t('pests.snails.symptoms.0'),
      t('pests.snails.symptoms.1'),
      t('pests.snails.symptoms.2'),
      t('pests.snails.symptoms.3'),
    ],
    treatment: [
      t('pests.snails.treatment.0'),
      t('pests.snails.treatment.1'),
      t('pests.snails.treatment.2'),
      t('pests.snails.treatment.3'),
    ],
    prevention: [
      t('pests.snails.prevention.0'),
      t('pests.snails.prevention.1'),
      t('pests.snails.prevention.2'),
    ],
  },
];
}

type Item = ReturnType<typeof getDiseases>[0] | ReturnType<typeof getPests>[0];

function getSections(t: any) {
  return [
    { key: 'symptoms',   title: t('diseases.sections.symptoms'), icon: '🔍', color: 'text-red-600',    bg: 'bg-red-50',    dot: 'bg-red-400' },
    { key: 'causes',     title: t('diseases.sections.causes'),   icon: '⚠️', color: 'text-orange-600', bg: 'bg-orange-50', dot: 'bg-orange-400' },
    { key: 'treatment',  title: t('diseases.sections.treatment'), icon: '💊', color: 'text-blue-600',   bg: 'bg-blue-50',   dot: 'bg-blue-400' },
    { key: 'prevention', title: t('diseases.sections.prevention'), icon: '🛡️', color: 'text-green-600',  bg: 'bg-green-50',  dot: 'bg-green-400' },
  ] as const;
}

export default function DiseasesPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'disease' | 'pest'>('disease');
  const [selected, setSelected] = useState<Item | null>(null);
  const [showDiagnose, setShowDiagnose] = useState(false);
  const { products } = useProducts();
  const crop = useActiveCrop();
  // Lan: dùng data cũ (SVG + i18n). Cây khác: dùng data trong crop config.
  const useCropData = crop.id !== 'orchid' && crop.diseases.length > 0;
  const diseases = useCropData ? cropDiseasesToItems(crop.diseases, crop.id, crop.emoji) : getDiseases(t);
  const pests = useCropData ? cropPestsToItems(crop.pests, crop.id, crop.emoji) : getPests(t);
  const SECTIONS = getSections(t);
  const items = tab === 'disease' ? diseases : pests;

  if (selected) {
    return (
      <div className="space-y-4">
        <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-green-600 font-medium text-sm">
          ← {t('diseases.backButton')}
        </button>

        <div className={`rounded-3xl overflow-hidden bg-gradient-to-br ${selected.headerBg} border ${selected.borderColor}`}>
          {/* Ảnh lớn phía trên — gallery 2 ảnh */}
          <div className="w-full bg-black/5 overflow-hidden">
            <DiseaseGallery id={selected.id} Illustration={selected.Illustration} />
          </div>
          {/* Info */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${selected.tagColor}`}>
                {'causes' in selected ? t('diseases.diseaseTag') : t('diseases.pestTag')}
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{selected.nameVi}</h2>
            <p className="text-xs text-gray-500 italic">{selected.name}</p>
            {'description' in selected && (
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{selected.description}</p>
            )}
          </div>
        </div>

        {SECTIONS.map(({ key, title, icon, color, bg, dot }) => {
          const data = (selected as unknown as Record<string, string[]>)[key];
          if (!data) return null;
          return (
            <div key={key} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className={`px-4 py-3 ${bg} flex items-center gap-2`}>
                <span>{icon}</span>
                <h3 className={`font-bold text-sm ${color}`}>{title}</h3>
              </div>
              <ul className="p-4 space-y-2.5">
                {data.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                    <span className={`mt-2 w-2 h-2 rounded-full shrink-0 ${dot}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {/* Sản phẩm liên quan */}
        {(() => {
          const related = products.filter(p => p.diseaseIds.includes(selected.id));
          if (related.length === 0) return null;
          return (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-orange-50 flex items-center gap-2">
                <span>🛒</span>
                <h3 className="font-bold text-sm text-orange-700">{t('diseases.relatedProducts')}</h3>
              </div>
              <div className="p-3 space-y-2">
                {related.map(p => (
                  <a key={p.id} href={p.shopUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 active:scale-95 transition-transform">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white shrink-0 border border-gray-100">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        : <span className="w-full h-full flex items-center justify-center text-2xl">🧴</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{p.name}</p>
                      {p.price && <p className="text-green-600 font-bold text-sm mt-0.5">{p.price}</p>}
                    </div>
                    <span className="shrink-0 text-xs bg-gradient-to-r from-[#fe2c55] to-[#ff6550] text-white px-2 py-1 rounded-lg font-semibold">
                      {t('diseases.buyButton')}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          );
        })()}
        <div className="h-4" />
      </div>
    );
  }

  return (
    <>
    {showDiagnose && <DiagnoseModal onClose={() => setShowDiagnose(false)} />}
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('diseases.title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('diseases.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowDiagnose(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-transform"
        >
          🔬 {t('diseases.diagnoseButton')}
        </button>
      </div>

      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        <button onClick={() => setTab('disease')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'disease' ? 'bg-white shadow-sm text-green-700' : 'text-gray-400'}`}>
          🦠 {t('diseases.diseaseTab', { count: diseases.length })}
        </button>
        <button onClick={() => setTab('pest')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'pest' ? 'bg-white shadow-sm text-green-700' : 'text-gray-400'}`}>
          🐛 {t('diseases.pestTab', { count: pests.length })}
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item: Item) => (
            <button key={item.id} onClick={() => setSelected(item)}
              className="w-full text-left bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex items-stretch">
              <div className={`w-24 h-24 shrink-0 bg-gradient-to-br ${item.headerBg} overflow-hidden`}>
                <DiseaseImage id={item.id} Illustration={item.Illustration} size="sm" />
              </div>
              <div className="flex-1 p-3 min-w-0 flex flex-col justify-center gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm">{item.nameVi}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.tagColor}`}>
                    {item.name}
                  </span>
                </div>
                {'description' in item && (
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{item.description}</p>
                )}
                <p className="text-xs text-gray-300 leading-relaxed line-clamp-1">🔍 {item.symptoms[0]}</p>
              </div>
              <div className="flex items-center pr-3 text-gray-300 text-lg shrink-0">›</div>
            </button>
        ))}
      </div>
    </div>
    </>
  );
}
