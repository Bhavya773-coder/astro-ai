@echo off
echo 🚀 Starting AstroAI Backend with Ollama...
echo.

REM Check if Ollama is running
ollama list >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔮 Ollama not running, starting it...
    start "Ollama Server" ollama serve
    echo ⏳ Waiting 15 seconds for Ollama to start...
    timeout /t 15 /nobreak >nul
) else (
    echo ✅ Ollama is already running!
)

echo.
echo 🌟 Starting AstroAI Backend...
npm run dev

pause
