document.addEventListener('DOMContentLoaded', () => {
    const kulmaInput = document.getElementById('katon-kulma');
    const leveysInput = document.getElementById('rakennuksen-leveys');
    const raystasPituusInput = document.getElementById('raystaan-pituus');
    const raystasYlitysInput = document.getElementById('raystaan-ylitys');
    const palkinKorkeusInput = document.getElementById('palkin-korkeus');

    const lapeTulosSpan = document.querySelector('#tulos span');
    const korkeusTulosSpan = document.querySelector('#katon-korkeus-tulos span');
    const katteenPituusTulosSpan = document.querySelector('#katteen-pituus-tulos span');

    const canvas = document.getElementById('katto-canvas');
    const ctx = canvas.getContext('2d');
    const resetButton = document.getElementById('reset-button');
    const downloadButton = document.getElementById('download-button');
    const scaleSlider = document.getElementById('scale-slider');

    let lastModified = 'pituus'; // 'pituus' or 'ylitys'

    function calculateAndDraw() {
        const kulma = parseFloat(kulmaInput.value);
        const leveys = parseFloat(leveysInput.value);
        let raystasPituus = parseFloat(raystasPituusInput.value);
        let raystasYlitys = parseFloat(raystasYlitysInput.value);
        const palkinKorkeus = parseFloat(palkinKorkeusInput.value);

        if (isNaN(kulma) || isNaN(leveys) || isNaN(palkinKorkeus) || kulma <= 0 || kulma >= 90 || leveys <= 0 || palkinKorkeus < 0) {
            lapeTulosSpan.textContent = 'Virheelliset syötteet';
            korkeusTulosSpan.textContent = '';
            katteenPituusTulosSpan.textContent = '';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        const kulmaRad = kulma * (Math.PI / 180);

        if (lastModified === 'pituus') {
            raystasYlitys = raystasPituus * Math.cos(kulmaRad);
            raystasYlitysInput.value = raystasYlitys.toFixed(2);
        } else if (lastModified === 'ylitys') {
            raystasPituus = raystasYlitys / Math.cos(kulmaRad);
            raystasPituusInput.value = raystasPituus.toFixed(2);
        }

        const lapePituus = (leveys / 2) / Math.cos(kulmaRad) + raystasPituus;
        const katonKorkeus = (leveys / 2) * Math.tan(kulmaRad);
        
        // Calculate the extra length for the top surface
        const lisaPituus = palkinKorkeus / Math.cos(kulmaRad);
        const katteenPituus = lapePituus + lisaPituus; // Assuming plumb cut at ridge, square at eave

        lapeTulosSpan.textContent = `${lapePituus.toFixed(2)} cm`;
        korkeusTulosSpan.textContent = `${katonKorkeus.toFixed(2)} cm`;
        katteenPituusTulosSpan.textContent = `${katteenPituus.toFixed(2)} cm`;

        drawRoof(kulma, leveys, raystasPituus, scaleSlider.value, katonKorkeus, raystasYlitys);
    }

    // The rest of the file (drawRoof, reset, event listeners) remains the same
    // ... (omitted for brevity)
    function drawRoof(kulma, leveys, raystasPituus, scale, katonKorkeus, raystasYlitys) {
        const canvasWidth = 600;
        const canvasHeight = 400;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.save();

        const margin = 40;
        const drawingAreaWidth = canvasWidth - 2 * margin;
        const drawingAreaHeight = canvasHeight - 2 * margin;

        const kulmaRad = kulma * (Math.PI / 180);
        const leveysM = leveys / 100;
        const raystasPituusM = raystasPituus / 100;
        const ylitysM = raystasYlitys / 100;
        const visualWallHeightM = 2.5;

        const buildingWidth = leveysM * scale;
        const roofRise = (katonKorkeus / 100) * scale;
        const wallHeight = visualWallHeightM * scale;
        const eavesHorizontal = ylitysM * scale;
        const eavesVertical = Math.sin(kulmaRad) * (raystasPituusM * scale);

        const totalGeomWidth = buildingWidth + 2 * eavesHorizontal;
        const totalGeomHeight = wallHeight + roofRise;

        let drawingScale = 1;
        if (totalGeomWidth > drawingAreaWidth) {
            drawingScale = drawingAreaWidth / totalGeomWidth;
        }
        if (totalGeomHeight * drawingScale > drawingAreaHeight) {
            drawingScale = Math.min(drawingScale, drawingAreaHeight / totalGeomHeight);
        }

        const scaledWidth = buildingWidth * drawingScale;
        const scaledRoofRise = roofRise * drawingScale;
        const scaledWallHeight = wallHeight * drawingScale;
        const scaledEavesHorizontal = eavesHorizontal * drawingScale;
        const scaledEavesVertical = eavesVertical * drawingScale;

        const startX = margin + (drawingAreaWidth - scaledWidth) / 2;
        const startY = margin + (drawingAreaHeight - scaledWallHeight + scaledRoofRise) / 2;

        const harjaPiste = { x: startX + scaledWidth / 2, y: startY - scaledRoofRise };
        const oikeaSeinaYla = { x: startX + scaledWidth, y: startY };
        const oikeaRaystaanPaa = { x: startX + scaledWidth + scaledEavesHorizontal, y: startY + scaledEavesVertical };

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, scaledWidth, scaledWallHeight);
        ctx.beginPath();
        ctx.moveTo(harjaPiste.x, harjaPiste.y);
        ctx.lineTo(startX - scaledEavesHorizontal, startY + scaledEavesVertical);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(harjaPiste.x, harjaPiste.y);
        ctx.lineTo(oikeaRaystaanPaa.x, oikeaRaystaanPaa.y);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.stroke();

        const verticalOffset = -15;
        ctx.beginPath();
        ctx.moveTo(oikeaSeinaYla.x, oikeaSeinaYla.y + verticalOffset);
        ctx.lineTo(oikeaRaystaanPaa.x, oikeaRaystaanPaa.y + verticalOffset);
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // --- Labels and Dimension Lines ---
        ctx.font = '12px Arial';

        // Building width line and label (left side)
        ctx.fillStyle = 'black';
        ctx.beginPath();
        //ctx.moveTo(startX - 30, startY); // Start at top-left of building, offset left
        //ctx.lineTo(startX - 30, startY + scaledWallHeight); // Draw down to bottom-left of building, offset left
        ctx.moveTo(startX, startY + scaledWallHeight + 20); // Start below bottom-left of building                                          │
        ctx.lineTo(startX + scaledWidth, startY + scaledWallHeight + 20); // Draw to below bottom-right of building   
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();
        //ctx.textAlign = 'right'; // Align text to the right of the line
        //ctx.fillText(`${leveysM.toFixed(2)} m`, startX - 35, startY + scaledWallHeight / 2); // Position text next to the line
        ctx.textAlign = 'center'; // Center text below the line                                                                             │
        ctx.fillText(`${leveysM.toFixed(2)} m`, startX + scaledWidth / 2, startY + scaledWallHeight + 35); // Position text below the line

        // Angle
        ctx.textAlign = 'left';
        ctx.fillText(`${kulma}°`, harjaPiste.x + 10, harjaPiste.y + 30);

        // Eaves length label (green line)
        ctx.fillStyle = 'green';
        ctx.textAlign = 'center';
        const greenLineCenterX = oikeaSeinaYla.x + (oikeaRaystaanPaa.x - oikeaRaystaanPaa.x) / 2;
        const greenLineCenterY = oikeaSeinaYla.y + (oikeaRaystaanPaa.y - oikeaRaystaanPaa.y) / 2 + verticalOffset;
        ctx.fillText(`${raystasPituusM.toFixed(2)} m`, greenLineCenterX, greenLineCenterY - 12);

        // Roof height line and label (moved to top-left of ridge)
        ctx.beginPath();
        ctx.moveTo(harjaPiste.x, harjaPiste.y); // Start at ridge peak
        ctx.lineTo(harjaPiste.x, startY); // Draw down to ridge base
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = 'black';
        ctx.textAlign = 'right'; // Align text to the right of the line
        ctx.fillText(`${(katonKorkeus / 100).toFixed(2)} m`, harjaPiste.x - 5, harjaPiste.y - 10); // Position text above and slightly left of ridge peak

        ctx.beginPath();
        ctx.moveTo(oikeaSeinaYla.x, oikeaRaystaanPaa.y + 20);
        ctx.lineTo(oikeaRaystaanPaa.x, oikeaRaystaanPaa.y + 20);
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = 'blue';
        ctx.textAlign = 'center';
        ctx.fillText(`${ylitysM.toFixed(2)} m`, oikeaSeinaYla.x + scaledEavesHorizontal / 2, oikeaRaystaanPaa.y + 35);

        ctx.restore();
    }

    function reset() {
        kulmaInput.value = 20;
        leveysInput.value = 383;
        raystasYlitysInput.value = 30;
        palkinKorkeusInput.value = 10;
        scaleSlider.value = 75;
        lastModified = 'ylitys';
        calculateAndDraw();
    }

    function downloadCanvas() {
        const link = document.createElement('a');
        link.download = 'katto-visualisointi.png';
        link.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
        link.click();
    }

    raystasPituusInput.addEventListener('input', () => {
        lastModified = 'pituus';
        calculateAndDraw();
    });

    raystasYlitysInput.addEventListener('input', () => {
        lastModified = 'ylitys';
        calculateAndDraw();
    });

    kulmaInput.addEventListener('input', () => {
        lastModified = 'pituus';
        calculateAndDraw();
    });

    leveysInput.addEventListener('input', calculateAndDraw);
    palkinKorkeusInput.addEventListener('input', calculateAndDraw);
    scaleSlider.addEventListener('input', calculateAndDraw);
    resetButton.addEventListener('click', reset);
    downloadButton.addEventListener('click', downloadCanvas);

    // Initial calculation
    calculateAndDraw();
});