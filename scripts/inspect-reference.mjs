import { chromium } from '@playwright/test';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
await page.goto('https://layrmedia.com/', {waitUntil:'domcontentloaded',timeout:60000});
await page.waitForTimeout(4000);
 
await page.screenshot({path:'/tmp/trn-reference-start.png'});
const entry=page.getByText('Enter without sound',{exact:false});
if(await entry.count()) await entry.first().evaluate(el=>el.click());
await page.waitForTimeout(1500);
await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.toLowerCase().includes('enter with audio')); let e=b; while(e&&getComputedStyle(e).position!=='fixed') e=e.parentElement; e?.remove(); window.dispatchEvent(new CustomEvent('loader-dismissed')); document.body.style.overflow='';});
await page.waitForTimeout(2000);
await page.screenshot({path:'/tmp/trn-reference-hero.png'});
console.log(await page.evaluate(()=>({title:document.title,fonts:[...new Set([...document.querySelectorAll('h1,h2,p,a')].map(e=>getComputedStyle(e).fontFamily))],height:document.documentElement.scrollHeight,body:getComputedStyle(document.body).backgroundColor})));
await page.mouse.wheel(0,800);await page.waitForTimeout(1500);
await page.screenshot({path:'/tmp/trn-reference-scroll.png'});
await page.mouse.wheel(0,1500);await page.waitForTimeout(1500);
await page.screenshot({path:'/tmp/trn-reference-gallery.png'});
await browser.close();
