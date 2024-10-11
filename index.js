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

async function listDatabases() {
  try {
    // Connect to PostgreSQL
    await client.connect();
    console.log('Connected to PostgreSQL server.');

    // List databases
    const res = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
    console.log('Databases:');
    res.rows.forEach(row => {
      console.log(row.datname);
    });

    // Disconnect from PostgreSQL
    await client.end();
    console.log('Disconnected from PostgreSQL server.');
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err);
  }
}

async function createSchemaAndRestoreSQL() {
    try {
      // Connect to PostgreSQL
      await client.connect();
      console.log('Connected to PostgreSQL server.');
  
      // Create a new schema (change 'your_schema' to the desired schema name)
      const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS public;`;
      await client.query(createSchemaQuery);
      console.log('Schema created successfully.');
  
      // Read the SQL file content
      const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
  
      // Execute the SQL file content in the public schema
      await client.query(sqlContent);
      console.log('SQL file executed successfully.');
  
      // Disconnect from PostgreSQL
      await client.end();
      console.log('Disconnected from PostgreSQL server.');
    } catch (err) {
      console.error('Error:', err);
    }
  }

// Call the function to list databases
listDatabases();

// Call the function to create schema and restore SQL file
createSchemaAndRestoreSQL();