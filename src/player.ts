import type { Position, PlayerState, InputState, EvolutionStage } from './types';
import { getStageByLevel, getNextStage, getMaxLevel } from './evolution';

export class Player {
  private state: PlayerState;
  private mapWidth: number;
  private mapHeight: number;

  constructor(mapWidth: number, mapHeight: number) {
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    const initialStage = getStageByLevel(1);
    this.state = {
      position: {
        x: mapWidth / 2,
        y: mapHeight / 2
      },
      stage: initialStage,
      exp: 0,
      devourCount: 0
    };
  }

  public update(deltaTime: number, input: InputState): void {
    const stage = this.state.stage;
    const speed = stage.speed;
    let dx = 0;
    let dy = 0;

    if (input.up) dy -= 1;
    if (input.down) dy += 1;
    if (input.left) dx -= 1;
    if (input.right) dx += 1;

    if (dx !== 0 && dy !== 0) {
      const factor = 1 / Math.sqrt(2);
      dx *= factor;
      dy *= factor;
    }

    const newX = this.state.position.x + dx * speed * deltaTime;
    const newY = this.state.position.y + dy * speed * deltaTime;

    this.state.position.x = Math.max(stage.radius, Math.min(this.mapWidth - stage.radius, newX));
    this.state.position.y = Math.max(stage.radius, Math.min(this.mapHeight - stage.radius, newY));
  }

  public addExp(amount: number): boolean {
    this.state.exp += amount;
    this.state.devourCount += 1;

    const nextStage = getNextStage(this.state.stage.level);
    if (nextStage && this.state.exp >= nextStage.expRequired) {
      this.evolve();
      return true;
    }
    return false;
  }

  private evolve(): void {
    const nextLevel = this.state.stage.level + 1;
    if (nextLevel <= getMaxLevel()) {
      this.state.stage = getStageByLevel(nextLevel);
    }
  }

  public canDevour(targetLevel: number): boolean {
    return targetLevel <= this.state.stage.level;
  }

  public getPosition(): Position {
    return { ...this.state.position };
  }

  public getStage(): EvolutionStage {
    return { ...this.state.stage };
  }

  public getExp(): number {
    return this.state.exp;
  }

  public getDevourCount(): number {
    return this.state.devourCount;
  }

  public getRadius(): number {
    return this.state.stage.radius;
  }

  public getLevel(): number {
    return this.state.stage.level;
  }

  public getExpProgress(): number {
    const currentStage = this.state.stage;
    const nextStage = getNextStage(currentStage.level);
    
    if (!nextStage) {
      return 1;
    }
    
    const expIntoCurrent = this.state.exp - currentStage.expRequired;
    const expNeeded = nextStage.expRequired - currentStage.expRequired;
    
    return Math.min(1, Math.max(0, expIntoCurrent / expNeeded));
  }

  public reset(): void {
    const initialStage = getStageByLevel(1);
    this.state = {
      position: {
        x: this.mapWidth / 2,
        y: this.mapHeight / 2
      },
      stage: initialStage,
      exp: 0,
      devourCount: 0
    };
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const { position, stage } = this.state;

    ctx.save();

    const gradient = ctx.createRadialGradient(
      position.x, position.y, 0,
      position.x, position.y, stage.radius * 1.5
    );
    gradient.addColorStop(0, stage.color + '80');
    gradient.addColorStop(1, stage.color + '00');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(position.x, position.y, stage.radius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = stage.color;
    ctx.strokeStyle = stage.strokeColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(position.x, position.y, stage.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stage.name, position.x, position.y);

    ctx.restore();
  }
}
