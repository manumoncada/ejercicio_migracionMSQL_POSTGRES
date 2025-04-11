const express = require('express');
const client = require('./db');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Prueba simple
app.get('/api/prueba1', (req, res) => {
    res.status(200).json({
        message: 'La API responde correctamente',
        port: PORT,
        status: 'success'
    });
});

// API para registrar usuario
app.post('/api/registro', async (req, res) => {
    const { nombre, email, cedula } = req.body;
    const query = 'INSERT INTO usuarios (nombre, email, cedula) VALUES ($1, $2, $3)';

    try {
        await client.query(query, [nombre, email, cedula]);
        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            data: { nombre, email, cedula }
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error.message);
        res.status(500).json({
            message: 'Error creando el usuario',
            error: error.message
        });
    }
});

// Mostrar todos los usuarios
app.get('/api/mostrar', async (req, res) => {
    const query = 'SELECT * FROM usuarios';

    try {
        const result = await client.query(query);
        res.status(200).json({
            connection: true,
            message: "Usuarios obtenidos correctamente",
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({
            connection: false,
            message: "Error al obtener los usuarios",
            details: error.message
        });
    }
});

// Eliminar usuario por cédula
app.delete('/api/eliminar/cedula', async (req, res) => {
    const { cedula } = req.query;
    const query = 'DELETE FROM usuarios WHERE cedula = $1';

    try {
        const result = await client.query(query, [cedula]);

        if (result.rowCount === 0) {
            res.status(404).json({
                success: false,
                message: `No existe el usuario con cédula ${cedula}`
            });
        } else {
            res.status(200).json({
                success: true,
                message: `Usuario con cédula ${cedula} eliminado exitosamente`
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar el usuario",
            details: error.message
        });
    }
});

// Actualizar usuario por cédula
app.put('/api/actualizar/cedula', async (req, res) => {
    const { cedula, nombre, email } = req.body;
    const query = 'UPDATE usuarios SET nombre = $1, email = $2 WHERE cedula = $3';

    try {
        const result = await client.query(query, [nombre, email, cedula]);

        if (result.rowCount === 0) {
            res.status(404).json({
                success: false,
                message: `No se encontró usuario con cédula ${cedula}`
            });
        } else {
            res.status(200).json({
                success: true,
                message: `Usuario con cédula ${cedula} actualizado correctamente`,
                data: { nombre, email, cedula }
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar el usuario",
            details: error.message
        });
    }
});
