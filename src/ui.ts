import type { EvolutionStage } from './types';

export interface UIState {
  stageName: string;
  level: number;
  exp: number;
  expProgress: number;
  devourCount: number;
  health: number;
  maxHealth: number;
  healthProgress: number;
  isRunning: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  nextStage: EvolutionStage | null;
}

export class UIRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  public render(state: UIState): void {
    this.renderHUD(state);
    
    if (!state.isRunning && !state.isPaused) {
      this.renderStartScreen();
    } else if (state.isPaused) {
      this.renderPauseScreen();
    }
  }

  private renderHUD(state: UIState): void {
    const ctx = this.ctx;
    const padding = 20;
    const panelWidth = 220;
    const panelHeight = 175;

    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(padding, padding, panelWidth, panelHeight);

    ctx.strokeStyle = '#FFD54F';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, padding, panelWidth, panelHeight);

    ctx.fillStyle = '#FFD54F';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`【${state.stageName}】`, padding + 12, padding + 12);

    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.fillText(`等级: ${state.level}`, padding + 12, padding + 40);

    const healthBarWidth = 196;
    const healthBarHeight = 14;
    const healthBarX = padding + 12;
    const healthBarY = padding + 62;

    ctx.fillStyle = '#333';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    const healthGradient = ctx.createLinearGradient(healthBarX, healthBarY, healthBarX, healthBarY + healthBarHeight);
    if (state.healthProgress > 0.5) {
      healthGradient.addColorStop(0, '#81C784');
      healthGradient.addColorStop(1, '#388E3C');
    } else if (state.healthProgress > 0.25) {
      healthGradient.addColorStop(0, '#FFB74D');
      healthGradient.addColorStop(1, '#F57C00');
    } else {
      healthGradient.addColorStop(0, '#E57373');
      healthGradient.addColorStop(1, '#D32F2F');
    }
    ctx.fillStyle = healthGradient;
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth * state.healthProgress, healthBarHeight);

    ctx.strokeStyle = '#E53935';
    ctx.lineWidth = 1;
    ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`生命 ${Math.floor(state.health)} / ${state.maxHealth}`, healthBarX + healthBarWidth / 2, healthBarY + 2);
    ctx.textAlign = 'left';

    const expBarWidth = 196;
    const expBarHeight = 14;
    const expBarX = padding + 12;
    const expBarY = padding + 88;

    ctx.fillStyle = '#333';
    ctx.fillRect(expBarX, expBarY, expBarWidth, expBarHeight);

    const expGradient = ctx.createLinearGradient(expBarX, expBarY, expBarX, expBarY + expBarHeight);
    expGradient.addColorStop(0, '#FFE082');
    expGradient.addColorStop(1, '#FFA000');
    ctx.fillStyle = expGradient;
    ctx.fillRect(expBarX, expBarY, expBarWidth * state.expProgress, expBarHeight);

    ctx.strokeStyle = '#FFD54F';
    ctx.lineWidth = 1;
    ctx.strokeRect(expBarX, expBarY, expBarWidth, expBarHeight);

    ctx.fillStyle = '#aaa';
    ctx.font = '12px sans-serif';
    ctx.fillText(`经验: ${Math.floor(state.exp)}`, padding + 12, padding + 108);

    if (state.nextStage) {
      ctx.fillStyle = '#90CAF9';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`→ ${state.nextStage.name}`, padding + 208, padding + 108);
    } else {
      ctx.fillStyle = '#90CAF9';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('已满级', padding + 208, padding + 108);
    }

    ctx.fillStyle = '#A5D6A7';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`吞噬: ${state.devourCount} 只`, padding + 12, padding + 148);

    ctx.restore();

    this.renderControlsHint();
  }

  private renderControlsHint(): void {
    const ctx = this.ctx;
    const padding = 20;

    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(this.width - padding - 180, padding, 180, 80);

    ctx.strokeStyle = '#90CAF9';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.width - padding - 180, padding, 180, 80);

    ctx.fillStyle = '#90CAF9';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('操作说明', this.width - padding - 170, padding + 8);

    ctx.fillStyle = '#ccc';
    ctx.font = '12px sans-serif';
    ctx.fillText('WASD / 方向键: 移动', this.width - padding - 170, padding + 30);
    ctx.fillText('空格: 暂停 / 继续', this.width - padding - 170, padding + 50);
    ctx.fillText('R: 重新开始', this.width - padding - 170, padding + 68);

    ctx.restore();
  }

  private renderStartScreen(): void {
    const ctx = this.ctx;
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#FFD54F';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('山海经·吞噬进化', centerX, centerY - 100);

    ctx.fillStyle = '#90CAF9';
    ctx.font = '18px sans-serif';
    ctx.fillText('吞天地灵气，食百兽精魂，化无上神兽', centerX, centerY - 50);

    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText('按 空格键 或 点击 开始游戏', centerX, centerY + 20);

    ctx.fillStyle = '#aaa';
    ctx.font = '14px sans-serif';
    ctx.fillText('WASD/方向键移动 | 吞噬等级不高于你的目标进化', centerX, centerY + 60);

    ctx.restore();
  }

  private renderPauseScreen(): void {
    const ctx = this.ctx;
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#FFD54F';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏暂停', centerX, centerY - 30);

    ctx.fillStyle = '#fff';
    ctx.font = '18px sans-serif';
    ctx.fillText('按 空格键 继续', centerX, centerY + 20);

    ctx.fillStyle = '#aaa';
    ctx.font = '14px sans-serif';
    ctx.fillText('按 R 键重新开始', centerX, centerY + 50);

    ctx.restore();
  }

  public renderEvolveEffect(stageName: string): void {
    const ctx = this.ctx;
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    ctx.save();

    ctx.fillStyle = 'rgba(255, 213, 79, 0.3)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#FFD54F';
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('进化！', centerX, centerY - 30);

    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(stageName, centerX, centerY + 20);

    ctx.restore();
  }
}
