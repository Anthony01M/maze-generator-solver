const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const generateButton = document.getElementById('generateMaze');
const solveButton = document.getElementById('solveMaze');

const rows = 20;
const cols = 20;
const cellSize = canvas.width / cols;

let maze = [];
let stack = [];
let currentCell;
let mazeGenerated = false;
let player;

class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.visited = false;
        this.walls = [true, true, true, true];
        this.solutionPath = false;
    }

    draw() {
        const x = this.col * cellSize;
        const y = this.row * cellSize;

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        if (this.walls[0]) ctx.strokeRect(x, y, cellSize, 0);
        if (this.walls[1]) ctx.strokeRect(x + cellSize, y, 0, cellSize);
        if (this.walls[2]) ctx.strokeRect(x, y + cellSize, cellSize, 0);
        if (this.walls[3]) ctx.strokeRect(x, y, 0, cellSize);

        if (this.visited) {
            ctx.fillStyle = 'white';
            ctx.fillRect(x, y, cellSize, cellSize);
        }

        if (this.solutionPath) {
            ctx.fillStyle = 'lightgreen';
            ctx.fillRect(x, y, cellSize, cellSize);
        }

        if (this.row === 0 && this.col === 0) {
            ctx.fillStyle = 'blue';
            ctx.fillRect(x, y, cellSize, cellSize);
        } else if (this.row === rows - 1 && this.col === cols - 1) {
            ctx.fillStyle = 'red';
            ctx.fillRect(x, y, cellSize, cellSize);
        }
    }

    checkNeighbors() {
        const neighbors = [];

        const top = maze[this.row - 1] && maze[this.row - 1][this.col];
        const right = maze[this.row][this.col + 1];
        const bottom = maze[this.row + 1] && maze[this.row + 1][this.col];
        const left = maze[this.row][this.col - 1];

        if (top && !top.visited) neighbors.push(top);
        if (right && !right.visited) neighbors.push(right);
        if (bottom && !bottom.visited) neighbors.push(bottom);
        if (left && !left.visited) neighbors.push(left);

        if (neighbors.length > 0) {
            const randomIndex = Math.floor(Math.random() * neighbors.length);
            return neighbors[randomIndex];
        } else {
            return undefined;
        }
    }
}

class Player {
    constructor() {
        this.row = 0;
        this.col = 0;
    }

    draw() {
        const x = this.col * cellSize;
        const y = this.row * cellSize;
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 4, 0, Math.PI * 2);
        ctx.fill();
    }

    move(row, col) {
        if (row >= 0 && row < rows && col >= 0 && col < cols) {
            const cell = maze[this.row][this.col];
            const targetCell = maze[row][col];

            if (this.row > row && !cell.walls[0] && !targetCell.walls[2]) {
                this.row = row;
                this.col = col;
            } else if (this.row < row && !cell.walls[2] && !targetCell.walls[0]) {
                this.row = row;
                this.col = col;
            } else if (this.col > col && !cell.walls[3] && !targetCell.walls[1]) {
                this.row = row;
                this.col = col;
            } else if (this.col < col && !cell.walls[1] && !targetCell.walls[3]) {
                this.row = row;
                this.col = col;
            }

            if (this.row === rows - 1 && this.col === cols - 1) {
                alert('You win!');
            }
        }
    }
}

function setup() {
    maze = [];
    for (let row = 0; row < rows; row++) {
        const rowArray = [];
        for (let col = 0; col < cols; col++) {
            const cell = new Cell(row, col);
            rowArray.push(cell);
        }
        maze.push(rowArray);
    }

    currentCell = maze[0][0];
    stack = [];
    mazeGenerated = false;
    solveButton.disabled = true;
    player = new Player();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            maze[row][col].draw();
        }
    }

    currentCell.visited = true;
    const nextCell = currentCell.checkNeighbors();

    if (nextCell) {
        nextCell.visited = true;

        stack.push(currentCell);

        removeWalls(currentCell, nextCell);

        currentCell = nextCell;
    } else if (stack.length > 0) {
        currentCell = stack.pop();
    }

    if (stack.length > 0) {
        requestAnimationFrame(draw);
    } else {
        mazeGenerated = true;
        solveButton.disabled = false;
        player.draw();
    }
}

function removeWalls(cell1, cell2) {
    const x = cell1.col - cell2.col;
    const y = cell1.row - cell2.row;

    if (x === 1) {
        cell1.walls[3] = false;
        cell2.walls[1] = false;
    } else if (x === -1) {
        cell1.walls[1] = false;
        cell2.walls[3] = false;
    }

    if (y === 1) {
        cell1.walls[0] = false;
        cell2.walls[2] = false;
    } else if (y === -1) {
        cell1.walls[2] = false;
        cell2.walls[0] = false;
    }
}

function solveMaze() {
    if (!mazeGenerated) return;

    const start = maze[0][0];
    const end = maze[rows - 1][cols - 1];
    const path = [];
    const visited = new Set();

    function dfs(cell) {
        if (cell === end) {
            path.push(cell);
            return true;
        }

        visited.add(cell);
        cell.solutionPath = true;

        const neighbors = getValidNeighbors(cell);

        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                if (dfs(neighbor)) {
                    path.push(cell);
                    return true;
                }
            }
        }

        cell.solutionPath = false;
        return false;
    }

    function getValidNeighbors(cell) {
        const neighbors = [];

        const top = maze[cell.row - 1] && maze[cell.row - 1][cell.col];
        const right = maze[cell.row][cell.col + 1];
        const bottom = maze[cell.row + 1] && maze[cell.row + 1][cell.col];
        const left = maze[cell.row][cell.col - 1];

        if (top && !cell.walls[0] && !top.walls[2]) neighbors.push(top);
        if (right && !cell.walls[1] && !right.walls[3]) neighbors.push(right);
        if (bottom && !cell.walls[2] && !bottom.walls[0]) neighbors.push(bottom);
        if (left && !cell.walls[3] && !left.walls[1]) neighbors.push(left);

        return neighbors;
    }

    dfs(start);
    draw();
}

generateButton.addEventListener('click', () => {
    setup();
    draw();
});

solveButton.addEventListener('click', () => {
    solveMaze();
});

solveButton.disabled = true;

window.addEventListener('keydown', (e) => {
    if (!mazeGenerated) return;

    switch (e.key) {
        case 'ArrowUp':
            player.move(player.row - 1, player.col);
            break;
        case 'ArrowDown':
            player.move(player.row + 1, player.col);
            break;
        case 'ArrowLeft':
            player.move(player.row, player.col - 1);
            break;
        case 'ArrowRight':
            player.move(player.row, player.col + 1);
            break;
    }

    draw();
});