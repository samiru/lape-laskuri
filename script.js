document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calculator-form');
    const kulmaInput = document.getElementById('katon-kulma');
    const leveysInput = document.getElementById('rakennuksen-leveys');
    const raystasInput = document.getElementById('raystaan-pituus');
    const tulosSpan = document.querySelector('#tulos span');
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
            tulosSpan.textContent = 'Virheelliset syötteet';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        const kulmaRad = kulma * (Math.PI / 180);
        const lapePituus = (leveys / 2) / Math.cos(kulmaRad) + raystas;
        tulosSpan.textContent = `${lapePituus.toFixed(2)} cm`;

        drawRoof(kulma, leveys, raystas, scale);
    }

    function drawRoof(kulma, leveys, raystas, scale) {
        const canvasWidth = 600;
        const canvasHeight = 400;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.save();

        // Convert cm inputs to meters for scaling
        const leveysM = leveys / 100;
        const raystasM = raystas / 100;
        
        // Visual representation uses a fixed height for the wall
        const visualWallHeightM = 2.5; 

        const buildingWidth = leveysM * scale;
        const eavesLength = raystasM * scale;
        const roofRise = (leveysM / 2) * Math.tan(kulma * (Math.PI / 180)) * scale;
        const wallHeight = visualWallHeightM * scale;

        const totalWidth = buildingWidth + 2 * eavesLength;
        const totalHeight = wallHeight + roofRise;

        let drawingScale = 1;
        if (totalWidth > canvasWidth * 0.9) {
            drawingScale = (canvasWidth * 0.9) / totalWidth;
        }
        if (totalHeight > canvasHeight * 0.9) {
            drawingScale = Math.min(drawingScale, (canvasHeight * 0.9) / totalHeight);
        }

        const scaledWidth = buildingWidth * drawingScale;
        const scaledEaves = eavesLength * drawingScale;
        const scaledRoofRise = roofRise * drawingScale;
        const scaledWallHeight = wallHeight * drawingScale;

        const startX = (canvasWidth - scaledWidth) / 2;
        const startY = (canvasHeight + scaledWallHeight - scaledRoofRise) / 2;

        // Draw building base
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, scaledWidth, scaledWallHeight);

        // Draw roof structure
        ctx.beginPath();
        ctx.moveTo(startX - scaledEaves, startY);
        ctx.lineTo(startX + scaledWidth / 2, startY - scaledRoofRise);
        ctx.lineTo(startX + scaledWidth + scaledEaves, startY);
        ctx.strokeStyle = '#333';
        ctx.stroke();

        // Highlight the calculated slope (lape)
        ctx.beginPath();
        ctx.moveTo(startX + scaledWidth / 2, startY - scaledRoofRise);
        ctx.lineTo(startX + scaledWidth + scaledEaves, startY);
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
        ctx.fillText(`${kulma}°`, startX + scaledWidth / 2 + 10, startY - scaledRoofRise / 2);
        
        // Eaves
        ctx.textAlign = 'center';
        ctx.fillText(`${raystasM.toFixed(2)} m`, startX + scaledWidth + scaledEaves / 2, startY - 10);

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