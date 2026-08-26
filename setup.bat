@echo off
chcp 65001 >nul
echo.
echo ============================================
echo   Setup NBA 2K Players List
echo ============================================
echo.

:: Controlla Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRORE] Node.js non e' installato.
    echo.
    echo Vai su https://nodejs.org e scarica la versione "LTS".
    echo Dopo l'installazione, riapri questa finestra e riesegui setup.bat
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js trovato.
echo.

:: Installa dipendenze
echo Installazione dipendenze in corso...
call npm install
if errorlevel 1 (
    echo [ERRORE] npm install fallito.
    pause
    exit /b 1
)
echo [OK] Dipendenze installate.
echo.

:: Installa Playwright Chromium
echo Installazione browser Playwright (Chromium)...
call npx playwright install chromium
if errorlevel 1 (
    echo [ERRORE] Installazione Playwright fallita.
    pause
    exit /b 1
)
echo [OK] Browser installato.
echo.

:: Controlla .env.local
if not exist .env.local (
    echo [ATTENZIONE] Il file .env.local non esiste.
    echo.
    echo Devi creare un file chiamato ".env.local" nella cartella del progetto
    echo con il seguente contenuto:
    echo.
    echo     NBA2K_API_KEY=la_tua_chiave_api
    echo.
    echo Ottieni la chiave su: https://nba2kapi.com
    echo.
    echo Dopo aver creato il file, esegui "avvia.bat" per avviare l'app.
    echo.
    pause
    exit /b 0
)

echo [OK] File .env.local trovato.
echo.
echo ============================================
echo   Setup completato!
echo ============================================
echo.
echo Per avviare l'app, esegui "avvia.bat" oppure digita:
echo     npm run dev
echo.
echo Poi apri il browser su: http://localhost:3000
echo.
pause
