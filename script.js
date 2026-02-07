// ===== VARIABLES GLOBALES =====
let occupancyRate = 85;
let adrValue = 120;
let revparValue = 102;
let satisfactionRate = 4.8;

// ===== LOGIN =====
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'admin' && password === 'admin') {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainSystem').style.display = 'block';
        startRealTimeUpdates();
        initializeRooms();
        updateClock();
        showNotification('Bienvenido al sistema', 'success');
    } else {
        document.getElementById('errorMsg').style.display = 'block';
        setTimeout(() => {
            document.getElementById('errorMsg').style.display = 'none';
        }, 3000);
    }
});

// ===== LOGOUT =====
function logout() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        location.reload();
    }
}

// ===== NAVEGACIÓN =====
function showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    document.getElementById(sectionId).classList.add('active');
    
    // Actualizar sidebar activo
    document.querySelectorAll('#sidebar ul li').forEach(li => {
        li.classList.remove('active');
    });
    event.target.closest('li').classList.add('active');
}

// ===== RELOJ EN TIEMPO REAL =====
function updateClock() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    document.getElementById('currentTime').textContent = now.toLocaleDateString('es-ES', options);
    setTimeout(updateClock, 1000);
}

// ===== ACTUALIZACIONES EN TIEMPO REAL =====
function startRealTimeUpdates() {
    setInterval(() => {
        // Simular cambios en métricas
        occupancyRate = Math.min(100, occupancyRate + (Math.random() - 0.5) * 2);
        adrValue = Math.max(100, adrValue + (Math.random() - 0.5) * 5);
        revparValue = (occupancyRate / 100) * adrValue;
        satisfactionRate = Math.min(5, Math.max(4, satisfactionRate + (Math.random() - 0.5) * 0.1));
        
        // Actualizar UI
        document.getElementById('occupancyRate').textContent = Math.round(occupancyRate) + '%';
        document.getElementById('adrValue').textContent = '$' + Math.round(adrValue);
        document.getElementById('revparValue').textContent = '$' + Math.round(revparValue);
        document.getElementById('satisfactionRate').textContent = satisfactionRate.toFixed(1);
        
        // Actualizar barra de progreso
        document.querySelector('.progress-bar').style.width = occupancyRate + '%';
    }, 5000);
    
    // Simular nuevas reservas
    setInterval(() => {
        addNewReservation();
    }, 15000);
}

// ===== NUEVA RESERVA SIMULADA =====
function addNewReservation() {
    const names = ['Carlos Rodríguez', 'Ana Martínez', 'Pedro Sánchez', 'Laura Gómez'];
    const channels = [
        {name: 'Booking', class: 'primary'},
        {name: 'Expedia', class: 'success'},
        {name: 'Web', class: 'info'},
        {name: 'Recepción', class: 'warning'}
    ];
    
    const name = names[Math.floor(Math.random() * names.length)];
    const channel = channels[Math.floor(Math.random() * channels.length)];
    const id = '#' + Math.floor(Math.random() * 9000 + 1000);
    const room = Math.floor(Math.random() * 200 + 101);
    
    const table = document.getElementById('reservationsTable');
    const newRow = table.insertRow(0);
    newRow.className = 'new-entry';
    newRow.innerHTML = `
        <td>${id}</td>
        <td><i class="bi bi-person-circle"></i> ${name}</td>
        <td><span class="badge bg-${channel.class}">${channel.name}</span></td>
        <td>${new Date().toLocaleDateString('es-ES')}</td>
        <td>${new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString('es-ES')}</td>
        <td>${room}</td>
        <td><span class="badge bg-success">Confirmada</span></td>
        <td>
            <button class="btn btn-sm btn-outline-primary" onclick="openCheckIn()">
                <i class="bi bi-box-arrow-in-right"></i>
            </button>
        </td>
    `;
    
    showNotification(`Nueva reserva: ${name} - ${channel.name}`, 'info');
}

// ===== CHECK-IN MODAL =====
function openCheckIn() {
    const modal = new bootstrap.Modal(document.getElementById('checkInModal'));
    modal.show();
}

function completeCheckIn() {
    showNotification('Check-in completado exitosamente en 2 minutos', 'success');
    bootstrap.Modal.getInstance(document.getElementById('checkInModal')).hide();
}

// ===== CHECK-OUT =====
function openCheckOut() {
    showNotification('Módulo de Check-Out (En desarrollo)', 'info');
}

// ===== HOUSEKEEPING =====
function initializeRooms() {
    const roomsGrid = document.getElementById('roomsGrid');
    const statuses = ['clean', 'dirty', 'maintenance'];
    const statusText = ['Limpia', 'Sucia', 'Reparación'];
    
    for (let i = 101; i <= 120; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const statusName = statusText[statuses.indexOf(status)];
        
        const roomCard = document.createElement('div');
        roomCard.className = 'col-md-2 col-sm-4 col-6';
        roomCard.innerHTML = `
            <div class="room-card ${status}" onclick="changeRoomStatus(this)">
                <div>${i}</div>
                <span>${statusName}</span>
            </div>
        `;
        roomsGrid.appendChild(roomCard);
    }
}

function changeRoomStatus(element) {
    const statuses = ['clean', 'dirty', 'maintenance'];
    const statusText = ['Limpia', 'Sucia', 'Reparación'];
    
    let currentStatus = statuses.findIndex(s => element.classList.contains(s));
    let nextStatus = (currentStatus + 1) % statuses.length;
    
    element.classList.remove(statuses[currentStatus]);
    element.classList.add(statuses[nextStatus]);
    element.querySelector('span').textContent = statusText[nextStatus];
    
    showNotification(`Habitación actualizada a: ${statusText[nextStatus]}`, 'success');
}

function autoAssign() {
    showNotification('Asignación automática de limpieza iniciada', 'success');
}

// ===== REPORTES =====
function generateReport(type) {
    const output = document.getElementById('reportOutput');
    output.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Generando reporte...</p></div>';
    
    setTimeout(() => {
        let content = '';
        switch(type) {
            case 'revenue':
                content = `
                    <h5><i class="bi bi-currency-dollar"></i> Reporte de Revenue Management</h5>
                    <div class="row g-3 mt-3">
                        <div class="col-md-4">
                            <div class="stat-card">
                                <h6>Ingresos del mes</h6>
                                <h3>$45,230</h3>
                                <small class="text-success"><i class="bi bi-arrow-up"></i> +12% vs mes anterior</small>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="stat-card">
                                <h6>Proyección mensual</h6>
                                <h3>$52,000</h3>
                                <small class="text-info">Basado en tendencia actual</small>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="stat-card">
                                <h6>RevPAR promedio</h6>
                                <h3>$102</h3>
                                <small class="text-muted">Revenue per Available Room</small>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'occupancy':
                content = `
                    <h5><i class="bi bi-building"></i> Reporte de Ocupación</h5>
                    <p class="mt-3">Tasa de ocupación promedio: <strong>85%</strong></p>
                    <div class="progress" style="height: 30px;">
                        <div class="progress-bar bg-success" style="width: 85%">85%</div>
                    </div>
                    <p class="mt-3 text-muted">Análisis detallado de ocupación por día de la semana y temporada.</p>
                `;
                break;
            case 'satisfaction':
                content = `
                    <h5><i class="bi bi-star"></i> Reporte de Satisfacción</h5>
                    <div class="text-center mt-4">
                        <h1 class="display-3">4.8 ⭐</h1>
                        <p class="text-muted">Basado en 245 reseñas este mes</p>
                        <div class="alert alert-success mt-3">
                            <i class="bi bi-check-circle"></i> Excelente nivel de satisfacción
                        </div>
                    </div>
                `;
                break;
        }
        output.innerHTML = content;
    }, 1500);
}

// ===== GRÁFICOS =====
function updateChart() {
    const bars = document.querySelectorAll('.bar');
    bars.forEach(bar => {
        const newHeight = Math.floor(Math.random() * 40 + 60) + '%';
        bar.style.setProperty('--height', newHeight);
    });
    showNotification('Gráfico actualizado con datos en tiempo real', 'success');
}

// ===== NOTIFICACIONES =====
function showNotification(message, type = 'info') {
    const colors = {
        success: '#198754',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#0dcaf0'
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
    `;
    notification.innerHTML = `<i class="bi bi-check-circle"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== NUEVA RESERVA =====
function openNewReservation() {
    showNotification('Módulo de nueva reserva (En desarrollo)', 'info');
}

// ===== CSS ANIMATIONS =====
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
`;
document.head.appendChild(style);
