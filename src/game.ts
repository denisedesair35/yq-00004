import type { Target, GameState } from './types';
import { Player } from './player';
import { InputManager } from './input';
import { UIRenderer } from './ui';
import { generateInitialTargets, generateRandomTarget, renderTarget, renderTargetWarning, checkCollision } from './target';
import { getNextStage, getMaxLevel } from './evolution';

const INITIAL_TARGET_COUNT = 25;
const MAP_WIDTH = 1200;
const MAP_HEIGHT = 800;
const WARNING_DURATION = 0.8;

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private inputManager: InputManager;
  private uiRenderer: UIRenderer;
  private targets: Target[] = [];
  private warningTargets: Map<number, number> = new Map();
  private gameState: GameState;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private evolveEffectTimer: number = 0;
  private evolveEffectName: string = '';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.canvas.width = MAP_WIDTH;
    this.canvas.height = MAP_HEIGHT;

    this.player = new Player(MAP_WIDTH, MAP_HEIGHT);
    this.inputManager = new InputManager();
    this.uiRenderer = new UIRenderer(canvas);

    this.gameState = {
      isRunning: false,
      isPaused: false,
      isGameOver: false,
      mapWidth: MAP_WIDTH,
      mapHeight: MAP_HEIGHT
    };

    this.setupEventListeners();
    this.spawnInitialTargets();
    this.render();
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.canvas.addEventListener('click', this.handleClick.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.code === 'Space') {
      e.preventDefault();
      this.togglePause();
    } else if (e.code === 'KeyR') {
      e.preventDefault();
      this.restart();
    }
  }

  private handleClick(): void {
    if (!this.gameState.isRunning && !this.gameState.isPaused) {
      this.start();
    }
  }

  private spawnInitialTargets(): void {
    const playerPos = this.player.getPosition();
    const playerRadius = this.player.getRadius();
    const maxLevel = Math.min(3, getMaxLevel());
    
    this.targets = generateInitialTargets(
      MAP_WIDTH,
      MAP_HEIGHT,
      INITIAL_TARGET_COUNT,
      maxLevel,
      playerRadius,
      playerPos
    );
  }

  public start(): void {
    if (this.gameState.isRunning) return;
    
    this.gameState.isRunning = true;
    this.gameState.isPaused = false;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  public pause(): void {
    if (!this.gameState.isRunning || this.gameState.isPaused) return;
    
    this.gameState.isPaused = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.render();
  }

  public resume(): void {
    if (!this.gameState.isRunning || !this.gameState.isPaused) return;
    
    this.gameState.isPaused = false;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  public togglePause(): void {
    if (!this.gameState.isRunning) {
      this.start();
      return;
    }
    
    if (this.gameState.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  public restart(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.player.reset();
    this.targets = [];
    this.warningTargets.clear();
    this.evolveEffectTimer = 0;
    
    this.gameState.isRunning = false;
    this.gameState.isPaused = false;
    this.gameState.isGameOver = false;
    
    this.spawnInitialTargets();
    this.render();
  }

  private gameLoop(): void {
    if (!this.gameState.isRunning || this.gameState.isPaused) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(deltaTime: number): void {
    const input = this.inputManager.getState();
    this.player.update(deltaTime, input);
    this.checkCollisions();

    if (this.evolveEffectTimer > 0) {
      this.evolveEffectTimer -= deltaTime;
    }

    for (const [id, timer] of this.warningTargets) {
      const newTimer = timer - deltaTime;
      if (newTimer <= 0) {
        this.warningTargets.delete(id);
      } else {
        this.warningTargets.set(id, newTimer);
      }
    }
  }

  private checkCollisions(): void {
    const playerPos = this.player.getPosition();
    const playerRadius = this.player.getRadius();
    const playerLevel = this.player.getLevel();

    const remainingTargets: Target[] = [];
    
    for (const target of this.targets) {
      if (checkCollision(playerPos, playerRadius, target)) {
        if (this.player.canDevour(target.level)) {
          const evolved = this.player.addExp(target.expValue);
          if (evolved) {
            const stage = this.player.getStage();
            this.evolveEffectTimer = 1.5;
            this.evolveEffectName = stage.name;
          }
          
          const newTarget = generateRandomTarget(
            MAP_WIDTH,
            MAP_HEIGHT,
            Math.min(playerLevel + 2, getMaxLevel()),
            playerRadius,
            playerPos
          );
          remainingTargets.push(newTarget);
        } else {
          this.warningTargets.set(target.id, WARNING_DURATION);
          remainingTargets.push(target);
        }
      } else {
        remainingTargets.push(target);
      }
    }
    
    this.targets = remainingTargets;
  }

  private render(): void {
    const ctx = this.ctx;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    this.renderGrid();
    this.renderMapBorder();

    for (const target of this.targets) {
      const warningTimer = this.warningTargets.get(target.id);
      if (warningTimer !== undefined) {
        renderTargetWarning(ctx, target, WARNING_DURATION - warningTimer);
      } else {
        renderTarget(ctx, target);
      }
    }

    this.player.render(ctx);

    const stage = this.player.getStage();
    const uiState = {
      stageName: stage.name,
      level: stage.level,
      exp: this.player.getExp(),
      expProgress: this.player.getExpProgress(),
      devourCount: this.player.getDevourCount(),
      isRunning: this.gameState.isRunning,
      isPaused: this.gameState.isPaused,
      isGameOver: this.gameState.isGameOver,
      nextStage: getNextStage(stage.level)
    };

    this.uiRenderer.render(uiState);

    if (this.evolveEffectTimer > 0) {
      this.uiRenderer.renderEvolveEffect(this.evolveEffectName);
    }
  }

  private renderGrid(): void {
    const ctx = this.ctx;
    const gridSize = 50;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= MAP_WIDTH; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, MAP_HEIGHT);
      ctx.stroke();
    }

    for (let y = 0; y <= MAP_HEIGHT; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(MAP_WIDTH, y);
      ctx.stroke();
    }
  }

  private renderMapBorder(): void {
    const ctx = this.ctx;

    ctx.strokeStyle = '#FFD54F';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, MAP_WIDTH - 4, MAP_HEIGHT - 4);

    const cornerSize = 20;
    ctx.strokeStyle = '#FFD54F';
    ctx.lineWidth = 3;

    const corners = [
      { x: 2, y: 2 },
      { x: MAP_WIDTH - 2, y: 2 },
      { x: 2, y: MAP_HEIGHT - 2 },
      { x: MAP_WIDTH - 2, y: MAP_HEIGHT - 2 }
    ];

    for (const corner of corners) {
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, cornerSize, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  public destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    this.inputManager.destroy();
  }
}
