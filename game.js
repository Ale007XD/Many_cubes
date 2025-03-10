// Инициализация игры
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

// Настройка размера canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Константы игры
const GRAVITY = 0.5;
const JUMP_FORCE = 12;
const SPEED = 3;
const MIN_OBSTACLE_DISTANCE = 200; // Минимальное расстояние между препятствиями
const COLORS = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3', '#33FFF3'];

// Класс для изометрического преобразования
class IsometricHelper {
    constructor() {
        // Матрица изометрического преобразования
        this.isoAngle = Math.PI / 6; // 30 градусов
        this.scale = 1;
    }

    // Преобразование 3D координат в 2D для отрисовки
    to2D(x, y, z) {
        const isoX = (x - z) * Math.cos(this.isoAngle) * this.scale;
        const isoY = (x + z) * Math.sin(this.isoAngle) * this.scale - y * this.scale;
        return { x: isoX + canvas.width / 2, y: isoY + canvas.height / 2 };
    }
}

// Класс игрока (зеленый шар)
class Player {
    constructor() {
        this.x = 0;
        this.z = 0;
        this.y = 0;
        this.radius = 20;
        this.velocityY = 0;
        this.isJumping = false;
        this.color = '#33FF57'; // Зеленый цвет
    }

    update() {
        // Применение гравитации
        this.velocityY += GRAVITY;
        this.y -= this.velocityY;

        // Проверка приземления
        if (this.y <= 0) {
            this.y = 0;
            this.velocityY = 0;
            this.isJumping = false;
        }

        // Движение вперед
        this.z += SPEED;
    }

    jump() {
        if (!this.isJumping) {
            this.velocityY = JUMP_FORCE;
            this.isJumping = true;
        }
    }

    draw() {
        const pos = iso.to2D(this.x, this.y, this.z);
        
        // Рисуем тень
        ctx.beginPath();
        ctx.ellipse(pos.x, iso.to2D(this.x, 0, this.z).y, this.radius * 0.8, this.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();
        
        // Рисуем шар
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    // Проверка столкновения с препятствием
    collidesWith(obstacle) {
        // Проверяем только если мы находимся в диапазоне z препятствия
        if (Math.abs(this.z - obstacle.z) < obstacle.depth / 2 + this.radius) {
            // Проверяем столкновение по x
            if (Math.abs(this.x - obstacle.x) < obstacle.width / 2 + this.radius) {
                // Проверяем столкновение по y
                if (this.y < obstacle.height && !this.isAbove(obstacle)) {
                    return true;
                }
            }
        }
        return false;
    }

    // Проверка, находится ли игрок над препятствием
    isAbove(obstacle) {
        return this.y > obstacle.height;
    }
}

// Класс препятствия (кубики)
class Obstacle {
    constructor(z) {
        this.width = 40 + Math.random() * 40; // Случайная ширина
        this.height = 30 + Math.random() * 70; // Случайная высота
        this.depth = 40 + Math.random() * 40; // Случайная глубина
        this.x = Math.random() > 0.5 ? 50 : -50; // Случайное положение по x
        this.z = z;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.passed = false;
    }

    draw() {
        // Рисуем куб в изометрической проекции
        const frontBottomLeft = iso.to2D(this.x - this.width / 2, 0, this.z - this.depth / 2);
        const frontBottomRight = iso.to2D(this.x + this.width / 2, 0, this.z - this.depth / 2);
        const frontTopLeft = iso.to2D(this.x - this.width / 2, this.height, this.z - this.depth / 2);
        const frontTopRight = iso.to2D(this.x + this.width / 2, this.height, this.z - this.depth / 2);
        
        const backBottomLeft = iso.to2D(this.x - this.width / 2, 0, this.z + this.depth / 2);
        const backBottomRight = iso.to2D(this.x + this.width / 2, 0, this.z + this.depth / 2);
        const backTopLeft = iso.to2D(this.x - this.width / 2, this.height, this.z + this.depth / 2);
        const backTopRight = iso.to2D(this.x + this.width / 2, this.height, this.z + this.depth / 2);

        // Верхняя грань
        ctx.beginPath();
        ctx.moveTo(frontTopLeft.x, frontTopLeft.y);
        ctx.lineTo(frontTopRight.x, frontTopRight.y);
        ctx.lineTo(backTopRight.x, backTopRight.y);
        ctx.lineTo(backTopLeft.x, backTopLeft.y);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // Левая грань
        ctx.beginPath();
        ctx.moveTo(frontBottomLeft.x, frontBottomLeft.y);
        ctx.lineTo(frontTopLeft.x, frontTopLeft.y);
        ctx.lineTo(backTopLeft.x, backTopLeft.y);
        ctx.lineTo(backBottomLeft.x, backBottomLeft.y);
        ctx.closePath();
        ctx.fillStyle = this.darkenColor(this.color, 20);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // Правая грань
        ctx.beginPath();
        ctx.moveTo(frontBottomRight.x, frontBottomRight.y);
        ctx.lineTo(frontTopRight.x, frontTopRight.y);
        ctx.lineTo(backTopRight.x, backTopRight.y);
        ctx.lineTo(backBottomRight.x, backBottomRight.y);
        ctx.closePath();
        ctx.fillStyle = this.darkenColor(this.color, 40);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
    }

    // Затемнение цвета для создания эффекта объема
    darkenColor(color, percent) {
        const num = parseInt(color.slice(1), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
    }
}

// Класс игры
class Game {
    constructor() {
        this.player = new Player();
        this.obstacles = [];
        this.score = 0;
        this.gameOver = false;
        this.lastObstacleZ = 300; // Начальная позиция первого препятствия
        
        // Создаем начальные препятствия
        this.generateInitialObstacles();
    }

    generateInitialObstacles() {
        for (let i = 0; i < 5; i++) {
            this.addObstacle();
        }
    }

    addObstacle() {
        const z = this.lastObstacleZ + MIN_OBSTACLE_DISTANCE + Math.random() * 200;
        this.obstacles.push(new Obstacle(z));
        this.lastObstacleZ = z;
    }

    update() {
        if (this.gameOver) return;

        this.player.update();

        // Обновление препятствий
        for (let i = 0; i < this.obstacles.length; i++) {
            const obstacle = this.obstacles[i];
            
            // Проверка столкновения
            if (this.player.collidesWith(obstacle)) {
                this.endGame();
                return;
            }

            // Проверка прохождения препятствия
            if (!obstacle.passed && this.player.z > obstacle.z + obstacle.depth / 2) {
                obstacle.passed = true;
                this.score++;
                scoreElement.textContent = `Счет: ${this.score}`;
            }
        }

        // Удаление препятствий, которые остались позади
        this.obstacles = this.obstacles.filter(obstacle => 
            obstacle.z > this.player.z - 300);

        // Добавление новых препятствий
        if (this.obstacles.length < 5) {
            this.addObstacle();
        }
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Рисуем пол (сетка)
        this.drawGrid();

        // Сортируем объекты по z для правильного порядка отрисовки
        const allObjects = [...this.obstacles, this.player].sort((a, b) => a.z - b.z);
        
        // Рисуем все объекты
        allObjects.forEach(obj => obj.draw());
    }

    drawGrid() {
        const gridSize = 50;
        const gridExtent = 1000;
        const playerGridZ = Math.floor(this.player.z / gridSize) * gridSize;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        
        // Горизонтальные линии
        for (let z = playerGridZ - gridExtent; z < playerGridZ + gridExtent; z += gridSize) {
            const start = iso.to2D(-gridExtent, 0, z);
            const end = iso.to2D(gridExtent, 0, z);
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
        
        // Вертикальные линии
        for (let x = -gridExtent; x < gridExtent; x += gridSize) {
            const start = iso.to2D(x, 0, playerGridZ - gridExtent);
            const end = iso.to2D(x, 0, playerGridZ + gridExtent);
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
    }

    handleTap() {
        if (!this.gameOver) {
            this.player.jump();
        }
    }

    endGame() {
        this.gameOver = true;
        finalScoreElement.textContent = this.score;
        gameOverElement.style.display = 'block';
    }

    restart() {
        this.player = new Player();
        this.obstacles = [];
        this.score = 0;
        this.gameOver = false;
        this.lastObstacleZ = 300;
        this.generateInitialObstacles();
        scoreElement.textContent = `Счет: 0`;
        gameOverElement.style.display = 'none';
    }
}

// Инициализация игры
const iso = new IsometricHelper();
let game = new Game();

// Обработчики событий
canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    game.handleTap();
});

canvas.addEventListener('mousedown', function(e) {
    game.handleTap();
});

restartBtn.addEventListener('click', function() {
    game.restart();
});

// Основной игровой цикл
function gameLoop() {
    game.update();
    game.draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
