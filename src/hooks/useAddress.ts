import { useState, useEffect } from 'react';

const BASE = 'https://provinces.open-api.vn/api/v1';

interface Region { code: number; name: string; }

export function useAddress() {
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [wards, setWards]         = useState<Region[]>([]);
  const [loadingWards, setLoadingWards] = useState(false);

  const [province, setProvince] = useState<Region | null>(null);
  const [ward, setWard]         = useState<Region | null>(null);
  const [customWard, setCustomWard] = useState('');
  const [useCustomWard, setUseCustomWard] = useState(false);
  const [street, setStreet]     = useState('');

  useEffect(() => {
    fetch(`${BASE}/?depth=1`)
      .then(r => r.json())
      .then((data: Region[]) => {
        const cleaned = data.map(p => ({
          code: p.code,
          name: p.name.replace(/^(Tỉnh|Thành phố)\s+/i, ''),
        }));
        setProvinces(cleaned);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!province) { setWards([]); setWard(null); return; }
    setLoadingWards(true);
    fetch(`${BASE}/p/${province.code}?depth=2`)
      .then(r => r.json())
      .then(async (d) => {
        const districts = d.districts ?? [];
        const allWards: Region[] = [];

        // Fetch wards for each district
        for (const dist of districts) {
          try {
            const wardRes = await fetch(`${BASE}/d/${dist.code}?depth=2`);
            const wardData = await wardRes.json();
            const wards = wardData.wards ?? [];
            wards.forEach((w: any) => {
              allWards.push({
                code: w.code,
                name: w.name.replace(/^(Phường|Xã|Thị trấn)\s+/i, ''),
              });
            });
          } catch (err) {
            console.error('Failed to fetch wards for district', dist.code, err);
          }
        }

        setWards(allWards);
        setLoadingWards(false);
      })
      .catch((err) => {
        console.error('Failed to fetch wards:', err);
        setLoadingWards(false);
      });
    setWard(null);
  }, [province]);

  const wardName = useCustomWard ? customWard : ward?.name;
  const fullAddress = [street, wardName, province?.name]
    .filter(Boolean).join(', ');

  const reset = () => {
    setProvince(null); setWard(null); setCustomWard(''); setUseCustomWard(false); setStreet('');
  };

  return {
    provinces, wards, loadingWards,
    province, setProvince,
    ward, setWard,
    customWard, setCustomWard,
    useCustomWard, setUseCustomWard,
    street, setStreet,
    fullAddress, reset,
  };
}
