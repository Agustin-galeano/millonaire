import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pg=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True)
        await pg.goto('file:///home/claude/millonaire/index.html'); await pg.wait_for_timeout(400)
        await pg.click('#wGo'); await pg.wait_for_timeout(3200)
        box=await pg.locator('#room').bounding_box()
        W=await pg.evaluate("document.getElementById('room').width"); sx=box['width']/W
        tile=lambda i,j:(box['x']+(W/2+(i-j)*12)*sx, box['y']+(80+(i+j+1)*6)*sx)
        await pg.mouse.click(*tile(1,6)); print(tile(1,6),box)
        for k in range(6):
            await pg.wait_for_timeout(90); await pg.screenshot(path=f'f{k}.png')
        await b.close()
asyncio.run(main())
