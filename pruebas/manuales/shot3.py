import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pg=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True)
        errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
        await pg.goto('file:///home/claude/millonaire/index.html'); await pg.wait_for_timeout(500)
        await pg.fill('#nameIn','Agus'); await pg.click('#wGo'); await pg.wait_for_timeout(500)
        vis=await pg.evaluate("getComputedStyle(document.getElementById('bubble')).opacity")
        await pg.click('#bubble'); await pg.wait_for_timeout(300)
        vis2=await pg.evaluate("getComputedStyle(document.getElementById('bubble')).opacity")
        print('bubble opacity before/after tap',vis,vis2)
        await pg.click('#bShop')
        for cat,k in [('mueble',5),('gema',2),('metal',2),('arte',0)]:
            await pg.click(f'#catTabs .tab[data-cat={cat}]'); await pg.locator('.card').nth(k).click(); await pg.click('#buyBtn'); await pg.wait_for_timeout(100)
        await pg.click('#sheet .x'); await pg.wait_for_timeout(600)
        # tap on a far floor tile -> walk
        box=await pg.locator('#room').bounding_box()
        pos=await pg.evaluate("""()=>{const cv=document.getElementById('room');return [cv.width,cv.height]}""")
        sx=box['width']/pos[0]
        # tile (1,6): P(1.5,6.5) = OX+(1.5-6.5)*12, OY+(8)*6 ; OX=W/2, OY=80
        x=pos[0]/2+(1.5-6.5)*12; y=80+8*6
        await pg.mouse.click(box['x']+x*sx, box['y']+y*sx); await pg.wait_for_timeout(250)
        await pg.screenshot(path='w1.png')
        await pg.wait_for_timeout(1500)
        await pg.screenshot(path='w2.png')
        # tap on each piece -> info
        pcs=await pg.evaluate("""()=>JSON.parse(localStorage.getItem('millonaire-v2')||'{}').pieces""")
        print('pieces',[(q['t'],q.get('i'),q.get('j'),q.get('w')) for q in pcs])
        await pg.evaluate("()=>{}")
        q=[q for q in pcs if q['t']=='piano'][0]
        x=pos[0]/2+(q['i']-q['j'])*12; y=80+(q['i']+q['j']+1)*6-6
        await pg.mouse.click(box['x']+x*sx, box['y']+y*sx); await pg.wait_for_timeout(300)
        await pg.screenshot(path='w3.png')
        await pg.click('#bVip'); await pg.click('#vipGo'); await pg.wait_for_timeout(200); await pg.click('#vipIn'); await pg.wait_for_timeout(5500)
        await pg.screenshot(path='w4.png')
        print('ERRS',errs)
        await b.close()
asyncio.run(main())
