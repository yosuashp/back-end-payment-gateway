const { Connection, Request } = require('tedious');
const { config1, config2, config3, config4, config5, config6 } = require('../config/database');
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../log.txt');

// Fungsi untuk mencatat log
function logMessage(message) {
  const localDate = new Date(Date.now());
  const wibDate = new Date(localDate.getTime() + 7 * 60 * 60 * 1000);
  const formattedDate = wibDate.toISOString().replace('T', ' ').slice(0, 19);

  const logEntry = `[${formattedDate} WIB] ${message}\n`;
  console.log(logEntry.trim());
  fs.appendFileSync(logFilePath, logEntry);
}

// Fungsi untuk membuat koneksi baru ke database
function createNewConnection(config, dbName) {
  return new Promise((resolve, reject) => {
    const connection = new Connection(config);

    connection.on('connect', (err) => {
      if (err) {
        logMessage(`Gagal koneksi ke database ${dbName}: ${err.message}`);
        reject(err);
      } else {
        logMessage(`Berhasil koneksi ke database ${dbName}`);
        resolve(connection);
      }
    });

    connection.on('error', (err) => {
      logMessage(`Error pada koneksi ke database ${dbName}: ${err.message}`);
    });

    connection.on('end', () => {
      logMessage(`Koneksi ke database ${dbName} ditutup.`);
    });

    connection.connect();
  });
}

// Fungsi untuk memastikan koneksi baru setiap kali dipanggil
async function getNewConnection(config, dbName) {
  let connection;
  try {
    connection = await createNewConnection(config, dbName);
  } catch (err) {
    logMessage(`Gagal membuat koneksi baru ke database ${dbName}: ${err.message}`);
    throw err;
  }
  return connection;
}

async function executeSimpleQuery(dbName) {
  try {
    // Menyusun objek konfigurasi berdasarkan nama database
    const configs = {
      TRO: config1,
      BRIMPNG2: config2,
      SHIFT: config3,
      CASHCARD: config4,
      SPAN: config5,
    };

    // Pastikan nama database yang diminta ada di configs
    if (!dbName) {
      console.log(dbName)
      throw new Error("Nama database tidak disediakan.");
    }

    if (!configs[dbName]) {
      throw new Error(`Konfigurasi untuk database ${dbName} tidak ditemukan.`);
    }

    logMessage(`Menggunakan konfigurasi untuk database ${dbName}`);

    // Menggunakan konfigurasi yang tepat untuk database yang dipilih
    const connection = await createNewConnection(configs[dbName], dbName);

    return new Promise((resolve, reject) => {
      const request = new Request("SELECT 1 + 1 AS result", (err, rowCount, rows) => {
        if (err) {
          logMessage(`Query gagal untuk ${dbName}: ${err.message}`);
          reject(err);
        } else {
          logMessage(`Query berhasil untuk ${dbName}`);
          resolve(rows);  // Return the rows for inspection if needed
        }
      });

      // Eksekusi query
      connection.execSql(request);

      // Tutup koneksi setelah eksekusi
      connection.on('end', () => {
        connection.close();
      });
    });
  } catch (err) {
    logMessage(`Gagal eksekusi query untuk ${dbName}: ${err.message}`);
  }
}


// Fungsi untuk refresh semua koneksi setiap 1 jam
async function refreshAllConnections() {
  const configs = { TRO: config1, BRIMPNG2: config2, SHIFT: config3, CASHCARD: config4, SPAN: config5 };
  for (const dbName of Object.keys(configs)) {
    try {
      logMessage(`Merefresh koneksi ke database ${dbName}...`);
      const connection = await getNewConnection(configs[dbName], dbName);
      connection.close(); // Tutup koneksi setelah memastikan berhasil terkoneksi
      logMessage(`Koneksi ke database ${dbName} berhasil di-refresh.`);
    } catch (err) {
      logMessage(`Gagal merefresh koneksi ke database ${dbName}: ${err.message}`);
    }
  }
}

// Interval untuk refresh koneksi setiap 1 jam
setInterval(async () => {
  logMessage('Melakukan refresh semua koneksi ke database...');
  await refreshAllConnections();
  const dbNames = ['TRO', 'BRIMPNG2', 'SHIFT', 'CASHCARD', 'SPAN'];
  for (const dbName of dbNames) {
    await executeSimpleQuery(dbName);
  }
}, 60 * 60 * 1000); 

module.exports = {
  async getDbTRO() {
    return getNewConnection(config1, 'TRO');
  },
  async getDbBRIMPNG2() {
    return getNewConnection(config2, 'BRIMPNG2');
  },
  async getDbSHIFT() {
    return getNewConnection(config3, 'SHIFT');
  },
  async getDbCASHCARD() {
    return getNewConnection(config4, 'CASHCARD');
  },
  async getDbSPAN() {
    return getNewConnection(config5, 'SPAN');
  },
  async getDbNEWTRO() {
    return getNewConnection(config6, 'NEWTRO');
  },
  logMessage,
};
