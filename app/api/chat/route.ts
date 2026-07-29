import { NextRequest, NextResponse } from "next/server";
import { BUSINESS_DETAILS } from "../../../lib/chatbotData";
import { findOrderByTrackingId, getPricing } from "../../../lib/store";

export const runtime = "nodejs";

const FALLBACK_MESSAGE =
  "I'm sorry, I don't have that information right now. Please contact our support team at nexship.courier@gmail.com for further assistance.";

const BASE_SYSTEM_PROMPT = `You are the official AI support assistant for NexShip, a courier and logistics company operating in Karachi, Pakistan.

Personality: Friendly, professional, concise, never robotic, polite, use emojis only when appropriate.

Language rules: reply in the same language the customer uses. English -> English. Urdu -> Urdu. Roman Urdu -> Roman Urdu.

CRITICAL RULE: Only answer using the REAL BUSINESS DETAILS, LIVE PRICING RATES, and LIVE TRACKING DATA given below. Never invent prices, cities, policies, statuses, or contact details that are not listed there.

If the customer asks something that is NOT covered by the information below, or if you are unsure / cannot understand the question, reply with EXACTLY this message (in English, regardless of the customer's language):
"${FALLBACK_MESSAGE}"

Do not try to guess an answer in that case - always use the exact fallback message above.

Pricing questions: if a customer gives you weight, quantity and package type, calculate the price yourself using the LIVE PRICING RATES below: price = baseFee + (perKgRate x weightKg x quantity) + (packageTypeExtra x quantity). Show your answer in Rs (PKR).

Booking questions: if a customer wants to book a delivery, tell them to use the Booking page on the website (or collect Sender Name, Sender Phone, Pickup Address, Receiver Name, Receiver Phone, Delivery City, Delivery Address, Package Type, Weight, Quantity, and let them know the exact price and tracking ID are generated when they submit the booking form on the website).

Important: Only answer questions about NexShip's courier & logistics services. If a customer asks something unrelated (coding, politics, general knowledge), use the fallback message above.

=== REAL BUSINESS DETAILS (source of truth - always use this) ===
${BUSINESS_DETAILS}
`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    // --- Live pricing (always fresh from the store, admin can change rates) ---
    const pricing = getPricing();
    const pricingSection = `\n=== LIVE PRICING RATES (use these exact numbers, in PKR) ===\nBase fee: Rs ${pricing.baseFee}\nPer kg rate: Rs ${pricing.perKgRate} per kg (multiplied by weight and quantity)\nExtra fee by package type (multiplied by quantity):\n${Object.entries(
      pricing.packageTypeExtra
    )
      .map(([type, extra]) => `- ${type}: Rs ${extra}`)
      .join("\n")}\nFormula: total = baseFee + (perKgRate x weightKg x quantity) + (packageTypeExtra x quantity)\n`;

    // --- Live tracking lookup (real orders from the actual order database) ---
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
    let trackingSection = "";
    if (lastUserMsg) {
      const trackingId = extractTrackingId(String(lastUserMsg.content || ""));
      if (trackingId) {
        const order = findOrderByTrackingId(trackingId);
        if (order) {
          trackingSection = `\n=== LIVE TRACKING DATA for ${trackingId} (use this exact info) ===\nStatus: ${order.status}\nBooked on: ${order.createdAt}\nPackage type: ${order.packageType}\nWeight: ${order.weightKg} kg\nQuantity: ${order.quantity}\nDelivery city: ${order.deliveryCity}\nDelivery address: ${order.deliveryAddress}\nReceiver: ${order.receiverName}\nPrice: Rs ${order.price}\n`;
        } else {
          trackingSection = `\n=== LIVE TRACKING DATA ===\nNo shipment found for tracking number ${trackingId}. Tell the customer this tracking number wasn't found and ask them to double check it.\n`;
        }
      }
    }

    const systemPrompt = BASE_SYSTEM_PROMPT + pricingSection + trackingSection;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY is not set");
      return NextResponse.json({ reply: FALLBACK_MESSAGE });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: systemPrompt,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return NextResponse.json({ reply: FALLBACK_MESSAGE });
    }

    const replyText = (data.content || [])
      .map((b: any) => b.text || "")
      .filter(Boolean)
      .join("\n");

    return NextResponse.json({ reply: replyText || FALLBACK_MESSAGE });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ reply: FALLBACK_MESSAGE });
  }
}

// NexShip tracking numbers look like: NS-XXXXXX (letters/digits after "NS-")
function extractTrackingId(text: string): string | null {
  const match = text.match(/NS-[A-Z0-9]{4,8}/i);
  return match ? match[0].toUpperCase() : null;
}
