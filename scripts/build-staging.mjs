// Prepara uma distribuição de TESTES isolada, sem ligações ao Supabase de produção.
// Executar apenas com configuração pública de um projeto Supabase distinto.
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';

const base=resolve(import.meta.dirname,'..');
const dest=resolve(process.env.STAGING_OUTPUT_DIR||join(base,'dist','preprod'));
const apiUrl=String(process.env.STAGING_SUPABASE_URL||'').trim();
const apiKey=String(process.env.STAGING_SUPABASE_PUBLISHABLE_KEY||'').trim();
const vapidKey=String(process.env.STAGING_VAPID_PUBLIC_KEY||'').trim();
const productionHost='kfihltycbnambszmefqa.supabase.co';

function fail(message){throw new Error('[PREPROD] '+message)}
let api;
try{api=new URL(apiUrl)}catch{fail('STAGING_SUPABASE_URL inválida ou em falta')}
if(api.protocol!=='https:'||!/^[-a-z0-9]+\.supabase\.co$/i.test(api.hostname))
 fail('STAGING_SUPABASE_URL deve ser um projeto Supabase https://...supabase.co');
if(api.hostname===productionHost)fail('NÃO é permitido ligar a pré-produção ao Supabase de produção');
if(!/^sb_publishable_[A-Za-z0-9_-]{12,}$/.test(apiKey))
 fail('É necessária uma publishable key válida do projeto de testes');
// Nunca usar secret key, service_role ou qualquer outra credencial privilegiada neste bundle.
if(vapidKey&&!/^[A-Za-z0-9_-]{70,100}$/.test(vapidKey))
 fail('Chave VAPID pública de testes inválida; deixa-a vazia para desativar push');

const required=['index.html','app.js','styles.css','sw.js','manifest.webmanifest',
 'termos.html','privacidade.html','cookies.html','legal.css'];
for(const file of required)if(!existsSync(join(base,file)))fail('Ficheiro em falta: '+file);
if(dest===base||!dest.startsWith(base+'/'))fail('Pasta de saída insegura');
rmSync(dest,{recursive:true,force:true});mkdirSync(dest,{recursive:true});
for(const file of required)cpSync(join(base,file),join(dest,file));
for(const folder of ['assets','data'])if(existsSync(join(base,folder)))
 cpSync(join(base,folder),join(dest,folder),{recursive:true});

function edit(file,transform){
 const location=join(dest,file);
 const original=readFileSync(location,'utf8');
 const modified=transform(original);
 if(modified===original)fail('Nenhuma alteração efetuada em '+file);
 writeFileSync(location,modified,'utf8');
}
function one(src,from,to,name){
 const hits=src.split(from).length-1;
 if(hits!==1)fail(name+': esperado 1 marcador; encontrados '+hits);
 return src.replace(from,to);
}
const prodCspHost='https://'+productionHost;
const prodCspWs='wss://'+productionHost;
edit('app.js',src=>{
 src=one(src,"const SUPABASE_URL='https://"+productionHost+"';",
  'const SUPABASE_URL='+JSON.stringify(api.origin)+';','URL Supabase');
 src=src.replace(/const SUPABASE_PUBLISHABLE_KEY='[^']+';/,
   'const SUPABASE_PUBLISHABLE_KEY='+JSON.stringify(apiKey)+';');
 if(!src.includes('const SUPABASE_PUBLISHABLE_KEY='+JSON.stringify(apiKey)+';'))
   fail('Publishable key não substituída');
 src=src.replace(/const VAPID_PUBLIC_KEY='[^']*';/,
   'const VAPID_PUBLIC_KEY='+JSON.stringify(vapidKey)+';');
 src=one(src,"const APP_VERSION='1.3';","const APP_VERSION='1.4.0-preprod';",'Versão');
 src=one(src,"const V2_KEY='adc-figueiras-team-manager-v3-dev';",
  "const V2_KEY='adc-figueiras-team-manager-v3-preprod';",'Cache local');
 src=one(src,'function pushSupported(){return !!(',
  'function pushSupported(){return !!(VAPID_PUBLIC_KEY&&','Push opcional');
 if(src.includes(productionHost))fail('A app pré-prod ainda menciona o backend de produção');
 return src;
});
edit('index.html',src=>{
 src=one(src,prodCspHost,api.origin,'CSP Supabase');
 src=one(src,prodCspWs,'wss://'+api.hostname,'CSP WS');
 src=one(src,'<body>','<body><div class="preprod-ribbon" role="status">AMBIENTE DE TESTES — utilizar apenas dados fictícios</div>','Banner');
 return src;
});
edit('styles.css',src=>src+'\n.preprod-ribbon{background:#ffdf89;color:#3b2500;padding:8px 16px;text-align:center;font-weight:800;position:sticky;top:0;z-index:10000;font-size:13px}\n');
edit('sw.js',src=>one(src,"const CACHE='adc-figueiras-v1-3-production-2';",
 "const CACHE='adc-figueiras-preprod-v1-4-0';",'Cache service worker'));

const outputApp=readFileSync(join(dest,'app.js'),'utf8');
const outputHtml=readFileSync(join(dest,'index.html'),'utf8');
if(outputApp.includes(productionHost)||outputHtml.includes(prodCspHost))fail('Ligação de produção encontrada');
if(outputHtml.includes('SUPABASE_SERVICE_ROLE_KEY')||outputApp.includes('sb_secret_'))fail('Credencial privada exposta');
console.log('Pré-produção construída isoladamente em:',dest);
console.log('Backend de testes:',api.origin);
console.log('Push:',vapidKey?'chave pública de testes configurada':'desativado até configurar VAPID de testes');
