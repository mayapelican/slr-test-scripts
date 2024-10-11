const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// PostgreSQL connection configuration
const config = {
  user: 'postgres',
  host: 'edb-poc-rw', // e.g., 'localhost'
  password: 'uN3i1Hh0bYbCc4TyVAacBhmSzgqtzqxmOVjAn0QIChsJrSmu9PY2fw2q8EKKLpZ9',
  database: 'app', 
  port: 5432, // Default PostgreSQL port
};

// Create a client instance
const client = new Client(config);

// Path to the SQL file
const sqlFilePath = path.join(__dirname, 'backup.sql'); // Replace with your actual SQL file name

async function connectClient() {
  try {
    if (!client._connected) {
      await client.connect();
      console.log('Connected to PostgreSQL server.');
      client._connected = true; // Mark client as connected
    }
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err);
  }
}

async function disconnectClient() {
  try {
    if (client._connected) {
      await client.end();
      console.log('Disconnected from PostgreSQL server.');
      client._connected = false; // Mark client as disconnected
    }
  } catch (err) {
    console.error('Error disconnecting from PostgreSQL:', err);
  }
}

async function listDatabases() {
  try {
    // Ensure the client is connected
    await connectClient();

    // List databases
    const res = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
    console.log('Databases:');
    res.rows.forEach(row => {
      console.log(row.datname);
    });

  } catch (err) {
    console.error('Error listing databases:', err);
  }
}

async function createSchemaAndRestoreSQL() {
  try {
    // Ensure the client is connected
    await connectClient();

    // Create a new schema (change 'your_schema' to the desired schema name)
    const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS public;`;
    await client.query(createSchemaQuery);
    console.log('Schema created successfully.');

    // Read the SQL file content
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

    // Execute the SQL file content in the public schema
    await client.query(sqlContent);
    console.log('SQL file executed successfully.');

  } catch (err) {
    console.error('Error creating schema and restoring SQL file:', err);
  }
}

async function main() {
  try {
    // Perform database listing
    await listDatabases();

    // Perform schema creation and SQL file restoration
    await createSchemaAndRestoreSQL();
  } finally {
    // Ensure the client is disconnected
    await disconnectClient();
  }
}

// Call the main function
main();
