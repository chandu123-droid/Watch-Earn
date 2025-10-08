import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function sendPayout(userUpi, userShare, adminShare) {
  if (!userUpi || !userShare) throw new Error("UPI ID or amount missing");

  // Razorpay Payout requires UPI VPA as beneficiary
  const payoutData = {
    account_number: userUpi, // for UPI, use virtual account ID or VPA as per Razorpay docs
    amount: Math.round(userShare * 100), // in paise
    currency: "INR",
    mode: "UPI",
    purpose: "payout",
    fund_account: {
      account_type: "vpa",
      vpa: { address: userUpi },
    },
    narration: "Watch & Earn Payout",
    queue_if_low_balance: true,
  };

  try {
    const response = await razorpay.payouts.create(payoutData);
    console.log("Razorpay Payout Response:", response);
    return response;
  } catch (err) {
    console.error("Razorpay Payout Error:", err);
    throw new Error("Razorpay payout failed");
  }
}
