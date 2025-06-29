document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calculator-form');
    const kulmaInput = document.getElementById('katon-kulma');
    const leveysInput = document.getElementById('rakennuksen-leveys');
    const raystasInput = document.getElementById('raystaan-pituus');
    const lapeTulosSpan = document.querySelector('#tulos span');
    const korkeusTulosSpan = document.querySelector('#katon-korkeus-tulos span');
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
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        const kulmaRad = kulma * (Math.PI / 180);
        const lapePituus = (leveys / 2) / Math.cos(kulmaRad) + raystas;
        const katonKorkeus = (leveys / 2) * Math.tan(kulmaRad);

        lapeTulosSpan.textContent = `${lapePituus.toFixed(2)} cm`;
        korkeusTulosSpan.textContent = `${katonKorkeus.toFixed(2)} cm`;

        drawRoof(kulma, leveys, raystas, scale, katonKorkeus);
    }

    function drawRoof(kulma, leveys, raystas, scale, katonKorkeus) {
        const canvasWidth = 600;
        const canvasHeight = 400;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.save();

        const kulmaRad = kulma * (Math.PI / 180);
        const leveysM = leveys / 100;
        const raystasM = raystas / 100;
        const visualWallHeightM = 2.5;

        const buildingWidth = leveysM * scale;
        const roofRise = (katonKorkeus / 100) * scale;
        const wallHeight = visualWallHeightM * scale;

        // Calculate eaves projection correctly
        const eavesHorizontal = Math.cos(kulmaRad) * (raystasM * scale);
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

        // Draw building base
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, scaledWidth, scaledWallHeight);

        // Define roof points
        const harjaPiste = { x: startX + scaledWidth / 2, y: startY - scaledRoofRise };
        const vasenRaystaanPaa = { x: startX - scaledEavesHorizontal, y: startY + scaledEavesVertical };
        const oikeaRaystaanPaa = { x: startX + scaledWidth + scaledEavesHorizontal, y: startY + scaledEavesVertical };

        // Draw roof structure
        ctx.beginPath();
        ctx.moveTo(vasenRaystaanPaa.x, vasenRaystaanPaa.y);
        ctx.lineTo(harjaPiste.x, harjaPiste.y);
        ctx.lineTo(oikeaRaystaanPaa.x, oikeaRaystaanPaa.y);
        ctx.strokeStyle = '#333';
        ctx.stroke();

        // Highlight the calculated slope (lape)
        ctx.beginPath();
        ctx.moveTo(harjaPiste.x, harjaPiste.y);
        ctx.lineTo(oikeaRaystaanPaa.x, oikeaRaystaanPaa.y);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Dimensions and labels
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';

        // Building width
        ctx.fillText(`${leveysM.toFixed(2)} m`, startX + scaledWidth / 2, startY + scaledWallHeight + 20);

        // Angle
        ctx.textAlign = 'left';
        ctx.fillText(`${kulma}°`, harjaPiste.x + 10, harjaPiste.y + 30);

        // Eaves label
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(oikeaRaystaanPaa.x - 20, oikeaRaystaanPaa.y + 20);
        ctx.rotate(-kulmaRad);
        ctx.fillText(`${raystasM.toFixed(2)} m`, 0, 0);
        ctx.restore();

        // Roof height label
        const harjaX = startX + scaledWidth / 2;
        ctx.beginPath();
        ctx.moveTo(harjaX + 40, startY);
        ctx.lineTo(harjaX + 40, startY - scaledRoofRise);
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = 'blue';
        ctx.textAlign = 'left';
        ctx.fillText(`${(katonKorkeus / 100).toFixed(2)} m`, harjaX + 45, startY - scaledRoofRise / 2);

        ctx.restore();
    }

    function reset() {
        form.reset();
        kulmaInput.value = 30;
        leveysInput.value = 800;
        raystasInput.value = 50;
        scaleSlider.value = 50;
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