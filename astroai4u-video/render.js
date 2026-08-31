import { render } from "hyperframes";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;

// Scene 1: Cosmic Background + Title (0-3s = 90 frames)
function generateScene1Frames() {
  const frames = [];
  for (let i = 0; i < 90; i++) {
    const opacity = Math.min(1, i / 30); // Fade in over 1 second
    const scale = 0.9 + (0.1 * (i / 90)); // Slow zoom in
    const glowOpacity = Math.min(0.8, i / 20);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: ${WIDTH}px;
            height: ${HEIGHT}px;
            background: radial-gradient(ellipse at center, #1a0d2e 0%, #0a0520 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            position: relative;
            overflow: hidden;
          }

          .stars {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
          }

          .star {
            position: absolute;
            background: white;
            border-radius: 50%;
          }

          .glow {
            position: absolute;
            pointer-events: none;
          }

          .container {
            position: relative;
            z-index: 10;
            text-align: center;
            padding: 0 40px;
            opacity: ${opacity};
            transform: scale(${scale});
          }

          h1 {
            font-size: 56px;
            font-weight: 700;
            line-height: 1.2;
            text-shadow: 0 0 20px rgba(168, 85, 247, ${glowOpacity});
            letter-spacing: -1px;
            color: #fff;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="stars" id="stars"></div>
        <div class="container">
          <h1>Confused About Your Next Move?</h1>
        </div>
        <script>
          // Generate random stars
          const starsDiv = document.getElementById('stars');
          for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.width = Math.random() * 3 + 'px';
            star.style.height = star.style.width;
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.opacity = Math.random() * 0.8 + 0.2;
            starsDiv.appendChild(star);
          }

          // Add floating particles
          for (let i = 0; i < 30; i++) {
            const glow = document.createElement('div');
            glow.className = 'glow';
            glow.style.width = Math.random() * 80 + 20 + 'px';
            glow.style.height = glow.style.width;
            glow.style.background = 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)';
            glow.style.borderRadius = '50%';
            glow.style.left = Math.random() * 100 + '%';
            glow.style.top = Math.random() * 100 + '%';
            glow.style.filter = 'blur(40px)';
            document.body.appendChild(glow);
          }
        </script>
      </body>
      </html>
    `;
    frames.push({ html, duration: 1 / FPS });
  }
  return frames;
}

// Scene 2: Birth Chart (3-7s = 120 frames)
function generateScene2Frames() {
  const frames = [];
  for (let i = 0; i < 120; i++) {
    const rotation = (i / 120) * 360;
    const chartOpacity = Math.min(1, i / 30);
    const textOpacity = Math.min(1, (i - 30) / 30);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: ${WIDTH}px;
            height: ${HEIGHT}px;
            background: radial-gradient(ellipse at center, #1a0d2e 0%, #0a0520 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow: hidden;
          }

          .chart-container {
            position: relative;
            width: 300px;
            height: 300px;
            margin-bottom: 40px;
            opacity: ${chartOpacity};
          }

          .chart {
            position: absolute;
            width: 100%;
            height: 100%;
            transform: rotate(${rotation}deg);
            transition: none;
          }

          .circle {
            position: absolute;
            border: 2px solid;
            border-radius: 50%;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }

          .circle-1 { width: 280px; height: 280px; border-color: rgba(168, 85, 247, 0.6); }
          .circle-2 { width: 200px; height: 200px; border-color: rgba(59, 130, 246, 0.5); }
          .circle-3 { width: 120px; height: 120px; border-color: rgba(236, 72, 153, 0.5); }
          .circle-4 { width: 40px; height: 40px; border-color: rgba(251, 191, 36, 0.7); background: rgba(251, 191, 36, 0.3); }

          .planet {
            position: absolute;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }

          .planet-1 { background: #fbbf24; width: 10px; height: 10px; top: 15%; }
          .planet-2 { background: #ec4899; width: 8px; height: 8px; top: 25%; left: 75%; }
          .planet-3 { background: #3b82f6; width: 9px; height: 9px; top: 75%; left: 75%; }
          .planet-4 { background: #a855f7; width: 7px; height: 7px; top: 75%; left: 25%; }

          .text-container {
            text-align: center;
            opacity: ${textOpacity};
            padding: 0 30px;
          }

          h2 {
            font-size: 48px;
            font-weight: 700;
            line-height: 1.2;
            text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="chart-container">
          <div class="chart">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
            <div class="circle circle-3"></div>
            <div class="circle circle-4"></div>
            <div class="planet planet-1"></div>
            <div class="planet planet-2"></div>
            <div class="planet planet-3"></div>
            <div class="planet planet-4"></div>
          </div>
        </div>
        <div class="text-container">
          <h2>Your Birth Chart<br>Holds More Than<br>Predictions</h2>
        </div>
      </body>
      </html>
    `;
    frames.push({ html, duration: 1 / FPS });
  }
  return frames;
}

// Scene 3: Decision Cards (7-11s = 120 frames)
function generateScene3Frames() {
  const frames = [];
  for (let i = 0; i < 120; i++) {
    const titleOpacity = Math.min(1, i / 20);

    // Card reveal timing
    const card1Opacity = Math.min(1, Math.max(0, (i - 20) / 20));
    const card2Opacity = Math.min(1, Math.max(0, (i - 50) / 20));
    const card3Opacity = Math.min(1, Math.max(0, (i - 80) / 20));

    const card1Transform = `translateY(${Math.max(0, (20 - i) * 2)}px)`;
    const card2Transform = `translateY(${Math.max(0, (50 - i) * 2)}px)`;
    const card3Transform = `translateY(${Math.max(0, (80 - i) * 2)}px)`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: ${WIDTH}px;
            height: ${HEIGHT}px;
            background: radial-gradient(ellipse at center, #1a0d2e 0%, #0a0520 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow: hidden;
            padding: 40px 30px;
          }

          h2 {
            font-size: 48px;
            font-weight: 700;
            line-height: 1.2;
            text-align: center;
            text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
            margin-bottom: 60px;
            opacity: ${titleOpacity};
          }

          .cards-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
            width: 100%;
            max-width: 500px;
          }

          .card {
            background: linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%);
            border: 2px solid rgba(168, 85, 247, 0.3);
            border-radius: 16px;
            padding: 24px;
            text-align: center;
            font-size: 24px;
            font-weight: 600;
            backdrop-filter: blur(10px);
          }

          .card-1 {
            opacity: ${card1Opacity};
            transform: ${card1Transform};
            border-color: rgba(251, 191, 36, 0.4);
          }

          .card-2 {
            opacity: ${card2Opacity};
            transform: ${card2Transform};
            border-color: rgba(236, 72, 153, 0.4);
          }

          .card-3 {
            opacity: ${card3Opacity};
            transform: ${card3Transform};
            border-color: rgba(59, 130, 246, 0.4);
          }
        </style>
      </head>
      <body>
        <h2>Get Personalized<br>Cosmic Guidance</h2>
        <div class="cards-container">
          <div class="card card-1">💼 Career</div>
          <div class="card card-2">💕 Relationships</div>
          <div class="card card-3">⭐ Important Decisions</div>
        </div>
      </body>
      </html>
    `;
    frames.push({ html, duration: 1 / FPS });
  }
  return frames;
}

// Scene 4: Mobile App Mockup (11-14s = 90 frames)
function generateScene4Frames() {
  const frames = [];
  for (let i = 0; i < 90; i++) {
    const slideUp = Math.max(0, (90 - i) * 3);
    const opacity = Math.min(1, i / 20);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: ${WIDTH}px;
            height: ${HEIGHT}px;
            background: radial-gradient(ellipse at center, #1a0d2e 0%, #0a0520 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow: hidden;
          }

          .phone-mockup {
            position: relative;
            width: 300px;
            height: 620px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 40px;
            border: 3px solid rgba(168, 85, 247, 0.3);
            overflow: hidden;
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.2);
            opacity: ${opacity};
            transform: translateY(${slideUp}px);
          }

          .notch {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 150px;
            height: 28px;
            background: #000;
            border-radius: 0 0 20px 20px;
            z-index: 10;
          }

          .screen {
            width: 100%;
            height: 100%;
            padding: 40px 20px;
            display: flex;
            flex-direction: column;
            gap: 30px;
            overflow: hidden;
          }

          .screen-content {
            margin-top: 20px;
          }

          .feature {
            background: rgba(168, 85, 247, 0.1);
            border: 1px solid rgba(168, 85, 247, 0.2);
            border-radius: 12px;
            padding: 16px;
            font-size: 13px;
            font-weight: 600;
            text-align: center;
            backdrop-filter: blur(10px);
          }

          h3 {
            font-size: 16px;
            margin-bottom: 8px;
            color: #fbbf24;
          }
        </style>
      </head>
      <body>
        <div class="phone-mockup">
          <div class="notch"></div>
          <div class="screen">
            <div class="screen-content">
              <div class="feature">
                <h3>📊 Kundli & Birth Chart</h3>
                Decoded for you
              </div>
              <div class="feature">
                <h3>🎯 Cosmic Decision Engine</h3>
                Know when to act
              </div>
              <div class="feature">
                <h3>✨ Daily Guidance</h3>
                Personalized just for you
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    frames.push({ html, duration: 1 / FPS });
  }
  return frames;
}

// Scene 5: CTA (14-16s = 60 frames)
function generateScene5Frames() {
  const frames = [];
  for (let i = 0; i < 60; i++) {
    const titleOpacity = Math.min(1, i / 20);
    const subtitleOpacity = Math.min(1, (i - 15) / 20);
    const buttonOpacity = Math.min(1, (i - 30) / 20);
    const buttonScale = 0.8 + (0.2 * Math.min(1, (i - 30) / 20));

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: ${WIDTH}px;
            height: ${HEIGHT}px;
            background: radial-gradient(ellipse at center, #1a0d2e 0%, #0a0520 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow: hidden;
            padding: 40px;
            text-align: center;
          }

          .glow-bg {
            position: absolute;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%);
            border-radius: 50%;
            filter: blur(60px);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 0;
          }

          .content {
            position: relative;
            z-index: 10;
          }

          h1 {
            font-size: 56px;
            font-weight: 700;
            margin-bottom: 20px;
            text-shadow: 0 0 30px rgba(168, 85, 247, 0.6);
            opacity: ${titleOpacity};
          }

          p {
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 40px;
            color: #fbbf24;
            opacity: ${subtitleOpacity};
            text-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
          }

          .cta-button {
            background: linear-gradient(135deg, #a855f7 0%, #3b82f6 100%);
            border: none;
            color: white;
            padding: 18px 48px;
            font-size: 18px;
            font-weight: 700;
            border-radius: 12px;
            cursor: pointer;
            opacity: ${buttonOpacity};
            transform: scale(${buttonScale});
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.4);
            transition: none;
          }
        </style>
      </head>
      <body>
        <div class="glow-bg"></div>
        <div class="content">
          <h1>Know When to Act</h1>
          <p>Explore AstroAI4U</p>
          <button class="cta-button">Get Started Free</button>
        </div>
      </body>
      </html>
    `;
    frames.push({ html, duration: 1 / FPS });
  }
  return frames;
}

// Combine all scenes
async function renderVideo() {
  console.log("Generating video frames...");

  const allFrames = [
    ...generateScene1Frames(),
    ...generateScene2Frames(),
    ...generateScene3Frames(),
    ...generateScene4Frames(),
    ...generateScene5Frames(),
  ];

  console.log(`Total frames: ${allFrames.length}`);
  console.log(`Expected duration: ${allFrames.length / FPS}s`);

  try {
    console.log("Rendering video with Hyperframes...");
    await render({
      frames: allFrames,
      output: path.join(__dirname, "output/astroai4u-reel.mp4"),
      width: WIDTH,
      height: HEIGHT,
      fps: FPS,
    });
    console.log("✓ Video rendered successfully!");
    console.log(`✓ Output: output/astroai4u-reel.mp4`);
  } catch (error) {
    console.error("Error rendering video:", error);
    throw error;
  }
}

renderVideo().catch(console.error);
