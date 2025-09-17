document.addEventListener('DOMContentLoaded', () => {
    const passwordForm = document.getElementById('password-form');
    const adminDashboard = document.getElementById('admin-dashboard');
    const adminPasswordInput = document.getElementById('adminPassword');
    const accessBtn = document.getElementById('accessBtn');
    const passwordError = document.getElementById('passwordError');
    const listaEquipos = document.getElementById('listaEquipos');
    const cuadroTorneo = document.getElementById('cuadroTorneo');

    accessBtn.addEventListener('click', async () => {
        const password = adminPasswordInput.value;
        try {
            const response = await fetch(`/api/admin/equipos?password=${password}`);
            if (response.status === 401) {
                passwordError.textContent = 'Contraseña incorrecta. Intenta de nuevo.';
                return;
            }
            const equipos = await response.json();
            passwordForm.style.display = 'none';
            adminDashboard.style.display = 'block';
            cargarDashboard(equipos);

        } catch (error) {
            console.error('Error al cargar los datos:', error);
            passwordError.textContent = 'Hubo un error al conectar. Intenta de nuevo.';
        }
    });

    function cargarDashboard(equipos) {
        document.getElementById('equipoCount').textContent = equipos.length;

        listaEquipos.innerHTML = equipos.map(equipo => `
            <li data-id="${equipo.id}" data-equipo-id="${equipo.equipo_id}">
                <b>${equipo.nombre_equipo}</b> - Coach: ${equipo.nombre_coach}
                <div class="equipo-actions">
                    <button class="btn-edit">Editar</button>
                    <button class="btn-delete">Eliminar</button>
                </div>
            </li>
        `).join('');

        listaEquipos.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', handleDelete);
        });
        listaEquipos.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', handleEdit);
        });

        if (equipos.length >= 2) {
            cuadroTorneo.innerHTML = generarCuadroHTML(equipos);
        } else {
            cuadroTorneo.innerHTML = '<p>Necesitas al menos 2 equipos para generar el cuadro del torneo.</p>';
        }
    }

    async function handleDelete(e) {
        const li = e.target.closest('li');
        // Usamos el ID de la base de datos del atributo data-id
        const id = li.dataset.id;
        const nombreEquipo = li.querySelector('b').textContent;

        if (confirm(`¿Estás seguro de que quieres eliminar a "${nombreEquipo}"?`)) {
            try {
                const response = await fetch(`/api/admin/equipo/${id}`, {
                    method: 'DELETE'
                });
                const result = await response.json();
                if (result.success) {
                    alert('Equipo eliminado correctamente.');
                    window.location.reload();
                } else {
                    alert('Error al eliminar el equipo.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al conectar con el servidor para eliminar.');
            }
        }
    }

    async function handleEdit(e) {
        const li = e.target.closest('li');
        const id = li.dataset.id; // Obtenemos el ID de la base de datos
        
        try {
            // Usamos el `equipo_id` para obtener la información del equipo para editar
            const response = await fetch(`/api/equipo/${li.dataset.equipoId}`);
            const equipoData = await response.json();

            const newName = prompt(`Editar el nombre de "${equipoData.nombre_equipo}":`, equipoData.nombre_equipo);
            if (newName) {
                const updatedData = {
                    nombre_equipo: newName,
                    club: equipoData.club,
                    categoria: equipoData.categoria,
                    tiene_libero: equipoData.tiene_libero,
                    num_jugadores: equipoData.num_jugadores,
                    nombre_coach: equipoData.nombre_coach,
                    email_coach: equipoData.email_coach,
                    telefono_coach: equipoData.telefono_coach
                };

                const updateResponse = await fetch(`/api/admin/equipo/${id}`, { // Usamos el ID de la base de datos para la actualización
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });
                const result = await updateResponse.json();
                if (result.success) {
                    alert('Equipo actualizado correctamente.');
                    window.location.reload();
                } else {
                    alert('Error al actualizar el equipo.');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al obtener los datos del equipo para editar.');
        }
    }

    function generarCuadroHTML(equipos) {
        let equiposDisponibles = [...equipos];
        let cuadroHTML = '<div class="cuadro-torneo">';

        for (let i = equiposDisponibles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [equiposDisponibles[i], equiposDisponibles[j]] = [equiposDisponibles[j], equiposDisponibles[i]];
        }

        if (equiposDisponibles.length % 2 !== 0) {
            const byeTeam = equiposDisponibles.pop();
            cuadroHTML += `<div class="partido"><span>${byeTeam.nombre_equipo}</span> (pasa a la siguiente ronda)</div>`;
        }

        for (let i = 0; i < equiposDisponibles.length; i += 2) {
            const equipo1 = equiposDisponibles[i];
            const equipo2 = equiposDisponibles[i + 1];
            cuadroHTML += `<div class="partido"><span>${equipo1.nombre_equipo}</span> vs <span>${equipo2.nombre_equipo}</span></div>`;
        }
        
        cuadroHTML += '</div>';
        return cuadroHTML;
    }
});