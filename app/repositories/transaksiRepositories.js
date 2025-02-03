const { Request, TYPES } = require('tedious');
const { getDbTRO } = require('../../database/database');

class SpanRepositories {
    query(connection, query, parameters = []) {
        return new Promise((resolve, reject) => {
            const request = new Request(query, (err, rowCount) => {
                if (err) {
                    return reject(err, rowCount);
                }
                resolve(rows);
            });

            if (Array.isArray(parameters)) {
                parameters.forEach(param => request.addParameter(param.name, param.type, param.value));
            }

            const rows = [];
            request.on('row', columns => {
                const row = {};
                columns.forEach(column => {
                    row[column.metadata.colName] = column.value;
                });
                rows.push(row);
            });

            connection.execSql(request);
        });
    }

    async getTransactionDetails() {
        const connection = await getDbTRO();
        const query = `
          SELECT 
            t.id as transaction_id,
            t.total_transaksi,
            t.total_barang,
            t.status_bayar,
            p.nama as nama_pembeli,
            b.nama_barang as nama_barang
          FROM transaksi t
          JOIN pembeli p ON t.pembeli_id = p.id
          JOIN barang b ON t.barang_id = b.id
        `;
        
        const transactions = await this.query(connection, query);
        return (transactions)
      }

      async getTransactionById(transactionId) {
        const connection = await getDbTRO();
        const query = `
          SELECT 
            t.id as transaction_id,
            t.total_transaksi,
            t.total_barang,
            t.status_bayar,
            p.email,
            p.nama as nama_pembeli,
            b.nama_barang as nama_barang,
            b.id as barang_id
          FROM transaksi t
          JOIN pembeli p ON t.pembeli_id = p.id
          JOIN barang b ON t.barang_id = b.id
          WHERE t.id = @transactionId
        `;
        
        const parameters = [{
          name: 'transactionId',
          type: TYPES.UniqueIdentifier,
          value: transactionId
        }];
    
        const transactions = await this.query(connection, query, parameters);
        return transactions[0];
      }

      async updateTransactionStatus(transactionId, status) {
        const connection = await getDbTRO();
        const query = `
          UPDATE transaksi 
          SET status_bayar = @status
          WHERE id = @transactionId
        `;
        
        const parameters = [
          {
            name: 'status',
            type: TYPES.VarChar,
            value: status
          },
          {
            name: 'transactionId',
            type: TYPES.Int,
            value: transactionId
          }
        ];
    
        const transactions = await this.query(connection, query, parameters);
        return transactions
      }
    
      async saveSubscription(pembeliId, subscription) {
        const connection = await getDbTRO();
        const query = `
          UPDATE pembeli 
          SET push_subscription = @subscription
          WHERE id = @pembeliId
        `;
        
        const parameters = [
          {
            name: 'subscription',
            type: TYPES.VarChar,
            value: JSON.stringify(subscription)
          },
          {
            name: 'pembeliId',
            type: TYPES.Int,
            value: pembeliId
          }
        ];
    
        const transactions = await this.query(connection, query, parameters);
        return transactions
      }
    
      async getSubscription(pembeliId) {
        const connection = await getDbTRO();
        const query = `
          SELECT push_subscription
          FROM pembeli
          WHERE id = @pembeliId
        `;
        
        const parameters = [{
          name: 'pembeliId',
          type: TYPES.Int,
          value: pembeliId
        }];
    
         const transactions = await this.query(connection, query, parameters);
        return JSON.parse(transactions[0].push_subscription);
      }
}

module.exports = new SpanRepositories();