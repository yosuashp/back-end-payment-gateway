const transaksiRepositories = require('../repositories/transaksiRepositories')

class transaksiServices { 
    async getTransactionDetails() {
        try {
            const transactions = await transaksiRepositories.getTransactionDetails();
            return transactions;
        } catch (error) {
            console.error('Error in getTransactionDetails Service:', error);
            throw new Error('Failed to retrieve data');
        }
    }

    async getTransactionById(transactionId){
        try {
            const transactions = await transaksiRepositories.getTransactionById(transactionId);
            return transactions;
        } catch (error) {
            console.error('Error in getTransactionById Service:', error);
            throw new Error('Failed to retrieve data');
        }
    }

    async updateTransactionStatus(transactionId, status){
        try {
            const transactions = await transaksiRepositories.updateTransactionStatus(transactionId, status);
            return transactions;
        } catch (error) {
            console.error('Error in updateTransactionStatus Service:', error);
            throw new Error('Failed to retrieve data');
        }
    }

    async getSubscription(pembeli_id){
        try {
            const transactions = await transaksiRepositories.getSubscription(pembeli_id);
            return transactions;
        } catch (error) {
            console.error('Error in getTransactionDetails Service:', error);
            throw new Error('Failed to retrieve data');
        }
    }

    async saveSubscription (pembeli_id, subscription){
        try {
            const transactions = await transaksiRepositories.saveSubscription(pembeli_id, subscription);
            return transactions;
        } catch (error) {
            console.error('Error in getTransactionDetails Service:', error);
            throw new Error('Failed to retrieve data');
        }
    }

}

module.exports = new transaksiServices()