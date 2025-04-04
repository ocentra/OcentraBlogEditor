// src/components/DynamicBackground.tsx
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  vx: number;
  vy: number;
}

interface ShootingStar {
  currentParticle: Particle;
  nextParticle: Particle;
  progress: number;
  speed: number;
  trail: { x: number; y: number; size: number }[];
}

// Particle configuration
const MIN_PARTICLE_SIZE = 1; // Minimum particle size in pixels
const MAX_PARTICLE_SIZE = 25; // Maximum particle size in pixels
const MAX_PARTICLES = 1000; // Maximum number of particles
const LARGE_PARTICLE_CHANCE = 0.05; // 10% chance for large particles (0.0 to 1.0)

// Shooting star configuration
const MAX_SHOOTING_STARS = 5; // Maximum number of shooting stars at once
const MAX_SHOOTING_STAR_DISTANCE = 300; // Maximum distance between particles for shooting stars (in pixels)
const SHOOTING_STAR_SPEED = 0.005; // Speed of shooting stars (0.0 to 1.0) - Slowed down
const SHOOTING_STAR_CHANCE = 1; // Chance to create a new shooting star each frame
const TRAIL_LENGTH = 2; // Number of points in the trail

// Color configuration
const BOTTOM_COLOR = 'rgb(0, 0, 0)'; // Deep slate blue at bottom (was #0F172A)
const TOP_COLOR = 'rgb(0, 47, 134)'; // Lighter slate blue at top (was #334155)
const PARTICLE_COLOR = 'rgba(38, 139, 210, '; // Particle color (will be combined with opacity)

// Shooting star color options
const SHOOTING_STAR_COLORS = {
  white: 'rgba(255, 255, 255, ',
  blue: 'rgba(38, 139, 210, ',
  purple: 'rgba(147, 51, 234, ',
  green: 'rgba(34, 197, 94, ',
  yellow: 'rgba(234, 179, 8, ',
  red: 'rgba(239, 68, 68, '
};

// Current shooting star color (can be changed)
let currentShootingStarColor = SHOOTING_STAR_COLORS.blue;

// Function to get interpolated size between two particles
const getInterpolatedSize = (startSize: number, endSize: number, progress: number): number => {
  return startSize + (endSize - startSize) * progress;
};

const DynamicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    let shootingStars: ShootingStar[] = [];

    // Create gradient background with modern colors - bottom to top
    const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
    gradient.addColorStop(0, BOTTOM_COLOR);
    gradient.addColorStop(1, TOP_COLOR);

    // Generate particles
    for (let i = 0; i < MAX_PARTICLES; i++) {
      // Determine if this should be a large particle
      const isLarge = Math.random() < LARGE_PARTICLE_CHANCE;
      
      // Calculate radius based on whether it's large or small
      const radius = isLarge 
        ? Math.random() * (MAX_PARTICLE_SIZE - 5) + 5 // Large particles: 5-10px
        : Math.random() * (3 - MIN_PARTICLE_SIZE) + MIN_PARTICLE_SIZE; // Small particles: 1-3px

      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: radius,
        opacity: Math.random() * 0.7 + 0.3,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
      });
    }

    // Function to find next particle for a shooting star
    const findNextParticle = (currentParticle: Particle): Particle | null => {
      let attempts = 0;
      const maxAttempts = 100;

      // Determine if we want a large or small particle based on current particle size
      const isCurrentLarge = currentParticle.radius > 5;
      const targetSize = isCurrentLarge ? 1 : 5; // Target size for next particle

      while (attempts < maxAttempts) {
        const nextParticle = particles[Math.floor(Math.random() * particles.length)];
        
        const distance = Math.sqrt(
          Math.pow(nextParticle.x - currentParticle.x, 2) +
          Math.pow(nextParticle.y - currentParticle.y, 2)
        );

        // Check if the particle is within distance and matches our size target
        if (distance <= MAX_SHOOTING_STAR_DISTANCE) {
          // For large target, accept particles larger than 5
          // For small target, accept particles smaller than 5
          if ((targetSize === 5 && nextParticle.radius > 5) || 
              (targetSize === 1 && nextParticle.radius < 5)) {
            return nextParticle;
          }
        }

        attempts++;
      }

      return null;
    };

    // Function to create a new shooting star
    const createShootingStar = () => {
      if (shootingStars.length >= MAX_SHOOTING_STARS) return;

      const startParticle = particles[Math.floor(Math.random() * particles.length)];
      const nextParticle = findNextParticle(startParticle);

      if (nextParticle) {
        shootingStars.push({
          currentParticle: startParticle,
          nextParticle: nextParticle,
          progress: 0,
          speed: SHOOTING_STAR_SPEED,
          trail: Array(TRAIL_LENGTH).fill({ 
            x: startParticle.x, 
            y: startParticle.y,
            size: startParticle.radius 
          })
        });
      }
    };

    // Animation loop
    const animate = () => {
      // Clear canvas with gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Twinkle effect
        particle.opacity = Math.sin(Date.now() * 0.001 + particle.x) * 0.35 + 0.65;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = PARTICLE_COLOR + particle.opacity + ')';
        ctx.fill();
      });

      // Update and draw shooting stars
      shootingStars = shootingStars.filter(star => {
        star.progress += star.speed;
        
        // Calculate current position and size
        const x = star.currentParticle.x + (star.nextParticle.x - star.currentParticle.x) * star.progress;
        const y = star.currentParticle.y + (star.nextParticle.y - star.currentParticle.y) * star.progress;
        const currentSize = getInterpolatedSize(
          star.currentParticle.radius,
          star.nextParticle.radius,
          star.progress
        );

        // Draw the connection line
        ctx.beginPath();
        ctx.moveTo(star.currentParticle.x, star.currentParticle.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = currentShootingStarColor + (1 - star.progress * 0.3) + ')';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw the moving head with glow
        ctx.beginPath();
        ctx.arc(x, y, currentSize * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = currentShootingStarColor + '1)';
        ctx.fill();

        // Add a secondary glow at the head
        ctx.beginPath();
        ctx.arc(x, y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = currentShootingStarColor + '0.3)';
        ctx.fill();

        // When reaching the next particle, find a new target
        if (star.progress >= 1) {
          const nextTarget = findNextParticle(star.nextParticle);
          if (nextTarget) {
            star.currentParticle = star.nextParticle;
            star.nextParticle = nextTarget;
            star.progress = 0;
            return true;
          }
          return false; // Remove if no next particle found
        }

        return true;
      });

      // Only create new shooting stars if we're below the maximum
      if (shootingStars.length < MAX_SHOOTING_STARS && Math.random() < SHOOTING_STAR_CHANCE) {
        createShootingStar();
      }

      requestAnimationFrame(animate);
    };

    // Add keyboard controls for color
    const handleKeyPress = (e: KeyboardEvent) => {
      switch(e.key.toLowerCase()) {
        case '1':
          currentShootingStarColor = SHOOTING_STAR_COLORS.white;
          break;
        case '2':
          currentShootingStarColor = SHOOTING_STAR_COLORS.blue;
          break;
        case '3':
          currentShootingStarColor = SHOOTING_STAR_COLORS.purple;
          break;
        case '4':
          currentShootingStarColor = SHOOTING_STAR_COLORS.green;
          break;
        case '5':
          currentShootingStarColor = SHOOTING_STAR_COLORS.yellow;
          break;
        case '6':
          currentShootingStarColor = SHOOTING_STAR_COLORS.red;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    animate();

    // Handle resize
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []); // Empty dependency array since we're using static colors

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }}
    />
  );
};

export default DynamicBackground;