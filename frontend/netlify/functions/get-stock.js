const yahooFinance = require('yahoo-finance2').default;

exports.handler = async (event) => {
  const symbol = event.queryStringParameters.symbol;
  if (!symbol) return { statusCode: 400, body: "Symbol is required" };

  try {
    const yfSymbol = symbol.endsWith('.IS') ? symbol : `${symbol}.IS`;
    
    // Fiyat ve Özet verisi çek
    const result = await yahooFinance.quote(yfSymbol);
    
    // Grafik verisi (Son 5 gün)
    const history = await yahooFinance.chart(yfSymbol, { period1: '5d' });

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        symbol: symbol,
        price: result.regularMarketPrice,
        changePercent: result.regularMarketChangePercent,
        open: result.regularMarketOpen,
        history: history.quotes.map(q => ({ date: q.date, close: q.close }))
      })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
