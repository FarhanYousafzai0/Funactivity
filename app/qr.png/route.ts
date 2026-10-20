import QRCode from "qrcode";
import { siteUrl } from "@/lib/site-url";

// /qr.png — the join QR code as a 1024px PNG, for WhatsApp, posters or slides.
export async function GET() {
  const url = await siteUrl();
  const png = await QRCode.toBuffer(url, { type: "png", width: 1024, margin: 2, errorCorrectionLevel: "M", color: { dark: "#06110d", light: "#ffffff" } });
  return new Response(new Uint8Array(png), {
    headers: {
      "content-type": "image/png",
      "content-disposition": 'inline; filename="pitch-arena-qr.png"',
      "cache-control": "public, max-age=3600",
    },
  });
}
