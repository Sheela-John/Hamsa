/**
 * Misc. utils
 */
'use strict'
var uuid = require('uuid');

function uid() {
    return uuid.v1().replace(/\-/g, '');
}

function calculateBill(planData, settingsData) {
    var subscriptionCharge = Number(planData.fees);
    if (subscriptionCharge == 0) {
        return {
            transactionFees: 0,
            totalAmount: 0,
            taxAmount: 0
        }
    }

    var tax = Number(((subscriptionCharge * settingsData.nzTaxPercentage) / 100).toFixed(2));

    var withTaxAmount = subscriptionCharge + tax;

    var transactionFees = (Number(((withTaxAmount * settingsData.transactionFees) / 100).toFixed(2)) + Number(settingsData.flatFee)).toFixed(2);

    var totalTransactionFees = (Number(((settingsData.transactionFees * transactionFees) / 100).toFixed(2)) + Number(transactionFees)).toFixed(2);

    var Total = (withTaxAmount + Number(totalTransactionFees)).toFixed(2);

    var billdata = {
        transactionFees: Number(totalTransactionFees),
        totalAmount: Number(Total),
        taxAmount: Number(tax)
    }
    return billdata;
}

module.exports = {
    uid: uid,
    calculateBill: calculateBill
}
