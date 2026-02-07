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