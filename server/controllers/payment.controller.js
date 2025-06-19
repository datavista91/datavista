const paymentService = require('../services/razorpay.service');
const logger = require('../utils/logger');

exports.createOrder = async (req, res) => {
  try {
    const { amount, planName, billingPeriod } = req.body;
    const currency = (req.body.currency || 'USD').trim().toUpperCase();

    const VALID_CURRENCIES = ['USD', 'INR'];
    if (!VALID_CURRENCIES.includes(currency)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid currency',
        code: 'INVALID_CURRENCY'
      });
    }

    const amountInt = Math.round(Number(amount));
    if (!amountInt || isNaN(amountInt)) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required',
        code: 'INVALID_AMOUNT'
      });
    }

    if (!['monthly', 'annual'].includes(billingPeriod)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid billing period',
        code: 'INVALID_BILLING_PERIOD'
      });
    }

    logger.info(`Creating order for ${planName} plan (${billingPeriod}) - Amount: ${amountInt / 100} ${currency}`);

    const order = await paymentService.createOrder(amountInt, currency);

    paymentService.addOrderMetadata(order.id, {
      planName,
      billingPeriod,
      amount: amountInt,
      currency,
      createdAt: new Date()
    });

    res.json({
      success: true,
      order,
      planName,
      billingPeriod,
      currency,
      message: 'Order created successfully'
    });

  } catch (error) {
    logger.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
      code: 'ORDER_CREATION_FAILED',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { order_id, payment_id, razorpay_signature, planName, billingPeriod } = req.body;

    const missingFields = []; 
    if (!order_id) missingFields.push('order_id');
    if (!payment_id) missingFields.push('payment_id');
    if (!razorpay_signature) missingFields.push('razorpay_signature');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        code: 'MISSING_FIELDS'
      });
    }

    logger.info(`Verifying payment for order: ${order_id}`);

    const isValid = await paymentService.verifyPayment(payment_id, order_id, razorpay_signature);

    if (isValid) {
      paymentService.addPaymentMetadata(payment_id, {
        orderId: order_id,
        planName,
        billingPeriod,
        status: 'verified',
        verifiedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: payment_id,
        orderId: order_id,
        planName,
        billingPeriod
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment verification failed',
        code: 'PAYMENT_VERIFICATION_FAILED'
      });
    }
  } catch (error) {
    logger.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed',
      code: 'VERIFICATION_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = paymentService.getPaymentDetails(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
        code: 'PAYMENT_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    logger.error('Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment status',
      code: 'FETCH_PAYMENT_ERROR'
    });
  }
};
