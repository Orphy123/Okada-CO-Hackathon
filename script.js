// Configuration
const API_BASE_URL = 'http://localhost:8000';
let currentUser = null;
let isTyping = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadInitialData();
});

function initializeApp() {
    // Check for existing user session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }
    
    // Setup smooth scrolling for navigation
    setupSmoothScrolling();
    
    // Setup file upload drag and drop
    setupFileUpload();
    
    // Setup chat input
    setupChatInput();
    
    // Load portfolio stats
    loadPortfolioStats();
}

function setupEventListeners() {
    // Navigation active state
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            scrollToSection(target);
            updateActiveNavLink(this);
        });
    });
    
    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    
    // File input change
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    
    // Chat input enter key
    document.getElementById('chatInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Portfolio query enter key
    document.getElementById('portfolioQuery').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            analyzePortfolio();
        }
    });
    
    // Modal close on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal.id);
            }
        }
    });
}

function setupSmoothScrolling() {
    // Update active nav link on scroll
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        handleFileUpload({ target: { files } });
    });
    
    // Click to upload
    uploadArea.addEventListener('click', function() {
        document.getElementById('fileInput').click();
    });
}

function setupChatInput() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Navigation functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

function updateActiveNavLink(activeLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

// Modal functions
function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function showSignupModal() {
    document.getElementById('signupModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = '';
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        // In a real app, you would authenticate with your backend
        // For demo purposes, we'll simulate a successful login
        const user = {
            id: 'user_' + Date.now(),
            email: email,
            name: email.split('@')[0],
            company: 'Demo Company'
        };
        
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateUIForLoggedInUser();
        closeModal('loginModal');
        showNotification('Welcome back! Login successful.', 'success');
        
    } catch (error) {
        showNotification('Login failed. Please try again.', 'error');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const company = document.getElementById('signupCompany').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/crm/create_user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                company: company || null,
                preferences: null
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            const user = {
                id: data.user_id,
                name: name,
                email: email,
                company: company
            };
            
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            updateUIForLoggedInUser();
            closeModal('signupModal');
            showNotification('Account created successfully! Welcome to AI CRE Assistant.', 'success');
        } else {
            throw new Error('Signup failed');
        }
        
    } catch (error) {
        showNotification('Signup failed. Please try again.', 'error');
    }
}

function updateUIForLoggedInUser() {
    if (currentUser) {
        // Update navigation buttons
        const navActions = document.querySelector('.nav-actions');
        navActions.innerHTML = `
            <span class="user-greeting">Hello, ${currentUser.name}</span>
            <button class="btn btn-outline" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i>
                Logout
            </button>
        `;
        
        // Update chat user info
        const chatUserInfo = document.getElementById('chatUserInfo');
        if (chatUserInfo) {
            chatUserInfo.textContent = `${currentUser.name} (${currentUser.company || 'Individual'})`;
        }
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    location.reload();
}

// Chat functions
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message || isTyping) return;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    input.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    isTyping = true;
    
    // Disable send button
    const sendButton = document.getElementById('sendButton');
    sendButton.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/chat/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: currentUser?.id || 'anonymous',
                message: message
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            removeTypingIndicator();
            addMessageToChat(data.response, 'ai');
        } else {
            throw new Error('Chat request failed');
        }
        
    } catch (error) {
        removeTypingIndicator();
        addMessageToChat('Sorry, I encountered an error. Please try again later.', 'ai');
        showNotification('Chat error occurred. Please check your connection.', 'error');
    } finally {
        isTyping = false;
        sendButton.disabled = false;
    }
}

function sendQuickMessage(message) {
    document.getElementById('chatInput').value = message;
    sendMessage();
}

function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
        </div>
        <div class="message-content">
            <p>${formatMessage(message)}</p>
            <span class="message-time">${time}</span>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatMessage(message) {
    // Convert line breaks to HTML
    return message.replace(/\n/g, '<br>');
}

function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <p>
                <span class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </p>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function clearChat() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
        <div class="message ai-message">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>Hello! I'm your AI Commercial Real Estate Assistant. I can help you:</p>
                <ul>
                    <li>Analyze property portfolios</li>
                    <li>Find investment opportunities</li>
                    <li>Answer questions about market data</li>
                    <li>Process and search through documents</li>
                </ul>
                <p>What would you like to explore today?</p>
                <span class="message-time">Just now</span>
            </div>
        </div>
    `;
}

function exportChat() {
    const messages = document.querySelectorAll('.message:not(.typing-indicator)');
    let chatText = 'AI CRE Assistant - Chat Export\n';
    chatText += `Date: ${new Date().toLocaleDateString()}\n`;
    chatText += `User: ${currentUser?.name || 'Guest'}\n\n`;
    
    messages.forEach(message => {
        const sender = message.classList.contains('user-message') ? 'User' : 'AI Assistant';
        const content = message.querySelector('p').textContent;
        const time = message.querySelector('.message-time').textContent;
        chatText += `${sender} (${time}): ${content}\n\n`;
    });
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cre-chat-export-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Chat exported successfully!', 'success');
}

function toggleChatSettings() {
    showNotification('Chat settings coming soon!', 'info');
}

// Portfolio analysis functions
function setQuery(query) {
    document.getElementById('portfolioQuery').value = query;
}

async function analyzePortfolio() {
    const query = document.getElementById('portfolioQuery').value.trim();
    const generateChart = document.getElementById('generateChart').checked;
    const downloadCsv = document.getElementById('downloadCsv').checked;
    
    if (!query) {
        showNotification('Please enter a query to analyze your portfolio', 'warning');
        return;
    }
    
    const resultsContainer = document.getElementById('portfolioResults');
    const analyzeButton = document.getElementById('analyzeButton');
    
    // Show loading state
    resultsContainer.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <h3>Analyzing Your Portfolio</h3>
            <p>Processing your query and searching through property data...</p>
        </div>
    `;
    
    analyzeButton.disabled = true;
    analyzeButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/analyze/analyze_portfolio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: currentUser?.id || 'anonymous',
                query: query,
                return_chart: generateChart,
                download_csv: downloadCsv
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            displayPortfolioResults(data);
            showNotification(`Analysis complete! Found ${data.total_matches} matching properties.`, 'success');
        } else {
            throw new Error('Portfolio analysis failed');
        }
        
    } catch (error) {
        resultsContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Analysis Failed</h3>
                <p>Unable to analyze portfolio. Please check your connection and try again.</p>
                <button class="btn btn-primary" onclick="analyzePortfolio()">
                    <i class="fas fa-redo"></i>
                    Try Again
                </button>
            </div>
        `;
        showNotification('Portfolio analysis failed. Please try again.', 'error');
    } finally {
        analyzeButton.disabled = false;
        analyzeButton.innerHTML = '<i class="fas fa-search"></i> Analyze Portfolio';
    }
}

function displayPortfolioResults(data) {
    const resultsContainer = document.getElementById('portfolioResults');
    
    let resultsHTML = `
        <div class="results-content">
            <div class="results-header">
                <h3>Analysis Results</h3>
                <p>Found <strong>${data.total_matches}</strong> properties matching your criteria</p>
            </div>
            
            <div class="results-summary">
                <h4><i class="fas fa-chart-line"></i> Summary</h4>
                <p>${data.summary}</p>
            </div>
            
            <div class="results-interpretation">
                <h4><i class="fas fa-code"></i> Query Interpretation</h4>
                <pre>${data.query_interpretation}</pre>
            </div>
    `;
    
    if (data.matches && data.matches.length > 0) {
        resultsHTML += `
            <div class="results-table">
                <h4><i class="fas fa-table"></i> Matching Properties (Top ${Math.min(data.matches.length, 10)})</h4>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Property Address</th>
                                <th>Suite</th>
                                <th>Size (SF)</th>
                                <th>Rent/SF/Year</th>
                                <th>GCI (3 Years)</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        data.matches.slice(0, 10).forEach(property => {
            resultsHTML += `
                <tr>
                    <td><strong>${property['Property Address'] || 'N/A'}</strong></td>
                    <td>${property['Suite'] || 'N/A'}</td>
                    <td>${formatNumber(property['Size (SF)']) || 'N/A'}</td>
                    <td>${property['Rent/SF/Year'] || 'N/A'}</td>
                    <td>${property['GCI On 3 Years'] || 'N/A'}</td>
                </tr>
            `;
        });
        
        resultsHTML += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    if (data.chart_url || data.csv_url) {
        resultsHTML += `
            <div class="results-downloads">
                <h4><i class="fas fa-download"></i> Downloads</h4>
                <div class="download-buttons">
        `;
        
        if (data.chart_url) {
            resultsHTML += `
                <a href="${API_BASE_URL}${data.chart_url}" target="_blank" class="btn btn-outline">
                    <i class="fas fa-chart-bar"></i>
                    View Chart
                </a>
            `;
        }
        
        if (data.csv_url) {
            resultsHTML += `
                <a href="${API_BASE_URL}${data.csv_url}" download class="btn btn-outline">
                    <i class="fas fa-file-csv"></i>
                    Download CSV
                </a>
            `;
        }
        
        resultsHTML += `
                </div>
            </div>
        `;
    }
    
    resultsHTML += '</div>';
    resultsContainer.innerHTML = resultsHTML;
}

function formatNumber(num) {
    if (!num) return 'N/A';
    return new Intl.NumberFormat().format(num);
}

// File upload functions
async function handleFileUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const formData = new FormData();
    Array.from(files).forEach(file => {
        formData.append('files', file);
    });
    
    // Show upload progress
    showUploadProgress();
    
    try {
        const response = await fetch(`${API_BASE_URL}/chat/upload_docs`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            hideUploadProgress();
            showNotification(`Successfully uploaded ${data.files_processed} files and added ${data.chunks_added} text chunks to the knowledge base.`, 'success');
            loadKnowledgeBaseStats();
        } else {
            throw new Error('Upload failed');
        }
        
    } catch (error) {
        hideUploadProgress();
        showNotification('Upload failed. Please check your files and try again.', 'error');
    }
    
    // Reset file input
    event.target.value = '';
}

function showUploadProgress() {
    const uploadArea = document.getElementById('uploadArea');
    const progressContainer = document.getElementById('uploadProgress');
    
    uploadArea.style.display = 'none';
    progressContainer.style.display = 'block';
    
    // Simulate progress
    let progress = 0;
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressDetails = document.getElementById('progressDetails');
    
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
        
        if (progress < 30) {
            progressDetails.textContent = 'Uploading files...';
        } else if (progress < 60) {
            progressDetails.textContent = 'Extracting text content...';
        } else if (progress < 90) {
            progressDetails.textContent = 'Processing and indexing...';
        }
    }, 200);
    
    // Store interval for cleanup
    uploadArea.dataset.progressInterval = interval;
}

function hideUploadProgress() {
    const uploadArea = document.getElementById('uploadArea');
    const progressContainer = document.getElementById('uploadProgress');
    
    // Clear progress interval
    const interval = uploadArea.dataset.progressInterval;
    if (interval) {
        clearInterval(interval);
        delete uploadArea.dataset.progressInterval;
    }
    
    // Complete progress
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressDetails = document.getElementById('progressDetails');
    
    progressFill.style.width = '100%';
    progressText.textContent = '100%';
    progressDetails.textContent = 'Upload complete!';
    
    // Hide progress and show upload area after a delay
    setTimeout(() => {
        uploadArea.style.display = 'block';
        progressContainer.style.display = 'none';
        
        // Reset progress
        progressFill.style.width = '0%';
        progressText.textContent = '0%';
        progressDetails.textContent = 'Analyzing document content...';
    }, 1500);
}

// Data loading functions
async function loadInitialData() {
    await Promise.all([
        loadKnowledgeBaseStats(),
        loadPortfolioStats()
    ]);
}

async function loadKnowledgeBaseStats() {
    try {
        // Simulate loading knowledge base stats
        // In a real app, you would call an API endpoint
        const stats = {
            total_documents: Math.floor(Math.random() * 50) + 150,
            total_chunks: Math.floor(Math.random() * 500) + 1200,
            index_status: 'Ready',
            ai_accuracy: '99.9%'
        };
        
        document.getElementById('totalDocs').textContent = stats.total_documents;
        document.getElementById('totalChunks').textContent = formatNumber(stats.total_chunks);
        document.getElementById('indexStatus').textContent = stats.index_status;
        document.getElementById('aiAccuracy').textContent = stats.ai_accuracy;
        
    } catch (error) {
        console.error('Failed to load knowledge base stats:', error);
    }
}

async function loadPortfolioStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/analyze/portfolio_stats`);
        
        if (response.ok) {
            const stats = await response.json();
            
            // Update placeholder stats in portfolio section
            const placeholderStats = document.querySelectorAll('.placeholder-stat');
            if (placeholderStats.length >= 3) {
                placeholderStats[0].querySelector('.stat-number').textContent = stats.total_properties;
                placeholderStats[1].querySelector('.stat-number').textContent = `$${stats.avg_rent_per_sf.toFixed(2)}`;
                placeholderStats[2].querySelector('.stat-number').textContent = `${(stats.avg_size_sf / 1000).toFixed(1)}K`;
            }
        }
        
    } catch (error) {
        console.error('Failed to load portfolio stats:', error);
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Add some demo interactions for the hero section
function addHeroInteractions() {
    const floatingDashboard = document.querySelector('.floating-dashboard');
    if (floatingDashboard) {
        floatingDashboard.addEventListener('mouseenter', function() {
            this.style.animationPlayState = 'paused';
        });
        
        floatingDashboard.addEventListener('mouseleave', function() {
            this.style.animationPlayState = 'running';
        });
    }
}

// Initialize hero interactions when DOM is loaded
document.addEventListener('DOMContentLoaded', addHeroInteractions);

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to focus chat input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.focus();
            scrollToSection('chat');
        }
    }
    
    // Ctrl/Cmd + Enter to analyze portfolio
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const portfolioQuery = document.getElementById('portfolioQuery');
        if (document.activeElement === portfolioQuery) {
            e.preventDefault();
            analyzePortfolio();
        }
    }
});

// Add some visual feedback for better UX
function addVisualFeedback() {
    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Add ripple animation CSS
const rippleCSS = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;

const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

// Initialize visual feedback
document.addEventListener('DOMContentLoaded', addVisualFeedback);