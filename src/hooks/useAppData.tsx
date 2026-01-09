import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface Task {
  id: number;
  title: string;
  icon: string;
  duration: number;
  completed: boolean;
  visible_to_child: boolean;
}

export interface Reward {
  id: number;
  title: string;
  cost: number;
  icon: string;
  duration?: number; // Duration in minutes
}

export interface HistoryLog {
  id: string; // UUID or timestamp string
  type: 'task_completed' | 'reward_redeemed' | 'manual_adjustment';
  title: string;
  points: number; // Positive for tasks, negative for rewards
  timestamp: string; // ISO string
}

export interface AppState {
  theme: string;
  childName: string;
  stars: number;
  soundEnabled: boolean;
  currentFeeling: string | null;
  routine: Task[];
  rewards: Reward[];
  history: HistoryLog[];
}

const DEFAULT_ROUTINE: Task[] = [
  { id: 1, title: 'Café da Manhã', icon: 'fa-mug-hot', duration: 15, completed: false, visible_to_child: true },
  { id: 2, title: 'Escola', icon: 'fa-school', duration: 240, completed: false, visible_to_child: true },
  { id: 3, title: 'Almoço', icon: 'fa-utensils', duration: 30, completed: false, visible_to_child: true },
  { id: 4, title: 'Banho', icon: 'fa-bath', duration: 20, completed: false, visible_to_child: true },
  { id: 5, title: 'Dormir', icon: 'fa-bed', duration: 600, completed: false, visible_to_child: true },
];

const DEFAULT_REWARDS: Reward[] = [
  { id: 1, title: '15min de Tablet', cost: 3, icon: 'fa-tablet-screen-button', duration: 15 },
  { id: 2, title: 'Escolher o Jantar', cost: 5, icon: 'fa-utensils', duration: 0 },
  { id: 3, title: 'Passeio no Parque', cost: 10, icon: 'fa-tree', duration: 60 },
  { id: 4, title: 'Brinquedo Pequeno', cost: 20, icon: 'fa-gift', duration: 0 }
];

export function useAppData() {
  const { user } = useAuth();
  const [state, setState] = useState<AppState>({
    theme: 'theme-blue',
    childName: '',
    stars: 5,
    soundEnabled: true,
    currentFeeling: null,
    routine: DEFAULT_ROUTINE,
    rewards: DEFAULT_REWARDS,
    history: []
  });
  const [loading, setLoading] = useState(true);

  // Load data from Supabase
  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('app_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading data:', error);
      }

      if (data) {
        setState({
          theme: data.theme || 'theme-blue',
          childName: data.child_name || '',
          stars: data.stars ?? 5,
          soundEnabled: data.sound_enabled ?? true,
          currentFeeling: data.current_feeling,
          routine: data.routine || DEFAULT_ROUTINE,
          rewards: data.rewards || DEFAULT_REWARDS,
          history: data.history || []
        });
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save data to Supabase
  const saveData = useCallback(async (newState: AppState) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('app_data')
        .upsert({
          user_id: user.id,
          theme: newState.theme,
          child_name: newState.childName,
          stars: newState.stars,
          sound_enabled: newState.soundEnabled,
          current_feeling: newState.currentFeeling,
          routine: newState.routine,
          rewards: newState.rewards,
          history: newState.history,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) console.error('Error saving:', error);
    } catch (err) {
      console.error('Error:', err);
    }
  }, [user]);

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      saveData(newState);
      return newState;
    });
  }, [saveData]);

  return { state, updateState, loading, loadData };
}
