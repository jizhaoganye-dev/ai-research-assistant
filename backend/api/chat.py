"""
Chat API - LLM-powered conversational interface
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, AsyncGenerator
import asyncio
import json

router = APIRouter()


class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    model: Optional[str] = "gpt-4"
    stream: Optional[bool] = True
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 2000


class ChatResponse(BaseModel):
    id: str
    content: str
    model: str
    usage: dict


async def generate_stream(messages: List[Message], model: str) -> AsyncGenerator[str, None]:
    """
    Generate streaming response from LLM
    
    In production, this would connect to OpenAI/Claude API
    For demo, we simulate streaming response
    """
    
    # Simulated response based on last message
    last_message = messages[-1].content.lower() if messages else ""
    
    if "コード" in last_message or "python" in last_message:
        response = """もちろんです！以下はPythonでのWebスクレイピングコードです：

```python
import requests
from bs4 import BeautifulSoup
import pandas as pd
from typing import List, Dict

class WebScraper:
    \"\"\"
    高機能Webスクレイパークラス
    
    Features:
    - 自動リトライ機能
    - レート制限対応
    - エラーハンドリング
    \"\"\"
    
    def __init__(self, base_url: str, headers: Dict = None):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update(headers or {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def scrape_products(self, category: str) -> List[Dict]:
        \"\"\"商品情報をスクレイピング\"\"\"
        url = f"{self.base_url}/products/{category}"
        response = self.session.get(url)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        products = []
        
        for item in soup.select('.product-card'):
            products.append({
                'name': item.select_one('.product-name').text.strip(),
                'price': self._parse_price(item.select_one('.price').text),
                'rating': float(item.select_one('.rating')['data-value']),
                'url': self.base_url + item.select_one('a')['href']
            })
        
        return products
    
    def _parse_price(self, price_text: str) -> int:
        return int(price_text.replace('¥', '').replace(',', ''))
    
    def to_dataframe(self, products: List[Dict]) -> pd.DataFrame:
        return pd.DataFrame(products)

# 使用例
scraper = WebScraper('https://example.com')
products = scraper.scrape_products('electronics')
df = scraper.to_dataframe(products)
df.to_csv('products.csv', index=False)
print(f"✅ {len(products)}件の商品データを取得しました")
```

このコードの特徴：
- ✅ **クラスベース設計** - 再利用性と保守性が高い
- ✅ **型ヒント完備** - コードの可読性向上
- ✅ **エラーハンドリング** - 本番環境対応
- ✅ **pandas連携** - データ分析に即対応"""
    
    elif "分析" in last_message or "データ" in last_message:
        response = """## 📊 データ分析レポート

アップロードされたデータを詳細に分析しました。

### 📈 主要指標サマリー

| 指標 | 現在値 | 前月比 | 目標達成率 |
|------|--------|--------|-----------|
| 月間アクティブユーザー | 156,000 | +12.5% | 78% |
| コンバージョン率 | 3.2% | +0.4pt | 89% |
| 平均注文単価 | ¥8,450 | +5.2% | 102% |
| 顧客満足度 (NPS) | 47 | +3pt | 94% |

### 🔍 セグメント別分析

**ユーザー属性:**
- 20代: 35% (前月比 +2.1pt)
- 30代: 42% (前月比 -0.5pt)  
- 40代以上: 23% (前月比 -1.6pt)

**デバイス別:**
- モバイル: 68% 📱
- デスクトップ: 28% 💻
- タブレット: 4% 📲

### 💡 改善提案

1. **モバイルUX最適化**
   - ファーストビューのCTA配置改善
   - ページロード時間の短縮 (目標: < 2秒)

2. **パーソナライゼーション強化**
   - ユーザー行動に基づくレコメンド精度向上
   - A/Bテストによる継続的改善

3. **リテンション施策**
   - プッシュ通知の最適化
   - ロイヤリティプログラムの拡充"""
    
    else:
        response = """こんにちは！AI Research Assistant です。

私は以下のタスクをサポートできます：

### 🚀 主な機能

1. **コード生成**
   - Python, TypeScript, JavaScript など
   - スクレイピング、API連携、データ処理

2. **ドキュメント分析**
   - PDF、テキストファイルの要約
   - 重要ポイントの抽出

3. **データ分析**
   - CSVデータの統計分析
   - 可視化レポート作成

4. **リサーチ支援**
   - 技術調査
   - 比較分析

何かお手伝いできることはありますか？"""

    # Simulate streaming
    words = response.split()
    for i, word in enumerate(words):
        chunk = word + (" " if i < len(words) - 1 else "")
        yield f"data: {json.dumps({'content': chunk})}\n\n"
        await asyncio.sleep(0.02)  # Simulate typing delay
    
    yield "data: [DONE]\n\n"


@router.post("/")
async def chat(request: ChatRequest):
    """
    Send a message to the AI and receive a response
    
    Supports both streaming and non-streaming modes
    """
    try:
        if request.stream:
            return StreamingResponse(
                generate_stream(request.messages, request.model),
                media_type="text/event-stream"
            )
        else:
            # Non-streaming response
            full_response = ""
            async for chunk in generate_stream(request.messages, request.model):
                if chunk.startswith("data: ") and not chunk.strip().endswith("[DONE]"):
                    data = json.loads(chunk[6:])
                    full_response += data.get("content", "")
            
            return ChatResponse(
                id="chat_" + str(hash(full_response))[:8],
                content=full_response,
                model=request.model,
                usage={
                    "prompt_tokens": sum(len(m.content.split()) for m in request.messages),
                    "completion_tokens": len(full_response.split()),
                    "total_tokens": sum(len(m.content.split()) for m in request.messages) + len(full_response.split())
                }
            )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models")
async def list_models():
    """List available LLM models"""
    return {
        "models": [
            {
                "id": "gpt-4",
                "name": "GPT-4",
                "provider": "OpenAI",
                "context_length": 8192,
                "capabilities": ["chat", "code", "analysis"]
            },
            {
                "id": "gpt-4-turbo",
                "name": "GPT-4 Turbo",
                "provider": "OpenAI", 
                "context_length": 128000,
                "capabilities": ["chat", "code", "analysis", "vision"]
            },
            {
                "id": "claude-3-opus",
                "name": "Claude 3 Opus",
                "provider": "Anthropic",
                "context_length": 200000,
                "capabilities": ["chat", "code", "analysis", "vision"]
            },
            {
                "id": "claude-3-sonnet",
                "name": "Claude 3 Sonnet",
                "provider": "Anthropic",
                "context_length": 200000,
                "capabilities": ["chat", "code", "analysis"]
            }
        ]
    }
