const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOrderConfirmation = async (order, userEmail, userName) => {
  try {
    const itemsList = order.items.map(item =>
      `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #333;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #333; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #333; text-align: right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
      </tr>`
    ).join('');

    await resend.emails.send({
      from: 'ShopSavyy <onboarding@resend.dev>',
      to: 'saisujan2707@gmail.com',
      subject: `Order Confirmed #${order._id.toString().slice(-8).toUpperCase()} – ShopSavyy`,
      html: `
        <div style="font-family: 'Times New Roman', serif; background: #0a0a0b; color: #f0ede8; padding: 40px; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #c9a96e; font-size: 28px; font-weight: 400; letter-spacing: 0.05em;">ShopSavyy</h1>
          </div>

          <div style="background: #111113; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 28px; margin-bottom: 24px;">
            <h2 style="color: #c9a96e; font-size: 20px; font-weight: 400; margin-bottom: 8px;">Order Confirmed ✓</h2>
            <p style="color: #9a9898; margin-bottom: 4px;">Hi ${userName},</p>
            <p style="color: #9a9898;">Your order has been placed successfully.</p>
          </div>

          <div style="background: #111113; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 28px; margin-bottom: 24px;">
            <h3 style="color: #f0ede8; font-size: 16px; margin-bottom: 16px;">Order Details</h3>
            <p style="color: #9a9898; margin-bottom: 4px;">Order ID: <span style="color: #f0ede8; font-family: monospace;">#${order._id.toString().slice(-8).toUpperCase()}</span></p>
            <p style="color: #9a9898; margin-bottom: 4px;">Payment: <span style="color: #f0ede8;">${order.paymentMethod}</span></p>
            <p style="color: #9a9898;">Date: <span style="color: #f0ede8;">${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
          </div>

          <div style="background: #111113; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 28px; margin-bottom: 24px;">
            <h3 style="color: #f0ede8; font-size: 16px; margin-bottom: 16px;">Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                  <th style="padding: 8px 10px; text-align: left; color: #9a9898; font-size: 12px; font-weight: 500; text-transform: uppercase;">Product</th>
                  <th style="padding: 8px 10px; text-align: center; color: #9a9898; font-size: 12px; font-weight: 500; text-transform: uppercase;">Qty</th>
                  <th style="padding: 8px 10px; text-align: right; color: #9a9898; font-size: 12px; font-weight: 500; text-transform: uppercase;">Price</th>
                </tr>
              </thead>
              <tbody>${itemsList}</tbody>
            </table>
            <div style="border-top: 1px solid rgba(255,255,255,0.1); margin-top: 16px; padding-top: 16px; text-align: right;">
              <p style="color: #9a9898; margin-bottom: 4px;">Shipping: <span style="color: ${order.shippingPrice === 0 ? '#5cb87a' : '#f0ede8'};">${order.shippingPrice === 0 ? 'FREE' : '₹' + order.shippingPrice}</span></p>
              <p style="color: #f0ede8; font-size: 18px; font-weight: 600;">Total: ₹${order.totalPrice.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div style="background: #111113; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 28px; margin-bottom: 24px;">
            <h3 style="color: #f0ede8; font-size: 16px; margin-bottom: 16px;">Shipping Address</h3>
            <p style="color: #9a9898; line-height: 1.8;">
              ${order.shippingAddress.fullName}<br/>
              ${order.shippingAddress.address}<br/>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br/>
              Phone: ${order.shippingAddress.phone}
            </p>
          </div>

          <div style="text-align: center; color: #555; font-size: 12px; margin-top: 32px;">
            <p>Thank you for shopping with ShopSavyy</p>
            <p style="margin-top: 8px;"><a href="https://shopsavyy.vercel.app" style="color: #c9a96e;">shopsavyy.vercel.app</a></p>
          </div>
        </div>
      `,
    });
    console.log('Order confirmation email sent to:', userEmail);
  } catch (err) {
    console.error('Email error:', err);
  }
};

const sendOrderStatusUpdate = async (order, userEmail, userName, newStatus) => {
  try {
    const statusMessages = {
      processing: {
        subject: 'Your Order is Being Processed 🔄',
        heading: 'Order Being Processed',
        message: 'Great news! Your order is now being processed and will be shipped soon.',
        color: '#e8c95a',
      },
      shipped: {
        subject: 'Your Order Has Been Shipped 🚚',
        heading: 'Order Shipped',
        message: 'Your order is on its way! You will receive it soon.',
        color: '#5ab8e8',
      },
      delivered: {
        subject: 'Your Order Has Been Delivered ✅',
        heading: 'Order Delivered',
        message: 'Your order has been delivered successfully. We hope you love your purchase!',
        color: '#5cb87a',
      },
      cancelled: {
        subject: 'Your Order Has Been Cancelled ❌',
        heading: 'Order Cancelled',
        message: 'Your order has been cancelled. If you have any questions please contact us.',
        color: '#e05c5c',
      },
    };

    const statusInfo = statusMessages[newStatus];
    if (!statusInfo) return;

    await resend.emails.send({
      from: 'ShopSavyy <onboarding@resend.dev>',
      to: userEmail,
      subject: `${statusInfo.subject} – Order #${order._id.toString().slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family: 'Times New Roman', serif; background: #0a0a0b; color: #f0ede8; padding: 40px; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #c9a96e; font-size: 28px; font-weight: 400; letter-spacing: 0.05em;">ShopSavyy</h1>
          </div>

          <div style="background: #111113; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 28px; margin-bottom: 24px;">
            <h2 style="color: ${statusInfo.color}; font-size: 20px; font-weight: 400; margin-bottom: 8px;">${statusInfo.heading}</h2>
            <p style="color: #9a9898; margin-bottom: 4px;">Hi ${userName},</p>
            <p style="color: #9a9898;">${statusInfo.message}</p>
          </div>

          <div style="background: #111113; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 28px; margin-bottom: 24px;">
            <h3 style="color: #f0ede8; font-size: 16px; margin-bottom: 16px;">Order Summary</h3>
            <p style="color: #9a9898; margin-bottom: 4px;">Order ID: <span style="color: #f0ede8; font-family: monospace;">#${order._id.toString().slice(-8).toUpperCase()}</span></p>
            <p style="color: #9a9898; margin-bottom: 4px;">Status: <span style="color: ${statusInfo.color}; text-transform: capitalize; font-weight: 500;">${newStatus}</span></p>
            <p style="color: #9a9898;">Total: <span style="color: #f0ede8; font-weight: 600;">₹${order.totalPrice.toLocaleString('en-IN')}</span></p>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://shopsavyy.vercel.app/orders" style="display: inline-block; background: #c9a96e; color: #0a0a0b; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 500;">View Order</a>
          </div>

          <div style="text-align: center; color: #555; font-size: 12px; margin-top: 32px;">
            <p>Thank you for shopping with ShopSavyy</p>
            <p style="margin-top: 8px;"><a href="https://shopsavyy.vercel.app" style="color: #c9a96e;">shopsavyy.vercel.app</a></p>
          </div>
        </div>
      `,
    });
    console.log(`Order ${newStatus} email sent to:`, userEmail);
  } catch (err) {
    console.error('Email error:', err);
  }
};

module.exports = { sendOrderConfirmation, sendOrderStatusUpdate };