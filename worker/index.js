export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(request.url);
    if (url.pathname !== "/api/chat" || request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: cors });
    }
    if (!env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Palvelimen API-avain puuttuu." }), { status: 503, headers: cors });
    }

    try {
      const body = await request.json();
      if (!Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > 30) {
        return new Response(JSON.stringify({ error: "Viestihistoria ei kelpaa." }), { status: 400, headers: cors });
      }
      const messages = body.messages
        .filter(m => ["user", "assistant"].includes(m.role) && typeof m.content === "string")
        .slice(-20)
        .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));

      const upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-6-astra",
          instructions: "Olet ystävällinen, hyödyllinen ja selkeä suomenkielinen tekoälyavustaja. Vastaa käyttäjän kielellä.",
          input: messages
        })
      });

      const data = await upstream.json();
      if (!upstream.ok) {
        return new Response(JSON.stringify({ error: data.error?.message || "Tekoälypalvelun kutsu epäonnistui." }), {
          status: upstream.status, headers: cors
        });
      }
      return new Response(JSON.stringify({ reply: data.output_text || "En saanut muodostettua vastausta." }), { headers: cors });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Palvelinvirhe. Yritä uudelleen." }), { status: 500, headers: cors });
    }
  }
};
