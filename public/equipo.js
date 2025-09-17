document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const equipoId = params.get('id');
    const equipoInfoDiv = document.getElementById('equipo-info');
    const cuadroTorneoDiv = document.getElementById('cuadroTorneo');

    if (!equipoId) {
        equipoInfoDiv.innerHTML = '<p>ID de equipo no encontrado.</p>';
        return;
    }

    try {
        // Fetch specific team data
        const response = await fetch(`/api/equipo/${equipoId}`);
        const equipo = await response.json();

        if (response.status === 404) {
            equipoInfoDiv.innerHTML = `<p>${equipo.message}</p>`;
            return;
        }

        // Display team information
        equipoInfoDiv.innerHTML = `
            <div class="team-card">
                <h3>${equipo.nombre_equipo}</h3>
                <p><b>ID Único:</b> ${equipo.equipo_id}</p>
                <p><b>Club:</b> ${equipo.club}</p>
                <p><b>Categoría:</b> ${equipo.categoria}</p>
                <p><b>Jugadores:</b> ${equipo.num_jugadores}</p>
            </div>
        `;

        // Fetch all teams to generate the bracket
        const allTeamsResponse = await fetch(`/api/admin/equipos?password=admin123`); // Using a simple password for demo
        const allTeams = await allTeamsResponse.json();

        if (allTeams.length >= 2) {
            cuadroTorneoDiv.innerHTML = generarCuadroHTML(allTeams);
        } else {
            cuadroTorneoDiv.innerHTML = '<p>Aún no hay suficientes equipos para generar el cuadro del torneo.</p>';
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        equipoInfoDiv.innerHTML = '<p>Error al cargar la información del equipo.</p>';
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