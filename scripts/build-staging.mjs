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
for(const folder of ['assets'])if(existsSync(join(base,folder)))
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
 // Não transportar para a app de testes os dados iniciais reais do plantel,
 // adversários ou calendário que existem no código original.
 const seedStart=src.indexOf('const seedPlayers=');
 const seedEnd=src.indexOf('const blankRoster=',seedStart);
 if(seedStart<0||seedEnd<=seedStart)fail('Bloco de dados iniciais não encontrado');
 const syntheticSeeds=`const seedPlayers=[
  {id:'p1',name:'Jogador Fictício Um',position:'Ala',number:7,status:'Ativo',birth:'',phone:'',notes:''},
  {id:'p2',name:'Jogador Fictício Dois',position:'Fixo',number:10,status:'Ativo',birth:'',phone:'',notes:''},
  {id:'p3',name:'Guarda-Redes Fictício',position:'GR',number:1,status:'Ativo',birth:'',phone:'',notes:''},
  {id:'p4',name:'Jogador Fictício Quatro',position:'Pivot',number:11,status:'Ativo',birth:'',phone:'',notes:''}
 ];
 const seedTeams=[
  {name:'ADC Figueiras',short:'FIG TESTE',logo:'assets/adc-figueiras-logo-normal.png',homeVenue:'Pavilhão de Testes',aliases:[]},
  {name:'Adversário Fictício A',short:'TESTE A',logo:'',homeVenue:'Pavilhão Fictício A',aliases:[]},
  {name:'Adversário Fictício B',short:'TESTE B',logo:'',homeVenue:'Pavilhão Fictício B',aliases:[]}
 ];
 const seedFixtures=[
  {round:4,date:'2026-10-18',time:'20:00',home:'ADC Figueiras',away:'Adversário Fictício B',id:'fx_teste_01',seasonId:'s2627',competition:'Liga Fictícia de Testes',venue:'Pavilhão de Testes',homeScore:3,awayScore:2,fixture:true},
  {round:5,date:'2026-11-01',time:'20:00',home:'ADC Figueiras',away:'Adversário Fictício A',id:'fx_teste_02',seasonId:'s2627',competition:'Liga Fictícia de Testes',venue:'Pavilhão de Testes',homeScore:'',awayScore:'',fixture:true},
  {round:6,date:'2026-11-08',time:'20:00',home:'Adversário Fictício B',away:'ADC Figueiras',id:'fx_teste_03',seasonId:'s2627',competition:'Liga Fictícia de Testes',venue:'Pavilhão Fictício B',homeScore:'',awayScore:'',fixture:true}
 ];
 `;
 src=src.slice(0,seedStart)+syntheticSeeds+src.slice(seedEnd);
 src=src.replace(/users:\[\s*\{id:'u_david',[\s\S]*?\}\s*\],/, 'users:[],');
 // Evitar que dados locais legados de outras instalações sejam migrados no site de testes.
 src=one(src,"const V1_KEY='adc-figueiras-team-manager-v3-legacy-unused';",
  "const V1_KEY='adc-figueiras-team-manager-v3-legacy-unused-preprod';",'Cache v1 isolada');
 if(src.includes(productionHost))fail('A app pré-prod ainda menciona o backend de produção');
 return src;
});
edit('index.html',src=>{
 src=one(src,prodCspHost,api.origin,'CSP Supabase');
 src=one(src,prodCspWs,'wss://'+api.hostname,'CSP WS');
 src=one(src,'<body>','<body><div class="preprod-ribbon" role="status">AMBIENTE DE TESTES — utilizar apenas dados fictícios</div>','Banner');
 src=one(src,'<title>ADC Figueiras</title>','<title>ADC Figueiras — TESTES</title>','Título de testes');
 src=one(src,'content="Figueiras"','content="Figueiras Testes"','Nome da instalação iOS');
 return src;
});
edit('styles.css',src=>src+'\n.preprod-ribbon{background:#ffdf89;color:#3b2500;padding:8px 16px;text-align:center;font-weight:800;position:sticky;top:0;z-index:10000;font-size:13px}\n');
edit('sw.js',src=>one(src,"const CACHE='adc-figueiras-v1-3-production-2';",
 "const CACHE='adc-figueiras-preprod-v1-4-0';",'Cache service worker'));
edit('manifest.webmanifest',src=>{
 const manifest=JSON.parse(src);
 manifest.name='ADC Figueiras — TESTES';
 manifest.short_name='Figueiras TESTES';
 manifest.description='Ambiente de demonstração com dados fictícios, separado da app oficial.';
 return JSON.stringify(manifest,null,2)+'\\n';
});

const outputApp=readFileSync(join(dest,'app.js'),'utf8');
const outputHtml=readFileSync(join(dest,'index.html'),'utf8');
if(outputApp.includes(productionHost)||outputHtml.includes(prodCspHost))fail('Ligação de produção encontrada');
if(outputHtml.includes('SUPABASE_SERVICE_ROLE_KEY')||outputApp.includes('sb_secret_'))fail('Credencial privada exposta');
console.log('Pré-produção construída isoladamente em:',dest);
console.log('Backend de testes:',api.origin);
console.log('Push:',vapidKey?'chave pública de testes configurada':'desativado até configurar VAPID de testes');
