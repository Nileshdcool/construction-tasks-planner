import confetti from 'canvas-confetti';

export function fireCelebration() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.7 },
    zIndex: 9999,
  });
}
