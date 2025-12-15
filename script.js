// Seesaw Physics Simulator
// Torque = Weight × Distance from pivot

class SeesawSimulator {
    constructor() {
        // DOM Elements
        this.board = document.getElementById('seesaw-board');
        this.leftTorqueDisplay = document.getElementById('left-torque');
        this.rightTorqueDisplay = document.getElementById('right-torque');
        this.resetBtn = document.getElementById('reset-btn');
        this.weightBtns = document.querySelectorAll('.weight-btn');
        
        // State
        this.weights = []; // Array of {id, weight, position, element}
        this.selectedWeight = 1;
        this.weightIdCounter = 0;
        
        // Physics constants
        this.maxTiltAngle = 30; // Maximum rotation in degrees
        this.currentAngle = 0; // Track current tilt angle
        
        // Board dimensions (fixed width from CSS)
        this.boardWidth = 700; // Actual board width in pixels
        this.boardCenter = 350; // Center of board
        
        this.init();
    }
    
    init() {
        // Get board dimensions
        this.updateBoardDimensions();
        
        // Event listeners
        this.board.addEventListener('click', (e) => this.handleBoardClick(e));
        this.board.addEventListener('contextmenu', (e) => e.preventDefault());
        
        this.weightBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectWeight(btn));
        });
        
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.updateBoardDimensions();
            this.repositionWeights();
        });
        
        // Load saved state from localStorage
        this.loadState();
    }
    
    updateBoardDimensions() {
        // Board dimensions are fixed in CSS (700px width)
        // This method kept for potential future responsive adjustments
        this.boardWidth = 700;
        this.boardCenter = this.boardWidth / 2;
    }
    
    selectWeight(btn) {
        this.weightBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedWeight = parseInt(btn.dataset.weight);
    }
    
    handleBoardClick(e) {
        // Don't place weight if clicking on existing weight
        if (e.target.closest('.weight')) return;
        
        // Get the board's bounding rect and center point in viewport
        const rect = this.board.getBoundingClientRect();
        const boardCenterX = rect.left + rect.width / 2;
        const boardCenterY = rect.top + rect.height / 2;
        
        // Get click position relative to board center (in viewport coords)
        const clickRelX = e.clientX - boardCenterX;
        const clickRelY = e.clientY - boardCenterY;
        
        // Un-rotate the click position to get position on the un-rotated board
        // Rotate by negative angle to compensate for board rotation
        const angleRad = -this.currentAngle * (Math.PI / 180);
        const cosA = Math.cos(angleRad);
        const sinA = Math.sin(angleRad);
        
        // Apply rotation transformation
        const unrotatedX = clickRelX * cosA - clickRelY * sinA;
        
        // Convert to position on board (0 to boardWidth)
        const pixelPosition = unrotatedX + this.boardCenter;
        
        // Leave some margin on edges (5% each side)
        const margin = this.boardWidth * 0.05;
        const clampedX = Math.max(margin, Math.min(this.boardWidth - margin, pixelPosition));
        
        // Position in pixels from center (negative = left, positive = right)
        const positionFromCenter = clampedX - this.boardCenter;
        
        // Create and place weight
        this.placeWeight(this.selectedWeight, positionFromCenter, clampedX);
    }
    
    placeWeight(weight, positionFromCenter, pixelPosition, save = true) {
        const id = this.weightIdCounter++;
        
        // Create weight element
        const weightEl = document.createElement('div');
        weightEl.className = save ? 'weight placing' : 'weight';
        weightEl.dataset.id = id;
        weightEl.style.left = `${pixelPosition}px`;
        
        const block = document.createElement('div');
        block.className = 'weight-block';
        block.dataset.weight = weight;
        block.textContent = `${weight}`;
        
        weightEl.appendChild(block);
        
        // Click to remove
        weightEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeWeight(id);
        });
        
        // Right-click also removes
        weightEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.removeWeight(id);
        });
        
        this.board.appendChild(weightEl);
        
        // Remove animation class after animation completes
        setTimeout(() => weightEl.classList.remove('placing'), 400);
        
        // Store weight data
        this.weights.push({
            id,
            weight,
            position: positionFromCenter, // Distance from center in pixels
            pixelPosition, // Absolute position on board
            element: weightEl
        });
        
        // Recalculate physics
        this.updatePhysics();
        
        // Save to localStorage
        if (save) {
            this.saveState();
        }
    }
    
    removeWeight(id) {
        const index = this.weights.findIndex(w => w.id === id);
        if (index === -1) return;
        
        const weight = this.weights[index];
        
        // Animate removal
        weight.element.style.transform = 'translateX(-50%) scale(0)';
        weight.element.style.opacity = '0';
        
        setTimeout(() => {
            weight.element.remove();
        }, 200);
        
        this.weights.splice(index, 1);
        this.updatePhysics();
        this.saveState();
    }
    
    calculateTorques() {
        let leftTorque = 0;
        let rightTorque = 0;
        
        this.weights.forEach(w => {
            // Torque = weight × |distance from center|
            const torque = w.weight * Math.abs(w.position);
            
            if (w.position < 0) {
                // Left side (negative position)
                leftTorque += torque;
            } else {
                // Right side (positive position)
                rightTorque += torque;
            }
        });
        
        return { leftTorque, rightTorque };
    }
    
    updatePhysics() {
        const { leftTorque, rightTorque } = this.calculateTorques();
        
        // Update torque display
        this.leftTorqueDisplay.textContent = Math.round(leftTorque);
        this.rightTorqueDisplay.textContent = Math.round(rightTorque);
        
        // Calculate tilt angle from torque difference
        // Positive = tilt right (clockwise), Negative = tilt left (counter-clockwise)
        // Angle is torque difference / 10, capped at ±30 degrees
        this.currentAngle = Math.max(-30, Math.min(30, (rightTorque - leftTorque) / 10));
        
        // Apply rotation to board
        this.board.style.transform = `translateX(-50%) translateY(-50%) rotate(${this.currentAngle}deg)`;
    }
    
    repositionWeights() {
        // Board dimensions are fixed, just update physics
        this.updatePhysics();
    }
    
    reset() {
        // Animate all weights out
        this.weights.forEach(w => {
            w.element.style.transform = 'translateX(-50%) scale(0) rotate(360deg)';
            w.element.style.opacity = '0';
        });
        
        setTimeout(() => {
            this.weights.forEach(w => w.element.remove());
            this.weights = [];
            this.updatePhysics();
            this.saveState();
        }, 300);
    }
    
    saveState() {
        // Save weights data to localStorage (without DOM elements)
        const saveData = this.weights.map(w => ({
            weight: w.weight,
            position: w.position,
            pixelPosition: w.pixelPosition
        }));
        localStorage.setItem('seesawWeights', JSON.stringify(saveData));
    }
    
    loadState() {
        const saved = localStorage.getItem('seesawWeights');
        if (!saved) return;
        
        try {
            const saveData = JSON.parse(saved);
            
            // Recreate each weight
            saveData.forEach(data => {
                this.placeWeight(data.weight, data.position, data.pixelPosition, false);
            });
        } catch (e) {
            console.warn('Failed to load saved state:', e);
            localStorage.removeItem('seesawWeights');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SeesawSimulator();
});

