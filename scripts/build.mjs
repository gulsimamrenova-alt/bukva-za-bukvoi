import {readFileSync,writeFileSync,mkdirSync,rmSync,copyFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,join} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=path=>readFileSync(join(root,path),'utf8');
let html=read('src/index.html');
let css=read('src/style.css');
for(const name of ['manrope.ttf','nunito.ttf','caveat.ttf']){
  const encoded=readFileSync(join(root,'assets',name)).toString('base64');
  css=css.replaceAll('assets/'+name,'data:font/ttf;base64,'+encoded);
}
const icon=readFileSync(join(root,'assets/favicon.svg')).toString('base64');
html=html.replace('href="assets/favicon.svg"','href="data:image/svg+xml;base64,'+icon+'"');
html=html.replace(/<link rel="stylesheet" href="style\.css[^\"]*">/,()=>'<style>\n'+css+'\n</style>');
html=html.replace(/<script src="app\.js[^\"]*" defer><\/script>/,'');
const js=read('src/app.js').replaceAll('</script','<\\/script');
html=html.replace('</body>','<script>\n'+js+'\n</script>\n</body>');
const licenses=['manrope-license.txt','nunito-license.txt','caveat-license.txt'].map(name=>read('assets/'+name)).join('\n\n');
html=html.replace('</head>','<script type="text/plain" id="font-licenses">'+licenses+'</script></head>');
const out=resolve(root,'public');
rmSync(out,{recursive:true,force:true});
mkdirSync(join(out,'download'),{recursive:true});
mkdirSync(join(out,'licenses'),{recursive:true});
writeFileSync(join(out,'index.html'),html);
writeFileSync(join(out,'download/index.html'),html);
copyFileSync(join(root,'docs/interactive-report.md'),join(out,'download/report.txt'));
for(const name of ['manrope-license.txt','nunito-license.txt','caveat-license.txt'])copyFileSync(join(root,'assets',name),join(out,'licenses',name));
console.log(`Built public/index.html (${Buffer.byteLength(html)} bytes) and standalone download. No external dependencies.`);
