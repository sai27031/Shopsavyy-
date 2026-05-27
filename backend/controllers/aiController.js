const Groq = require('groq-sdk');
const Product = require('../models/Product');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const chat = async (req, res) => {
  try {
    const { message, productId, conversationHistory = [] } = req.body;

    let productContext = '';
    if (productId) {
      const product = await Product.findById(productId).select(
        'name price originalPrice priceHistory description category brand rating numReviews stock'
      );
      if (product) {
        const lowestPrice = product.priceHistory.length
          ? Math.min(...product.priceHistory.map(p => p.price))
          : product.price;
        const highestPrice = product.priceHistory.length
          ? Math.max(...product.priceHistory.map(p => p.price))
          : product.price;

        productContext = `
CURRENT PRODUCT CONTEXT:
- Name: ${product.name}
- Brand: ${product.brand || 'N/A'}
- Category: ${product.category}
- Current Price: ₹${product.price}
- Original Price: ₹${product.originalPrice || product.price}
- Discount: ${product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0}%
- Rating: ${product.rating.toFixed(1)}/5 (${product.numReviews} reviews)
- Stock: ${product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
- Description: ${product.description}
- Price History (last ${product.priceHistory.length} records):
${product.priceHistory.slice(-10).map(p => `  • ₹${p.price} on ${new Date(p.date).toLocaleDateString('en-IN')}`).join('\n')}
- All-time lowest: ₹${lowestPrice}
- All-time highest: ₹${highestPrice}
        `.trim();
      }
    }

    const systemPrompt = `You are ShopSavyy AI, a smart shopping assistant for ShopSavyy — a modern e-commerce store selling clothes and electronics.

Your personality: Knowledgeable, concise, helpful. You speak like a trusted personal shopper, not a chatbot.

Your capabilities:
- Answer questions about product prices and price history
- Tell users if current price is a good deal based on price trends
- Compare products and give recommendations
- Help with size, color, and compatibility questions
- Guide users through the shopping experience

${productContext ? `\n${productContext}\n` : ''}

Always respond in a helpful, conversational tone. Keep answers brief and to the point. Use Indian Rupee (₹) for prices. If asked about price history, provide specific data from the context above. If you don't have specific data, say so honestly.`;

    const messages = [
      ...conversationHistory.slice(-10),
      { role: 'user', content: message },
    ];

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    });

    res.json({
      reply: response.choices[0].message.content,
    });
  } catch (err) {
    console.error('Groq AI Error:', err);
    res.status(500).json({ message: 'AI service unavailable', error: err.message });
  }
};

const getProductInsights = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('name price priceHistory rating numReviews');
    if (!product)
      return res.status(404).json({ message: 'Product not found' });

    const prices = product.priceHistory.map(p => p.price);
    const lowest  = prices.length ? Math.min(...prices) : product.price;
    const highest = prices.length ? Math.max(...prices) : product.price;
    const avg     = prices.length
      ? prices.reduce((a, b) => a + b, 0) / prices.length
      : product.price;
    const trend   = prices.length > 1
      ? (prices[prices.length - 1] > prices[prices.length - 2] ? 'up' : 'down')
      : 'stable';

    res.json({
      currentPrice:  product.price,
      lowestEver:    lowest,
      highestEver:   highest,
      averagePrice:  Math.round(avg),
      priceTrend:    trend,
      isBestPrice:   product.price <= lowest,
      discount:      highest > 0 ? Math.round((1 - product.price / highest) * 100) : 0,
      priceHistory:  product.priceHistory,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getRecommendations = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('name category brand tags price');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const filter = {
      _id: { $ne: product._id },
      category: product.category,
    };

    let recommended = await Product.find(filter)
      .limit(8)
      .select('name price originalPrice image category brand rating numReviews stock');

    if (recommended.length < 4) {
      const more = await Product.find({ _id: { $ne: product._id } })
        .limit(8)
        .select('name price originalPrice image category brand rating numReviews stock');
      recommended = [...recommended, ...more].slice(0, 8);
    }

    recommended = recommended.sort(() => Math.random() - 0.5).slice(0, 4);

    res.json(recommended);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = { chat, getProductInsights, getRecommendations };