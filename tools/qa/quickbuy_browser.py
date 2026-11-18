from playwright.sync_api import sync_playwright
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from functools import partial
from pathlib import Path
import time
root=Path(__file__).resolve().parents[2]
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)))
Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/index.html'
print('URL',url,flush=True)
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--disable-gpu','--no-sandbox'])
  page=browser.new_page(viewport={'width':844,'height':390})
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  try:page.goto(url,wait_until='domcontentloaded',timeout=10000)
  except Exception as e:print('NAVIGATION ERROR:',type(e).__name__,str(e)[:500]);raise
  page.wait_for_timeout(1500)
  print('TITLE',page.title())
  print('auto visible source:',page.locator('#autoBuyBtn').count(), 'rebuy',page.locator('#rebuyBtn').count())
  print('QuickBuy installed:',page.evaluate('typeof window.BSQuickBuy'))
  print('page errors:',errors[:8])
  assert page.locator('#autoBuyBtn').count()==1
  assert page.evaluate('typeof window.BSQuickBuy')=='object'
  browser.close()
except Exception as e:
 print('BROWSER TEST FAILED:',type(e).__name__,str(e)[:400]);raise
finally:server.shutdown()
