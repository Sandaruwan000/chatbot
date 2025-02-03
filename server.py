from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from ollama import AsyncClient
import asyncio

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.websocket("/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    client = AsyncClient()
    
    try:
        while True:
            data = await websocket.receive_json()
            message = data['message']
            
            response = await client.generate(
                model='tinyllama',
                prompt=message,
                stream=True,
                options=data.get('options', {})
            )
            
            full_response = []
            async for chunk in response:
                token = chunk['response']
                full_response.append(token)
                await websocket.send_json({
                    'type': 'token',
                    'content': ''.join(full_response)
                })
                
            await websocket.send_json({
                'type': 'complete',
                'content': ''.join(full_response)
            })
            
    except Exception as e:
        await websocket.send_json({
            'type': 'error',
            'content': str(e)
        })
    finally:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)