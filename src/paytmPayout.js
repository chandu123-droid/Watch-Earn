import https from "https";
import PaytmChecksum from "paytmchecksum";

// Paytm Config
const PAYTM_MID = process.env.PAYTM_MID; // Merchant ID
const PAYTM_MERCHANT_KEY = process.env.PAYTM_MERCHANT_KEY; 
const PAYTM_ENV = process.env.PAYTM_ENV || "staging"; // "staging" or "production"

// Paytm Payout API URL
const PAYTM_PAYOUT_URL =
  PAYTM_ENV === "production"
    ? "https://secure.paytm.in/theia/api/v1/disburse/order"
    : "https://staging-dashboard.paytm.com/bpay/api/v1/disburse/order";

/**
 * Send payout to user via Paytm
 * @param {string} userUpi - User's UPI ID
 * @param {number} userShare - Amount for user (INR)
 * @param {number} adminShare - Amount for admin (INR)
 */
export async function sendPayout(userUpi, userShare, adminShare) {
  if (!userUpi || !userShare) throw new Error("UPI ID or amount missing");

  const requestBody = {
    requestType: "PAYOUT",
    mid: PAYTM_MID,
    orderId: `ORD${Date.now()}`,
    amount: userShare.toFixed(2),
    beneficiaryAccount: userUpi,
    channel: "UPI",
    purpose: "PAYOUT",
    remarks: "Watch & Earn Payout",
  };

  // Generate checksum
  const checksum = await PaytmChecksum.generateSignature(
    JSON.stringify(requestBody),
    PAYTM_MERCHANT_KEY
  );

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-mid": PAYTM_MID,
      "x-checksum": checksum,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(PAYTM_PAYOUT_URL, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const result = JSON.parse(data);
          console.log("Paytm Payout Response:", result);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", (err) => {
      console.error("Paytm Payout Error:", err);
      reject(err);
    });

    req.write(JSON.stringify(requestBody));
    req.end();
  });
}
