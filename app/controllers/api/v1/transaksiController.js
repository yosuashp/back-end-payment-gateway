// transaksiController.js
const midtransClient = require('midtrans-client');
const webpush = require('web-push');
const transaksiService = require('../../../services/transaksiServices');

// Configure Web Push
const vapidKeys = webpush.generateVAPIDKeys();
webpush.setVapidDetails(
  'mailto:your@email.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

class transaksiController {

    //**Midtrans */
  constructor() {
    // Initialize Midtrans
    this.snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: 'SB-Mid-server-q-sqkJw4NHJfNgwU-C9Ihw39',
      //clientKey: 'SB-Mid-client-Ffg0_v7rwvvCuXk3'
      clientKey: 'ROtUeppG-G135854590-SNAP'
    });

    this.createPayment = this.createPayment.bind(this);
  }

  async check(req, res) {
    res.status(200).json({
        statusCode: 200,
        status: 'success',
        message: 'Server Midtrans is running smoothly.',
    });
  }

  // Get transaction details
  async getTransactionDetails(req, res) {
    try {
      const transactions = await transaksiService.getTransactionDetails();
      res.status(200).json({
        status: 'success',
        data: transactions
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // Create payment
//   async createPayment(req, res) {
//     try {
//       const { transactionId } = req.params;
//       console.log(transactionId)
//       const transaction = await transaksiService.getTransactionById(transactionId);
      
//       const parameter = {
//         transaction_details: {
//           order_id: `ORDER-${transactionId}-${Date.now()}`,
//           gross_amount: transaction.total_transaksi
//         },
//         customer_details: {
//           first_name: transaction.nama_pembeli,
//           email: transaction.email
//         },
//         item_details: [{
//           id: transaction.barang_id,
//           price: transaction.total_transaksi / transaction.total_barang,
//           quantity: transaction.total_barang,
//           name: transaction.nama_barang
//         }]
//       };

//       const transaction_token = await this.snap.createTransaction(parameter);
//       res.status(200).json({
//         status: 'success',
//         token: transaction_token
//       });
//     } catch (error) {
//       res.status(500).json({
//         status: 'error',
//         message: error.message
//       });
//     }
//   }

async createPayment(req, res) {
    try {
      const { transactionId } = req.params;
      console.log("Transaction ID:", transactionId);
  
      const transaction = await transaksiService.getTransactionById(transactionId);
  
      if (!transaction) {
        return res.status(404).json({
          status: 'error',
          message: 'Transaction not found'
        });
      }
  
      const shortTransactionId = transactionId.replace(/-/g, '').substring(0, 8);
      const timestamp = Date.now().toString().slice(-6); 
  
      const order_id = `ORD-${shortTransactionId}-${timestamp}`; 
  
      const parameter = {
        transaction_details: {
          order_id: order_id,
          gross_amount: transaction.total_transaksi
        },
        customer_details: {
          first_name: transaction.nama_pembeli,
          email: transaction.email
        },
        item_details: [{
          id: transaction.barang_id,
          price: transaction.total_transaksi / transaction.total_barang,
          quantity: transaction.total_barang,
          name: transaction.nama_barang
        }]
      };
  
      if (!this.snap) {
        throw new Error("Midtrans Snap client is not initialized.");
      }
  
      const transaction_token = await this.snap.createTransaction(parameter);
      res.status(200).json({
        status: 'success',
        token: transaction_token
      });
    } catch (error) {
      console.error("Payment Error:", error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
  
  // Handle Midtrans notification
  async handleNotification(req, res) {
    try {
      const statusResponse = await this.snap.transaction.notification(req.body);
      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      const transactionId = orderId.split('-')[1];
      let status;

      if (transactionStatus == 'capture') {
        if (fraudStatus == 'challenge') {
          status = 'challenge';
        } else if (fraudStatus == 'accept') {
          status = 'success';
        }
      } else if (transactionStatus == 'settlement') {
        status = 'success';
      } else if (transactionStatus == 'deny') {
        status = 'deny';
      } else if (transactionStatus == 'cancel' ||
                 transactionStatus == 'expire') {
        status = 'failure';
      } else if (transactionStatus == 'pending') {
        status = 'pending';
      }

      // Update transaction status
      await transaksiService.updateTransactionStatus(transactionId, status);

      // Send push notification
      await this.sendPushNotification(transactionId, status);

      res.status(200).json({ status: 'success' });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // Send push notification
  async sendPushNotification(transactionId, status) {
    const transaction = await transaksiService.getTransactionById(transactionId);
    const subscription = await transaksiService.getSubscription(transaction.pembeli_id);

    const notificationPayload = {
      notification: {
        title: 'Transaction Update',
        body: `Transaction status: ${status}`,
        icon: '/path/to/icon.png',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1
        },
        actions: [{
          action: 'explore',
          title: 'View Details'
        }]
      }
    };

    await webpush.sendNotification(
      subscription,
      JSON.stringify(notificationPayload)
    );
  }

  // Save push subscription
  async savePushSubscription(req, res) {
    try {
      const { subscription } = req.body;
      const { pembeli_id } = req.params;
      
      await transaksiService.saveSubscription(pembeli_id, subscription);
      
      res.status(200).json({
        status: 'success',
        message: 'Push subscription saved'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }



  //**Xendit */


}

module.exports = new transaksiController()