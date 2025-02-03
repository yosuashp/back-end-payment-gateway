const express = require("express")
const controller = require("../app/controllers")
const middleware = require("../app/middleware/mainMiddleware")
const apiRouter = express.Router();

//** Test Connection */
apiRouter.get('/api/v1/test',controller.api.v1.transaksiController.check)
apiRouter.get('/api/v1/transactions', middleware.authorize, controller.api.v1.transaksiController.getTransactionDetails)
apiRouter.post('/api/v1/payment/:transactionId', middleware.authorize, controller.api.v1.transaksiController.createPayment)
//** Not Found Route*/
apiRouter.use(controller.api.main.onLost);
apiRouter.use(controller.api.main.onError);

module.exports = apiRouter;