const express = require('express');
const { Client } = require('pg');
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

// Create a client instance
let client = new Client(config);

// Path to the SQL file
const sqlFilePath = path.join(__dirname, 'backup.sql'); // Replace with your actual SQL file name

// Connect to PostgreSQL
async function connectClient() {
    if (!client._connected) {
        await client.connect();
        console.log('Connected to PostgreSQL server.');
        client._connected = true;
    }
}

// Disconnect from PostgreSQL
async function disconnectClient() {
    if (client._connected) {
        await client.end();
        console.log('Disconnected from PostgreSQL server.');
        client._connected = false;
    }
}

// Route to list all databases
app.get('/list-databases', async (req, res) => {
    try {
        await connectClient();

        // Query to list all databases
        const result = await client.query(`
        SELECT datname 
        FROM pg_database 
        WHERE datistemplate = false;
      `);

        const databases = result.rows.map(row => row.datname);
        res.json({ databases });

    } catch (err) {
        console.error('Error listing databases:', err);
        res.status(500).json({ error: 'Failed to list databases' });
    } finally {
        await disconnectClient();
    }
});


// Route to list all schemas
app.get('/list-schemas', async (req, res) => {
    try {
        await connectClient();

        // Query to list all schemas
        const result = await client.query(`
        SELECT schema_name 
        FROM information_schema.schemata;
      `);

        const schemas = result.rows.map(row => row.schema_name);
        res.json({ schemas });

    } catch (err) {
        console.error('Error listing schemas:', err);
        res.status(500).json({ error: 'Failed to list schemas' });
    } finally {
        await disconnectClient();
    }
});

// Route to list all tables in the public schema
app.get('/list-tables', async (req, res) => {
    try {
        await connectClient();

        // Query to list tables in the 'public' schema
        const result = await client.query(`
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
    } finally {
        await disconnectClient();
    }
});

// Route to restore schema and run SQL backup
app.post('/restore-schema', async (req, res) => {
    try {
        await connectClient();

        // Create the schema if not exists
        const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS public;`;
        await client.query(createSchemaQuery);
        console.log('Schema created successfully.');

        res.json({ message: 'Schema restored successfully' });
    } catch (err) {
        console.error('Error restoring schema:', err);
        res.status(500).json({ error: 'Failed to restore schema' });
    } finally {
        await disconnectClient();
    }
});

// Route to restore schema and run SQL backup
app.post('/restore-data', async (req, res) => {
    try {
        await connectClient();
        // Read the SQL file content
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

        // Execute the SQL file content
        await client.query(sqlContent);
        console.log('SQL file executed successfully.');

        res.json({ message: 'Data restored and SQL executed successfully' });
    } catch (err) {
        console.error('Error restoring schema:', err);
        res.status(500).json({ error: 'Failed to restore schema' });
    } finally {
        await disconnectClient();
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
