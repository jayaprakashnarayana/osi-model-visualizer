// Model Data
const osiModel = [
    { num: 7, id: 'L7', name: 'Application', desc: 'Network processes to application. Provides network services to user applications.', pdu: 'Data', protocols: ['HTTP', 'SMTP', 'FTP', 'DNS'], highlight: '#ec4899', header: 'A-HDR' },
    { num: 6, id: 'L6', name: 'Presentation', desc: 'Data representation and encryption. Transforms data formats to provide a standard interface for the Application layer.', pdu: 'Data', protocols: ['SSL/TLS', 'JPEG', 'MPEG', 'ASCII'], highlight: '#d946ef', header: 'P-HDR' },
    { num: 5, id: 'L5', name: 'Session', desc: 'Interhost communication. Establishes, manages and terminates connections between applications.', pdu: 'Data', protocols: ['NetBIOS', 'PPTP', 'RPC'], highlight: '#a855f7', header: 'S-HDR' },
    { num: 4, id: 'L4', name: 'Transport', desc: 'End-to-end connections and reliability. Provides reliable or unreliable delivery, error recovery, and flow control.', pdu: 'Segment / Datagram', protocols: ['TCP', 'UDP'], highlight: '#8b5cf6', header: 'TCP-HDR' },
    { num: 3, id: 'L3', name: 'Network', desc: 'Path determination and logical addressing. Routes packets across different networks.', pdu: 'Packet', protocols: ['IP', 'ICMP', 'IPSec', 'IGMP'], highlight: '#3b82f6', header: 'IP-HDR' },
    { num: 2, id: 'L2', name: 'Data Link', desc: 'Physical addressing (MAC). Formats data into frames and provides node-to-node delivery over the physical medium.', pdu: 'Frame', protocols: ['Ethernet', 'MAC', 'PPP', 'Switching'], highlight: '#06b6d4', header: 'ETH-HDR' },
    { num: 1, id: 'L1', name: 'Physical', desc: 'Media, signal and binary transmission. Transmits raw bitstream over physical medium.', pdu: 'Bits', protocols: ['100Base-T', '802.11', 'Cables', 'Hubs'], highlight: '#10b981', header: null }
];

// TCP/IP is 4 layers, but maps conceptually to OSI
const tcpModel = [
    { num: 4, id: 'L4', name: 'Application', desc: 'Represents data to the user plus encoding and dialog control (combines OSI Application, Presentation, Session).', pdu: 'Data', protocols: ['HTTP', 'FTP', 'DNS', 'TLS'], highlight: '#ec4899', header: 'APP-HDR' },
    { num: 3, id: 'L3', name: 'Transport', desc: 'Supports communication between diverse devices across diverse networks.', pdu: 'Segment', protocols: ['TCP', 'UDP'], highlight: '#8b5cf6', header: 'TCP-HDR' },
    { num: 2, id: 'L2', name: 'Internet', desc: 'Determines the best path through the network (equivalent to OSI Network layer).', pdu: 'Packet', protocols: ['IP', 'ICMP'], highlight: '#3b82f6', header: 'IP-HDR' },
    { num: 1, id: 'L1', name: 'Network Access', desc: 'Controls the hardware devices and media that make up the network (combines OSI Data Link and Physical).', pdu: 'Frame / Bits', protocols: ['Ethernet', 'ARP', 'Drivers'], highlight: '#10b981', header: 'MAC-HDR' }
];

let isOsi = true;
let currentModel = osiModel;

// Simulation State
let simState = 'READY'; // READY, ENCAPSULATING, TRANSMITTING, DECAPSULATING, DONE
let currentLayerIndex = 0; 
let activeHeaders = [];

// DOM Elements
const senderStack = document.getElementById('sender-stack');
const receiverStack = document.getElementById('receiver-stack');
const modelToggle = document.getElementById('model-toggle');
const labelOsi = document.getElementById('label-osi');
const labelTcp = document.getElementById('label-tcp');

const animPacket = document.getElementById('animated-packet');
const packetHeaders = document.getElementById('packet-headers');
const particles = document.getElementById('particles');

const btnStart = document.getElementById('btn-start');
const btnStep = document.getElementById('btn-step');
const btnReset = document.getElementById('btn-reset');
const statusText = document.getElementById('status-text');

// Info Panel Elements
const infoPanel = {
    placeholder: document.getElementById('panel-placeholder'),
    content: document.getElementById('panel-content'),
    layerNum: document.getElementById('info-layer-num'),
    layerName: document.getElementById('info-layer-name'),
    desc: document.getElementById('info-desc'),
    pdu: document.getElementById('info-pdu'),
    action: document.getElementById('info-action'),
    protocols: document.getElementById('info-protocols')
};

// Initialize
function init() {
    renderStacks();
    setupEventListeners();
    resetSimulation();
}

function renderStacks() {
    senderStack.innerHTML = '';
    receiverStack.innerHTML = '';
    currentModel = isOsi ? osiModel : tcpModel;

    currentModel.forEach((layer, index) => {
        senderStack.appendChild(createLayerElement(layer, index, 'sender'));
        receiverStack.appendChild(createLayerElement(layer, index, 'receiver'));
    });
}

function createLayerElement(layer, index, type) {
    const el = document.createElement('div');
    el.className = 'layer';
    el.id = `${type}-layer-${index}`;
    // Store layer data
    el.dataset.index = index;
    el.dataset.type = type;
    
    el.innerHTML = `
        <span class="layer-num">${isOsi ? 'L' + layer.num : layer.name.substring(0,3).toUpperCase()}</span>
        <span class="layer-name">${layer.name}</span>
        <span class="layer-pdu">${layer.pdu.split(' ')[0]}</span>
    `;

    el.addEventListener('click', () => showLayerInfo(layer, type === 'sender' ? 'Encapsulation' : 'Decapsulation'));
    return el;
}

function showLayerInfo(layer, actionText) {
    infoPanel.placeholder.style.display = 'none';
    infoPanel.content.classList.remove('hidden');

    infoPanel.layerNum.textContent = isOsi ? 'L' + layer.num : 'L' + layer.num;
    infoPanel.layerNum.style.backgroundColor = layer.highlight;
    infoPanel.layerName.textContent = layer.name;
    infoPanel.desc.textContent = layer.desc;
    infoPanel.pdu.textContent = layer.pdu;
    infoPanel.action.textContent = actionText;

    infoPanel.protocols.innerHTML = '';
    layer.protocols.forEach(p => {
        const span = document.createElement('span');
        span.textContent = p;
        infoPanel.protocols.appendChild(span);
    });
}

function updateStatus(text) {
    statusText.textContent = text;
}

function clearActiveLayers() {
    document.querySelectorAll('.layer').forEach(l => {
        l.classList.remove('active', 'processing');
    });
}

// Positioning Helper
function getCenterCoords(element) {
    const rect = element.getBoundingClientRect();
    const containerRect = document.querySelector('.simulation-area').getBoundingClientRect();
    
    return {
        x: rect.left - containerRect.left + (rect.width / 2),
        y: rect.top - containerRect.top + (rect.height / 2)
    };
}

// Simulation Flow
function updatePacketPosition(layerIndex, side) {
    const targetElementId = `${side}-layer-${layerIndex}`;
    const targetElement = document.getElementById(targetElementId);
    
    if (targetElement) {
        const coords = getCenterCoords(targetElement);
        // Add offset to position packet to the right of sender stack, left of receiver stack
        const offsetX = side === 'sender' ? (targetElement.offsetWidth / 2 + 30) : -(targetElement.offsetWidth / 2 + 30);
        
        animPacket.style.transform = `translate(calc(-50% + ${coords.x + offsetX}px), calc(-50% + ${coords.y}px))`;
        
        // Ensure packet faces correct direction
        if (side === 'receiver') {
            animPacket.style.flexDirection = 'row'; // headers on left, data on right
            // but we need to reverse the order visually so data is leading for receiver?
            // Actually, keep it consistent. Headers on front of data.
        } else {
             animPacket.style.flexDirection = 'row';
        }
    }
}

function renderHeaders() {
    packetHeaders.innerHTML = '';
    activeHeaders.forEach(hdr => {
        const div = document.createElement('div');
        div.className = 'header-block';
        div.style.backgroundColor = hdr.color;
        div.textContent = hdr.text;
        packetHeaders.appendChild(div);
    });
}

function processStep() {
    clearActiveLayers();
    
    if (simState === 'READY') {
        simState = 'ENCAPSULATING';
        currentLayerIndex = 0;
        animPacket.style.display = 'flex';
        activeHeaders = [];
        renderHeaders();
        updatePacketPosition(0, 'sender');
        btnStart.disabled = true;
        btnStep.disabled = false;
        updateStatus('Sender generating payload...');
        return; // wait for next click to actually process L7
    }

    if (simState === 'ENCAPSULATING') {
        if (currentLayerIndex < currentModel.length) {
            const layer = currentModel[currentLayerIndex];
            const senderLayer = document.getElementById(`sender-layer-${currentLayerIndex}`);
            senderLayer.classList.add('processing');
            
            updatePacketPosition(currentLayerIndex, 'sender');
            showLayerInfo(layer, 'Encapsulation');
            
            if (layer.header) {
                activeHeaders.unshift({ text: layer.header, color: layer.highlight });
                renderHeaders();
            }
            
            if (layer.pdu === 'Bits') {
                updateStatus(`Converting to ${layer.pdu} at Physical layer...`);
            } else {
                updateStatus(`Adding header at ${layer.name} layer... -> ${layer.pdu}`);
            }

            currentLayerIndex++;
        } else {
            // Done encapsulating, move to clear wire
            simState = 'TRANSMITTING';
            const lastSenderLayer = document.getElementById(`sender-layer-${currentModel.length - 1}`);
            lastSenderLayer.classList.add('active'); // active indicating sent
            
            // Move packet to wire
            const wire = document.querySelector('.network-wire');
            const wireCoords = getCenterCoords(wire);
            animPacket.style.transform = `translate(calc(-50% + ${wireCoords.x}px), calc(-50% + ${wireCoords.y}px))`;
            
            particles.classList.add('active');
            updateStatus('Transmitting over physical medium...');
        }
        return;
    }

    if (simState === 'TRANSMITTING') {
        simState = 'DECAPSULATING';
        currentLayerIndex = currentModel.length - 1; // Start at bottom index (L1 for OSI)
        particles.classList.remove('active');
        
        // Move to receiver L1
        updatePacketPosition(currentLayerIndex, 'receiver');
        updateStatus('Data received! Beginning decapsulation...');
        return;
    }

    if (simState === 'DECAPSULATING') {
        if (currentLayerIndex >= 0) {
            const layer = currentModel[currentLayerIndex];
            const receiverLayer = document.getElementById(`receiver-layer-${currentLayerIndex}`);
            receiverLayer.classList.add('processing');
            
            updatePacketPosition(currentLayerIndex, 'receiver');
            showLayerInfo(layer, 'Decapsulation');
            
            if (layer.header) {
                // Remove header (top of array)
                activeHeaders.shift();
                renderHeaders();
                updateStatus(`Stripped header at ${layer.name} layer... recovering ${layer.pdu}`);
            } else {
                updateStatus(`Reading bits at ${layer.name} layer...`);
            }

            currentLayerIndex--;
        } else {
            // Done!
            simState = 'DONE';
            animPacket.style.display = 'none';
            activeHeaders = [];
            renderHeaders();
            
            // Highlight the app layer on receiver
            document.getElementById(`receiver-layer-0`).classList.add('active');
            updateStatus('Data successfully received by the application!');
            
            btnStep.disabled = true;
            btnStart.disabled = false;
            btnStart.textContent = 'Send Another';
        }
        return;
    }
}

function resetSimulation() {
    simState = 'READY';
    currentLayerIndex = 0;
    activeHeaders = [];
    
    clearActiveLayers();
    
    animPacket.style.display = 'none';
    particles.classList.remove('active');
    renderHeaders();
    
    btnStart.disabled = false;
    btnStart.textContent = 'Send Message';
    btnStep.disabled = true;
    
    updateStatus('Ready to transmit');
    
    infoPanel.placeholder.style.display = 'flex';
    infoPanel.content.classList.add('hidden');
}

// Event Listeners
function setupEventListeners() {
    modelToggle.addEventListener('change', (e) => {
        isOsi = !e.target.checked;
        labelOsi.classList.toggle('active', isOsi);
        labelTcp.classList.toggle('active', !isOsi);
        resetSimulation();
        renderStacks();
    });

    btnStart.addEventListener('click', () => {
        if (simState === 'DONE') {
            resetSimulation();
        }
        processStep(); 
    });

    btnStep.addEventListener('click', () => {
        processStep();
    });
    
    btnReset.addEventListener('click', resetSimulation);
    
    // Automatic resize handling
    window.addEventListener('resize', () => {
        if (simState === 'ENCAPSULATING' && currentLayerIndex > 0) {
            updatePacketPosition(currentLayerIndex - 1, 'sender');
        } else if (simState === 'DECAPSULATING' && currentLayerIndex < currentModel.length - 1) {
            updatePacketPosition(currentLayerIndex + 1, 'receiver');
        } else if (simState === 'TRANSMITTING') {
            const wire = document.querySelector('.network-wire');
            const wireCoords = getCenterCoords(wire);
            animPacket.style.transform = `translate(calc(-50% + ${wireCoords.x}px), calc(-50% + ${wireCoords.y}px))`;
        }
    });
}

// Boot up
window.addEventListener('DOMContentLoaded', init);
