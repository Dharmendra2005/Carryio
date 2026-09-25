const crypto = require("crypto");
const razorpay = require("../../config/razorpay");
const env = require("../../config/env");
const prisma = require("../../config/prisma");
const shipmentService = require("../shipment/shipment.service");

class PaymentService {
  async createRazorpayOrder(amount, orderId, userId) {
    const amountInPaise = Math.round(Number(amount) * 100);
    const receipt = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    const paymentRecord = await prisma.payment.create({
      data: {
        userId,
        orderId: orderId || null,
        razorpayOrderId: razorpayOrder.id,
        amount: Number(amount),
        currency: "INR",
        status: "created",
      },
    });

    return {
      razorpayOrder,
      paymentRecord: { ...paymentRecord, _id: paymentRecord.id },
    };
  }

  verifyClientSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    return expectedSignature === razorpaySignature;
  }

  async verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId) {
    const isValid = this.verifyClientSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      await prisma.payment.updateMany({
        where: { razorpayOrderId },
        data: { status: "failed" },
      });
      const err = new Error("Invalid Razorpay payment signature");
      err.statusCode = 400;
      throw err;
    }

    const existingPayment = await prisma.payment.findFirst({
      where: { razorpayOrderId },
    });

    let payment = existingPayment;
    if (existingPayment) {
      payment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          razorpayPaymentId,
          razorpaySignature,
          status: "verified",
          orderId: orderId || existingPayment.orderId,
        },
      });
    }

    const targetOrderId = orderId || payment?.orderId;
    if (targetOrderId) {
      await prisma.order.update({
        where: { id: targetOrderId },
        data: { status: "paid" },
      });
      const targetOrder = await prisma.order.findUnique({
        where: { id: targetOrderId },
      });
      if (targetOrder) {
        await shipmentService.createShipment(targetOrderId, targetOrder.userId);
      }
    }

    return { isValid: true, payment: payment ? { ...payment, _id: payment.id } : null };
  }

  verifyWebhookSignature(rawBody, signatureHeader) {
    if (!signatureHeader || !rawBody) return false;
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    return expectedSignature === signatureHeader;
  }

  async processWebhook(rawBody, signatureHeader, eventBody) {
    const isVerified = this.verifyWebhookSignature(rawBody, signatureHeader);
    if (!isVerified) {
      const err = new Error("Webhook signature verification failed");
      err.statusCode = 400;
      throw err;
    }

    const eventId = eventBody.event_id || eventBody.payload?.payment?.entity?.id;
    const eventType = eventBody.event;

    // Idempotency check via processedWebhooks table
    const existingWebhook = await prisma.processedWebhook.findFirst({
      where: { eventId },
    });
    if (existingWebhook) {
      return { status: "ignored", message: "Event already processed" };
    }

    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = eventBody.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      let payment = await prisma.payment.findFirst({
        where: { razorpayOrderId },
      });

      if (!payment) {
        payment = await prisma.payment.create({
          data: {
            userId: paymentEntity.notes?.userId || null,
            razorpayOrderId,
            amount: paymentEntity.amount / 100,
            currency: paymentEntity.currency || "INR",
            status: "captured",
            razorpayPaymentId,
          },
        });
      } else {
        payment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            razorpayPaymentId,
            status: "captured",
          },
        });
      }

      await prisma.processedWebhook.create({
        data: {
          paymentId: payment.id,
          eventId,
          eventType,
        },
      });

      if (payment.orderId) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: "paid" },
        });
        await shipmentService.createShipment(payment.orderId, payment.userId);
      }
    } else if (eventType === "payment.failed") {
      const paymentEntity = eventBody.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;

      const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId },
      });
      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "failed" },
        });
        await prisma.processedWebhook.create({
          data: {
            paymentId: payment.id,
            eventId,
            eventType,
          },
        });
      }
    }

    return { status: "success", eventType };
  }
}

module.exports = new PaymentService();
