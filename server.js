const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'torneo_voleibol'
});

const ADMIN_PASSWORD = 'admin123';

// ---- API Routes ----

// Register a new team and generate a unique ID
app.post('/api/registrar', (req, res) => {
    const {
        nombreEquipo, club, categoria, tieneLibero, numJugadores,
        nombreCoach, emailCoach, telefonoCoach
    } = req.body;

    const equipoId = crypto.randomBytes(3).toString('hex');

    const sql = `INSERT INTO equipos (nombre_equipo, club, categoria, tiene_libero, num_jugadores,
                 nombre_coach, email_coach, telefono_coach, equipo_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
        sql,
        [nombreEquipo, club, categoria, tieneLibero, numJugadores,
         nombreCoach, emailCoach, telefonoCoach, equipoId],
        (err, result) => {
            if (err) {
                console.error('Error saving to database:', err);
                return res.status(500).json({ success: false, message: 'Error registering team.' });
            }
            res.status(200).json({ success: true, message: '¡Equipo registrado con éxito!', equipoId: equipoId });
        }
    );
});

// Get a single team by its unique ID
app.get('/api/equipo/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM equipos WHERE equipo_id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error fetching team:', err);
            return res.status(500).json({ success: false, message: 'Error fetching team.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Equipo no encontrado.' });
        }
        res.status(200).json(results[0]);
    });
});

// Get all teams for admin
app.get('/api/admin/equipos', (req, res) => {
    const { password } = req.query;
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, message: 'Acceso no autorizado.' });
    }
    const sql = 'SELECT * FROM equipos';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching teams for admin:', err);
            return res.status(500).json({ success: false, message: 'Error fetching teams.' });
        }
        res.status(200).json(results);
    });
});

// Update a team's information (CRUD: Update)
app.put('/api/admin/equipo/:id', (req, res) => {
    const { id } = req.params;
    const {
        nombre_equipo, club, categoria, tiene_libero, num_jugadores,
        nombre_coach, email_coach, telefono_coach
    } = req.body;

    const sql = `UPDATE equipos SET 
                 nombre_equipo = ?, club = ?, categoria = ?, tiene_libero = ?, num_jugadores = ?,
                 nombre_coach = ?, email_coach = ?, telefono_coach = ?
                 WHERE id = ?`;

    db.query(
        sql,
        [nombre_equipo, club, categoria, tiene_libero, num_jugadores,
         nombre_coach, email_coach, telefono_coach, id],
        (err, result) => {
            if (err) {
                console.error('Error updating team:', err);
                return res.status(500).json({ success: false, message: 'Error al actualizar el equipo.' });
            }
            res.status(200).json({ success: true, message: 'Equipo actualizado correctamente.' });
        }
    );
});

// Delete a team (CRUD: Delete)
app.delete('/api/admin/equipo/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM equipos WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting team:', err);
            return res.status(500).json({ success: false, message: 'Error al eliminar el equipo.' });
        }
        res.status(200).json({ success: true, message: 'Equipo eliminado correctamente.' });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});