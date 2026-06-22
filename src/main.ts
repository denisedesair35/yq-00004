import { Game } from './game';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

if (!canvas) {
  console.error('Canvas element not found');
} else {
  const game = new Game(canvas);
  
  window.addEventListener('beforeunload', () => {
    game.destroy();
  });
}
