import { useEffect, useRef } from "react";

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particlesArray: Particle[] = [];
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      targetOpacity: number;
      
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = Math.random() * -0.8 - 0.2; // Flowing upwards smoothly
        this.targetOpacity = Math.random() * 0.5 + 0.1;
        this.opacity = 0; // fade in
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.opacity < this.targetOpacity) {
            this.opacity += 0.01;
        }

        // Reset if it goes off screen
        if (this.y < 0) {
          this.y = canvas.height;
          this.x = Math.random() * canvas.width;
          this.opacity = 0; // reset opacity for fade in
        }
        if (this.x < 0 || this.x > canvas.width) {
          this.speedX = -this.speedX;
        }
      }

      draw() {
        if (!ctx) return;
        // Warm beige/gold color particles
        ctx.fillStyle = `rgba(188, 143, 102, ${this.opacity})`; 
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particlesArray = [];
      const numberOfParticles = Math.min((canvas.width * canvas.height) / 7000, 150);
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    };
    init();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        background: "linear-gradient(135deg, #fdfbf7 0%, #f4eee1 100%)",
      }}
    />
  );
}
