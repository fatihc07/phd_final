import os
import sys
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Backend klasörünü kütüphane yolu olarak ekle
sys.path.append(os.path.dirname(__file__))

# Kendi servisimizden import ediyoruz
try:
    from financial_service import (
        get_all_bist_stocks, 
        get_stock_data, 
        get_stock_details, 
        get_stock_financials
    )
except ImportError:
    from backend.financial_service import (
        get_all_bist_stocks, 
        get_stock_data, 
        get_stock_details, 
        get_stock_financials
    )

app = FastAPI(title="PhD Terminal Data Engine")

# Netlify ve Yerel den erişim için CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Netlify adresini buraya ekleyebilirsin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/stocks")
async def get_stocks(page: int = 1, limit: int = 20):
    try:
        all_stocks = get_all_bist_stocks()
        start = (page - 1) * limit
        end = start + limit
        return {
            "items": all_stocks[start:end],
            "has_more": end < len(all_stocks)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stocks/{symbol}")
async def get_details(symbol: str):
    symbol = symbol.upper().replace(".IS", "")
    data = get_stock_data(symbol)
    if not data:
        raise HTTPException(status_code=404, detail="Hisse verisi bulunamadı")
        
    return {
        "symbol": symbol,
        "price_data": data,
        "details": get_stock_details(symbol),
        "financials": get_stock_financials(symbol)
    }

@app.get("/search/suggestions")
async def suggestions(q: str):
    all_stocks = get_all_bist_stocks()
    q = q.upper()
    return [s for s in all_stocks if q in s["symbol"] or q in s["name"].upper()][:10]

@app.get("/heartbeat")
async def heartbeat():
    return {"status": "online", "engine": "PhD Terminal Vector", "time": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
