const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  const mainDbUrl = process.env.DATABASE_URL;
  if (!mainDbUrl) {
    console.error('DATABASE_URL no está definida en el archivo .env');
    process.exit(1);
  }

  // URL para conectar a la base de datos por defecto 'postgres' y crear la base de datos destino si no existe
  // Reemplazamos 'semilleroDemo' por 'postgres'
  const defaultDbUrl = mainDbUrl.replace(/\/semilleroDemo(\?|$)/, '/postgres$1');

  console.log('1. Conectando a PostgreSQL para verificar base de datos...');
  let client = new Client({ connectionString: defaultDbUrl });
  await client.connect();

  try {
    // Verificar si la base de datos semilleroDemo existe
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'semilleroDemo'");
    if (res.rowCount === 0) {
      console.log('   La base de datos "semilleroDemo" no existe. Creándola...');
      // Las sentencias CREATE DATABASE no pueden ejecutarse dentro de bloques de transacción,
      // por lo que las ejecutamos directamente en la conexión 'postgres'.
      await client.query('CREATE DATABASE "semilleroDemo"');
      console.log('   Base de datos creada exitosamente.');
    } else {
      console.log('   La base de datos "semilleroDemo" ya existe.');
    }
  } catch (err) {
    console.error('Error al verificar/crear la base de datos:', err);
    await client.end();
    process.exit(1);
  }
  await client.end();

  // Conectarse a la base de datos semilleroDemo
  console.log('2. Conectando a "semilleroDemo" para aplicar esquema y datos semilla...');
  client = new Client({ connectionString: mainDbUrl });
  await client.connect();

  try {
    // 1. Limpiar/Dropear esquema público para recrear todo limpio
    console.log('   Limpiando esquema público existente...');
    await client.query('DROP SCHEMA public CASCADE');
    await client.query('CREATE SCHEMA public');
    await client.query('GRANT ALL ON SCHEMA public TO public');

    // 2. Leer archivo schema.sql
    const sqlPath = path.join(__dirname, '..', 'database', 'schema.sql');
    console.log(`   Leyendo archivo SQL desde ${sqlPath}...`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // 3. Ejecutar SQL
    console.log('   Ejecutando script de base de datos...');
    await client.query(sql);
    console.log('   ¡Esquema y datos semilla aplicados con éxito!');
  } catch (err) {
    console.error('Error al aplicar el esquema SQL:', err);
  } finally {
    await client.end();
  }
}

main();
