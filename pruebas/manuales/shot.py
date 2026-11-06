import asyncio,sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pg=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True)
        errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
        await pg.goto('file:///home/claude/millonaire/index.html')
        await pg.wait_for_timeout(600)
        await pg.screenshot(path='s1.png')
        await pg.click('#welcome .btn')
        await pg.wait_for_timeout(400)
        await pg.click('#bShop')
        await pg.wait_for_timeout(400)
        for cat,ids in [('metal',['oro','oro','oro','plata','platino','platino']),('gema',['diamante','rubi','zafiro','esmeralda','rosa']),('cristal',['amatista','cuarzo','amatista'])]:
            await pg.click(f'.tab[data-cat={cat}]')
            for _ in ids: pass
            n=len(await pg.query_selector_all('.card'))
            for k in range(n):
                for rep in range(3):
                    await pg.locator('.card').nth(k).click(); await pg.click('#buy'); await pg.wait_for_timeout(120)
        await pg.wait_for_timeout(600)
        await pg.screenshot(path='s2.png')
        await pg.click('#sheet .x'); await pg.wait_for_timeout(500)
        await pg.screenshot(path='s3.png')
        await pg.click('#bVault'); await pg.wait_for_timeout(300)
        await pg.screenshot(path='s4.png')
        print('ERRS',errs)
        await b.close()
asyncio.run(main())
