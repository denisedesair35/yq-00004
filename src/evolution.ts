import type { EvolutionStage } from './types';

export const EVOLUTION_STAGES: EvolutionStage[] = [
  {
    name: '青蚨',
    level: 1,
    radius: 15,
    speed: 120,
    color: '#7CB342',
    strokeColor: '#558B2F',
    expRequired: 0,
    description: '低阶昆虫类异兽，形似蝉而色青'
  },
  {
    name: '文鳐鱼',
    level: 2,
    radius: 22,
    speed: 140,
    color: '#29B6F6',
    strokeColor: '#0288D1',
    expRequired: 50,
    description: '鱼身鸟翼，常游于东海'
  },
  {
    name: '狰',
    level: 3,
    radius: 30,
    speed: 150,
    color: '#EF5350',
    strokeColor: '#C62828',
    expRequired: 150,
    description: '三尾一角，状如赤豹'
  },
  {
    name: '毕方',
    level: 4,
    radius: 38,
    speed: 160,
    color: '#FF7043',
    strokeColor: '#D84315',
    expRequired: 350,
    description: '鸟面人身，一足一翼，火之精也'
  },
  {
    name: '夔牛',
    level: 5,
    radius: 48,
    speed: 130,
    color: '#7E57C2',
    strokeColor: '#4527A0',
    expRequired: 700,
    description: '状如牛，苍身而无角，一足'
  },
  {
    name: '应龙',
    level: 6,
    radius: 60,
    speed: 170,
    color: '#FFD54F',
    strokeColor: '#F57F17',
    expRequired: 1200,
    description: '有翼之龙，主司风雨雷电'
  },
  {
    name: '烛龙',
    level: 7,
    radius: 75,
    speed: 150,
    color: '#AB47BC',
    strokeColor: '#6A1B9A',
    expRequired: 2000,
    description: '钟山之神，人面蛇身，昼开夜合'
  }
];

export const getStageByLevel = (level: number): EvolutionStage => {
  const stage = EVOLUTION_STAGES.find(s => s.level === level);
  if (!stage) {
    return EVOLUTION_STAGES[EVOLUTION_STAGES.length - 1];
  }
  return stage;
};

export const getNextStage = (currentLevel: number): EvolutionStage | null => {
  const nextLevel = currentLevel + 1;
  const nextStage = EVOLUTION_STAGES.find(s => s.level === nextLevel);
  return nextStage || null;
};

export const getMaxLevel = (): number => {
  return EVOLUTION_STAGES[EVOLUTION_STAGES.length - 1].level;
};
