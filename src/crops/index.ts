import { orchidCrop } from './orchid';
import { durianCrop } from './durian';
import type { CropConfig } from './types';
import { useUserProfile } from '../hooks/useUserProfile';

export type { CropConfig, CropDisease, CropPest, MetricKey, Threshold, AdvisorContext } from './types';

export const CROPS: Record<string, CropConfig> = {
  orchid: orchidCrop,
  durian: durianCrop,
};

export const DEFAULT_CROP_ID = 'orchid';

export function getCrop(id?: string): CropConfig {
  return CROPS[id ?? DEFAULT_CROP_ID] ?? CROPS[DEFAULT_CROP_ID];
}

// Danh sách cây để hiển thị nút chọn
export const CROP_LIST = Object.values(CROPS);

// Hook: trả về cấu hình cây đang chọn (mặc định lan cho user cũ)
export function useActiveCrop(): CropConfig {
  const { profile } = useUserProfile();
  return getCrop(profile?.activeCrop);
}
