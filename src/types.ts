export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface EvolutionStage {
  name: string;
  level: number;
  radius: number;
  speed: number;
  color: string;
  strokeColor: string;
  expRequired: number;
  description: string;
}

export interface PlayerState {
  position: Position;
  stage: EvolutionStage;
  exp: number;
  devourCount: number;
}

export type TargetType = 'qi' | 'beast';

export interface Target {
  id: number;
  type: TargetType;
  position: Position;
  level: number;
  radius: number;
  color: string;
  expValue: number;
  name: string;
}

export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  mapWidth: number;
  mapHeight: number;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}
