import type { Target, TargetType, Position } from './types';

const QI_COLORS: Record<number, string> = {
  1: '#E1BEE7',
  2: '#CE93D8',
  3: '#BA68C8',
  4: '#AB47BC',
  5: '#9C27B0',
  6: '#8E24AA',
  7: '#7B1FA2'
};

const BEAST_NAMES: Record<number, string[]> = {
  1: ['蛄', '蜉蝣', '蝼蚁'],
  2: ['山雀', '野兔', '松鼠'],
  3: ['狐狸', '獾', '貉'],
  4: ['豺狼', '山豹', '玄鹤'],
  5: ['玄虎', '赤豹', '青狼'],
  6: ['穷奇幼崽', '饕餮幼子', '梼杌稚形'],
  7: ['圣兽残影', '神兽虚影', '仙兽遗形']
};

const BEAST_COLORS: Record<number, string> = {
  1: '#A5D6A7',
  2: '#81C784',
  3: '#66BB6A',
  4: '#4CAF50',
  5: '#43A047',
  6: '#388E3C',
  7: '#2E7D32'
};

let targetIdCounter = 0;

export const createTarget = (
  type: TargetType,
  level: number,
  position: Position
): Target => {
  targetIdCounter += 1;
  
  if (type === 'qi') {
    return {
      id: targetIdCounter,
      type: 'qi',
      position,
      level,
      radius: 8 + level * 2,
      color: QI_COLORS[level] || QI_COLORS[1],
      expValue: 5 + level * 5,
      name: `${level}阶灵气`
    };
  } else {
    const names = BEAST_NAMES[level] || BEAST_NAMES[1];
    const name = names[Math.floor(Math.random() * names.length)];
    return {
      id: targetIdCounter,
      type: 'beast',
      position,
      level,
      radius: 10 + level * 3,
      color: BEAST_COLORS[level] || BEAST_COLORS[1],
      expValue: 10 + level * 10,
      name
    };
  }
};

export const generateRandomTarget = (
  mapWidth: number,
  mapHeight: number,
  maxLevel: number,
  playerRadius: number,
  playerPosition: Position
): Target => {
  const type: TargetType = Math.random() < 0.6 ? 'qi' : 'beast';
  const level = Math.floor(Math.random() * maxLevel) + 1;
  
  let position: Position;
  let attempts = 0;
  const maxAttempts = 50;
  
  do {
    position = {
      x: Math.random() * (mapWidth - 40) + 20,
      y: Math.random() * (mapHeight - 40) + 20
    };
    attempts += 1;
    
    const dx = position.x - playerPosition.x;
    const dy = position.y - playerPosition.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > playerRadius + 50) {
      break;
    }
  } while (attempts < maxAttempts);
  
  return createTarget(type, level, position);
};

export const generateInitialTargets = (
  mapWidth: number,
  mapHeight: number,
  count: number,
  maxLevel: number,
  playerRadius: number,
  playerPosition: Position
): Target[] => {
  const targets: Target[] = [];
  for (let i = 0; i < count; i++) {
    targets.push(generateRandomTarget(mapWidth, mapHeight, maxLevel, playerRadius, playerPosition));
  }
  return targets;
};

export const renderTarget = (ctx: CanvasRenderingContext2D, target: Target): void => {
  ctx.save();

  if (target.type === 'qi') {
    const gradient = ctx.createRadialGradient(
      target.position.x, target.position.y, 0,
      target.position.x, target.position.y, target.radius * 1.8
    );
    gradient.addColorStop(0, target.color + 'CC');
    gradient.addColorStop(0.5, target.color + '66');
    gradient.addColorStop(1, target.color + '00');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(target.position.x, target.position.y, target.radius * 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = target.color;
    ctx.beginPath();
    ctx.arc(target.position.x, target.position.y, target.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('灵', target.position.x, target.position.y);
  } else {
    ctx.fillStyle = target.color;
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(target.position.x, target.position.y, target.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(target.name, target.position.x, target.position.y);

    ctx.fillStyle = '#FFD54F';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Lv.${target.level}`, target.position.x, target.position.y + target.radius + 12);
  }

  ctx.restore();
};

export const checkCollision = (
  playerPos: Position,
  playerRadius: number,
  target: Target
): boolean => {
  const dx = playerPos.x - target.position.x;
  const dy = playerPos.y - target.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < playerRadius + target.radius * 0.6;
};
