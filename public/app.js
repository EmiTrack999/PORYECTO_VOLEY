document.addEventListener('DOMContentLoaded', () => {
    const registroForm = document.getElementById('registroEquipoForm');
    const mensajeRegistro = document.getElementById('mensajeRegistro');
    const viewTeamBtn = document.getElementById('viewTeamBtn');
    const adminLoginBtn = document.getElementById('adminLoginBtn');

    // Handle team registration form submission
    registroForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                mensajeRegistro.innerHTML = `¡Equipo <b>${data.nombreEquipo}</b> registrado correctamente! Tu ID único es: <b>${result.equipoId}</b>. Guárdalo para ver tu estado y el cuadro del torneo.`;
                this.reset();
            } else {
                mensajeRegistro.textContent = 'Error: ' + result.message;
            }
        } catch (error) {
            console.error('Error:', error);
            mensajeRegistro.textContent = 'Error al conectar con el servidor.';
        }
    });

    // Handle 'View My Team' button click
    viewTeamBtn.addEventListener('click', () => {
        const equipoId = prompt("Por favor, introduce tu ID de equipo:");
        if (equipoId) {
            window.location.href = `/equipo.html?id=${equipoId}`;
        }
    });

    // Handle 'Admin Login' button click
    adminLoginBtn.addEventListener('click', () => {
        window.location.href = '/admin.html';
    });
});