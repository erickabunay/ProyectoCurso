// ===== CRM.JS =====

// Variables globales
let currentPage = 1;
let guestsPerPage = 10;
let allGuests = [];
let charts = {};

// ===== DATOS DE EJEMPLO =====
const sampleGuests = [
    {
        id: 'G001',
        name: 'Carlos Rodríguez Méndez',
        email: 'carlos.rodriguez@email.com',
        phone: '+593 999 123 456',
        photo: 'https://i.pravatar.cc/150?img=12',
        segment: 'vip',
        visits: 12,
        lastVisit: '2026-01-28',
        totalRevenue: 4850,
        satisfaction: 5,
        country: 'EC',
        preferences: ['Vista al mar', 'Piso alto', 'Cama King', 'No lácteos']
    },
    {
        id: 'G002',
        name: 'María García López',
        email: 'maria.garcia@email.com',
        phone: '+593 988 654 321',
        photo: 'https://i.pravatar.cc/150?img=5',
        segment: 'vip',
        visits: 8,
        lastVisit: '2026-02-01',
        totalRevenue: 3200,
        satisfaction: 5,
        country: 'CO',
        preferences: ['Almohadas extra', 'Late check-out', 'Habitación tranquila']
    },
    {
        id: 'G003',
        name: 'Juan Pérez Gómez',
        email: 'juan.perez@email.com',
        phone: '+593 977 111 222',
        photo: 'https://i.pravatar.cc/150?img=33',
        segment: 'frecuente',
        visits: 4,
        lastVisit: '2025-12-15',
        totalRevenue: 1680,
        satisfaction: 4,
        country: 'EC',
        preferences: ['Desayuno temprano', 'WiFi rápido']
    },
    {
        id: 'G004',
        name: 'Ana Martínez Silva',
        email: 'ana.martinez@email.com',
        phone: '+593 966 333 444',
        photo: 'https://i.pravatar.cc/150?img=9',
        segment: 'nuevo',
        visits: 1,
        lastVisit: '2026-01-20',
        totalRevenue: 425,
        satisfaction: 5,
        country: 'PE',
        preferences: ['Cuna para bebé', 'Bañera']
    },
    {
        id: 'G005',
        name: 'Pedro Sánchez Torres',
        email: 'pedro.sanchez@email.com',
        phone: '+593 955 555 666',
        photo: 'https://i.pravatar.cc/150?img=13',
        segment: 'inactivo',
        visits: 3,
        lastVisit: '2025-06-10',
        totalRevenue: 890,
        satisfaction: 3,
        country: 'EC',
        preferences: ['Parking gratuito']
    },
    {
        id: 'G006',
        name: 'Laura Gómez Ruiz',
        email: 'laura.gomez@email.com',
        phone: '+593 944 777 888',
        photo: 'https://i.pravatar.cc/150?img=10',
        segment: 'frecuente',
        visits: 5,
        lastVisit: '2026-01-15',
        totalRevenue: 2100,
        satisfaction: 4,
        country: 'CO',
        preferences: ['Yoga mat', 'Gimnasio 24h']
    },
    {
        id: 'G007',
        name: 'Roberto Fernández',
        email: 'roberto.fernandez@email.com',
        phone: '+1 305 123 4567',
        photo: 'https://i.pravatar.cc/150?img=15',
        segment: 'vip',
        visits: 15,
        lastVisit: '2026-02-03',
        totalRevenue: 6750,
        satisfaction: 5,
        country: 'US',
        preferences: ['Suite presidencial', 'Servicio de conserjería', 'Traslado aeropuerto']
    },
    {
        id: 'G008',
        name: 'Sofia Valencia',
        email: 'sofia.valencia@email.com',
        phone: '+34 612 345 678',
        photo: 'https://i.pravatar.cc/150?img=20',
        segment: 'nuevo',
        visits: 1,
        lastVisit: '2026-02-05',
        totalRevenue: 580,
        satisfaction: 5,
        country: 'ES',
        preferences: ['Almohadas hipoalergénicas', 'Minibar personalizado']
    }
];

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    allGuests = [...sampleGuests];
    loadGuests();
    updateKPIs();
    initializeCharts();
    loadVIPGuests();
    loadRecommendations();
});

// ===== CARGAR HUÉSPEDES EN LA TABLA =====
function loadGuests(filtered = null) {
    const guests = filtered || allGuests;
    const tbody = document.getElementById('guestsBody');
    tbody.innerHTML = '';

    // Calcular paginación
    const start = (currentPage - 1) * guestsPerPage;
    const end = start + guestsPerPage;
    const pageGuests = guests.slice(start, end);

    pageGuests.forEach(guest => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <img src="${guest.photo}" alt="${guest.name}" class="guest-photo">
            </td>
            <td>
                <div>
                    <strong>${guest.name}</strong><br>
                    <small class="text-muted">${guest.email}</small><br>
                    <small class="text-muted">${guest.phone}</small>
                </div>
            </td>
            <td>${getSegmentBadge(guest.segment)}</td>
            <td><span class="badge bg-primary">${guest.visits}</span></td>
            <td>${formatDate(guest.lastVisit)}</td>
            <td><strong>$${guest.totalRevenue}</strong></td>
            <td>${getStars(guest.satisfaction)}</td>
            <td>
                ${guest.preferences.slice(0, 2).map(p => `<span class="preference-tag">${p}</span>`).join(' ')}
                ${guest.preferences.length > 2 ? `<span class="preference-tag">+${guest.preferences.length - 2}</span>` : ''}
            </td>
            <td>
                <button class="action-btn view" onclick="viewGuestProfile('${guest.id}')" title="Ver perfil">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="action-btn edit" onclick="editGuest('${guest.id}')" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="action-btn email" onclick="sendEmailToGuest('${guest.id}')" title="Enviar email">
                    <i class="bi bi-envelope"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    generatePagination(guests.length);
}

// ===== OBTENER BADGE DE SEGMENTO =====
function getSegmentBadge(segment) {
    const segments = {
        vip: { name: 'VIP', icon: 'gem', class: 'segment-vip' },
        frecuente: { name: 'Frecuente', icon: 'repeat', class: 'segment-frecuente' },
        nuevo: { name: 'Nuevo', icon: 'star', class: 'segment-nuevo' },
        inactivo: { name: 'Inactivo', icon: 'hourglass-split', class: 'segment-inactivo' }
    };

    const seg = segments[segment];
    return `<span class="segment-badge ${seg.class}">
        <i class="bi bi-${seg.icon}"></i> ${seg.name}
    </span>`;
}

// ===== OBTENER ESTRELLAS =====
function getStars(rating) {
    const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    return `<span class="stars">${stars}</span>`;
}

// ===== FORMATEAR FECHA =====
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

// ===== ACTUALIZAR KPIs =====
function updateKPIs() {
    document.getElementById('totalGuests').textContent = allGuests.length.toLocaleString();

    const vipCount = allGuests.filter(g => g.segment === 'vip').length;
    document.getElementById('vipGuests').textContent = vipCount;

    const returningRate = ((allGuests.filter(g => g.visits > 1).length / allGuests.length) * 100).toFixed(0);
    document.getElementById('returningGuests').textContent = returningRate + '%';

    const avgRevenue = (allGuests.reduce((sum, g) => sum + g.totalRevenue, 0) / allGuests.length).toFixed(0);
    document.getElementById('avgRevenue').textContent = '$' + avgRevenue;
}

// ===== PAGINACIÓN =====
function generatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / guestsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    // Botón anterior
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">Anterior</a>`;
    pagination.appendChild(prevLi);

    // Números de página
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>`;
            pagination.appendChild(li);
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            const li = document.createElement('li');
            li.className = 'page-item disabled';
            li.innerHTML = '<a class="page-link" href="#">...</a>';
            pagination.appendChild(li);
        }
    }

    // Botón siguiente
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">Siguiente</a>`;
    pagination.appendChild(nextLi);
}

// ===== CAMBIAR PÁGINA =====
function changePage(page) {
    const totalPages = Math.ceil(allGuests.length / guestsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    loadGuests();
}

// ===== APLICAR FILTROS =====
function applyFilters() {
    const searchText = document.getElementById('searchGuest').value.toLowerCase();
    const segment = document.getElementById('filterSegment').value;
    const country = document.getElementById('filterCountry').value;
    const satisfaction = document.getElementById('filterSatisfaction').value;

    let filtered = allGuests.filter(guest => {
        const matchText = searchText === '' || 
            guest.name.toLowerCase().includes(searchText) ||
            guest.email.toLowerCase().includes(searchText) ||
            guest.phone.includes(searchText);

        const matchSegment = segment === '' || guest.segment === segment;
        const matchCountry = country === '' || guest.country === country;
        const matchSatisfaction = satisfaction === '' || guest.satisfaction === parseInt(satisfaction);

        return matchText && matchSegment && matchCountry && matchSatisfaction;
    });

    currentPage = 1;
    loadGuests(filtered);
    updateFilterTags({ searchText, segment, country, satisfaction });
    showNotification(`${filtered.length} huésped(es) encontrado(s)`, 'info');
}

// ===== ACTUALIZAR TAGS DE FILTROS =====
function updateFilterTags(filters) {
    const tagsContainer = document.getElementById('activeTags');
    tagsContainer.innerHTML = '';

    if (filters.searchText) {
        addFilterTag(`Búsqueda: ${filters.searchText}`, 'searchGuest');
    }
    if (filters.segment) {
        addFilterTag(`Segmento: ${filters.segment}`, 'filterSegment');
    }
    if (filters.country) {
        addFilterTag(`País: ${filters.country}`, 'filterCountry');
    }
    if (filters.satisfaction) {
        addFilterTag(`Satisfacción: ${filters.satisfaction}⭐`, 'filterSatisfaction');
    }
}

function addFilterTag(text, filterId) {
    const tagsContainer = document.getElementById('activeTags');
    const tag = document.createElement('span');
    tag.className = 'filter-tag';
    tag.innerHTML = `${text} <i class="bi bi-x-circle" onclick="removeFilter('${filterId}')"></i>`;
    tagsContainer.appendChild(tag);
}

function removeFilter(filterId) {
    document.getElementById(filterId).value = '';
    applyFilters();
}

// ===== VER PERFIL DEL HUÉSPED =====
function viewGuestProfile(guestId) {
    const guest = allGuests.find(g => g.id === guestId);
    if (!guest) return;

    const content = `
        <div class="profile-header">
            <img src="${guest.photo}" alt="${guest.name}" class="profile-photo">
            <div class="profile-info">
                <h3>${guest.name}</h3>
                <p><i class="bi bi-envelope"></i> ${guest.email}</p>
                <p><i class="bi bi-telephone"></i> ${guest.phone}</p>
                <p><i class="bi bi-geo-alt"></i> ${getCountryName(guest.country)}</p>
            </div>
            <div class="ms-auto">
                ${getSegmentBadge(guest.segment)}
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="profile-section">
                    <h6><i class="bi bi-graph-up"></i> Estadísticas</h6>
                    <div class="info-row">
                        <span class="info-label">Total de Visitas:</span>
                        <span class="info-value">${guest.visits}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Última Visita:</span>
                        <span class="info-value">${formatDate(guest.lastVisit)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Revenue Total:</span>
                        <span class="info-value">$${guest.totalRevenue}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Revenue Promedio:</span>
                        <span class="info-value">$${(guest.totalRevenue / guest.visits).toFixed(2)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Satisfacción:</span>
                        <span class="info-value">${getStars(guest.satisfaction)}</span>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="profile-section">
                    <h6><i class="bi bi-heart"></i> Preferencias</h6>
                    ${guest.preferences.map(pref => `
                        <span class="preference-tag" style="display: block; margin: 5px 0;">${pref}</span>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="profile-section">
            <h6><i class="bi bi-clock-history"></i> Historial de Reservas</h6>
            <div class="timeline">
                <div class="timeline-item">
                    <div class="timeline-date">${formatDate(guest.lastVisit)}</div>
                    <div class="timeline-content">
                        <strong>Última estadía</strong><br>
                        <small>Habitación 305 - Suite - 3 noches</small><br>
                        <small class="text-success">Pagado: $${(guest.totalRevenue / guest.visits).toFixed(2)}</small>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-date">Hace 2 meses</div>
                    <div class="timeline-content">
                        <strong>Estadía anterior</strong><br>
                        <small>Habitación 210 - Doble - 2 noches</small>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-date">Hace 4 meses</div>
                    <div class="timeline-content">
                        <strong>Primera visita</strong><br>
                        <small>Habitación 150 - Simple - 1 noche</small>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('guestProfileContent').innerHTML = content;
    const modal = new bootstrap.Modal(document.getElementById('guestProfileModal'));
    modal.show();
}

function getCountryName(code) {
    const countries = {
        'EC': 'Ecuador',
        'CO': 'Colombia',
        'PE': 'Perú',
        'US': 'Estados Unidos',
        'ES': 'España'
    };
    return countries[code] || code;
}
// ===== CARGAR HUÉSPEDES VIP =====
function loadVIPGuests() {
    const vipGuests = allGuests.filter(g => g.segment === 'vip');
    const grid = document.getElementById('vipGuestsGrid');
    grid.innerHTML = '';

    vipGuests.forEach(guest => {
        const card = document.createElement('div');
        card.className = 'col-md-4';
        card.innerHTML = `
            <div class="vip-card">
                <div class="text-center">
                    <img src="${guest.photo}" alt="${guest.name}" class="guest-photo">
                    <h4>${guest.name}</h4>
                    <p><small>${guest.email}</small></p>
                </div>
                <div class="vip-stats">
                    <div class="vip-stat">
                        <h5>${guest.visits}</h5>
                        <p>Visitas</p>
                    </div>
                    <div class="vip-stat">
                        <h5>$${guest.totalRevenue}</h5>
                        <p>Revenue</p>
                    </div>
                    <div class="vip-stat">
                        <h5>${guest.satisfaction}⭐</h5>
                        <p>Rating</p>
                    </div>
                </div>
                <button class="btn btn-light w-100 mt-3" onclick="viewGuestProfile('${guest.id}')">
                    Ver Perfil Completo
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ===== INICIALIZAR GRÁFICOS =====
function initializeCharts() {
    // Gráfico de Tendencia de Huéspedes
    const ctx1 = document.getElementById('guestTrendChart');
    if (ctx1) {
        charts.trendChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Nuevos Huéspedes',
                    data: [45, 58, 62, 71, 85, 98],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Gráfico de Distribución Geográfica
    const ctx2 = document.getElementById('geographyChart');
    if (ctx2) {
        const countryCounts = {};
        allGuests.forEach(g => {
            countryCounts[g.country] = (countryCounts[g.country] || 0) + 1;
        });

        charts.geoChart = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: Object.keys(countryCounts).map(getCountryName),
                datasets: [{
                    data: Object.values(countryCounts),
                    backgroundColor: ['#667eea', '#56ab2f', '#f093fb', '#4facfe', '#ffd700']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Gráfico de Satisfacción
    const ctx3 = document.getElementById('satisfactionChart');
    if (ctx3) {
        const satisfactionCounts = [0, 0, 0, 0, 0];
        allGuests.forEach(g => {
            satisfactionCounts[g.satisfaction - 1]++;
        });

        charts.satisfactionChart = new Chart(ctx3, {
            type: 'bar',
            data: {
                labels: ['1⭐', '2⭐', '3⭐', '4⭐', '5⭐'],
                datasets: [{
                    label: 'Cantidad de Huéspedes',
                    data: satisfactionCounts,
                    backgroundColor: ['#dc3545', '#ffc107', '#17a2b8', '#28a745', '#198754']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    // Gráfico de Revenue por Segmento
    const ctx4 = document.getElementById('revenueChart');
    if (ctx4) {
        const segmentRevenue = {
            vip: 0,
            frecuente: 0,
            nuevo: 0,
            inactivo: 0
        };

        allGuests.forEach(g => {
            segmentRevenue[g.segment] += g.totalRevenue;
        });

        charts.revenueChart = new Chart(ctx4, {
            type: 'pie',
            data: {
                labels: ['VIP', 'Frecuentes', 'Nuevos', 'Inactivos'],
                datasets: [{
                    data: Object.values(segmentRevenue),
                    backgroundColor: ['#ffd700', '#56ab2f', '#4facfe', '#6c757d']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// ===== CARGAR RECOMENDACIONES =====
function loadRecommendations() {
    const recommendations = [
        {
            icon: 'envelope-heart',
            title: 'Campaña de Reactivación',
            description: '174 huéspedes inactivos. Enviar email con oferta especial 15% de descuento.',
            action: 'Enviar Campaña',
            color: '#dc3545'
        },
        {
            icon: 'gift',
            title: 'Programa de Fidelidad VIP',
            description: '12 huéspedes frecuentes cerca de nivel VIP. Ofrecer beneficios exclusivos.',
            action: 'Ver Candidatos',
            color: '#ffd700'
        },
        {
            icon: 'star-fill',
            title: 'Seguimiento Post-Estadía',
            description: '45 huéspedes nuevos sin reseña. Solicitar feedback para mejorar el servicio.',
            action: 'Enviar Encuesta',
            color: '#0dcaf0'
        },
        {
            icon: 'calendar-heart',
            title: 'Recordatorio de Aniversario',
            description: '8 huéspedes VIP con aniversario este mes. Enviar felicitación personalizada.',
            action: 'Programar Emails',
            color: '#198754'
        }
    ];

    const container = document.getElementById('recommendations');
    container.innerHTML = '';

    recommendations.forEach(rec => {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        item.innerHTML = `
            <div class="recommendation-icon" style="background: ${rec.color};">
                <i class="bi bi-${rec.icon}"></i>
            </div>
            <div class="recommendation-content flex-grow-1">
                <h6>${rec.title}</h6>
                <p>${rec.description}</p>
            </div>
            <div class="recommendation-action">
                <button class="btn btn-sm btn-primary">
                    ${rec.action}
                </button>
            </div>
        `;
        container.appendChild(item);
    });
}

// ===== VER SEGMENTO =====
function viewSegment(segment) {
    document.getElementById('filterSegment').value = segment;
    applyFilters();

    // Cambiar al tab de todos los huéspedes
    const guestsTab = new bootstrap.Tab(document.getElementById('guests-tab'));
    guestsTab.show();
}

// ===== NUEVO HUÉSPED =====
function openNewGuest() {
    const modal = new bootstrap.Modal(document.getElementById('newGuestModal'));
    modal.show();
}

function saveNewGuest() {
    showLoading();

    setTimeout(() => {
        const newGuest = {
            id: 'G' + String(allGuests.length + 1).padStart(3, '0'),
            name: document.querySelector('#newGuestForm input[type="text"]').value,
            email: document.querySelector('#newGuestForm input[type="email"]').value,
            phone: document.querySelector('#newGuestForm input[type="tel"]').value,
            photo: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
            segment: 'nuevo',
            visits: 0,
            lastVisit: new Date().toISOString().split('T')[0],
            totalRevenue: 0,
            satisfaction: 0,
            country: document.querySelector('#newGuestForm select').value,
            preferences: document.querySelector('#newGuestForm textarea').value.split(',').map(p => p.trim()).filter(p => p)
        };

        allGuests.unshift(newGuest);

        hideLoading();
        bootstrap.Modal.getInstance(document.getElementById('newGuestModal')).hide();
        loadGuests();
        updateKPIs();

        showNotification(`Huésped ${newGuest.name} registrado exitosamente`, 'success');
    }, 1500);
}

// ===== EMAIL MASIVO =====
function sendMassEmail() {
    const modal = new bootstrap.Modal(document.getElementById('massEmailModal'));
    modal.show();
}

function sendMassEmailConfirm() {
    const recipients = document.getElementById('emailRecipients').value;
    showLoading();

    setTimeout(() => {
        hideLoading();
        bootstrap.Modal.getInstance(document.getElementById('massEmailModal')).hide();
        showNotification('Emails enviados exitosamente', 'success');
    }, 2000);
}

// ===== ENVIAR EMAIL A HUÉSPED =====
function sendEmailToGuest(guestId) {
    const guest = allGuests.find(g => g.id === guestId);
    if (guest) {
        showNotification(`Enviando email a ${guest.name}...`, 'info');
        setTimeout(() => {
            showNotification('Email enviado exitosamente', 'success');
        }, 1500);
    }
}

function sendEmail() {
    showNotification('Email enviado al huésped', 'success');
}

// ===== EDITAR HUÉSPED =====
function editGuest(guestId) {
    showNotification('Función de edición en desarrollo', 'info');
}

// ===== ACTUALIZAR HUÉSPEDES =====
function refreshGuests() {
    showLoading();
    setTimeout(() => {
        loadGuests();
        hideLoading();
        showNotification('Datos actualizados', 'success');
    }, 1000);
}

// ===== EXPORTAR DATOS =====
function exportData() {
    showNotification('Exportando a Excel...', 'info');
    setTimeout(() => {
        showNotification('Archivo descargado: huespedes_CRM.xlsx', 'success');
    }, 1500);
}

// ===== LOADING =====
function showLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3 mb-0 text-white">Procesando...</p>
        </div>
    `;
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.remove();
}

// ===== NOTIFICACIONES =====
function showNotification(message, type = 'info') {
    const colors = {
        success: '#198754',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#0dcaf0'
    };

    const icons = {
        success: 'check-circle',
        danger: 'x-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
        min-width: 300px;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    notification.innerHTML = `<i class="bi bi-${icons[type]}"></i> ${message}`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }

    .loading-spinner {
        background: white;
        padding: 30px;
        border-radius: 16px;
        text-align: center;
    }
`;
document.head.appendChild(style);
