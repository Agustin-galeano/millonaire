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
        await pg.fill('#nameIn','Agus'); await pg.click('#wGo'); await pg.wait_for_timeout(300)
        await pg.click('#bShop')
        for cat,k in [('mueble',5),('mueble',3),('metal',2),('metal',2),('arte',0)]:
            await pg.click(f'#catTabs .tab[data-cat={cat}]'); await pg.locator('.card').nth(k).click(); await pg.click('#buyBtn'); await pg.wait_for_timeout(100)
        await pg.click('#sheet .x'); await pg.wait_for_timeout(600)
        box=await pg.locator('#room').bounding_box()
        W=await pg.evaluate("document.getElementById('room').width"); sx=box['width']/W
        def tile(i,j,dy=0): return (box['x']+(W/2+(i-j)*12)*sx, box['y']+(80+(i+j+1)*6+dy)*sx)
        pcs=await pg.evaluate("JSON.parse(localStorage.getItem('millonaire-v2')).pieces")
        print([(q['t'],q.get('i'),q.get('j'),q.get('s'),q.get('w')) for q in pcs])
        # walk far and capture frames
        await pg.mouse.click(*tile(7,1)); await pg.wait_for_timeout(200)
        await pg.screenshot(path='m1.png',clip={'x':0,'y':150,'width':390,'height':450})
        await pg.wait_for_timeout(130); await pg.screenshot(path='m2.png',clip={'x':0,'y':150,'width':390,'height':450})
        await pg.wait_for_timeout(1500)
        piano=[q for q in pcs if q['t']=='piano'][0]
        await pg.mouse.click(*tile(piano['i'],piano['j'],-8)); await pg.wait_for_timeout(300)
        await pg.click('#iMove'); await pg.wait_for_timeout(300)
        await pg.screenshot(path='m3.png')
        await pg.mouse.click(*tile(5,6)); await pg.wait_for_timeout(500)
        # move gold stack
        oro=[q for q in pcs if q['t']=='oro'][0]
        await pg.mouse.click(*tile(oro['i'],oro['j'],-4)); await pg.wait_for_timeout(300)
        await pg.click('#iMove'); await pg.mouse.click(*tile(2,6)); await pg.wait_for_timeout(400)
        # move painting
        await pg.evaluate("()=>{}")
        await pg.screenshot(path='m4.png')
        pcs=await pg.evaluate("JSON.parse(localStorage.getItem('millonaire-v2')).pieces")
        print([(q['t'],q.get('i'),q.get('j'),q.get('s'),q.get('w')) for q in pcs])
        print('ERRS',errs)
        await b.close()
asyncio.run(main())
