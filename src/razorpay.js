import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function createRazorpayOrder(amount) {
  if (!amount || amount < 2) throw new Error("Minimum ₹2 required");

  const options = {
    amount: amount * 100, // Convert INR to paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    console.log("Razorpay order created:", order);
    return order;
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    throw new Error("Failed to create Razorpay order");
  }
}
