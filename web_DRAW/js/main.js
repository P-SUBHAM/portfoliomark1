const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');

let currentTool = 'pencil';
let drawing = false;
let startX = 0;
let startY = 0;
let color = '#000000';
let brushSize = 5;
let eraserType = 'stroke';
let drawnElements = []; // Array to store all drawn elements
let currentShape = null; // Variable to store the shape being currently drawn

// Tool Buttons
document.getElementById('pencil').addEventListener('click', () => selectTool('pencil'));
document.getElementById('brush').addEventListener('click', () => selectTool('brush'));
document.getElementById('eraser').addEventListener('click', () => selectTool('eraser'));
document.getElementById('eraser-type').addEventListener('change', (e) => eraserType = e.target.value);
document.getElementById('color-picker').addEventListener('change', (e) => color = e.target.value);
document.getElementById('oval').addEventListener('click', () => selectTool('oval'));
document.getElementById('rectangle').addEventListener('click', () => selectTool('rectangle'));
document.getElementById('line').addEventListener('click', () => selectTool('line'));
document.getElementById('fill').addEventListener('click', () => selectTool('fill'));
document.getElementById('text').addEventListener('click', () => selectTool('text')); // Added Text button listener
document.getElementById('clear').addEventListener('click', clearCanvas); // Clear button listener

// Mouse Events
canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('mouseout', endDraw);

// Touch Events
canvas.addEventListener('touchstart', startDrawTouch);
canvas.addEventListener('touchmove', drawTouch);
canvas.addEventListener('touchend', endDrawTouch);
canvas.addEventListener('touchcancel', endDrawTouch);

function selectTool(tool) {
    currentTool = tool;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawnElements = []; // Clear all stored elements
}

function startDraw(e) {
    if (currentTool === 'text') {
        const text = prompt("Enter text:");
        if (text) {
            const x = e.offsetX;
            const y = e.offsetY;
            ctx.fillStyle = color;
            ctx.font = `${brushSize * 2}px Arial`;
            ctx.fillText(text, x, y);
            drawnElements.push({ type: 'text', text: text, x: x, y: y, color: color, size: brushSize * 2 });
        }
        return;
    }
    drawing = true;
    startX = e.offsetX;
    startY = e.offsetY;
    if (currentTool === 'fill') {
        fillColor(startX, startY);
        drawing = false;
    }
}

function draw(e) {
    if (!drawing) return;
    const x = e.offsetX;
    const y = e.offsetY;

    if (currentTool === 'pencil') {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
        drawnElements.push({ type: 'line', x1: startX, y1: startY, x2: x, y2: y, color: color, size: 1 });
        startX = x;
        startY = y;
    } else if (currentTool === 'brush') {
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
        drawnElements.push({ type: 'line', x1: startX, y1: startY, x2: x, y2: y, color: color, size: brushSize });
        startX = x;
        startY = y;
    } else if (currentTool === 'eraser') {
        if (eraserType === 'stroke') {
            eraseStroke(x, y);
        } else if (eraserType === 'pixel') {
            ctx.clearRect(x, y, brushSize, brushSize);
        }
    } else if (currentTool === 'oval' || currentTool === 'rectangle' || currentTool === 'line') {
        currentShape = { type: currentTool, x1: startX, y1: startY, x2: x, y2: y, color: color, size: brushSize };
        redrawCanvas(); // Redraw to show the temporary shape
    }
}

function endDraw(e) {
    if (!drawing) return;
    drawing = false;
    ctx.beginPath();
    const x = e.offsetX;
    const y = e.offsetY;

    if (currentTool === 'oval' || currentTool === 'rectangle' || currentTool === 'line') {
        if (currentShape) {
            drawShape(currentShape.type, currentShape.x1, currentShape.y1, currentShape.x2, currentShape.y2);
            drawnElements.push(currentShape);
            currentShape = null;
        }
    } else {
        // For shapes and other tools
    }
}

// Touch event handlers
function startDrawTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function drawTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function endDrawTouch(e) {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvas.dispatchEvent(mouseEvent);
}

function drawShape(type, x1, y1, x2, y2) {
    const width = x2 - x1;
    const height = y2 - y1;
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    if (type === 'oval') {
        ctx.beginPath();
        ctx.ellipse(x1 + width / 2, y1 + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, 2 * Math.PI);
        ctx.stroke();
    } else if (type === 'rectangle') {
        ctx.strokeRect(x1, y1, width, height);
    }
}

function drawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function fillColor(x, y) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const targetColor = getPixelColor(imgData, x, y);
    const fillColorRGB = hexToRgb(color);
    floodFill(x, y, targetColor, fillColorRGB, imgData);
    ctx.putImageData(imgData, 0, 0);
}

function getPixelColor(imgData, x, y) {
    const index = (y * imgData.width + x) * 4;
    return {
        r: imgData.data[index],
        g: imgData.data[index + 1],
        b: imgData.data[index + 2],
        a: imgData.data[index + 3]
    };
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

function floodFill(x, y, targetColor, fillColor, imgData) {
    const stack = [[x, y]];
    const visited = new Set();
    while (stack.length > 0) {
        const [currentX, currentY] = stack.pop();
        const key = `${currentX},${currentY}`;
        if (visited.has(key)) continue;
        visited.add(key);
        const currentColor = getPixelColor(imgData, currentX, currentY);
        if (colorsMatch(currentColor, targetColor)) {
            setPixelColor(imgData, currentX, currentY, fillColor);
            if (currentX > 0) stack.push([currentX - 1, currentY]);
            if (currentX < imgData.width - 1) stack.push([currentX + 1, currentY]);
            if (currentY > 0) stack.push([currentX, currentY - 1]);
            if (currentY < imgData.height - 1) stack.push([currentX, currentY + 1]);
        }
    }
}

function colorsMatch(c1, c2) {
    return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b && c1.a === c2.a;
}

function setPixelColor(imgData, x, y, color) {
    const index = (y * imgData.width + x) * 4;
    imgData.data[index] = color.r;
    imgData.data[index + 1] = color.g;
    imgData.data[index + 2] = color.b;
    imgData.data[index + 3] = 255;
}

function eraseStroke(x, y) {
    // Iterate through drawnElements to find intersecting strokes
    for (let i = 0; i < drawnElements.length; i++) {
        const elem = drawnElements[i];
        if (elem.type === 'line' || elem.type === 'oval' || elem.type === 'rectangle') {
            if (isIntersecting(elem, x, y)) {
                drawnElements.splice(i, 1); // Remove the element
                redrawCanvas();
                break;
            }
        }
    }
}

function isIntersecting(element, x, y) {
    // Simple bounding box collision detection
    let minX, minY, maxX, maxY;
    if (element.type === 'line') {
        minX = Math.min(element.x1, element.x2) - brushSize;
        maxX = Math.max(element.x1, element.x2) + brushSize;
        minY = Math.min(element.y1, element.y2) - brushSize;
        maxY = Math.max(element.y1, element.y2) + brushSize;
    } else if (element.type === 'oval' || element.type === 'rectangle') {
        minX = Math.min(element.x1, element.x2) - brushSize;
        maxX = Math.max(element.x1, element.x2) + brushSize;
        minY = Math.min(element.y1, element.y2) - brushSize;
        maxY = Math.max(element.y1, element.y2) + brushSize;
    }
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawnElements.forEach(elem => {
        if (elem.type === 'line') {
            ctx.strokeStyle = elem.color;
            ctx.lineWidth = elem.size;
            ctx.beginPath();
            ctx.moveTo(elem.x1, elem.y1);
            ctx.lineTo(elem.x2, elem.y2);
            ctx.stroke();
        } else if (elem.type === 'oval') {
            ctx.strokeStyle = elem.color;
            ctx.lineWidth = elem.size;
            const width = elem.x2 - elem.x1;
            const height = elem.y2 - elem.y1;
            ctx.beginPath();
            ctx.ellipse(elem.x1 + width / 2, elem.y1 + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (elem.type === 'rectangle') {
            ctx.strokeStyle = elem.color;
            ctx.lineWidth = elem.size;
            const width = elem.x2 - elem.x1;
            const height = elem.y2 - elem.y1;
            ctx.strokeRect(elem.x1, elem.y1, width, height);
        } else if (elem.type === 'text') {
            ctx.fillStyle = elem.color;
            ctx.font = `${elem.size}px Arial`;
            ctx.fillText(elem.text, elem.x, elem.y);
        }
    });
    if (currentShape) {
        ctx.strokeStyle = currentShape.color;
        ctx.lineWidth = currentShape.size;
        const { type, x1, y1, x2, y2 } = currentShape;
        if (type === 'oval') {
            const width = x2 - x1;
            const height = y2 - y1;
            ctx.beginPath();
            ctx.ellipse(x1 + width / 2, y1 + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (type === 'rectangle') {
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        } else if (type === 'line') {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }
}