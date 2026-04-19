const { GoogleGenerativeAI } = require('@google/generative-ai');
const Property = require('../model/Property.model.js');

const MODEL_ID = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY missing in environment');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const safeJSONParse = (text) => {
  if (!text) return null;
  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to extract JSON object from surrounding text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
};

const FILTER_PROMPT = `You are a property search assistant. Extract structured filters from a user's request about finding a property.
Return ONLY valid JSON with this shape (omit fields the user did not specify):
{
  "location": "string - city / area / neighborhood name",
  "listingType": "sale" | "rent",
  "minPrice": number,
  "maxPrice": number,
  "keywords": ["string", "..."]
}
Rules:
- Normalize "buy/buying/purchase" → listingType "sale".
- Normalize "rent/renting/lease" → listingType "rent".
- Amounts like "50 lakh" = 5000000, "2 crore" = 20000000, "15k" = 15000.
- If no filter can be extracted, return {}.
- NEVER wrap the JSON in code fences.
User message:`;

const extractFilters = async (message) => {
  const client = getClient();
  const model = client.getGenerativeModel({ model: MODEL_ID });
  const result = await model.generateContent(`${FILTER_PROMPT}\n"${message}"`);
  const text = result.response.text();
  return safeJSONParse(text) || {};
};

const findProperties = async (filters) => {
  const query = { verified: true };
  if (filters.listingType === 'sale' || filters.listingType === 'rent') {
    query.listingType = filters.listingType;
  }
  if (filters.location) {
    query.location = { $regex: filters.location, $options: 'i' };
  }
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
    if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
  }

  let results = await Property.find(query)
    .populate('seller', 'name email')
    .limit(5)
    .lean();

  // Keyword fallback: if we found nothing with strict filters, try loose keyword match
  if (results.length === 0 && filters.keywords && filters.keywords.length > 0) {
    const regex = filters.keywords.map((k) => ({
      $or: [
        { title: { $regex: k, $options: 'i' } },
        { description: { $regex: k, $options: 'i' } },
        { location: { $regex: k, $options: 'i' } },
      ],
    }));
    results = await Property.find({ verified: true, $and: regex })
      .populate('seller', 'name email')
      .limit(5)
      .lean();
  }

  // Last-resort fallback: if still nothing, return any 5 verified listings (so chat isn't empty)
  if (results.length === 0) {
    results = await Property.find({ verified: true })
      .populate('seller', 'name email')
      .limit(5)
      .lean();
  }

  return results;
};

const formatPrice = (p) => {
  const n = Number(p.price || 0).toLocaleString('en-IN');
  return p.listingType === 'rent' ? `₹${n}/${p.rentPeriod || 'monthly'}` : `₹${n}`;
};

const REPLY_PROMPT = `You are RentUp's friendly AI property advisor. A user has asked a question and you found matching properties from the database.
Write a short, helpful reply (2-3 sentences) introducing the results. Mention how many matches, the location/type summary if relevant. Do NOT repeat each property in the text — those are shown as cards. No markdown.
Then, return a JSON block with pros/cons for each property.

Output format (strict):
<reply>
your natural-language intro here (plain text, no markdown)
</reply>
<json>
[
  {"id": "propertyId", "pros": ["...", "..."], "cons": ["...", "..."]},
  ...
]
</json>

Keep pros/cons concise (max 8 words each), 2 each per property.`;

const parseTaggedResponse = (text) => {
  const replyMatch = text.match(/<reply>([\s\S]*?)<\/reply>/i);
  const jsonMatch = text.match(/<json>([\s\S]*?)<\/json>/i);

  let reply;
  if (replyMatch) {
    reply = replyMatch[1].trim();
  } else if (jsonMatch) {
    // Reply tag missing but json present — strip json block and any fences/arrays
    reply = text
      .replace(/<json>[\s\S]*?<\/json>/gi, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\[[\s\S]*\]/, '')
      .trim();
  } else {
    reply = text.trim();
  }

  let meta = [];
  if (jsonMatch) {
    const parsed = safeJSONParse(jsonMatch[1]);
    if (Array.isArray(parsed)) meta = parsed;
  } else {
    // Try fenced / bare JSON array in text
    const arrMatch = text.match(/\[[\s\S]*\]/);
    if (arrMatch) {
      const parsed = safeJSONParse(arrMatch[0]);
      if (Array.isArray(parsed)) meta = parsed;
    }
  }
  return { reply, meta };
};

const generateReply = async (userMessage, properties) => {
  if (!properties.length) {
    return {
      reply: "I couldn't find any matching properties. Try broadening your search — a different city or wider price range?",
      meta: [],
    };
  }

  const client = getClient();
  const model = client.getGenerativeModel({ model: MODEL_ID });

  const propertyList = properties
    .map(
      (p, i) =>
        `${i + 1}. id=${p._id} | ${p.title} | ${p.listingType.toUpperCase()} | ${formatPrice(p)} | ${p.location} | ${p.description}`
    )
    .join('\n');

  const prompt = `${REPLY_PROMPT}

User question: "${userMessage}"

Matching properties:
${propertyList}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseTaggedResponse(text);
};

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        message: 'Chatbot is not configured. Set GEMINI_API_KEY in backend .env',
      });
    }

    const filters = await extractFilters(message);
    const properties = await findProperties(filters);
    const { reply, meta } = await generateReply(message, properties);

    const matches = properties.map((p) => {
      const extra = meta.find((m) => String(m.id) === String(p._id)) || {};
      return {
        _id: p._id,
        title: p.title,
        location: p.location,
        price: p.price,
        listingType: p.listingType,
        rentPeriod: p.rentPeriod,
        image: (p.images && p.images[0]) || p.image || null,
        pros: Array.isArray(extra.pros) ? extra.pros : [],
        cons: Array.isArray(extra.cons) ? extra.cons : [],
      };
    });

    res.json({ reply, matches, filters });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      message: 'Chat failed',
      error: error.message || String(error),
    });
  }
};
