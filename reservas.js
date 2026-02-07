// ===== RESERVAS.JS =====

// Variables globales
let currentPage = 1;
let reservationsPerPage = 10;
let allReservations = [];
let currentStep = 1;

// ===== DATOS DE EJEMPLO =====
const sampleReservations = [
    {
        id: '#1234',
        guest: 'Juan Pérez Gómez',
        email: 'juan.perez@email.com',
        phone: '+593 999 123 456',
        channel: 'booking',
        checkIn: '2026-02-07',
        checkOut: '2026-02-10',
        room: '101',
        roomType: 'Doble',
        price: 360,
        status: 'confirmada',
        adults: 2,
        children: 0,
        observations: 'Vista al mar preferiblemente'
    },
    {
        id: '#1235',
        guest: 'Maria García López',
        email: 'maria.garcia@email.com',
        phone: '+593 988 654 321',
        channel: 'expedia',
        checkIn: '2026-02-08',
        checkOut: '2026-02-11',
        room: '205',
        roomType: 'Suite',
        price: 600,
        status: 'confirmada',
        adults: 2,
        children: 1,
        observations: 'Cuna para bebé'
    },
    {
        id: '#1236',
        guest: 'Carlos Rodríguez',
        email: 'carlos.r@email.com',
        phone: '+593 977 111 222',
        channel: 'web',
        checkIn: '2026-02-06',
        checkOut: '2026-02-09',
        room: '302',
        roomType: 'Simple',
        price: 240,
        status: 'checkin',
        adults: 1,
        children: 0,
        observations: ''
    },
    {
        id: '#1237',
        guest: 'Ana Martínez Silva',
        email: 'ana.martinez@email.com',
        phone: '+593 966 333 444',
        channel: 'booking',
        checkIn: '2026-02-10',
        checkOut: '2026-02-15',
        room: '405',
        roomType: 'Deluxe',
        price: 1750,
        status: 'pendiente',
        adults: 2,
        children: 2,
        observations: 'Aniversario - decoración especial'
    },
    {
        id: '#1238',
        guest: 'Pedro Sánchez Torres',
        email: 'pedro.sanchez@email.com',
        phone: '+593 955 555 666',
        channel: 'recepcion',
        checkIn: '2026-02-05',
        checkOut: '2026-02-07',
        room: '150',
        roomType: 'Doble',
        price: 240,
        status: 'checkout',
        adults: 2,
        children: 0,
        observations: ''
    }
];

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    allReservations = [...sampleReservations];
    initializeDatePickers();
    loadReservations();
    updateStats();
    updateLastSync();

    // Actualizar sincronización cada minuto
    setInterval(updateLastSync, 60000);
});

// ===== DATE PICKERS =====
function initializeDatePickers() {
    flatpickr("#dateFrom", {
        locale: "es",
        dateFormat: "Y-m-d",
        onChange: function(selectedDates, dateStr) {
            console.log('Fecha desde:', dateStr);
        }
    });

    flatpickr("#dateTo", {
        locale: "es",
        dateFormat: "Y-m-d",
        onChange: function(selectedDates, dateStr) {
            console.log('Fecha hasta:', dateStr);
        }
    });

    flatpickr("#checkInDate", {
        locale: "es",
        dateFormat: "Y-m-d",
        minDate: "today",
        onChange: function(selectedDates, dateStr) {
            // Actualizar fecha mínima de check-out
            flatpickr("#checkOutDate", {
                locale: "es",
                dateFormat: "Y-m-d",
                minDate: new Date(selectedDates[0].getTime() + 86400000)
            });
            calculatePrice();
        }
    });

    flatpickr("#checkOutDate", {
        locale: "es",
        dateFormat: "Y-m-d",
        minDate: "today",
        onChange: function() {
            calculatePrice();
        }
    });
}

// ===== CARGAR RESERVAS EN LA TABLA =====
function loadReservations(filtered = null) {
    const reservations = filtered || allReservations;
    const tbody = document.getElementById('reservationsBody');
    tbody.innerHTML = '';

    // Calcular paginación
    const start = (currentPage - 1) * reservationsPerPage;
    const end = start + reservationsPerPage;
    const pageReservations = reservations.slice(start, end);

    pageReservations.forEach(reservation => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${reservation.id}</strong></td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-person-circle" style="font-size: 1.5rem;"></i>
                    <div>
                        <strong>${reservation.guest}</strong><br>
                        <small class="text-muted">${reservation.email}</small>
                    </div>
                </div>
            </td>
            <td>${getChannelBadge(reservation.channel)}</td>
            <td>${formatDate(reservation.checkIn)}</td>
            <td>${formatDate(reservation.checkOut)}</td>
            <td><span class="badge bg-secondary">${calculateNights(reservation.checkIn, reservation.checkOut)}</span></td>
            <td><strong>${reservation.room}</strong> <small>(${reservation.roomType})</small></td>
            <td><strong>$${reservation.price}</strong></td>
            <td>${getStatusBadge(reservation.status)}</td>
            <td>
                <button class="action-btn view" onclick="viewReservation('${reservation.id}')" title="Ver detalles">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="action-btn edit" onclick="editReservation('${reservation.id}')" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                ${reservation.status === 'confirmada' ? `
                <button class="action-btn checkin" onclick="doCheckIn('${reservation.id}')" title="Check-in">
                    <i class="bi bi-box-arrow-in-right"></i>
                </button>
                ` : ''}
                <button class="action-btn delete" onclick="deleteReservation('${reservation.id}')" title="Cancelar">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Generar paginación
    generatePagination(reservations.length);
}

// ===== OBTENER BADGE DE CANAL =====
function getChannelBadge(channel) {
    const channels = {
        booking: { name: 'Booking.com', icon: 'globe', class: 'channel-booking' },
        expedia: { name: 'Expedia', icon: 'airplane', class: 'channel-expedia' },
        web: { name: 'Web Directa', icon: 'browser-chrome', class: 'channel-web' },
        recepcion: { name: 'Recepción', icon: 'telephone', class: 'channel-recepcion' }
    };

    const ch = channels[channel];
    return `<span class="channel-badge ${ch.class}">
        <i class="bi bi-${ch.icon}"></i> ${ch.name}
    </span>`;
}

// ===== OBTENER BADGE DE ESTADO =====
function getStatusBadge(status) {
    const statuses = {
        confirmada: { name: 'Confirmada', icon: 'check-circle', class: 'status-confirmada' },
        pendiente: { name: 'Pendiente Pago', icon: 'hourglass-split', class: 'status-pendiente' },
        checkin: { name: 'Check-in', icon: 'box-arrow-in-right', class: 'status-checkin' },
        checkout: { name: 'Check-out', icon: 'box-arrow-right', class: 'status-checkout' },
        cancelada: { name: 'Cancelada', icon: 'x-circle', class: 'status-cancelada' }
    };

    const st = statuses[status];
    return `<span class="status-indicator ${st.class}">
        <i class="bi bi-${st.icon}"></i> ${st.name}
    </span>`;
}

// ===== FORMATEAR FECHA =====
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

// ===== CALCULAR NOCHES =====
function calculateNights(checkIn, checkOut) {
    const date1 = new Date(checkIn);
    const date2 = new Date(checkOut);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// ===== ACTUALIZAR ESTADÍSTICAS =====
function updateStats() {
    const today = new Date().toISOString().split('T')[0];

    document.getElementById('totalReservas').textContent = allReservations.length;

    const checkInToday = allReservations.filter(r => r.checkIn === today).length;
    document.getElementById('checkInHoy').textContent = checkInToday;

    const checkOutToday = allReservations.filter(r => r.checkOut === today).length;
    document.getElementById('checkOutHoy').textContent = checkOutToday;

    const pending = allReservations.filter(r => r.status === 'pendiente').length;
    document.getElementById('pendientes').textContent = pending;
}

// ===== ACTUALIZAR ÚLTIMA SINCRONIZACIÓN =====
function updateLastSync() {
    const now = new Date();
    const minutes = Math.floor(Math.random() * 5) + 1;
    document.getElementById('lastSync').textContent = `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
}

// ===== PAGINACIÓN =====
function generatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / reservationsPerPage);
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
    const totalPages = Math.ceil(allReservations.length / reservationsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    loadReservations();
}

// ===== APLICAR FILTROS =====
function applyFilters() {
    const searchText = document.getElementById('searchGuest').value.toLowerCase();
    const channel = document.getElementById('filterChannel').value;
    const status = document.getElementById('filterStatus').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;

    let filtered = allReservations.filter(reservation => {
        // Búsqueda por texto
        const matchText = searchText === '' || 
            reservation.guest.toLowerCase().includes(searchText) ||
            reservation.email.toLowerCase().includes(searchText) ||
            reservation.phone.includes(searchText);

        // Filtro por canal
        const matchChannel = channel === '' || reservation.channel === channel;

        // Filtro por estado
        const matchStatus = status === '' || reservation.status === status;

        // Filtro por fecha
        const matchDate = (dateFrom === '' || reservation.checkIn >= dateFrom) &&
                         (dateTo === '' || reservation.checkIn <= dateTo);

        return matchText && matchChannel && matchStatus && matchDate;
    });

    currentPage = 1;
    loadReservations(filtered);
    showNotification(`${filtered.length} reserva(s) encontrada(s)`, 'info');
}

// ===== NUEVA RESERVA =====
function openNewReservation() {
    currentStep = 1;
    updateSteps();
    const modal = new bootstrap.Modal(document.getElementById('newReservationModal'));
    modal.show();
}

// ===== CAMBIAR PASO DEL FORMULARIO =====
function changeStep(direction) {
    const totalSteps = 3;

    // Validar paso actual antes de avanzar
    if (direction === 1 && !validateCurrentStep()) {
        return;
    }

    currentStep += direction;

    if (currentStep < 1) currentStep = 1;
    if (currentStep > totalSteps) {
        // Guardar reserva
        saveReservation();
        return;
    }

    updateSteps();
}

// ===== ACTUALIZAR PASOS VISUALES =====
function updateSteps() {
    // Ocultar todos los pasos
    document.querySelectorAll('.reservation-step').forEach(step => {
        step.classList.remove('active');
    });

    // Mostrar paso actual
    document.getElementById(`step${currentStep}`).classList.add('active');

    // Actualizar indicadores
    document.querySelectorAll('.step-dot').forEach((dot, index) => {
        if (index < currentStep) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });

    // Actualizar botones
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';

    if (currentStep === 3) {
        nextBtn.innerHTML = '<i class="bi bi-check-circle"></i> Confirmar Reserva';
        nextBtn.className = 'btn btn-success';
        updateSummary();
    } else {
        nextBtn.innerHTML = 'Siguiente <i class="bi bi-arrow-right"></i>';
        nextBtn.className = 'btn btn-primary';
    }
}

// ===== VALIDAR PASO ACTUAL =====
function validateCurrentStep() {
    const step = document.getElementById(`step${currentStep}`);
    const inputs = step.querySelectorAll('input[required], select[required]');

    for (let input of inputs) {
        if (!input.value) {
            showNotification('Por favor complete todos los campos requeridos', 'warning');
            input.focus();
            return false;
        }
    }

    return true;
}

// ===== ACTUALIZAR RESUMEN =====
function updateSummary() {
    const guestName = document.querySelector('#step1 input[type="text"]').value;
    const checkIn = document.getElementById('checkInDate').value;
    const checkOut = document.getElementById('checkOutDate').value;
    const roomType = document.getElementById('roomType').selectedOptions[0].text;
    const channel = document.getElementById('reservationChannel').selectedOptions[0].text;

    document.getElementById('summaryGuest').textContent = guestName || '-';
    document.getElementById('summaryDates').textContent = checkIn && checkOut ? 
        `${formatDate(checkIn)} - ${formatDate(checkOut)}` : '-';
    document.getElementById('summaryNights').textContent = checkIn && checkOut ? 
        calculateNights(checkIn, checkOut) : '-';
    document.getElementById('summaryRoom').textContent = roomType || '-';
    document.getElementById('summaryChannel').textContent = channel || '-';
}

// ===== CALCULAR PRECIO =====
function calculatePrice() {
    const checkIn = document.getElementById('checkInDate').value;
    const checkOut = document.getElementById('checkOutDate').value;
    const roomType = document.getElementById('roomType');
    const channel = document.getElementById('reservationChannel').value;

    if (!checkIn || !checkOut || !roomType.value) return;

    const nights = calculateNights(checkIn, checkOut);
    const pricePerNight = parseFloat(roomType.selectedOptions[0].dataset.price || 0);
    const subtotal = nights * pricePerNight;

    // Calcular comisión OTA
    let commissionRate = 0;
    if (channel === 'booking') commissionRate = 0.18;
    if (channel === 'expedia') commissionRate = 0.20;

    const commission = subtotal * commissionRate;
    const iva = (subtotal - commission) * 0.12;
    const total = subtotal - commission + iva;

    document.getElementById('priceSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('priceCommission').textContent = `-$${commission.toFixed(2)}`;
    document.getElementById('priceIVA').textContent = `$${iva.toFixed(2)}`;
    document.getElementById('priceTotal').textContent = `$${total.toFixed(2)}`;
}

// ===== GUARDAR RESERVA =====
function saveReservation() {
    showLoading();

    setTimeout(() => {
        const newReservation = {
            id: '#' + (1239 + allReservations.length),
            guest: document.querySelector('#step1 input[type="text"]').value,
            email: document.querySelector('#step1 input[type="email"]').value,
            phone: document.querySelector('#step1 input[type="tel"]').value,
            channel: document.getElementById('reservationChannel').value,
            checkIn: document.getElementById('checkInDate').value,
            checkOut: document.getElementById('checkOutDate').value,
            room: Math.floor(Math.random() * 200) + 101 + '',
            roomType: document.getElementById('roomType').selectedOptions[0].text.split(' - ')[0],
            price: parseFloat(document.getElementById('priceTotal').textContent.replace('$', '')),
            status: 'confirmada',
            adults: 2,
            children: 0,
            observations: document.querySelector('#step2 textarea').value
        };

        allReservations.unshift(newReservation);

        hideLoading();
        bootstrap.Modal.getInstance(document.getElementById('newReservationModal')).hide();
        loadReservations();
        updateStats();

        showNotification(`Reserva ${newReservation.id} creada exitosamente`, 'success');
    }, 1500);
}

// ===== VER DETALLES DE RESERVA =====
function viewReservation(id) {
    const reservation = allReservations.find(r => r.id === id);
    if (!reservation) return;

    document.getElementById('detailReservationId').textContent = id;

    const details = `
        <div class="detail-section">
            <h6><i class="bi bi-person"></i> Información del Huésped</h6>
            <div class="detail-row">
                <span class="detail-label">Nombre:</span>
                <span class="detail-value">${reservation.guest}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${reservation.email}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Teléfono:</span>
                <span class="detail-value">${reservation.phone}</span>
            </div>
        </div>

        <div class="detail-section">
            <h6><i class="bi bi-calendar-range"></i> Detalles de la Reserva</h6>
            <div class="detail-row">
                <span class="detail-label">Check-in:</span>
                <span class="detail-value">${formatDate(reservation.checkIn)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Check-out:</span>
                <span class="detail-value">${formatDate(reservation.checkOut)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Noches:</span>
                <span class="detail-value">${calculateNights(reservation.checkIn, reservation.checkOut)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Habitación:</span>
                <span class="detail-value">${reservation.room} (${reservation.roomType})</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Canal:</span>
                <span class="detail-value">${getChannelBadge(reservation.channel)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Estado:</span>
                <span class="detail-value">${getStatusBadge(reservation.status)}</span>
            </div>
        </div>

        <div class="detail-section">
            <h6><i class="bi bi-cash-stack"></i> Información de Pago</h6>
            <div class="detail-row">
                <span class="detail-label">Precio Total:</span>
                <span class="detail-value"><strong>$${reservation.price}</strong></span>
            </div>
        </div>

        ${reservation.observations ? `
        <div class="detail-section">
            <h6><i class="bi bi-chat-left-text"></i> Observaciones</h6>
            <p class="mb-0">${reservation.observations}</p>
        </div>
        ` : ''}
    `;

    document.getElementById('reservationDetails').innerHTML = details;

    const modal = new bootstrap.Modal(document.getElementById('viewReservationModal'));
    modal.show();
}

// ===== REALIZAR CHECK-IN =====
function doCheckIn(id) {
    if (confirm('¿Confirmar check-in para esta reserva?')) {
        const reservation = allReservations.find(r => r.id === id);
        if (reservation) {
            reservation.status = 'checkin';
            loadReservations();
            updateStats();
            showNotification(`Check-in realizado para ${reservation.guest}`, 'success');
        }
    }
}

// ===== EDITAR RESERVA =====
function editReservation(id) {
    showNotification('Función de edición en desarrollo', 'info');
}

// ===== CANCELAR RESERVA =====
function deleteReservation(id) {
    if (confirm('¿Está seguro que desea cancelar esta reserva?')) {
        const reservation = allReservations.find(r => r.id === id);
        if (reservation) {
            reservation.status = 'cancelada';
            loadReservations();
            updateStats();
            showNotification(`Reserva ${id} cancelada`, 'warning');
        }
    }
}

function cancelReservation() {
    const id = document.getElementById('detailReservationId').textContent;
    bootstrap.Modal.getInstance(document.getElementById('viewReservationModal')).hide();
    deleteReservation(id);
}

// ===== ACTUALIZAR RESERVAS =====
function refreshReservations() {
    showLoading();
    setTimeout(() => {
        loadReservations();
        hideLoading();
        showNotification('Reservas actualizadas', 'success');
    }, 1000);
}

// ===== EXPORTAR A EXCEL =====
function exportToExcel() {
    showNotification('Exportando a Excel...', 'info');
    setTimeout(() => {
        showNotification('Archivo descargado: reservas_hotelOS.xlsx', 'success');
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
            <p class="mt-3 mb-0">Procesando...</p>
        </div>
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
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
        min-width: 300px;
    `;
    notification.innerHTML = `<i class="bi bi-${icons[type]}"></i> ${message}`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}