import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT),
  queueLimit: 0,
});

// Testa a conexão ao iniciar
db.getConnection()
  .then((connection) => {
    console.log(" Conectado ao MySQL com sucesso!");
    connection.release();
  })
  .catch((err) => {
    console.error("Erro ao conectar no MySQL:", err.message);
  });

export default db;