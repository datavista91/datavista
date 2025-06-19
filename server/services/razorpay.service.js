const razorpay = require('../config/razorpay.config');
const logger = require('../utils/logger');

const payments = {};
const orders = {};
const paymentMetadata = {};
const orderMetadata = {};

const createOrder = async (amount, currency = 'USD') => {
  const options = {
    amount, // already in smallest unit (paise or cents)
    currency: currency.toUpperCase(),
    receipt: `receipt_${Date.now()}`,
    payment_capture: 1
  };

  try {
    logger.debug(`Creating Razorpay order for amount: ${amount / 100} ${currency}`);
    const order = await razorpay.orders.create(options);
    logger.info(`Order created successfully: ${order.id}`);
    return order;
  } catch (error) {
    logger.error('Error creating Razorpay order:', error);
    throw new Error(`Failed to create order: ${error.error?.description || error.message}`);
  }
};

const verifyPayment = async (paymentId, orderId, signature) => {
  try {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(orderId + "|" + paymentId);
    const generatedSignature = hmac.digest('hex');

    const isValid = generatedSignature === signature;

    if (isValid) {
      payments[paymentId] = {
        orderId,
        paymentId,
        signature,
        status: 'verified',
        timestamp: new Date()
      };
      logger.info(`Payment verified: ${paymentId}`);
    } else {
      logger.warn(`Invalid signature for payment: ${paymentId}`);
    }

    return isValid;
  } catch (error) {
    logger.error('Error verifying payment:', error);
    throw new Error(`Payment verification failed: ${error.message}`);
  }
};

const addOrderMetadata = (orderId, metadata) => {
  orderMetadata[orderId] = metadata;
};

const addPaymentMetadata = (paymentId, metadata) => {
  paymentMetadata[paymentId] = metadata;
};

const getOrderDetails = (orderId) => {
  return {
    ...(orders[orderId] || {}),
    metadata: orderMetadata[orderId] || null
  };
};

const getPaymentDetails = (paymentId) => {
  return {
    ...(payments[paymentId] || {}),
    metadata: paymentMetadata[paymentId] || null
  };
};

module.exports = {
  createOrder,
  verifyPayment,
  addOrderMetadata,
  addPaymentMetadata,
  getOrderDetails,
  getPaymentDetails
};
