exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: JSON.stringify({ message: "Successful preflight" }),
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const data = JSON.parse(event.body || "{}");
    const customerName = (data.customerName || "Valued Customer").trim();
    const contactMethod = data.contactMethod || "Not specified";
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!discordWebhookUrl) {
      console.error("Missing configuration error: DISCORD_WEBHOOK_URL is not set.");
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Backend configuration error." }),
      };
    }

    const noteContent = data.comments || "None provided";

    const embedPayload = {
      username: "Cottage Quote Bot",
      embeds: [
        {
          title: "🏡 New Cottage Quote Request Received!",
          color: 3066993,
          timestamp: new Date().toISOString(),
          fields: [
            { name: "👤 Customer Name", value: customerName, inline: true },
            { name: "🏢 Company", value: data.companyName || "N/A", inline: true },
            { name: "📬 Email Address", value: data.email || "N/A", inline: false },
            { name: "📞 Phone", value: data.phone || "N/A", inline: true },
            { name: "💬 WhatsApp", value: data.whatsapp || "N/A", inline: true },
            { name: "🌍 Country Location", value: data.country || "N/A", inline: true },
            { name: "🔔 Preferred Contact Via", value: contactMethod, inline: true }
          ],
          description: `**📋 Summary & Selections:**\n\`\`\`text\n${noteContent}\`\`\``
        }
      ]
    };

    const discordResponse = await fetch(discordWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(embedPayload),
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      throw new Error(`Discord channel API returned code status: ${discordResponse.status} - ${errorText}`);
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Quote request pushed to Discord successfully!" }),
    };

  } catch (error) {
    console.error("Discord Hook Integration Error:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Failed to dispatch channel alert notification.", details: error.message }),
    };
  }
};
