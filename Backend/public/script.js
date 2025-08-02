let tickets = [
    {
        id: 1,
        subject: "Login Issues with New Account",
        description: "Unable to login after creating a new account. Getting 'Invalid credentials' error.",
        category: "technical",
        status: "open",
        author: "John Doe",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
        votes: 3,
        userVote: null
    },
    {
        id: 2,
        subject: "Billing Discrepancy in Monthly Invoice",
        description: "My monthly invoice shows charges that don't match my subscription plan.",
        category: "billing",
        status: "in-progress",
        author: "Jane Smith",
        createdAt: "2024-01-14T15:45:00Z",
        updatedAt: "2024-01-15T09:20:00Z",
        votes: 1,
        userVote: "up"
    },
    {
        id: 3,
        subject: "Feature Request: Dark Mode",
        description: "It would be great to have a dark mode option for better user experience.",
        category: "general",
        status: "resolved",
        author: "Mike Johnson",
        createdAt: "2024-01-13T08:15:00Z",
        updatedAt: "2024-01-14T16:30:00Z",
        votes: 15,
        userVote: null
    }
];

let currentUser = "John Doe";
let filteredTickets = [...tickets];

// DOM Elements
const createTicketBtn = document.getElementById('createTicketBtn');
const createTicketModal = document.getElementById('createTicketModal');
const ticketDetailModal = document.getElementById('ticketDetailModal');
const createTicketForm = document.getElementById('createTicketForm');
const ticketsList = document.getElementById('ticketsList');
const statusFilter = document.getElementById('statusFilter');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');
const sortBy = document.getElementById('sortBy');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    renderTickets();
    setupEventListeners();
});

// Check authentication
function checkAuth() {
    const session = localStorage.getItem('quickdesk_session') || sessionStorage.getItem('quickdesk_session');
    if (!session) {
        window.location.href = 'signin.html';
        return;
    }
    
    const userData = JSON.parse(session);
    document.getElementById('currentUser').textContent = userData.fullName;
    currentUser = userData.fullName;
}

// Event Listeners
function setupEventListeners() {
    createTicketBtn.addEventListener('click', openCreateTicketModal);
    createTicketForm.addEventListener('submit', handleCreateTicket);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Modal close events
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModals);
    });
    
    document.getElementById('cancelBtn').addEventListener('click', closeModals);
    
    // Click outside modal to close
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModals();
        }
    });
    
    // Filter and search events
    statusFilter.addEventListener('change', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);
    sortBy.addEventListener('change', applyFilters);
}

// Logout function
function handleLogout() {
    localStorage.removeItem('quickdesk_session');
    sessionStorage.removeItem('quickdesk_session');
    window.location.href = 'signin.html';
}

// Modal Functions
function openCreateTicketModal() {
    createTicketModal.style.display = 'block';
}

function closeModals() {
    createTicketModal.style.display = 'none';
    ticketDetailModal.style.display = 'none';
    createTicketForm.reset();
}

// Create Ticket
function handleCreateTicket(event) {
    event.preventDefault();
    
    const subject = document.getElementById('ticketSubject').value;
    const category = document.getElementById('ticketCategory').value;
    const description = document.getElementById('ticketDescription').value;
    
    const newTicket = {
        id: tickets.length + 1,
        subject: subject,
        description: description,
        category: category,
        status: 'open',
        author: currentUser,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        votes: 0,
        userVote: null
    };
    
    tickets.unshift(newTicket);
    applyFilters();
    closeModals();
    
    // Show success message
    alert('Ticket created successfully!');
}

// Render Tickets
function renderTickets() {
    if (filteredTickets.length === 0) {
        ticketsList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #64748b;">
                <h3>No tickets found</h3>
                <p>Try adjusting your filters or create a new ticket.</p>
            </div>
        `;
        return;
    }
    
    ticketsList.innerHTML = filteredTickets.map(ticket => `
        <div class="ticket-card" onclick="openTicketDetail(${ticket.id})">
            <div class="ticket-header">
                <div class="ticket-info">
                    <h3 class="ticket-title">${ticket.subject}</h3>
                    <div class="ticket-meta">
                        #${ticket.id} • Created by ${ticket.author} • ${formatDate(ticket.createdAt)}
                        <span class="category-badge">${ticket.category}</span>
                    </div>
                </div>
                <span class="status-badge status-${ticket.status.replace(' ', '-')}">${ticket.status}</span>
            </div>
            <p class="ticket-description">${ticket.description}</p>
            <div class="ticket-footer">
                <div class="ticket-voting" onclick="event.stopPropagation()">
                    <button class="vote-btn ${ticket.userVote === 'up' ? 'active' : ''}" 
                            onclick="handleVote(${ticket.id}, 'up')">↑</button>
                    <span class="vote-count">${ticket.votes}</span>
                    <button class="vote-btn ${ticket.userVote === 'down' ? 'active' : ''}" 
                            onclick="handleVote(${ticket.id}, 'down')">↓</button>
                </div>
                <div class="ticket-meta">
                    Updated ${formatDate(ticket.updatedAt)}
                </div>
            </div>
        </div>
    `).join('');
}

// Voting System
function handleVote(ticketId, voteType) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    // Remove previous vote if exists
    if (ticket.userVote === 'up') ticket.votes--;
    if (ticket.userVote === 'down') ticket.votes++;
    
    // Apply new vote
    if (ticket.userVote === voteType) {
        // Remove vote if clicking same button
        ticket.userVote = null;
    } else {
        ticket.userVote = voteType;
        if (voteType === 'up') ticket.votes++;
        if (voteType === 'down') ticket.votes--;
    }
    
    applyFilters();
}

// Ticket Detail Modal
function openTicketDetail(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    document.getElementById('ticketDetailContent').innerHTML = `
        <div style="padding: 1.5rem;">
            <div style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h2>${ticket.subject}</h2>
                    <span class="status-badge status-${ticket.status.replace(' ', '-')}">${ticket.status}</span>
                </div>
                <div style="color: #64748b; margin-bottom: 1rem;">
                    Ticket #${ticket.id} • Created by ${ticket.author} • ${formatDate(ticket.createdAt)}
                    <span class="category-badge">${ticket.category}</span>
                </div>
            </div>
            <div style="background: #f8fafc; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                <p>${ticket.description}</p>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div class="ticket-voting">
                    <button class="vote-btn ${ticket.userVote === 'up' ? 'active' : ''}" 
                            onclick="handleVote(${ticket.id}, 'up'); updateTicketDetail(${ticket.id})">↑</button>
                    <span class="vote-count">${ticket.votes} votes</span>
                    <button class="vote-btn ${ticket.userVote === 'down' ? 'active' : ''}" 
                            onclick="handleVote(${ticket.id}, 'down'); updateTicketDetail(${ticket.id})">↓</button>
                </div>
                <div style="color: #64748b; font-size: 0.875rem;">
                    Last updated: ${formatDate(ticket.updatedAt)}
                </div>
            </div>
        </div>
    `;
    
    ticketDetailModal.style.display = 'block';
}

function updateTicketDetail(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    const voteSection = document.querySelector('#ticketDetailContent .ticket-voting');
    voteSection.innerHTML = `
        <button class="vote-btn ${ticket.userVote === 'up' ? 'active' : ''}" 
                onclick="handleVote(${ticket.id}, 'up'); updateTicketDetail(${ticket.id})">↑</button>
        <span class="vote-count">${ticket.votes} votes</span>
        <button class="vote-btn ${ticket.userVote === 'down' ? 'active' : ''}" 
                onclick="handleVote(${ticket.id}, 'down'); updateTicketDetail(${ticket.id})">↓</button>
    `;
}

// Filtering and Sorting
function applyFilters() {
    let filtered = [...tickets];
    
    // Status filter
    const statusValue = statusFilter.value;
    if (statusValue) {
        filtered = filtered.filter(ticket => ticket.status === statusValue);
    }
    
    // Category filter
    const categoryValue = categoryFilter.value;
    if (categoryValue) {
        filtered = filtered.filter(ticket => ticket.category === categoryValue);
    }
    
    // Search filter
    const searchValue = searchInput.value.toLowerCase();
    if (searchValue) {
        filtered = filtered.filter(ticket => 
            ticket.subject.toLowerCase().includes(searchValue) ||
            ticket.description.toLowerCase().includes(searchValue) ||
            ticket.author.toLowerCase().includes(searchValue)
        );
    }
    
    // Sort
    const sortValue = sortBy.value;
    filtered.sort((a, b) => {
        switch (sortValue) {
            case 'recent':
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'priority':
                return b.votes - a.votes;
            default:
                return 0;
        }
    });
    
    filteredTickets = filtered;
    renderTickets();
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
        return 'Just now';
    } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 168) {
        return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}