@echo off
chcp 65001 >nul
echo.
echo ============================================
echo   Avvio NBA 2K Players List
echo ============================================
echo.

:: Controlla .env.local
if not exist .env.local (
    echo [ERRORE] Il file .env.local non esiste.
    echo.
    echo Crea un file ".env.local" nella cartella del progetto con:
    echo.
    echo     NBA2K_API_KEY=la_tua_chiave_api
    echo.
    echo Ottieni la chiave su: https://nba2kapi.com
    echo.
    pause
    exit /b 1
)

echo Avvio del server in corso...
echo.
echo Quando vedi "Ready in ...", apri il browser su:
echo     http://localhost:3000
echo.
echo Per fermare il server, premi CTRL+C in questa finestra.
echo.
npm run dev
