import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const statusLabels: Record<string, string> = {
  pending: "Order Placed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusMessages: Record<string, string> = {
  pending:
    "Your order has been placed successfully. We'll notify you when it's being processed.",
  processing:
    "Great news! Your order is now being processed and will be shipped soon.",
  shipped:
    "Your order has been shipped! It's on its way to you.",
  delivered:
    "Your order has been delivered. We hope you enjoy your purchase!",
  cancelled:
    "Your order has been cancelled. If you have questions, please contact support.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { orderId, newStatus } = await req.json();

    if (!orderId || !newStatus) {
      throw new Error("Missing orderId or newStatus");
    }

    // Fetch order details
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, customer_name, customer_email, total, status, payment_method")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderError?.message}`);
    }

    // Fetch order items
    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, quantity, unit_price")
      .eq("order_id", orderId);

    const statusLabel = statusLabels[newStatus] || newStatus;
    const statusMessage = statusMessages[newStatus] || `Your order status has been updated to: ${newStatus}`;

    const itemsHtml = (items || [])
      .map(
        (item) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.product_name}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">×${item.quantity}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">₨${(item.unit_price * item.quantity).toLocaleString()}</td>
          </tr>`
      )
      .join("");

    const emailHtml = `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;padding:0;">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:24px;">PCForge</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Order Update</p>
        </div>
        
        <div style="padding:32px;">
          <p style="color:#333;font-size:16px;margin:0 0 8px;">Hi ${order.customer_name},</p>
          <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px;">${statusMessage}</p>
          
          <div style="background:#f8f9fa;border-radius:8px;padding:16px;margin-bottom:24px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="color:#888;font-size:13px;">Order ID</span>
              <span style="color:#333;font-size:13px;font-family:monospace;">#${order.id.slice(0, 8)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="color:#888;font-size:13px;">Status</span>
              <span style="color:#6366f1;font-size:13px;font-weight:600;">${statusLabel}</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="color:#888;font-size:13px;">Payment</span>
              <span style="color:#333;font-size:13px;">${order.payment_method === "cod" ? "Cash on Delivery" : "Online"}</span>
            </div>
          </div>

          ${
            items && items.length > 0
              ? `<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
                  <thead>
                    <tr style="background:#f8f9fa;">
                      <th style="padding:8px 12px;text-align:left;font-size:12px;color:#888;text-transform:uppercase;">Item</th>
                      <th style="padding:8px 12px;text-align:center;font-size:12px;color:#888;text-transform:uppercase;">Qty</th>
                      <th style="padding:8px 12px;text-align:right;font-size:12px;color:#888;text-transform:uppercase;">Price</th>
                    </tr>
                  </thead>
                  <tbody>${itemsHtml}</tbody>
                </table>`
              : ""
          }
          
          <div style="border-top:2px solid #eee;padding-top:12px;text-align:right;">
            <span style="color:#888;font-size:14px;">Total: </span>
            <span style="color:#6366f1;font-size:18px;font-weight:700;">₨${order.total.toLocaleString()}</span>
          </div>
        </div>
        
        <div style="background:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#888;font-size:12px;margin:0;">PCForge — Your Trusted PC Parts Store</p>
        </div>
      </div>
    `;

    // Send email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PCForge <onboarding@resend.dev>",
        to: [order.customer_email],
        subject: `Order ${statusLabel} — #${order.id.slice(0, 8)}`,
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      throw new Error(
        `Resend API error [${resendResponse.status}]: ${JSON.stringify(resendData)}`
      );
    }

    return new Response(
      JSON.stringify({ success: true, emailId: resendData.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error sending order email:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
