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
        const lisaPituus = palkinKorkeus * Math.tan(kulmaRad);
        const katteenPituus = lapePituus + 2 * lisaPituus; // Assuming plumb cuts at both ends

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

        const totalWidth = buildingWidth + 2 * eavesHorizontal;
        const totalHeight = wallHeight + roofRise;

        let drawingScale = 1;
        if (totalWidth > canvasWidth * 0.9) {
            drawingScale = (canvasWidth * 0.9) / totalWidth;
        }
        if (totalHeight > canvasHeight * 0.9) {
            drawingScale = Math.min(drawingScale, (canvasHeight * 0.9) / totalHeight);
        }

        const scaledWidth = buildingWidth * drawingScale;
        const scaledRoofRise = roofRise * drawingScale;
        const scaledWallHeight = wallHeight * drawingScale;
        const scaledEavesHorizontal = eavesHorizontal * drawingScale;
        const scaledEavesVertical = eavesVertical * drawingScale;

        const startX = (canvasWidth - scaledWidth) / 2;
        const startY = (canvasHeight + scaledWallHeight - scaledRoofRise) / 2;

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
        
        ctx.font = '12px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText(`${leveysM.toFixed(2)} m`, startX + scaledWidth / 2, startY + scaledWallHeight + 20);
        ctx.textAlign = 'left';
        ctx.fillText(`${kulma}°`, harjaPiste.x + 10, harjaPiste.y + 30);

        ctx.fillStyle = 'green';
        ctx.textAlign = 'center';
        const greenLineCenterX = oikeaSeinaYla.x + (oikeaRaystaanPaa.x - oikeaSeinaYla.x) / 2;
        const greenLineCenterY = oikeaSeinaYla.y + (oikeaRaystaanPaa.y - oikeaSeinaYla.y) / 2 + verticalOffset;
        ctx.fillText(`${raystasPituusM.toFixed(2)} m`, greenLineCenterX, greenLineCenterY - 12);

        const harjaX = startX + scaledWidth / 2;
        ctx.beginPath();
        ctx.moveTo(harjaX + 40, startY);
        ctx.lineTo(harjaX + 40, startY - scaledRoofRise);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = 'black';
        ctx.textAlign = 'left';
        ctx.fillText(`${(katonKorkeus / 100).toFixed(2)} m`, harjaX + 45, startY - scaledRoofRise / 2);

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
        kulmaInput.value = 30;
        leveysInput.value = 383;
        raystasPituusInput.value = 50;
        palkinKorkeusInput.value = 10;
        scaleSlider.value = 75;
        lastModified = 'pituus';
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