/**
 * Knowledge Graph visualization for the AUB Thesis Dashboard
 * Creates an interactive graph showing relationships between concepts
 */

// Graph data and configuration
const graphData = {
    nodes: [
        { id: 'AUB', label: 'AUB', group: 'topic' },
        { id: 'Menorrhagia', label: 'Menorrhagia', group: 'symptom' },
        { id: 'Age 31-40', label: 'Age 31-40', group: 'factor' },
        { id: 'Secretory Phase', label: 'Secretory Phase', group: 'finding' },
        { id: 'Proliferative Phase', label: 'Proliferative Phase', group: 'finding' },
        { id: 'Hyperplasia', label: 'Hyperplasia', group: 'finding' },
        { id: 'Carcinoma', label: 'Carcinoma', group: 'finding' },
        { id: 'Histopathology', label: 'Histopathology', group: 'diagnosis' },
        { id: 'Age Factor', label: 'Age Factor', group: 'factor' },
        { id: 'LMP Factor', label: 'LMP Factor', group: 'factor' }
    ],
    edges: [
        { from: 'AUB', to: 'Menorrhagia' }, { from: 'AUB', to: 'Age 31-40' },
        { from: 'AUB', to: 'Secretory Phase' }, { from: 'AUB', to: 'Proliferative Phase' },
        { from: 'AUB', to: 'Histopathology' }, { from: 'Age 31-40', to: 'AUB' },
        { from: 'Age Factor', to: 'Hyperplasia' }, { from: 'Age Factor', to: 'Carcinoma' },
        { from: 'Hyperplasia', to: 'Histopathology' }, { from: 'Carcinoma', to: 'Histopathology' },
        { from: 'LMP Factor', to: 'Histopathology' }, { from: 'Menorrhagia', to: 'Histopathology'}
    ]
};

const legend = {
    'topic': 'Main Topic', 
    'symptom': 'Symptom', 
    'factor': 'Demographic/Factor',
    'finding': 'Histopathological Finding', 
    'diagnosis': 'Diagnostic Method'
};

// Global variables
let graphContainer;
let canvas;
let ctx;
let legendContainer;
let nodes;
let nodeElements;
let edges;
let animationFrameId;

/**
 * Initialize the knowledge graph visualization
 */
function initKnowledgeGraph() {
    console.log('Initializing knowledge graph...');
    
    graphContainer = document.getElementById('graph-container');
    canvas = document.getElementById('graph-canvas');
    ctx = canvas.getContext('2d');
    legendContainer = document.getElementById('graph-legend');
    
    if (!graphContainer || !canvas || !ctx || !legendContainer) {
        console.error('Knowledge graph elements not found');
        return;
    }

    initializeGraph();
    startSimulation();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        initializeGraph();
        startSimulation();
    });
}

/**
 * Set up the graph nodes and edges
 */
function initializeGraph() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    const { width, height } = graphContainer.getBoundingClientRect();
    
    nodes = graphData.nodes.map(n => ({ 
        ...n, 
        x: Math.random() * width, 
        y: Math.random() * height, 
        vx: 0, 
        vy: 0 
    }));
    
    edges = graphData.edges.map(e => ({
        source: nodes.find(n => n.id === e.from),
        target: nodes.find(n => n.id === e.to)
    }));

    // Remove existing nodes
    graphContainer.querySelectorAll('.graph-node').forEach(n => n.remove());
    legendContainer.innerHTML = '';

    // Create legend
    for (const group in legend) {
        const legendItem = document.createElement('div');
        legendItem.className = 'flex items-center gap-2';
        
        // Get color based on the group
        let color;
        switch(group) {
            case 'topic': color = '#0f766e'; break; // teal-700
            case 'finding': color = '#ea580c'; break; // orange-600
            case 'factor': color = '#0284c7'; break; // sky-600
            case 'symptom': color = '#d97706'; break; // amber-600
            case 'diagnosis': color = '#475569'; break; // slate-600
            default: color = '#64748b'; // slate-500
        }
        
        legendItem.innerHTML = `<div class="w-4 h-4 rounded-full" style="background-color: ${color}"></div><span>${legend[group]}</span>`;
        legendContainer.appendChild(legendItem);
    }

    // Create node elements
    nodeElements = nodes.map((node, i) => {
        const el = document.createElement('div');
        el.className = 'graph-node';
        el.textContent = node.label;
        el.dataset.group = node.group;
        el.style.left = `${node.x}px`;
        el.style.top = `${node.y}px`;
        
        // Handle hover interactions
        el.addEventListener('mouseenter', () => highlightConnections(node));
        el.addEventListener('mouseleave', clearHighlights);
        
        graphContainer.appendChild(el);
        return el;
    });
}

/**
 * Start the physics simulation for the graph
 */
function startSimulation() {
    const { width, height } = graphContainer.getBoundingClientRect();
    
    // Settings for the physics simulation
    const settings = {
        charge: -300, // Repulsion force
        linkDistance: 120, // Ideal distance between connected nodes
        centerGravity: 0.1, // Pulls graph to the center
        friction: 0.9, // Slows down movement
    };

    function tick() {
        // 1. Calculate forces
        for (let i = 0; i < nodes.length; i++) {
            const nodeA = nodes[i];
            
            // Centering force
            nodeA.vx += (width / 2 - nodeA.x) * settings.centerGravity * 0.01;
            nodeA.vy += (height / 2 - nodeA.y) * settings.centerGravity * 0.01;

            for (let j = i + 1; j < nodes.length; j++) {
                const nodeB = nodes[j];
                const dx = nodeB.x - nodeA.x;
                const dy = nodeB.y - nodeA.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 1) distance = 1;

                // Repulsion force (charge)
                const force = settings.charge / (distance * distance);
                const forceX = force * (dx / distance);
                const forceY = force * (dy / distance);
                
                nodeA.vx += forceX;
                nodeA.vy += forceY;
                nodeB.vx -= forceX;
                nodeB.vy -= forceY;
            }
        }
        
        // 2. Link spring force
        edges.forEach(edge => {
            const source = edge.source;
            const target = edge.target;
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0) {
                const stretch = (distance - settings.linkDistance) / distance;
                const forceX = dx * stretch * 0.1;
                const forceY = dy * stretch * 0.1;
                source.vx += forceX;
                source.vy += forceY;
                target.vx -= forceX;
                target.vy -= forceY;
            }
        });

        // 3. Update positions
        nodes.forEach(node => {
            node.vx *= settings.friction;
            node.vy *= settings.friction;
            
            node.x += node.vx;
            node.y += node.vy;

            // Boundary collision
            node.x = Math.max(50, Math.min(width - 50, node.x));
            node.y = Math.max(30, Math.min(height - 30, node.y));
        });
        
        // 4. Draw
        draw();
        animationFrameId = requestAnimationFrame(tick);
    }

    tick();
}

/**
 * Draw the graph on the canvas
 */
function draw() {
    const { width, height } = canvas.getBoundingClientRect();
    if (canvas.width !== width || canvas.height !== height) {
       canvas.width = width;
       canvas.height = height;
    }
    ctx.clearRect(0, 0, width, height);

    // Update DOM element positions
    nodes.forEach((node, i) => {
        nodeElements[i].style.left = `${node.x}px`;
        nodeElements[i].style.top = `${node.y}px`;
    });

    // Draw edges
    ctx.strokeStyle = '#cbd5e1'; // gray-300
    ctx.lineWidth = 1.5;
    edges.forEach(edge => {
        ctx.beginPath();
        ctx.moveTo(edge.source.x, edge.source.y);
        ctx.lineTo(edge.target.x, edge.target.y);
        ctx.stroke();
    });
}

/**
 * Highlight connections for a specific node
 * @param {Object} node - The node to highlight connections for
 */
function highlightConnections(node) {
    // First dim all nodes
    nodeElements.forEach(el => el.classList.add('dimmed'));
    
    // Get all connected nodes
    const connectedNodes = new Set();
    connectedNodes.add(node);
    
    edges.forEach(edge => {
        if (edge.source === node) {
            connectedNodes.add(edge.target);
        } else if (edge.target === node) {
            connectedNodes.add(edge.source);
        }
    });
    
    // Highlight connected nodes
    nodeElements.forEach((el, i) => {
        if (connectedNodes.has(nodes[i])) {
            el.classList.remove('dimmed');
            el.classList.add('highlight');
        }
    });
    
    // Highlight edges
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw regular edges first
    ctx.strokeStyle = '#cbd5e1'; // gray-300 (dimmed)
    ctx.lineWidth = 1;
    edges.forEach(edge => {
        if (!connectedNodes.has(edge.source) || !connectedNodes.has(edge.target)) {
            ctx.beginPath();
            ctx.moveTo(edge.source.x, edge.source.y);
            ctx.lineTo(edge.target.x, edge.target.y);
            ctx.stroke();
        }
    });
    
    // Draw highlighted edges
    ctx.strokeStyle = '#0d9488'; // teal-600
    ctx.lineWidth = 2.5;
    edges.forEach(edge => {
        if (connectedNodes.has(edge.source) && connectedNodes.has(edge.target)) {
            ctx.beginPath();
            ctx.moveTo(edge.source.x, edge.source.y);
            ctx.lineTo(edge.target.x, edge.target.y);
            ctx.stroke();
        }
    });
}

/**
 * Clear highlights and return to normal view
 */
function clearHighlights() {
    nodeElements.forEach(el => {
        el.classList.remove('dimmed');
        el.classList.remove('highlight');
    });
    
    // Redraw normal edges
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#cbd5e1'; // gray-300
    ctx.lineWidth = 1.5;
    edges.forEach(edge => {
        ctx.beginPath();
        ctx.moveTo(edge.source.x, edge.source.y);
        ctx.lineTo(edge.target.x, edge.target.y);
        ctx.stroke();
    });
}