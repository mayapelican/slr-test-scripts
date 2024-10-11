const { Client } = require('pg');

// PostgreSQL connection configuration
const config = {
  user: 'postgres',
  host: 'edb-poc-rw', // e.g., 'localhost'
  password: 'uN3i1Hh0bYbCc4TyVAacBhmSzgqtzqxmOVjAn0QIChsJrSmu9PY2fw2q8EKKLpZ9',
  port: 5432, // Default PostgreSQL port
};

// Create a client instance
const client = new Client(config);

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

// Call the function to list databases
listDatabases();
