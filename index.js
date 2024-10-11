const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection configuration
const config = {
    user: 'postgres',
    host: 'edb-poc-rw', // e.g., 'localhost'
    password: 'uN3i1Hh0bYbCc4TyVAacBhmSzgqtzqxmOVjAn0QIChsJrSmu9PY2fw2q8EKKLpZ9',
    database: 'app',
    port: 5432, // Default PostgreSQL port
};

// Create a connection pool
const pool = new Pool(config);

// Path to the SQL file
const sqlFilePath = path.join(__dirname, 'backup.sql'); // Replace with your actual SQL file name

// API endpoint to run custom SQL commands
app.post('/run-sql', async (req, res) => {
    const { sql } = req.body;

    // Check if SQL is provided
    if (!sql) {
        return res.status(400).json({ error: 'SQL command is required.' });
    }

    try {
        await connectClient();

        // Execute the SQL command
        const result = await client.query(sql);

        // Return the result of the query
        res.json({ rows: result.rows, fields: result.fields });

    } catch (err) {
        console.error('Error executing SQL:', err);
        res.status(500).json({ error: 'Failed to execute SQL', details: err.message });
    } finally {
        await disconnectClient();
    }
});

// Route to list all databases
app.get('/list-databases', async (req, res) => {
    try {
        // Query to list all databases
        const result = await pool.query(`
        SELECT datname 
        FROM pg_database 
        WHERE datistemplate = false;
      `);

        const databases = result.rows.map(row => row.datname);
        res.json({ databases });

    } catch (err) {
        console.error('Error listing databases:', err);
        res.status(500).json({ error: 'Failed to list databases' });
    }
});

// Route to list all schemas
app.get('/list-schemas', async (req, res) => {
    try {
        // Query to list all schemas
        const result = await pool.query(`
        SELECT schema_name 
        FROM information_schema.schemata;
      `);

        const schemas = result.rows.map(row => row.schema_name);
        res.json({ schemas });

    } catch (err) {
        console.error('Error listing schemas:', err);
        res.status(500).json({ error: 'Failed to list schemas' });
    }
});

// Route to list all tables in the public schema
app.get('/list-tables', async (req, res) => {
    try {
        // Query to list tables in the 'public' schema
        const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `);

        const tables = result.rows.map(row => row.table_name);
        res.json({ tables });

    } catch (err) {
        console.error('Error listing tables:', err);
        res.status(500).json({ error: 'Failed to list tables' });
    }
});

// Route to restore schema
app.post('/restore-schema', async (req, res) => {
    try {
        // Create the schema if not exists
        const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS public;`;
        await pool.query(createSchemaQuery);
        console.log('Schema created successfully.');

        res.json({ message: 'Schema restored successfully' });
    } catch (err) {
        console.error('Error restoring schema:', err);
        res.status(500).json({ error: 'Failed to restore schema' });
    }
});

// Route to restore data from SQL backup file
app.post('/restore-data', async (req, res) => {
    try {
        // Read the SQL file content
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

        // Execute the SQL file content
        await pool.query(sqlContent);
        console.log('SQL file executed successfully.');

        res.json({ message: 'Data restored and SQL executed successfully' });
    } catch (err) {
        console.error('Error restoring data:', err);
        res.status(500).json({ error: 'Failed to restore data' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
