import type { EvolutionStage } from './types';

export interface UIState {
  stageName: string;
  level: number;
  exp: number;
  expProgress: number;
  devourCount: number;
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

    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(padding, padding, 220, 130);

    ctx.strokeStyle = '#FFD54F';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding, padding, 220, 130);

    ctx.fillStyle = '#FFD54F';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`【${state.stageName}】`, padding + 12, padding + 12);

    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.fillText(`等级: ${state.level}`, padding + 12, padding + 40);

    ctx.fillStyle = '#aaa';
    ctx.font = '12px sans-serif';
    ctx.fillText(`经验: ${Math.floor(state.exp)}`, padding + 12, padding + 62);

    const expBarWidth = 196;
    const expBarHeight = 14;
    const expBarX = padding + 12;
    const expBarY = padding + 82;

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

    if (state.nextStage) {
      ctx.fillStyle = '#90CAF9';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`→ ${state.nextStage.name}`, padding + 208, padding + 62);
    } else {
      ctx.fillStyle = '#90CAF9';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('已满级', padding + 208, padding + 62);
    }

    ctx.fillStyle = '#A5D6A7';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`吞噬: ${state.devourCount} 只`, padding + 12, padding + 104);

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
