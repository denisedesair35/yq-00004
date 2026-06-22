import type { InputState } from './types';

export class InputManager {
  private state: InputState = {
    up: false,
    down: false,
    left: false,
    right: false
  };

  constructor() {
    this.setupListeners();
  }

  private setupListeners(): void {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.state.up = true;
        e.preventDefault();
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.state.down = true;
        e.preventDefault();
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.state.left = true;
        e.preventDefault();
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.state.right = true;
        e.preventDefault();
        break;
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.state.up = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.state.down = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.state.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.state.right = false;
        break;
    }
  }

  public getState(): InputState {
    return { ...this.state };
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
  }
}
