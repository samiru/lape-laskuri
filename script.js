document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calculator-form');
    const kulmaInput = document.getElementById('katon-kulma');
    const leveysInput = document.getElementById('rakennuksen-leveys');
    const raystasInput = document.getElementById('raystaan-pituus');
    const lapeTulosSpan = document.querySelector('#tulos span');
    const korkeusTulosSpan = document.querySelector('#katon-korkeus-tulos span');
    const ylitysTulosSpan = document.querySelector('#raystaan-ylitys-tulos span');
    const canvas = document.getElementById('katto-canvas');
    const ctx = canvas.getContext('2d');
    const resetButton = document.getElementById('reset-button');
    const downloadButton = document.getElementById('download-button');
    const scaleSlider = document.getElementById('scale-slider');

    function calculateAndDraw() {
        const kulma = parseFloat(kulmaInput.value);
        const leveys = parseFloat(leveysInput.value);
        const raystas = parseFloat(raystasInput.value);
        const scale = parseFloat(scaleSlider.value);

        if (isNaN(kulma) || isNaN(leveys) || isNaN(raystas) || kulma <= 0 || kulma >= 90 || leveys <= 0 || raystas < 0) {
            lapeTulosSpan.textContent = 'Virheelliset syötteet';
            korkeusTulosSpan.textContent = '';
            ylitysTulosSpan.textContent = '';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        const kulmaRad = kulma * (Math.PI / 180);
        const lapePituus = (leveys / 2) / Math.cos(kulmaRad) + raystas;
        const katonKorkeus = (leveys / 2) * Math.tan(kulmaRad);
        const raystaanYlitys = Math.cos(kulmaRad) * raystas;

        lapeTulosSpan.textContent = `${lapePituus.toFixed(2)} cm`;
        korkeusTulosSpan.textContent = `${katonKorkeus.toFixed(2)} cm`;
        ylitysTulosSpan.textContent = `${raystaanYlitys.toFixed(2)} cm`;

        drawRoof(kulma, leveys, raystas, scale, katonKorkeus, raystaanYlitys);
    }

    function drawRoof(kulma, leveys, raystas, scale, katonKorkeus, raystaanYlitys) {
        const canvasWidth = 600;
        const canvasHeight = 400;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.save();

        const kulmaRad = kulma * (Math.PI / 180);
        const leveysM = leveys / 100;
        const raystasM = raystas / 100;
        const ylitysM = raystaanYlitys / 100;
        const visualWallHeightM = 2.5;

        const buildingWidth = leveysM * scale;
        const roofRise = (katonKorkeus / 100) * scale;
        const wallHeight = visualWallHeightM * scale;
        const eavesHorizontal = ylitysM * scale;
        const eavesVertical = Math.sin(kulmaRad) * (raystasM * scale);

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

        // --- Drawing --- 

        // 1. Draw building base
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, scaledWidth, scaledWallHeight);

        // 2. Define roof points
        const harjaPiste = { x: startX + scaledWidth / 2, y: startY - scaledRoofRise };
        const oikeaSeinaYla = { x: startX + scaledWidth, y: startY };
        const oikeaRaystaanPaa = { x: startX + scaledWidth + scaledEavesHorizontal, y: startY + scaledEavesVertical };

        // 3. Draw roof segments
        // Left side for context
        ctx.beginPath();
        ctx.moveTo(harjaPiste.x, harjaPiste.y);
        ctx.lineTo(startX - scaledEavesHorizontal, startY + scaledEavesVertical);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Full slope (red)
        ctx.beginPath();
        ctx.moveTo(harjaPiste.x, harjaPiste.y);
        ctx.lineTo(oikeaRaystaanPaa.x, oikeaRaystaanPaa.y);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Eave (green, offset vertically)
        const verticalOffset = -15; // Vertical offset in pixels (negative is up)

        ctx.beginPath();
        ctx.moveTo(oikeaSeinaYla.x, oikeaSeinaYla.y + verticalOffset);
        ctx.lineTo(oikeaRaystaanPaa.x, oikeaRaystaanPaa.y + verticalOffset);
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;
        ctx.stroke();

        // --- Labels and Dimension Lines ---
        ctx.font = '12px Arial';

        // Building width
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText(`${leveysM.toFixed(2)} m`, startX + scaledWidth / 2, startY + scaledWallHeight + 20);

        // Angle
        ctx.textAlign = 'left';
        ctx.fillText(`${kulma}°`, harjaPiste.x + 10, harjaPiste.y + 30);

        // Eaves length label (for the green line)
        ctx.fillStyle = 'blue';
        ctx.textAlign = 'center';
        ctx.save();
        const greenLineCenterX = oikeaSeinaYla.x + (oikeaRaystaanPaa.x - oikeaSeinaYla.x) / 2;
        const greenLineCenterY = oikeaSeinaYla.y + (oikeaRaystaanPaa.y - oikeaSeinaYla.y) / 2 + verticalOffset;
        ctx.translate(greenLineCenterX, greenLineCenterY);
//        ctx.rotate(-kulmaRad);
        ctx.fillText(`${raystasM.toFixed(2)} m`, 0, -15); // Adjust label position
        ctx.restore();

        // Roof height line and label
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

        // Eaves horizontal projection (ylitys) line and label
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
        form.reset();
        kulmaInput.value = 30;
        leveysInput.value = 383;
        raystasInput.value = 50;
        scaleSlider.value = 75;
        calculateAndDraw();
    }

    function downloadCanvas() {
        const link = document.createElement('a');
        link.download = 'katto-visualisointi.png';
        link.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
        link.click();
    }

    form.addEventListener('input', calculateAndDraw);
    scaleSlider.addEventListener('input', calculateAndDraw);
    resetButton.addEventListener('click', reset);
    downloadButton.addEventListener('click', downloadCanvas);

    // Initial calculation and drawing
    calculateAndDraw();
});