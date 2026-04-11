import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GatoMiaConfig, FunnelStage, DEFAULT_CONFIG } from '@/types/settings';

const CONFIG_DOC_ID = 'config';
const SETTINGS_COLLECTION = 'settings';

export async function getConfig(): Promise<GatoMiaConfig> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, CONFIG_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_CONFIG, ...snap.data() } as GatoMiaConfig;
    }
  } catch (error) {
    console.error("Erro ao buscar config:", error);
  }
  return DEFAULT_CONFIG;
}

export async function saveConfig(config: Partial<GatoMiaConfig>): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, CONFIG_DOC_ID);
    const currentConfig = await getConfig();
    const newConfig = { ...currentConfig, ...config, updatedAt: serverTimestamp() };
    await setDoc(docRef, newConfig, { merge: true });
  } catch (error) {
    console.error("Erro ao salvar config:", error);
    throw error;
  }
}

export async function getFunnelStages(): Promise<FunnelStage[]> {
  const config = await getConfig();
  return config.funnel_stages.sort((a, b) => a.order - b.order);
}

export function useConfig() {
  const [config, setConfig] = useState<GatoMiaConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, SETTINGS_COLLECTION, CONFIG_DOC_ID);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setConfig({ ...DEFAULT_CONFIG, ...snap.data() } as GatoMiaConfig);
      } else {
        setConfig(DEFAULT_CONFIG);
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro no onSnapshot config:", error);
      setConfig(DEFAULT_CONFIG);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const save = async (newConfig: Partial<GatoMiaConfig>) => {
    await saveConfig(newConfig);
  };

  return { config, loading, save };
}
