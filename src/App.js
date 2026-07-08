import { useState, useMemo, useEffect } from "react";
import { database, ref, set, onValue } from "./firebase";

const PERGUNTAS = {
  busca:["Qual foi a fonte da demanda?","Qual dor ou oportunidade foi identificada?","Essa demanda e recorrente ou pontual?","Existe evidencia que suporte essa demanda?","Qual o publico impactado?"],
  identificacao:["Qual e a proposta do projeto?","Qual problema queremos resolver?","Existe solucao atual? Qual a limitacao?","Esse projeto se conecta com a estrategia da empresa?","Ha projetos semelhantes em andamento?"],
  analise_tecnica:["O que precisa ser desenvolvido?","Ja existe conhecimento interno sobre o tema?","Quais sao as principais incertezas tecnicas?","Existe benchmark ou referencia externa?","Quais sao os principais desafios tecnicos?"],
  levantamento_custos:["Quais sao os principais custos envolvidos?","Existe algum insumo critico ou de dificil acesso?","O custo estimado e viavel?","Existe variacao significativa entre fornecedores?","Qual o risco de inviabilidade financeira?"],
  aprovacao_preliminar:["O projeto faz sentido estrategico?","Temos capacidade tecnica e operacional?","O risco identificado e aceitavel?","Qual o principal argumento para seguir?","Qual o principal risco se avancarmos?"],
  analise_mercado:["Existe demanda clara para este produto?","Quem sao os principais usuarios ou prescritores?","Ha concorrentes diretos ou indiretos?","Qual o diferencial competitivo esperado?","Qual a tendencia de mercado relacionada?"],
  analise_financeira:["Qual o potencial de receita estimado?","Qual a margem estimada?","Qual o payback esperado?","Qual o risco de baixa adesao?","Qual o impacto esperado no ticket medio?"],
  complexidades:["Existem barreiras regulatorias identificadas?","Qual o risco sanitario envolvido?","Qual o impacto operacional esperado?","Quais areas da empresa serao envolvidas?","Existe dependencia externa critica?"],
  aprovacao_final:["O projeto esta pronto para desenvolvimento?","Os riscos sao aceitaveis para avancar?","O plano de execucao esta claro?","O retorno esperado justifica o investimento?","Qual o criterio de sucesso definido?"],
  formulacao_inicial:["Qual a formulacao proposta?","Ha referencias tecnicas que embasam a formulacao?","Quais as principais incompatibilidades previstas?","Qual o prazo estimado para formulacao inicial?","Quem e o responsavel tecnico?"],
  testes_piloto:["Quais testes foram realizados?","Os resultados atenderam as especificacoes?","Houve necessidade de ajuste na formulacao?","Quais parametros foram avaliados?","Quais foram os principais achados?"],
  ajustes_formulacao:["Quais ajustes foram realizados?","O que motivou os ajustes?","Os ajustes resolveram os problemas?","A formulacao esta estavel apos os ajustes?","Ha necessidade de novos testes?"],
  estabilidade:["Qual protocolo de estabilidade foi adotado?","Quais condicoes foram testadas?","Os resultados preliminares sao satisfatorios?","Qual o prazo para conclusao do estudo?","Houve alteracao fisica ou quimica identificada?"],
  definicao_embalagem:["Qual o tipo de embalagem definida?","A embalagem e compativel com a formulacao?","Ha fornecedor homologado?","A embalagem atende as exigencias regulatorias?","Qual o custo estimado da embalagem?"],
  padronizacao_prod:["O processo produtivo foi documentado?","Ha POP ou IT definido?","O lote piloto foi produzido com sucesso?","Existem pontos criticos de controle?","A equipe de producao foi treinada?"],
  avaliacao_regulatoria_lp:["Qual o enquadramento regulatorio do produto?","Ha necessidade de registro junto a ANVISA ou MAPA?","Quais documentos sao necessarios?","Existe prazo regulatorio critico?","O produto esta em conformidade com as normas?"],
  precificacao:["Qual o custo de producao final apurado?","Qual a margem de contribuicao definida?","Como o preco se posiciona em relacao ao mercado?","Ha necessidade de tabela diferenciada por volume?","O preco esta alinhado com a estrategia comercial?"],
  planejamento_lancamento:["Qual a data prevista de lancamento?","Quais canais serao utilizados?","Ha material de comunicacao planejado?","Quais unidades serao incluidas no lancamento?","Existe meta de volume para os primeiros meses?"],
  treinamento_lp:["Quem sera treinado?","Qual o conteudo do treinamento?","O treinamento foi realizado?","Como o treinamento foi avaliado?","Ha material de apoio disponivel?"],
  lancamento_lp:["O produto foi lancado conforme planejado?","Houve desvios em relacao ao plano?","Qual foi a receptividade inicial do mercado?","Houve feedback de veterinarios ou franqueados?","Quais ajustes foram necessarios apos o lancamento?"],
  prospeccao_fornecedor:["Quais fornecedores foram identificados?","Qual o pais de origem da materia-prima?","Ha restricao de importacao prevista?","Qual o lead time estimado?","Existe alternativa nacional?"],
  qualificacao_documental:["Quais documentos foram solicitados ao fornecedor?","O fornecedor esta em conformidade com as normas?","Ha certificado de analise e ficha tecnica?","O fornecedor possui historico no setor?","Existem pendencias documentais?"],
  analise_tecnica_mp:["A MP atende as especificacoes tecnicas?","Quais ensaios foram realizados?","Os resultados analiticos foram satisfatorios?","Ha necessidade de metodologia analitica especifica?","A MP e compativel com as formulacoes previstas?"],
  testes_bancada:["Quais testes de bancada foram realizados?","A MP se comportou conforme esperado?","Houve necessidade de ajuste no processo?","Quais foram os resultados dos testes?","A MP esta aprovada para prosseguir?"],
  avaliacao_regulatoria_mp:["A MP possui registro ou aprovacao regulatoria?","Ha restricao de uso em formulacoes veterinarias?","Existe limitacao de concentracao maxima?","E necessario registro junto ao MAPA ou ANVISA?","A documentacao regulatoria esta completa?"],
  aprovacao_fornecedor:["O fornecedor foi aprovado formalmente?","Quais criterios foram utilizados?","Ha contrato ou acordo comercial estabelecido?","Qual o prazo de validade da qualificacao?","Existem fornecedores alternativos aprovados?"],
  padronizacao_mp:["O processo de recebimento e controle foi documentado?","Ha POP definido para a MP?","Os criterios de aceitacao e rejeicao estao definidos?","A equipe de laboratorio foi orientada?","A MP foi incluida no sistema de qualidade?"],
  treinamento_mp:["Quem foi treinado para o uso da MP?","O treinamento cobriu aspectos tecnicos e de seguranca?","O treinamento foi registrado?","Ha material de apoio disponivel?","A equipe demonstrou compreensao adequada?"],
  liberacao:["A MP foi liberada para uso?","Quem assinou a liberacao?","Ha restricao de uso definida?","A MP esta disponivel para producao?","O estoque inicial foi estabelecido?"],
  levantamento_dor:["Qual e o problema ou ineficiencia identificada?","Quem sao os usuarios afetados?","Com que frequencia o problema ocorre?","Qual o impacto atual nao resolvido?","Ja houve tentativas anteriores de solucao?"],
  definicao_requisitos:["Quais sao os requisitos funcionais do sistema?","Quais sao os requisitos nao funcionais?","Quem sao os stakeholders envolvidos?","Ha integracoes com outros sistemas previstas?","Os requisitos foram validados com os usuarios?"],
  priorizacao:["Quais funcionalidades sao essenciais para o MVP?","Quais podem ser desenvolvidas em fases posteriores?","Qual o criterio de priorizacao utilizado?","Ha restricao de prazo ou orcamento?","A priorizacao foi aprovada pelos stakeholders?"],
  desenvolvimento_sis:["Qual tecnologia esta sendo utilizada?","O desenvolvimento esta seguindo o escopo?","Houve necessidade de ajuste nos requisitos?","Qual o percentual de desenvolvimento concluido?","Ha impedimentos tecnicos identificados?"],
  testes_sis:["Quais tipos de teste foram realizados?","Os resultados dos testes foram satisfatorios?","Foram identificados bugs ou inconsistencias?","Os testes cobriram todos os requisitos?","O sistema esta pronto para homologacao?"],
  homologacao:["Quem participou da homologacao?","O sistema foi aprovado pelos usuarios chave?","Houve ajustes solicitados?","A documentacao do sistema esta completa?","A homologacao foi formalizada?"],
  piloto:["Quais unidades participaram do piloto?","O sistema funcionou conforme esperado?","Quais problemas foram identificados?","O feedback dos usuarios foi positivo?","O piloto validou o sistema para rollout?"],
  ajustes_sis:["Quais ajustes foram realizados apos o piloto?","Os problemas identificados foram resolvidos?","Houve necessidade de revisao nos requisitos?","O sistema esta estavel apos os ajustes?","Ha pendencias antes do rollout?"],
  treinamento_sis:["Quem foi treinado para uso do sistema?","O treinamento cobriu todas as funcionalidades?","Ha manual ou material de apoio disponivel?","O treinamento foi avaliado?","Os usuarios demonstraram autonomia no uso?"],
  rollout:["O rollout foi realizado conforme planejado?","Houve desvios ou intercorrencias?","Todas as unidades previstas foram contempladas?","O suporte pos-implantacao esta definido?","O sistema esta em operacao plena?"],
  identificacao_melhoria:["Qual o processo que precisa ser melhorado?","Qual o problema central identificado?","Quem sao os envolvidos no processo atual?","Qual o impacto do problema nao resolvido?","Ha dados que quantificam o problema?"],
  mapeamento_processo:["O processo atual foi documentado?","Quais sao as etapas do processo atual?","Onde estao os principais gargalos?","Ha desperdicios ou retrabalhos identificados?","Quais areas estao envolvidas?"],
  analise_causa_raiz:["Qual e a causa raiz identificada?","Qual metodologia foi utilizada?","A causa raiz foi validada com os envolvidos?","Ha causas secundarias relevantes?","A analise foi documentada?"],
  proposta_solucao:["Qual a solucao proposta?","Como a solucao resolve a causa raiz?","Quais recursos serao necessarios?","Ha alternativas de solucao consideradas?","A proposta foi aprovada pelos envolvidos?"],
  teste_piloto_mel:["O teste piloto foi realizado?","Quais resultados foram obtidos?","A solucao funcionou conforme esperado?","Houve necessidade de ajustes?","O piloto foi realizado com quais areas?"],
  ajustes_mel:["Quais ajustes foram realizados apos o piloto?","Os ajustes resolveram os problemas identificados?","A solucao esta estavel?","Ha pendencias antes da padronizacao?","Os envolvidos aprovaram os ajustes?"],
  padronizacao_pop:["O POP foi elaborado?","O POP foi revisado e aprovado?","Esta disponivel para os envolvidos?","O processo novo foi documentado por completo?","Ha indicadores definidos para monitoramento?"],
  treinamento_mel:["Quem foi treinado no novo processo?","O treinamento foi baseado no POP aprovado?","O treinamento foi registrado?","Os participantes demonstraram compreensao?","Ha material de apoio disponivel?"],
  implementacao:["A implementacao foi realizada conforme planejado?","Houve desvios durante a implementacao?","Quais areas foram impactadas?","O processo novo esta em operacao?","Houve resistencia ou dificuldades de adesao?"],
  monitoramento:["Os indicadores estao sendo acompanhados?","Os resultados mostram melhoria?","Houve necessidade de ajustes apos a implementacao?","A melhoria foi sustentada ao longo do tempo?","Ha proximos passos ou desdobramentos previstos?"],
  implantacao:["Foi implementado conforme planejado?","Houve desvios em relacao ao plano original?","Quais foram os principais desafios na implantacao?","O time foi adequadamente preparado?","Ha pendencias a resolver apos a implantacao?"],
  concluido:["O objetivo do projeto foi atingido?","Quais foram os principais resultados alcancados?","O que faria diferente se fosse recomecar?","O projeto gerou valor para a empresa?","Deve ser escalado ou replicado?"],
};const TRILHOS_DEV = {
  "materia-prima":{label:"Materia-prima",etapas:[
    {id:"prospeccao_fornecedor",label:"Prospeccao de fornecedor"},
    {id:"qualificacao_documental",label:"Qualificacao documental"},
    {id:"analise_tecnica_mp",label:"Analise tecnica"},
    {id:"testes_bancada",label:"Testes de bancada"},
    {id:"avaliacao_regulatoria_mp",label:"Avaliacao regulatoria"},
    {id:"aprovacao_fornecedor",label:"Aprovacao de fornecedor"},
    {id:"padronizacao_mp",label:"Padronizacao"},
    {id:"treinamento_mp",label:"Treinamento"},
    {id:"liberacao",label:"Liberacao"},
  ]},
  "linha-produto":{label:"Linha de produto",etapas:[
    {id:"formulacao_inicial",label:"Formulacao inicial"},
    {id:"testes_piloto",label:"Testes piloto"},
    {id:"ajustes_formulacao",label:"Ajustes de formulacao"},
    {id:"estabilidade",label:"Estudo de estabilidade"},
    {id:"definicao_embalagem",label:"Definicao de embalagem"},
    {id:"padronizacao_prod",label:"Padronizacao produtiva"},
    {id:"avaliacao_regulatoria_lp",label:"Avaliacao regulatoria"},
    {id:"precificacao",label:"Precificacao"},
    {id:"planejamento_lancamento",label:"Planejamento de lancamento"},
    {id:"treinamento_lp",label:"Treinamento"},
    {id:"lancamento_lp",label:"Lancamento"},
  ]},
  "sistema":{label:"Sistema interno",etapas:[
    {id:"levantamento_dor",label:"Levantamento de dor"},
    {id:"definicao_requisitos",label:"Definicao de requisitos"},
    {id:"priorizacao",label:"Priorizacao"},
    {id:"desenvolvimento_sis",label:"Desenvolvimento"},
    {id:"testes_sis",label:"Testes"},
    {id:"homologacao",label:"Homologacao"},
    {id:"piloto",label:"Piloto"},
    {id:"ajustes_sis",label:"Ajustes"},
    {id:"treinamento_sis",label:"Treinamento"},
    {id:"rollout",label:"Rollout"},
  ]},
  "melhoria":{label:"Melhoria de processos",etapas:[
    {id:"identificacao_melhoria",label:"Identificacao da melhoria"},
    {id:"mapeamento_processo",label:"Mapeamento do processo atual"},
    {id:"analise_causa_raiz",label:"Analise de causa raiz"},
    {id:"proposta_solucao",label:"Proposta de solucao"},
    {id:"teste_piloto_mel",label:"Teste piloto"},
    {id:"ajustes_mel",label:"Ajustes"},
    {id:"padronizacao_pop",label:"Padronizacao (POP)"},
    {id:"treinamento_mel",label:"Treinamento"},
    {id:"implementacao",label:"Implementacao"},
    {id:"monitoramento",label:"Monitoramento"},
  ]},
};

const CATEGORIA_TRILHO = {
  "manipulacao":"materia-prima","produto-acabado":"linha-produto",
  "oftalmicos":"linha-produto","sistema":"sistema",
  "melhoria-processos":"melhoria","equinos":null,
};

const ETAPAS_PRE_DEV = [
  {id:"busca",label:"Busca ativa",gate:false},
  {id:"identificacao",label:"Identificacao",gate:false},
  {id:"analise_tecnica",label:"Analise tecnica",gate:false},
  {id:"levantamento_custos",label:"Levant. de custos",gate:false},
  {id:"aprovacao_preliminar",label:"Aprovacao preliminar",gate:true},
  {id:"analise_mercado",label:"Analise de mercado",gate:false},
  {id:"analise_financeira",label:"Analise financeira",gate:false},
  {id:"complexidades",label:"Complexidades",gate:false},
  {id:"aprovacao_final",label:"Aprovacao final",gate:true},
];
const ETAPA_IMP = {id:"implantacao",label:"Implantacao",gate:false};
const ETAPA_CON = {id:"concluido",label:"Concluido",gate:false};
const ETAPAS_NOME_EDIT = ["busca","identificacao","analise_tecnica"];
const PRE_IDS = ETAPAS_PRE_DEV.map(e=>e.id);

function etapasCompletas(tId) {
  const dev = tId ? TRILHOS_DEV[tId].etapas.map(e=>({...e,dev:true})) : [];
  return [...ETAPAS_PRE_DEV,...dev,ETAPA_IMP,ETAPA_CON];
}
function pergEtapa(id){ return PERGUNTAS[id]||[]; }
function pctRespostas(resp,id){
  const p=pergEtapa(id);if(!p.length)return 100;
  return Math.round((p.filter((_,i)=>(resp[i]||"").trim()).length/p.length)*100);
}
function etapaConcluida(resp,id){ return pergEtapa(id).every((_,i)=>(resp[i]||"").trim()); }

const CATEGORIAS = {
  "manipulacao":{label:"Expansao portfolio - manipulacao",short:"Manipulacao",cor:"#5E5280"},
  "produto-acabado":{label:"Expansao portfolio - produto acabado",short:"Prod. acabado",cor:"#1D9E75"},
  "sistema":{label:"Sistema interno",short:"Sistema",cor:"#D85A30"},
  "oftalmicos":{label:"Oftalmicos",short:"Oftalmicos",cor:"#185FA5"},
  "equinos":{label:"Equinos",short:"Equinos",cor:"#BA7517"},
  "melhoria-processos":{label:"Melhoria de processos",short:"Melhoria",cor:"#993556"},
};

const FONTES = [
  {id:"literatura",label:"Pesquisa de literatura",continuo:true},
  {id:"mercado",label:"Pesquisa de mercado",continuo:true},
  {id:"franqueados",label:"Franqueados",pct:25},
  {id:"veterinarios",label:"Veterinarios",pct:20},
  {id:"visitadores",label:"Visitadores",pct:20},
  {id:"operacionais",label:"Setores operacionais",pct:20},
  {id:"administrativos",label:"Setores administrativos",pct:15},
];

const MOTIVOS_REP = [
  "Inviabilidade tecnica","Inviabilidade financeira","Risco regulatorio alto",
  "Baixo potencial de mercado","Complexidade operacional","Decisao estrategica","Outro",
];

const TODAY="2026-06-26";

function mesesDesde(d){return Math.max(0,Math.floor((new Date(TODAY)-new Date(d))/(1000*60*60*24*30)));}
function mesesNaEtapa(hist,id){
  const e=hist.find(h=>h.etapa===id);if(!e)return 0;
  const i=hist.indexOf(e);const prox=hist[i+1];
  return Math.max(0,Math.floor(((prox?new Date(prox.data):new Date(TODAY))-new Date(e.data))/(1000*60*60*24*30)));
}
function progProjeto(p){
  const todas=etapasCompletas(p.trilhoDev);
  const idx=todas.findIndex(e=>e.id===(p.reprovado?p.reprovado.etapa:p.etapa));
  return idx<0?0:Math.round(((idx+1)/todas.length)*100);
}
function statusP(p){
  if(p.reprovado)return"reprovado";
  if(!p.prazoLimite)return"ok";
  const d=Math.floor((new Date(p.prazoLimite)-new Date(TODAY))/(1000*60*60*24));
  if(d<0)return"atraso";if(d<30)return"atencao";return"ok";
}
function etapaEmDev(id){return Object.values(TRILHOS_DEV).some(t=>t.etapas.some(e=>e.id===id));}

function gerarRelatorio(projeto){
  const cat=CATEGORIAS[projeto.categoria];
  const todas=etapasCompletas(projeto.trilhoDev);
  const ttm=mesesDesde(projeto.inicio);
  const fonte=FONTES.find(function(f){return f.id===projeto.fonte;});
  const status=projeto.reprovado?"Reprovado":projeto.etapa==="concluido"?"Concluido":"Em andamento";
  let tl="";
  projeto.historico.forEach(function(h){
    const et=todas.find(function(e){return e.id===h.etapa;});
    const m=mesesNaEtapa(projeto.historico,h.etapa);
    tl+="<div class='tl'><div class='dot'></div><div><strong>"+(et?et.label:h.etapa)+"</strong> - "+h.data+(m>0?" - "+m+" meses":"")+"</div></div>";
  });
  let secs="";
  projeto.historico.forEach(function(h){
    const pergs=pergEtapa(h.etapa);
    if(!pergs.length)return;
    const et=todas.find(function(e){return e.id===h.etapa;});
    const resp=(projeto.formRespostas&&projeto.formRespostas[h.etapa])?projeto.formRespostas[h.etapa]:{};
    const pct=pctRespostas(resp,h.etapa);
    let qas="";
    pergs.forEach(function(q,i){
      qas+="<div class='qa'><div class='q'>"+q+"</div><div class='a'>"+(resp[i]||"-")+"</div></div>";
    });
    secs+="<div class='bloco'><h3>"+(et?et.label:h.etapa)+" ("+pct+"% respondido)</h3>"+qas+"</div>";
  });
  let reprov="";
  if(projeto.reprovado){
    reprov+="<h2>Reprovacao</h2>";
    reprov+="<div style='background:#fff0f0;border-left:3px solid #E24B4A;padding:10px 14px;border-radius:0 4px 4px 0;'>";
    reprov+="<div class='qa'><div class='q'>Motivo</div><div class='a'>"+projeto.reprovado.motivo+"</div></div>";
    reprov+="<div class='qa'><div class='q'>Justificativa</div><div class='a'>"+(projeto.reprovado.justificativa||"-")+"</div></div>";
    if(projeto.reprovado.aprendizados){
      reprov+="<div class='qa'><div class='q'>Aprendizados</div><div class='a'>"+projeto.reprovado.aprendizados+"</div></div>";
    }
    reprov+="</div>";
  }
  const prazoHtml=projeto.prazoLimite?"<div class='mi'><strong>Prazo:</strong> "+new Date(projeto.prazoLimite).toLocaleDateString("pt-BR")+"</div>":"";
  let css="";
  css+="*{margin:0;padding:0;box-sizing:border-box;}";
  css+="body{font-family:Arial,sans-serif;font-size:13px;color:#1a1a1a;padding:40px;max-width:860px;margin:0 auto;}";
  css+="h1{font-size:22px;color:"+cat.cor+";margin-bottom:4px;}";
  css+="h2{font-size:15px;color:"+cat.cor+";margin:24px 0 8px;padding-bottom:4px;border-bottom:2px solid "+cat.cor+"44;}";
  css+="h3{font-size:13px;font-weight:600;margin:10px 0 6px;}";
  css+=".meta{display:flex;gap:20px;margin:10px 0 20px;flex-wrap:wrap;}";
  css+=".mi{font-size:12px;color:#555;}";
  css+=".bloco{background:#f8f8f8;border-left:3px solid "+cat.cor+";padding:10px 14px;margin-bottom:12px;border-radius:0 4px 4px 0;}";
  css+=".qa{margin-bottom:8px;}.q{font-size:11px;color:#666;margin-bottom:1px;}.a{font-size:13px;line-height:1.5;}";
  css+=".tl{display:flex;gap:10px;margin-bottom:6px;}";
  css+=".dot{width:7px;height:7px;border-radius:50%;background:"+cat.cor+";flex-shrink:0;margin-top:3px;}";
  css+=".footer{margin-top:40px;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:10px;}";
  css+=".btn{display:inline-block;margin-bottom:24px;padding:9px 22px;background:"+cat.cor+";color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;}";
  css+="@media print{.btn{display:none;}body{padding:20px;}}";
  let html="<!DOCTYPE html><html><head><meta charset='utf-8'>";
  html+="<title>Relatorio - "+projeto.nome+"</title>";
  html+="<style>"+css+"</style></head><body>";
  html+="<button class='btn' onclick='window.print()'>Salvar como PDF (Ctrl+P)</button>";
  html+="<div style='border-bottom:3px solid "+cat.cor+";padding-bottom:12px;margin-bottom:4px;'>";
  html+="<h1>"+projeto.nome+"</h1>";
  html+="<span style='display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;background:"+cat.cor+"22;color:"+cat.cor+";'>"+cat.label+"</span>";
  html+="</div><div class='meta'>";
  html+="<div class='mi'><strong>Responsavel:</strong> "+(projeto.responsavel||"-")+"</div>";
  html+="<div class='mi'><strong>Inicio:</strong> "+projeto.inicio+"</div>";
  html+="<div class='mi'><strong>TTM:</strong> "+ttm+" meses</div>";
  html+="<div class='mi'><strong>Fonte:</strong> "+(fonte?fonte.label:"-")+"</div>";
  html+="<div class='mi'><strong>Status:</strong> "+status+"</div>";
  html+=prazoHtml+"</div>";
  html+="<h2>Linha do tempo</h2>"+tl;
  html+="<h2>Relatorio por etapa</h2>"+secs+reprov;
  html+="<div class='footer'>Gerado em "+new Date().toLocaleDateString("pt-BR")+" - P&D Formula Animal</div>";
  html+="</body></html>";
  const blob=new Blob([html],{type:"text/html;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download="relatorio-"+projeto.nome.replace(/\s+/g,"-")+".html";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(url);},1000);
}function SBadge({p}){
  const s=statusP(p);if(s==="ok")return null;
  const c={atraso:["#FCEBEB","#A32D2D","Atraso"],atencao:["#FAEEDA","#854F0B","Atencao"],reprovado:["#F3F3F3","#666","Reprovado"]}[s];
  return <span style={{fontSize:11,background:c[0],color:c[1],borderRadius:4,padding:"2px 7px",fontWeight:500}}>{c[2]}</span>;
}
function Bar({pct,cor,h=6}){
  return <div style={{background:"#e0e0e0",borderRadius:4,height:h,overflow:"hidden",flex:1}}>
    <div style={{width:pct+"%",height:"100%",background:cor,borderRadius:4}}/>
  </div>;
}
function PieChart({data,size=110}){
  const cx=size/2,cy=size/2,r=size/2-8;
  const total=data.reduce((a,d)=>a+d.value,0);
  if(!total)return<div style={{width:size,height:size,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#999"}}>Sem dados</div>;
  let angle=-Math.PI/2;
  const slices=data.map(d=>{
    const sw=(d.value/total)*2*Math.PI;
    const x1=cx+r*Math.cos(angle),y1=cy+r*Math.sin(angle);angle+=sw;
    const x2=cx+r*Math.cos(angle),y2=cy+r*Math.sin(angle);
    return{...d,path:"M"+cx+","+cy+" L"+x1+","+y1+" A"+r+","+r+" 0 "+(sw>Math.PI?1:0)+",1 "+x2+","+y2+" Z"};
  });
  return<svg width={size} height={size} viewBox={"0 0 "+size+" "+size} style={{flexShrink:0}}>
    {slices.map((s,i)=><path key={i} d={s.path} fill={s.cor} stroke="#fff" strokeWidth={2}/>)}
    <circle cx={cx} cy={cy} r={r*0.46} fill="#fff"/>
  </svg>;
}
function Fld({label,value}){
  return<div style={{background:"#f5f5f5",borderRadius:6,padding:"8px 12px"}}>
    <p style={{margin:"0 0 2px",fontSize:11,color:"#999"}}>{label}</p>
    <p style={{margin:0,fontWeight:500,fontSize:13}}>{value||"-"}</p>
  </div>;
}
function FormularioEtapa({etapaId,respostas,onChange}){
  const pergs=pergEtapa(etapaId);
  const pct=pctRespostas(respostas,etapaId);
  if(!pergs.length)return<p style={{fontSize:12,color:"#999"}}>Sem perguntas para esta etapa.</p>;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <span style={{fontSize:11,color:"#666"}}>Progresso</span>
        <span style={{fontSize:11,fontWeight:500,color:pct===100?"#3B6D11":"#555"}}>{pct}%</span>
      </div>
      <Bar pct={pct} cor={pct===100?"#1D9E75":"#5E5280"} h={5}/>
      <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:10}}>
        {pergs.map((q,i)=>(
          <div key={i}>
            <label style={{display:"block",fontSize:12,color:"#666",marginBottom:3}}>
              <span style={{color:"#E24B4A",marginRight:3}}>*</span>{q}
            </label>
            <textarea value={respostas[i]||""} onChange={e=>onChange(i,e.target.value)} placeholder="Sua resposta..."
              style={{width:"100%",boxSizing:"border-box",padding:"7px 9px",borderRadius:6,border:"1px solid "+((respostas[i]||"").trim()?"#ccc":"#E24B4A55"),background:"#fafafa",color:"#1a1a1a",fontSize:13,fontFamily:"inherit",minHeight:55,resize:"vertical"}}/>
          </div>
        ))}
      </div>
    </div>
  );
}
function MatrizModal({projeto,onSave,onClose}){
  const CRITERIOS=["Potencial de mercado","Viabilidade tecnica","Viabilidade financeira","Alinhamento com a marca","Complexidade regulatoria","Complexidade operacional"];
  const [scores,setScores]=useState(projeto.matriz||Object.fromEntries(CRITERIOS.map(c=>[c,3])));
  const total=Object.values(scores).reduce((a,b)=>a+b,0);
  const max=CRITERIOS.length*5,pct=Math.round((total/max)*100);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50}}>
      <div style={{background:"#fff",borderRadius:12,padding:"1.5rem",width:440,border:"1px solid #ddd",maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
          <p style={{margin:0,fontWeight:500,fontSize:15}}>Matriz de decisao</p>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#666"}}>x</button>
        </div>
        {CRITERIOS.map(c=>(
          <div key={c} style={{marginBottom:"0.75rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:13,color:"#555"}}>{c}</span>
              <span style={{fontSize:13,fontWeight:500}}>{scores[c]}/5</span>
            </div>
            <div style={{display:"flex",gap:6}}>
              {[1,2,3,4,5].map(v=>(
                <button key={v} onClick={()=>setScores(s=>({...s,[c]:v}))}
                  style={{flex:1,height:28,borderRadius:4,border:"1px solid #ddd",cursor:"pointer",background:scores[c]>=v?"#5E5280":"#f5f5f5",color:scores[c]>=v?"#fff":"#555",fontSize:12,fontWeight:500}}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div style={{margin:"1rem 0",padding:"0.75rem",background:pct>=70?"#EAF3DE":pct>=50?"#FAEEDA":"#FCEBEB",borderRadius:8}}>
          <p style={{margin:0,fontSize:14,fontWeight:500,color:pct>=70?"#3B6D11":pct>=50?"#854F0B":"#A32D2D"}}>
            Score: {total}/{max} ({pct}%) - {pct>=70?"Recomendado":pct>=50?"Com ressalvas":"Nao recomendado"}
          </p>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{padding:"8px 16px",borderRadius:6,border:"1px solid #ddd",background:"#f5f5f5",cursor:"pointer",fontSize:13}}>Cancelar</button>
          <button onClick={()=>onSave(scores)} style={{padding:"8px 16px",borderRadius:6,border:"none",background:"#5E5280",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:500}}>Salvar</button>
        </div>
      </div>
    </div>
  );
}
function RenomearModal({projeto,proximaEtapa,onConfirmar,onClose}){
  const cat=CATEGORIAS[projeto.categoria];
  const [nome,setNome]=useState(projeto.nome);
  const podeConfirmar=nome.trim()&&nome.trim()!==projeto.nome;
  const etLabel=ETAPAS_PRE_DEV.find(e=>e.id===proximaEtapa);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:70}}>
      <div style={{background:"#fff",borderRadius:12,padding:"1.5rem",width:420,border:"1px solid #ddd"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
          <p style={{margin:0,fontWeight:500,fontSize:15}}>Avancar para {etLabel?etLabel.label:proximaEtapa}</p>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#666"}}>x</button>
        </div>
        <p style={{margin:"0 0 0.75rem",fontSize:12,color:"#999"}}>Opcional: refine o nome do projeto antes de avancar.</p>
        <div style={{marginBottom:"0.5rem",padding:"8px 12px",background:cat.cor+"11",borderRadius:6,border:"1px solid "+cat.cor+"33"}}>
          <p style={{margin:"0 0 1px",fontSize:11,color:"#999"}}>Nome atual</p>
          <p style={{margin:0,fontSize:13,color:"#555"}}>{projeto.nome}</p>
        </div>
        <div style={{marginBottom:"1rem"}}>
          <label style={{display:"block",fontSize:12,color:"#555",marginBottom:3}}>Novo nome (opcional)</label>
          <input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Novo nome..."
            style={{width:"100%",boxSizing:"border-box",padding:"7px 9px",borderRadius:6,border:"1px solid #ddd",background:"#fafafa",color:"#1a1a1a",fontSize:14}}/>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{padding:"8px 16px",borderRadius:6,border:"1px solid #ddd",background:"#f5f5f5",cursor:"pointer",fontSize:13}}>Cancelar</button>
          <button onClick={()=>onConfirmar(null)} style={{padding:"8px 16px",borderRadius:6,border:"1px solid #ddd",background:"#f5f5f5",cursor:"pointer",fontSize:13}}>Avancar sem renomear</button>
          <button onClick={()=>podeConfirmar&&onConfirmar(nome.trim())} disabled={!podeConfirmar}
            style={{padding:"8px 16px",borderRadius:6,border:"none",background:podeConfirmar?cat.cor:"#ddd",color:podeConfirmar?"#fff":"#999",cursor:podeConfirmar?"pointer":"default",fontSize:13,fontWeight:500}}>
            Renomear e avancar
          </button>
        </div>
      </div>
    </div>
  );
}
function ReprovacaoModal({projeto,onSalvar,onClose}){
  const [form,setForm]=useState({motivo:"",justificativa:"",reativavel:"talvez",condicao:"",aprendizados:"",aprovadoPor:""});
  const ok=form.motivo&&form.justificativa.trim();
  const s=k=>v=>setForm(f=>({...f,[k]:v}));
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:"1.5rem",zIndex:60}}>
      <div style={{background:"#fff",borderRadius:12,padding:"1.5rem",width:460,border:"1px solid #ddd",maxHeight:"88vh",overflowY:"auto",boxSizing:"border-box"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
          <p style={{margin:0,fontWeight:500,fontSize:15}}>Reprovar: {projeto.nome}</p>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#666"}}>x</button>
        </div>
        <p style={{margin:"0 0 8px",fontSize:12,fontWeight:500,color:"#555"}}>Motivo principal *</p>
        <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:"0.75rem"}}>
          {MOTIVOS_REP.map(m=>(
            <label key={m} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"7px 10px",borderRadius:6,border:"1px solid "+(form.motivo===m?"#E24B4A":"#ddd"),background:form.motivo===m?"#FFF0F0":"#fafafa"}}>
              <input type="radio" name="motivo" checked={form.motivo===m} onChange={()=>s("motivo")(m)} style={{accentColor:"#E24B4A"}}/>
              <span style={{fontSize:13}}>{m}</span>
            </label>
          ))}
        </div>
        <div style={{marginBottom:"0.75rem"}}>
          <label style={{display:"block",fontSize:12,color:"#555",marginBottom:3}}>Justificativa *</label>
          <textarea value={form.justificativa} onChange={e=>s("justificativa")(e.target.value)} placeholder="Descreva os motivos..."
            style={{width:"100%",boxSizing:"border-box",padding:"7px 9px",borderRadius:6,border:"1px solid #ddd",background:"#fafafa",color:"#1a1a1a",fontSize:13,fontFamily:"inherit",minHeight:60,resize:"vertical"}}/>
        </div>
        <p style={{margin:"0 0 6px",fontSize:12,fontWeight:500,color:"#555"}}>Pode ser reativado?</p>
        <div style={{display:"flex",gap:8,marginBottom:"0.75rem"}}>
          {[["sim","Sim"],["nao","Nao"],["talvez","Talvez"]].map(([v,l])=>(
            <label key={v} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",padding:"6px 12px",borderRadius:6,border:"1px solid "+(form.reativavel===v?"#5E5280":"#ddd"),background:form.reativavel===v?"#EEEDFE":"#fafafa",flex:1,justifyContent:"center"}}>
              <input type="radio" name="reativavel" checked={form.reativavel===v} onChange={()=>s("reativavel")(v)} style={{accentColor:"#5E5280"}}/>
              <span style={{fontSize:13}}>{l}</span>
            </label>
          ))}
        </div>
        {(form.reativavel==="sim"||form.reativavel==="talvez")&&(
          <div style={{marginBottom:"0.75rem"}}>
            <label style={{display:"block",fontSize:12,color:"#555",marginBottom:3}}>Condicao para reativacao</label>
            <input value={form.condicao} onChange={e=>s("condicao")(e.target.value)} placeholder="Ex: quando houver MP disponivel no Brasil"
              style={{width:"100%",boxSizing:"border-box",padding:"7px 9px",borderRadius:6,border:"1px solid #ddd",background:"#fafafa",color:"#1a1a1a",fontSize:13}}/>
          </div>
        )}
        <div style={{marginBottom:"0.75rem"}}>
          <label style={{display:"block",fontSize:12,color:"#555",marginBottom:3}}>Aprendizados</label>
          <textarea value={form.aprendizados} onChange={e=>s("aprendizados")(e.target.value)} placeholder="O que esse projeto ensinou?"
            style={{width:"100%",boxSizing:"border-box",padding:"7px 9px",borderRadius:6,border:"1px solid #ddd",background:"#fafafa",color:"#1a1a1a",fontSize:13,fontFamily:"inherit",minHeight:55,resize:"vertical"}}/>
        </div>
        <div style={{marginBottom:"1rem"}}>
          <label style={{display:"block",fontSize:12,color:"#555",marginBottom:3}}>Aprovado por</label>
          <input value={form.aprovadoPor} onChange={e=>s("aprovadoPor")(e.target.value)} placeholder="Nome de quem aprovou"
            style={{width:"100%",boxSizing:"border-box",padding:"7px 9px",borderRadius:6,border:"1px solid #ddd",background:"#fafafa",color:"#1a1a1a",fontSize:13}}/>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{padding:"8px 16px",borderRadius:6,border:"1px solid #ddd",background:"#f5f5f5",cursor:"pointer",fontSize:13}}>Cancelar</button>
          <button onClick={()=>ok&&onSalvar(form)} disabled={!ok}
            style={{padding:"8px 16px",borderRadius:6,border:"none",background:ok?"#E24B4A":"#ddd",color:ok?"#fff":"#999",cursor:ok?"pointer":"default",fontSize:13,fontWeight:500}}>
            Confirmar reprovacao
          </button>
        </div>
      </div>
    </div>
  );
}
function TrilhoModal({projeto,onEscolha,onClose}){
  const [escolha,setEscolha]=useState(null);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:60}}>
      <div style={{background:"#fff",borderRadius:12,padding:"1.5rem",width:420,border:"1px solid #ddd"}}>
        <p style={{margin:"0 0 4px",fontWeight:500,fontSize:15}}>Escolha o trilho de desenvolvimento</p>
        <p style={{margin:"0 0 1rem",fontSize:13,color:"#999"}}>Projeto Equino - qual trilho ele vai seguir?</p>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:"1.25rem"}}>
          {Object.entries(TRILHOS_DEV).map(([k,v])=>(
            <label key={k} style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",padding:"10px 14px",borderRadius:6,border:"1px solid "+(escolha===k?"#BA7517":"#ddd"),background:escolha===k?"#FAEEDA":"#fafafa"}}>
              <input type="radio" name="trilho" checked={escolha===k} onChange={()=>setEscolha(k)} style={{marginTop:2,accentColor:"#BA7517"}}/>
              <div>
                <p style={{margin:"0 0 2px",fontSize:13,fontWeight:500}}>{v.label}</p>
                <p style={{margin:0,fontSize:11,color:"#999"}}>{v.etapas.slice(0,4).map(e=>e.label).join(" > ")}...</p>
              </div>
            </label>
          ))}
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{padding:"8px 16px",borderRadius:6,border:"1px solid #ddd",background:"#f5f5f5",cursor:"pointer",fontSize:13}}>Cancelar</button>
          <button onClick={()=>escolha&&onEscolha(escolha)} disabled={!escolha}
            style={{padding:"8px 16px",borderRadius:6,border:"none",background:escolha?"#5E5280":"#ddd",color:escolha?"#fff":"#999",cursor:escolha?"pointer":"default",fontSize:13,fontWeight:500}}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
function NovoProjetoModal({onSave,onClose}){
  const [form,setForm]=useState({nome:"",categoria:"manipulacao",responsavel:"",fonte:"",prazoLimite:""});
  const ok=form.nome.trim();
  const s=k=>v=>setForm(f=>({...f,[k]:v}));
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:"1.5rem",zIndex:50}}>
      <div style={{background:"#fff",borderRadius:12,padding:"1.5rem",width:440,border:"1px solid #ddd",maxHeight:"88vh",overflowY:"auto",boxSizing:"border-box"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
          <p style={{margin:0,fontWeight:500,fontSize:15}}>Novo projeto</p>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#666"}}>x</button>
        </div>
        {[["Nome inicial do projeto","nome","text","Ex: Novidade para oftalmico"],["Responsavel","responsavel","text","Nome do responsavel"]].map(([l,f,t,ph])=>(
          <div key={f} style={{marginBottom:"0.75rem"}}>
            <label style={{display:"block",fontSize:12,color:"#555",marginBottom:3}}>{l}</label>
            <input type={t} value={form[f]} onChange={e=>s(f)(e.target.value)} placeholder={ph}
              style={{width:"100%",boxSizing:"border-box",padding:"7px 9px",borderRadius:6,border:"1px solid #ddd",background:"#fafafa",color:"#1a1a1a",fontSize:14}}/>
          </div>
        ))}
        <div style={{marginBottom:"0.75rem"}}>
          <label style={{display:"block",fontSize:12,color:"#555",marginBottom:3}}>Prazo limite</label>
          <input type="date" value={form.prazoLimite} onChange={e=>s("prazoLimite")(e.target.value)}
            style={{width:"100%",boxSizing:"border-box",padding:"7px 9px",borderRadius:6,border:"1px solid #ddd",background:"#fafafa",color:"#1a1a1a",fontSize:14}}/>
        </div>
        <div style={{marginBottom:"0.75rem"}}>
          <label style={{display:"block",fontSize:12,color:"#555",marginBottom:3}}>Fonte da demanda</label>
          <select value={form.fonte} onChange={e=>s("fonte")(e.target.value)}
            style={{width:"100%",padding:"7px 9px",borderRadius:6,border:"1px solid #ddd",background:"#fafafa",color:"#1a1a1a",fontSize:13}}>
            <option value="">Selecionar fonte...</option>
            {FONTES.map(f=><option key={f.id} value={f.id}>{f.label}{f.continuo?" (continua)":""}</option>)}
          </select>
        </div>
        <div style={{marginBottom:"1.25rem"}}>
          <label style={{display:"block",fontSize:12,color:"#555",marginBottom:6}}>Categoria</label>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {Object.entries(CATEGORIAS).map(([k,v])=>(
              <label key={k} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"8px 12px",borderRadius:6,border:"1px solid "+(form.categoria===k?v.cor:"#ddd"),background:form.categoria===k?v.cor+"18":"#fafafa"}}>
                <input type="radio" name="cat" checked={form.categoria===k} onChange={()=>s("categoria")(k)} style={{accentColor:v.cor}}/>
                <span style={{fontSize:13,fontWeight:form.categoria===k?500:400}}>{v.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{padding:"8px 16px",borderRadius:6,border:"1px solid #ddd",background:"#f5f5f5",cursor:"pointer",fontSize:13}}>Cancelar</button>
          <button onClick={()=>ok&&onSave(form)} disabled={!ok}
            style={{padding:"8px 16px",borderRadius:6,border:"none",background:ok?"#5E5280":"#ddd",color:ok?"#fff":"#999",cursor:ok?"pointer":"default",fontSize:13,fontWeight:500}}>
            Criar projeto
          </button>
        </div>
      </div>
    </div>
  );
}function SidePanel({projeto,onClose,onMover,onAbrirMatriz,onEscolherTrilho,onExcluir,onAtualizar,onReprovar,onReativar}){
  const cat=CATEGORIAS[projeto.categoria];
  const todas=etapasCompletas(projeto.trilhoDev);
  const idxAtual=todas.findIndex(e=>e.id===projeto.etapa);
  const etAtual=todas[idxAtual];
  const proxima=todas[idxAtual+1];
  const prog=progProjeto(projeto);
  const ttm=mesesDesde(projeto.inicio);
  const trilho=projeto.trilhoDev?TRILHOS_DEV[projeto.trilhoDev]:null;
  const precisaTrilho=proxima&&!PRE_IDS.includes(proxima.id)&&proxima.id!=="implantacao"&&proxima.id!=="concluido"&&!projeto.trilhoDev;
  const [aba,setAba]=useState("jornada");
  const [editNome,setEditNome]=useState(false);
  const [nomeTemp,setNomeTemp]=useState(projeto.nome);
  const [editDet,setEditDet]=useState(false);
  const [form,setForm]=useState({responsavel:projeto.responsavel||"",fonte:projeto.fonte||"",prazoLimite:projeto.prazoLimite||""});
  const podeEditNome=ETAPAS_NOME_EDIT.includes(projeto.etapa)&&!projeto.reprovado;
  const diasP=projeto.prazoLimite?Math.floor((new Date(projeto.prazoLimite)-new Date(TODAY))/(1000*60*60*24)):null;
  const resps=projeto.formRespostas&&projeto.formRespostas[projeto.etapa]?projeto.formRespostas[projeto.etapa]:{};
  const pctAtual=pctRespostas(resps,projeto.etapa);
  const concluida=etapaConcluida(resps,projeto.etapa);

  function salvarNome(){if(nomeTemp.trim())onAtualizar(projeto.id,{nome:nomeTemp.trim()});setEditNome(false);}
  function salvarDet(){onAtualizar(projeto.id,form);setEditDet(false);}
  function handleResp(i,v){
    const nr={...resps,[i]:v};
    const nf=Object.assign({},projeto.formRespostas,{[projeto.etapa]:nr});
    onAtualizar(projeto.id,{formRespostas:nf});
  }

  return(
    <div style={{width:330,flexShrink:0,background:"#f9f9f9",borderLeft:"1px solid #e0e0e0",display:"flex",flexDirection:"column",overflowY:"auto"}}>
      <div style={{padding:"1rem",borderBottom:"1px solid #e0e0e0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
          <div style={{flex:1,marginRight:8}}>
            {editNome?(
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <input value={nomeTemp} onChange={e=>setNomeTemp(e.target.value)} autoFocus
                  style={{flex:1,padding:"4px 8px",borderRadius:6,border:"1px solid "+cat.cor,background:"#fff",color:"#1a1a1a",fontSize:14,fontWeight:500}}/>
                <button onClick={salvarNome} style={{padding:"4px 8px",borderRadius:6,border:"none",background:cat.cor,color:"#fff",cursor:"pointer",fontSize:12}}>OK</button>
                <button onClick={()=>{setEditNome(false);setNomeTemp(projeto.nome);}} style={{padding:"4px 8px",borderRadius:6,border:"1px solid #ddd",background:"transparent",cursor:"pointer",fontSize:12}}>X</button>
              </div>
            ):(
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <p style={{margin:0,fontWeight:500,fontSize:14,lineHeight:1.3}}>{projeto.nome}</p>
                {podeEditNome&&<button onClick={()=>{setEditNome(true);setNomeTemp(projeto.nome);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#999",padding:0}}>edit</button>}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"#666",fontSize:20,lineHeight:1,padding:0,flexShrink:0}}>x</button>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          <span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:cat.cor+"22",color:cat.cor,fontWeight:500}}>{cat.short}</span>
          {trilho&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:"#f0f0f0",color:"#666",border:"1px solid #ddd"}}>{trilho.label}</span>}
          {projeto.reprovado&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:"#F3F3F3",color:"#666",fontWeight:500}}>Reprovado</span>}
        </div>
      </div>
      <div style={{padding:"0.75rem 1rem",borderBottom:"1px solid #e0e0e0"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{fontSize:11,color:"#999"}}>Progresso do projeto</span>
          <span style={{fontSize:12,fontWeight:500}}>{prog}%</span>
        </div>
        <Bar pct={prog} cor={projeto.reprovado?"#ccc":cat.cor} h={6}/>
        {projeto.prazoLimite&&!projeto.reprovado&&(
          <div style={{marginTop:7,padding:"5px 9px",borderRadius:6,background:diasP<0?"#FCEBEB":diasP<30?"#FAEEDA":"#EAF3DE"}}>
            <p style={{margin:0,fontSize:11,fontWeight:500,color:diasP<0?"#A32D2D":diasP<30?"#854F0B":"#3B6D11"}}>
              {diasP<0?"Prazo vencido ha "+Math.abs(diasP)+" dias":diasP===0?"Prazo: hoje":diasP+" dias restantes"}
            </p>
          </div>
        )}
      </div>
      {!projeto.reprovado&&(
        <div style={{display:"flex",borderBottom:"1px solid #e0e0e0"}}>
          {[["jornada","Jornada"],["formulario","Form"+(pctAtual<100?" ("+pctAtual+"%)":"")],["detalhes","Detalhes"]].map(([k,l])=>(
            <button key={k} onClick={()=>setAba(k)}
              style={{flex:1,padding:"8px 4px",border:"none",background:"transparent",cursor:"pointer",fontSize:11,fontWeight:aba===k?500:400,color:aba===k?cat.cor:"#666",borderBottom:aba===k?"2px solid "+cat.cor:"2px solid transparent"}}>
              {l}
            </button>
          ))}
        </div>
      )}
      <div style={{flex:1,overflowY:"auto",padding:"1rem"}}>
        {projeto.reprovado?(
          <div>
            <p style={{margin:"0 0 10px",fontSize:12,fontWeight:500,color:"#555"}}>Registro de reprovacao</p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <Fld label="Etapa" value={todas.find(e=>e.id===projeto.reprovado.etapa)?todas.find(e=>e.id===projeto.reprovado.etapa).label:projeto.reprovado.etapa}/>
              <Fld label="Data" value={projeto.reprovado.data}/>
              <Fld label="Motivo" value={projeto.reprovado.motivo}/>
              <div style={{background:"#f5f5f5",borderRadius:6,padding:"8px 12px"}}>
                <p style={{margin:"0 0 2px",fontSize:11,color:"#999"}}>Justificativa</p>
                <p style={{margin:0,fontSize:13,lineHeight:1.5}}>{projeto.reprovado.justificativa||"-"}</p>
              </div>
              <Fld label="Reativavel?" value={projeto.reprovado.reativavel==="sim"?"Sim":projeto.reprovado.reativavel==="nao"?"Nao":"Talvez"}/>
              {projeto.reprovado.condicao&&<Fld label="Condicao" value={projeto.reprovado.condicao}/>}
              {projeto.reprovado.aprendizados&&<div style={{background:"#f5f5f5",borderRadius:6,padding:"8px 12px"}}><p style={{margin:"0 0 2px",fontSize:11,color:"#999"}}>Aprendizados</p><p style={{margin:0,fontSize:13,lineHeight:1.5}}>{projeto.reprovado.aprendizados}</p></div>}
              {projeto.reprovado.aprovadoPor&&<Fld label="Aprovado por" value={projeto.reprovado.aprovadoPor}/>}
            </div>
            {projeto.reprovado.reativavel!=="nao"&&(
              <button onClick={()=>onReativar(projeto.id)} style={{marginTop:16,width:"100%",padding:"8px",borderRadius:6,border:"1px solid #1D9E75",background:"transparent",color:"#1D9E75",cursor:"pointer",fontSize:13,fontWeight:500}}>Reativar projeto</button>
            )}
          </div>
        ):aba==="jornada"?(
          <div>
            <p style={{margin:"0 0 8px",fontSize:10,fontWeight:500,color:"#999",textTransform:"uppercase",letterSpacing:"0.05em"}}>Pre-desenvolvimento</p>
            {ETAPAS_PRE_DEV.map(e=>{
              const passada=PRE_IDS.indexOf(e.id)<PRE_IDS.indexOf(projeto.etapa)||(!PRE_IDS.includes(projeto.etapa));
              const atual=projeto.etapa===e.id;
              const entrada=projeto.historico.find(h=>h.etapa===e.id);
              const m=entrada?mesesNaEtapa(projeto.historico,e.id):null;
              const r=projeto.formRespostas&&projeto.formRespostas[e.id]?projeto.formRespostas[e.id]:{};
              const pct=pctRespostas(r,e.id);
              return(
                <div key={e.id} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:7,opacity:(!passada&&!atual)?0.3:1}}>
                  <div style={{marginTop:4,width:7,height:7,borderRadius:"50%",flexShrink:0,background:atual?cat.cor:passada?"#1D9E75":"#ccc"}}/>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <p style={{margin:0,fontSize:12,fontWeight:atual?500:400,color:atual?"#1a1a1a":"#555"}}>{e.label}</p>
                      {(passada||atual)&&pergEtapa(e.id).length>0&&<span style={{fontSize:10,color:pct===100?"#3B6D11":"#854F0B",fontWeight:500}}>{pct}%</span>}
                    </div>
                    {entrada&&<p style={{margin:"1px 0 0",fontSize:10,color:"#999"}}>{entrada.data}{m&&m>0?" - "+m+"m":""}</p>}
                  </div>
                  {atual&&<SBadge p={projeto}/>}
                </div>
              );
            })}
            {trilho&&(
              <>
                <p style={{margin:"12px 0 8px",fontSize:10,fontWeight:500,color:cat.cor,textTransform:"uppercase",letterSpacing:"0.05em"}}>Desenvolvimento - {trilho.label}</p>
                <div style={{paddingLeft:10,borderLeft:"2px solid "+cat.cor+"33"}}>
                  {trilho.etapas.map(e=>{
                    const entrada=projeto.historico.find(h=>h.etapa===e.id);
                    const atual=projeto.etapa===e.id;
                    const m=entrada?mesesNaEtapa(projeto.historico,e.id):null;
                    const r=projeto.formRespostas&&projeto.formRespostas[e.id]?projeto.formRespostas[e.id]:{};
                    const pct=pctRespostas(r,e.id);
                    return(
                      <div key={e.id} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:7,opacity:(!entrada&&!atual)?0.3:1}}>
                        <div style={{marginTop:4,width:7,height:7,borderRadius:"50%",flexShrink:0,background:atual?cat.cor:entrada?"#1D9E75":"#ccc"}}/>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <p style={{margin:0,fontSize:12,fontWeight:atual?500:400,color:atual?"#1a1a1a":"#555"}}>{e.label}</p>
                            {(!!entrada||atual)&&pergEtapa(e.id).length>0&&<span style={{fontSize:10,color:pct===100?"#3B6D11":"#854F0B",fontWeight:500}}>{pct}%</span>}
                          </div>
                          {entrada&&<p style={{margin:"1px 0 0",fontSize:10,color:"#999"}}>{entrada.data}{m&&m>0?" - "+m+"m":""}</p>}
                        </div>
                        {atual&&<SBadge p={projeto}/>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,opacity:["implantacao","concluido"].includes(projeto.etapa)?1:0.3}}>
              <div style={{width:7,height:7,borderRadius:"50%",flexShrink:0,background:projeto.etapa==="concluido"?"#1D9E75":projeto.etapa==="implantacao"?cat.cor:"#ccc"}}/>
              <p style={{margin:0,fontSize:12,color:"#555"}}>Implantacao / Concluido</p>
            </div>
          </div>
        ):aba==="formulario"?(
          <div>
            <p style={{margin:"0 0 10px",fontSize:12,fontWeight:500,color:"#555"}}>Etapa: <strong>{etAtual?etAtual.label:""}</strong></p>
            <FormularioEtapa etapaId={projeto.etapa} respostas={resps} onChange={handleResp}/>
            {concluida&&<div style={{padding:"8px 12px",background:"#EAF3DE",borderRadius:6,marginTop:8}}><p style={{margin:0,fontSize:12,color:"#3B6D11",fontWeight:500}}>Todas as perguntas respondidas</p></div>}
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <p style={{margin:0,fontSize:12,fontWeight:500,color:"#555"}}>Detalhes</p>
              <button onClick={()=>setEditDet(!editDet)} style={{fontSize:11,padding:"2px 8px",borderRadius:4,border:"1px solid #ddd",background:"transparent",cursor:"pointer",color:"#666"}}>{editDet?"Cancelar":"Editar"}</button>
            </div>
            {editDet?(
              <div>
                {[["Responsavel","responsavel","text"],["Prazo limite","prazoLimite","date"]].map(([l,f,t])=>(
                  <div key={f} style={{marginBottom:"0.75rem"}}>
                    <label style={{display:"block",fontSize:12,color:"#555",marginBottom:3}}>{l}</label>
                    <input type={t} value={form[f]} onChange={e=>setForm(ff=>({...ff,[f]:e.target.value}))}
                      style={{width:"100%",boxSizing:"border-box",padding:"6px 8px",borderRadius:6,border:"1px solid #ddd",background:"#fafafa",color:"#1a1a1a",fontSize:13}}/>
                  </div>
                ))}
                <div style={{marginBottom:"0.75rem"}}>
                  <label style={{display:"block",fontSize:12,color:"#555",marginBottom:3}}>Fonte</label>
                  <select value={form.fonte} onChange={e=>setForm(f=>({...f,fonte:e.target.value}))}
                    style={{width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid #ddd",background:"#fafafa",color:"#1a1a1a",fontSize:13}}>
                    <option value="">Selecionar...</option>
                    {FONTES.map(f=><option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </div>
                <button onClick={salvarDet} style={{padding:"7px 14px",borderRadius:6,border:"none",background:"#5E5280",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:500}}>Salvar</button>
              </div>
            ):(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                <Fld label="Responsavel" value={projeto.responsavel}/>
                <Fld label="Fonte" value={FONTES.find(f=>f.id===projeto.fonte)?FONTES.find(f=>f.id===projeto.fonte).label:""}/>
                <Fld label="TTM atual" value={ttm+" meses"}/>
                <Fld label="Etapa atual" value={etAtual?etAtual.label:""}/>
              </div>
            )}
          </div>
        )}
      </div>
      {!projeto.reprovado&&(
        <div style={{padding:"1rem",borderTop:"1px solid #e0e0e0",display:"flex",flexDirection:"column",gap:7}}>
          {etAtual&&etAtual.gate&&(
            <button onClick={()=>onAbrirMatriz(projeto)}
              style={{padding:"8px",borderRadius:6,border:"1px solid "+cat.cor,background:"transparent",color:cat.cor,cursor:"pointer",fontSize:13,fontWeight:500}}>
              Preencher matriz de decisao
            </button>
          )}
          {proxima&&projeto.etapa!=="concluido"&&(
            <button onClick={()=>{
              if(!concluida&&pergEtapa(projeto.etapa).length>0){
                alert("Preencha todas as informacoes obrigatorias antes de avancar de etapa.");return;
              }
              onMover(projeto,proxima.id);
            }}
              style={{padding:"8px",borderRadius:6,border:"none",background:(concluida||!pergEtapa(projeto.etapa).length)?"#5E5280":"#aaa",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:500}}>
              {precisaTrilho?"Definir trilho e avancar":"Avancar: "+proxima.label}
            </button>
          )}
          <button onClick={()=>gerarRelatorio(projeto)}
            style={{padding:"8px",borderRadius:6,border:"1px solid #185FA5",background:"transparent",color:"#185FA5",cursor:"pointer",fontSize:13}}>
            Gerar relatorio (HTML)
          </button>
          <button onClick={()=>onReprovar(projeto)}
            style={{padding:"8px",borderRadius:6,border:"1px solid #E24B4A",background:"transparent",color:"#E24B4A",cursor:"pointer",fontSize:13}}>
            Reprovar projeto
          </button>
          <button onClick={()=>onExcluir(projeto.id)}
            style={{padding:"8px",borderRadius:6,border:"1px solid #ddd",background:"transparent",color:"#999",cursor:"pointer",fontSize:12}}>
            Excluir permanentemente
          </button>
        </div>
      )}
    </div>
  );
}function ViewCronograma(){
  const CICLOS=[
    {id:"q1",periodo:"1o Trimestre",meses:"Jul - Set 2026",cor:"#5E5280",atividades:[
      {tipo:"trimestral",label:"Sprint de ideacao",itens:["Analise de literatura e novos ativos","Pesquisa de mercado e concorrencia","Entrevista com veterinario de referencia (~5h)","Reuniao com Laboratorio/Producao (~2h)"]},
    ]},
    {id:"q2",periodo:"2o Trimestre",meses:"Out - Dez 2026",cor:"#185FA5",atividades:[
      {tipo:"trimestral",label:"Sprint de ideacao",itens:["Analise de literatura e novos ativos","Pesquisa de mercado e concorrencia","Entrevista com veterinario de referencia (~5h)","Reuniao com Laboratorio/Producao (~2h)"]},
      {tipo:"semestral",label:"Imersao de campo",itens:["Visita a franqueados-chave (~15h)","Acompanhamento do time VetExpress (~12h)","Sintese e triagem de demandas coletadas"]},
      {tipo:"pontual",label:"Setores administrativos",itens:["Reuniao com RH (~1,5h)","Reuniao com Financeiro (~1,5h)"]},
    ]},
    {id:"q3",periodo:"3o Trimestre",meses:"Jan - Mar 2027",cor:"#1D9E75",atividades:[
      {tipo:"trimestral",label:"Sprint de ideacao",itens:["Analise de literatura e novos ativos","Pesquisa de mercado e concorrencia","Entrevista com veterinario de referencia (~5h)","Reuniao com Laboratorio/Producao (~2h)"]},
    ]},
    {id:"q4",periodo:"4o Trimestre",meses:"Abr - Jun 2027",cor:"#BA7517",atividades:[
      {tipo:"trimestral",label:"Sprint de ideacao",itens:["Analise de literatura e novos ativos","Pesquisa de mercado e concorrencia","Entrevista com veterinario de referencia (~5h)","Reuniao com Laboratorio/Producao (~2h)"]},
      {tipo:"semestral",label:"Imersao de campo",itens:["Visita a franqueados-chave (~15h)","Acompanhamento do time VetExpress (~12h)","Sintese e triagem de demandas coletadas"]},
      {tipo:"pontual",label:"Setores administrativos",itens:["Reuniao com RH (~1,5h)","Reuniao com Financeiro (~1,5h)"]},
    ]},
  ];
  const TIPO_COR={trimestral:["#5E528022","#5E5280"],semestral:["#185FA522","#185FA5"],pontual:["#99355622","#993556"]};
  const TIPO_LABEL={trimestral:"Trimestral",semestral:"Semestral",pontual:"Semestral - pontual"};
  const [cl,setCl]=useState({});
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{background:"#f0eeff",border:"1px solid #5E528033",borderRadius:10,padding:"12px 16px"}}>
        <p style={{margin:"0 0 2px",fontWeight:500,fontSize:13,color:"#5E5280"}}>Pesquisa de literatura e mercado - Continuo</p>
        <p style={{margin:0,fontSize:12,color:"#555"}}>Leitura recorrente ao longo de todo o ano, integrada a rotina do time P&D.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {CICLOS.map(ciclo=>(
          <div key={ciclo.id} style={{background:"#fff",borderRadius:12,border:"1px solid #e0e0e0",overflow:"hidden"}}>
            <div style={{background:ciclo.cor,padding:"10px 14px"}}>
              <p style={{margin:"0 0 1px",fontWeight:500,fontSize:14,color:"#fff"}}>{ciclo.periodo}</p>
              <p style={{margin:0,fontSize:11,color:"#ffffff99"}}>{ciclo.meses}</p>
            </div>
            <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:14}}>
              {ciclo.atividades.map((at,ai)=>{
                const [bg,cor]=TIPO_COR[at.tipo];
                return(
                  <div key={ai}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <div style={{width:20,height:20,borderRadius:4,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:cor,fontWeight:600}}>{at.tipo[0].toUpperCase()}</div>
                      <div>
                        <p style={{margin:"0 0 2px",fontWeight:500,fontSize:13}}>{at.label}</p>
                        <span style={{fontSize:10,padding:"1px 6px",borderRadius:10,background:bg,color:cor,fontWeight:500}}>{TIPO_LABEL[at.tipo]}</span>
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:5}}>
                      {at.itens.map((item,ii)=>{
                        const k=ciclo.id+"-"+ai+"-"+ii,checked=!!cl[k];
                        return(
                          <label key={ii} style={{display:"flex",alignItems:"flex-start",gap:8,cursor:"pointer"}}>
                            <input type="checkbox" checked={checked} onChange={()=>setCl(c=>({...c,[k]:!c[k]}))} style={{accentColor:ciclo.cor,width:13,height:13,flexShrink:0,marginTop:2}}/>
                            <span style={{fontSize:12,color:checked?"#aaa":"#555",textDecoration:checked?"line-through":"none",lineHeight:1.4}}>{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div style={{background:"#fff",borderRadius:10,padding:"12px 16px",border:"1px solid #e0e0e0"}}>
        <p style={{margin:"0 0 8px",fontWeight:500,fontSize:13}}>Distribuicao de fontes de demanda</p>
        {[["Franqueados","25%","#5E5280"],["Veterinarios","20%","#185FA5"],["Visitadores","20%","#1D9E75"],["Setores operacionais","20%","#D85A30"],["Setores administrativos","15%","#993556"]].map(([l,p,c])=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
            <span style={{fontSize:12,color:"#555",width:170,flexShrink:0}}>{l}</span>
            <div style={{flex:1,background:"#e0e0e0",borderRadius:4,height:6,overflow:"hidden"}}><div style={{width:p,height:"100%",background:c,borderRadius:4}}/></div>
            <span style={{fontSize:12,fontWeight:500,width:36,textAlign:"right"}}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ViewCalendario({projetos}){
  const hoje=new Date(TODAY);
  const [mes,setMes]=useState(hoje.getMonth());
  const [ano,setAno]=useState(hoje.getFullYear());
  const MESES=["Janeiro","Fevereiro","Marco","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const DIAS=["Dom","Seg","Ter","Qua","Qui","Sex","Sab"];
  function nav(d){let m=mes+d,a=ano;if(m>11){m=0;a++;}if(m<0){m=11;a--;}setMes(m);setAno(a);}
  const primo=new Date(ano,mes,1).getDay();
  const dims=new Date(ano,mes+1,0).getDate();
  const porDia={};
  projetos.filter(p=>p.prazoLimite&&!p.reprovado).forEach(p=>{
    const d=new Date(p.prazoLimite);
    if(d.getMonth()===mes&&d.getFullYear()===ano){const dia=d.getDate();if(!porDia[dia])porDia[dia]=[];porDia[dia].push(p);}
  });
  const celulas=Array(primo).fill(null).concat(Array.from({length:dims},(_,i)=>i+1));
  while(celulas.length%7!==0)celulas.push(null);
  const todos=projetos.filter(p=>p.prazoLimite&&!p.reprovado).sort((a,b)=>new Date(a.prazoLimite)-new Date(b.prazoLimite));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={()=>nav(-1)} style={{padding:"6px 12px",borderRadius:6,border:"1px solid #ddd",background:"#fff",cursor:"pointer",fontSize:14}}>{"<"}</button>
        <p style={{margin:0,fontWeight:500,fontSize:15}}>{MESES[mes]} {ano}</p>
        <button onClick={()=>nav(1)} style={{padding:"6px 12px",borderRadius:6,border:"1px solid #ddd",background:"#fff",cursor:"pointer",fontSize:14}}>{">"}</button>
      </div>
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #e0e0e0",overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:"1px solid #e0e0e0"}}>
          {DIAS.map(d=><div key={d} style={{padding:"8px 4px",textAlign:"center",fontSize:11,fontWeight:500,color:"#999"}}>{d}</div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
          {celulas.map((dia,i)=>{
            const isHoje=dia&&dia===hoje.getDate()&&mes===hoje.getMonth()&&ano===hoje.getFullYear();
            const pjs=dia?(porDia[dia]||[]):[];
            return(
              <div key={i} style={{minHeight:68,padding:"5px 4px",borderRight:i%7!==6?"1px solid #e0e0e0":undefined,borderBottom:i<celulas.length-7?"1px solid #e0e0e0":undefined,background:isHoje?"#EEEDFE":undefined}}>
                {dia&&(<>
                  <p style={{margin:"0 0 3px",fontSize:11,fontWeight:isHoje?500:400,color:isHoje?"#534AB7":"#555",textAlign:"right"}}>{dia}</p>
                  {pjs.map(p=>{const cat=CATEGORIAS[p.categoria];return(
                    <div key={p.id} style={{background:cat.cor,borderRadius:3,padding:"2px 4px",marginBottom:2}}>
                      <p style={{margin:0,fontSize:9,color:"#fff",fontWeight:500,lineHeight:1.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.nome}</p>
                    </div>
                  );})}
                </>)}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:12,padding:"1rem",border:"1px solid #e0e0e0"}}>
        <p style={{margin:"0 0 10px",fontWeight:500,fontSize:13}}>Todos os prazos</p>
        {todos.length===0?<p style={{margin:0,fontSize:13,color:"#999"}}>Nenhum projeto com prazo definido.</p>:(
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {todos.map(p=>{
              const cat=CATEGORIAS[p.categoria];
              const d=new Date(p.prazoLimite);
              const dias=Math.floor((d-new Date(TODAY))/(1000*60*60*24));
              const cor=dias<0?"#A32D2D":dias<30?"#854F0B":"#3B6D11";
              const bg=dias<0?"#FCEBEB":dias<30?"#FAEEDA":"#EAF3DE";
              return(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:"#f9f9f9",borderRadius:6,border:"1px solid #e0e0e0",borderLeftWidth:3,borderLeftColor:cat.cor,borderLeftStyle:"solid"}}>
                  <div style={{flex:1}}>
                    <p style={{margin:"0 0 2px",fontSize:13,fontWeight:500}}>{p.nome}</p>
                    <p style={{margin:0,fontSize:11,color:"#999"}}>{cat.label}</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <p style={{margin:"0 0 2px",fontSize:12,fontWeight:500}}>{d.toLocaleDateString("pt-BR")}</p>
                    <span style={{fontSize:11,padding:"1px 7px",borderRadius:4,background:bg,color:cor,fontWeight:500}}>{dias<0?"Vencido ha "+Math.abs(dias)+"d":dias===0?"Hoje":dias+" dias"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ViewMatrizInovacao(){
  const [notas,setNotas]=useState({impacto:0,complexidade:0,regulatorio:0});
  const [inov,setInov]=useState({nov_tec:0,nov_emp:0,nov_mer:0,mud_proc:0});
  const [res,setRes]=useState(null);
  const OPTS={
    nov_tec:[{v:0,l:"Ja dominado"},{v:2,l:"Adaptacao leve"},{v:3,l:"Nova combinacao"},{v:5,l:"Tecnologia nova"}],
    nov_emp:[{v:0,l:"Rotina"},{v:2,l:"Pouco explorado"},{v:3,l:"Novo para a empresa"},{v:5,l:"Completamente novo"}],
    nov_mer:[{v:0,l:"Comum"},{v:2,l:"Conhecido"},{v:3,l:"Pouco explorado"},{v:5,l:"Inovador/diferencial"}],
    mud_proc:[{v:0,l:"Nenhuma"},{v:2,l:"Leve"},{v:3,l:"Relevante"},{v:5,l:"Disruptiva"}],
  };
  const LBLS={nov_tec:"Novidade tecnica",nov_emp:"Novidade para a empresa",nov_mer:"Novidade para o mercado",mud_proc:"Mudanca de processo"};
  function calcular(){
    const {impacto,complexidade,regulatorio}=notas;
    if(!impacto||!complexidade||!regulatorio){alert("Preencha todas as notas.");return;}
    const score=parseFloat((Object.values(inov).reduce((a,b)=>a+b,0)/4).toFixed(2));
    let cls="",just="";
    if(complexidade>=4||regulatorio>=4||(impacto>=4&&score>=3.5)){cls="Pipeline PID";just=complexidade>=4?"Complexidade tecnica elevada.":regulatorio>=4?"Risco regulatorio alto.":"Alto impacto + alta inovacao.";}
    else if(impacto<=2){cls="Backlog";just="Baixo impacto. Revisar no futuro.";}
    else if(complexidade<=3&&regulatorio<=3){cls="Setor responsavel";just="Baixa complexidade e risco controlado.";}
    else{cls="Nao priorizar";just="Baixo impacto + alta complexidade.";}
    setRes({impacto,complexidade,regulatorio,score,cls,just,inov:{...inov}});
  }
  const COR={"Pipeline PID":["#EAF3DE","#3B6D11"],"Setor responsavel":["#FAEEDA","#854F0B"],"Backlog":["#EEF0FF","#534AB7"],"Nao priorizar":["#FCEBEB","#A32D2D"]};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{background:"#EEEDFE",borderRadius:10,padding:"12px 16px",border:"1px solid #AFA9EC"}}>
        <p style={{margin:"0 0 2px",fontWeight:500,fontSize:13,color:"#534AB7"}}>Matriz de inovacao</p>
        <p style={{margin:0,fontSize:12,color:"#5E5280"}}>Avalie a demanda. O sistema calcula o score e a classificacao automaticamente.</p>
      </div>
      <div style={{background:"#fff",borderRadius:12,padding:"1rem",border:"1px solid #e0e0e0"}}>
        <p style={{margin:"0 0 10px",fontWeight:500,fontSize:13}}>1. Avaliacao da demanda (1 a 5)</p>
        {[["impacto","Impacto no negocio"],["complexidade","Complexidade tecnica"],["regulatorio","Risco regulatorio"]].map(([k,l])=>(
          <div key={k} style={{marginBottom:"0.75rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:13,color:"#555"}}>{l}</span>
              <span style={{fontSize:13,fontWeight:500}}>{notas[k]||"-"}/5</span>
            </div>
            <div style={{display:"flex",gap:6}}>
              {[1,2,3,4,5].map(v=>(
                <button key={v} onClick={()=>setNotas(n=>({...n,[k]:v}))}
                  style={{flex:1,height:30,borderRadius:4,border:"1px solid #ddd",cursor:"pointer",background:notas[k]===v?"#5E5280":"#f5f5f5",color:notas[k]===v?"#fff":"#555",fontSize:12,fontWeight:500}}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{background:"#fff",borderRadius:12,padding:"1rem",border:"1px solid #e0e0e0"}}>
        <p style={{margin:"0 0 10px",fontWeight:500,fontSize:13}}>2. Indice de inovacao</p>
        {Object.entries(OPTS).map(([k,opts])=>(
          <div key={k} style={{marginBottom:"0.75rem"}}>
            <p style={{margin:"0 0 5px",fontSize:13,color:"#555"}}>{LBLS[k]}</p>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {opts.map(o=>(
                <label key={o.v} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"6px 10px",borderRadius:6,border:"1px solid "+(inov[k]===o.v?"#5E5280":"#ddd"),background:inov[k]===o.v?"#EEEDFE":"#f5f5f5"}}>
                  <input type="radio" name={k} checked={inov[k]===o.v} onChange={()=>setInov(i=>({...i,[k]:o.v}))} style={{accentColor:"#5E5280"}}/>
                  <span style={{fontSize:12}}><strong>{o.v}</strong> - {o.l}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={calcular} style={{padding:"10px",borderRadius:6,border:"none",background:"#5E5280",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:500}}>Calcular classificacao</button>
      {res&&(
        <div style={{background:"#fff",borderRadius:12,padding:"1.25rem",border:"1px solid #e0e0e0",display:"flex",flexDirection:"column",gap:12}}>
          <div style={{padding:"10px 14px",borderRadius:6,background:(COR[res.cls]||["#eee","#333"])[0]}}>
            <p style={{margin:"0 0 2px",fontWeight:500,fontSize:16,color:(COR[res.cls]||["#eee","#333"])[1]}}>{res.cls}</p>
            <p style={{margin:0,fontSize:12,color:(COR[res.cls]||["#eee","#333"])[1]}}>{res.just}</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {[["Impacto",res.impacto],["Complexidade",res.complexidade],["Regulatorio",res.regulatorio]].map(([l,v])=>(
              <div key={l} style={{background:"#f5f5f5",borderRadius:6,padding:"8px 10px",textAlign:"center"}}>
                <p style={{margin:"0 0 2px",fontSize:10,color:"#999"}}>{l}</p>
                <p style={{margin:0,fontWeight:500,fontSize:20,color:"#5E5280"}}>{v}<span style={{fontSize:12,fontWeight:400}}>/5</span></p>
              </div>
            ))}
          </div>
          <div style={{background:"#f5f5f5",borderRadius:6,padding:"10px 12px"}}>
            <p style={{margin:"0 0 6px",fontSize:12,fontWeight:500}}>Score de inovacao: <span style={{color:"#5E5280",fontSize:16}}>{res.score}</span>/5</p>
            {Object.entries(LBLS).map(([k,l])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:2}}>
                <span style={{color:"#999"}}>{l}</span><strong>{res.inov[k]}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}const INIT_PROJ=[
  {id:1,nome:"Importacao de Raltegravir",categoria:"manipulacao",trilhoDev:"materia-prima",etapa:"busca",inicio:TODAY,historico:[{etapa:"busca",data:TODAY}],matriz:null,responsavel:"",fonte:"",prazoLimite:"",reprovado:null,formRespostas:{}},
  {id:2,nome:"MIAU",categoria:"sistema",trilhoDev:"sistema",etapa:"busca",inicio:TODAY,historico:[{etapa:"busca",data:TODAY}],matriz:null,responsavel:"",fonte:"",prazoLimite:"",reprovado:null,formRespostas:{}},
];

export default function App(){
  const [projetos,setProjetos]=useState([]);
  const [view,setView]=useState("pipeline");
  const [modal,setModal]=useState(null);
  const [detalhe,setDetalhe]=useState(null);
  const [matrizModal,setMatrizModal]=useState(null);
  const [trilhoModal,setTrilhoModal]=useState(null);
  const [reprovModal,setReprovModal]=useState(null);
  const [renomearModal,setRenomearModal]=useState(null);
  const [nextId,setNextId]=useState(3);
  const [filtroCategoria,setFiltroCategoria]=useState("todas");
  const [mostrarRep,setMostrarRep]=useState(false);

  useEffect(()=>{
  const projetosRef=ref(database,"projetos");
  onValue(projetosRef,(snapshot)=>{
    const data=snapshot.val();
    if(data){
      const lista=Object.values(data);
      setProjetos(lista);
    } else {
      setProjetos(INIT_PROJ);
      set(ref(database,"projetos"),Object.fromEntries(INIT_PROJ.map(p=>[p.id,p])));
    }
  });
},[]);
const projetosAtivos=useMemo(()=>projetos.filter(p=>!p.reprovado),[projetos]);
  const projetosRep=useMemo(()=>projetos.filter(p=>!!p.reprovado),[projetos]);
  const projetosFiltrados=useMemo(()=>{
    const base=mostrarRep?projetos:projetosAtivos;
    return filtroCategoria==="todas"?base:base.filter(p=>p.categoria===filtroCategoria);
  },[projetos,projetosAtivos,filtroCategoria,mostrarRep]);

  const stats=useMemo(()=>{
    const ativos=projetosAtivos.filter(p=>p.etapa!=="concluido");
    const atrasados=ativos.filter(p=>statusP(p)==="atraso");
    const concluidos=projetosAtivos.filter(p=>p.etapa==="concluido");
    const ttmMedio=concluidos.length?Math.round(concluidos.reduce((a,p)=>a+mesesDesde(p.inicio),0)/concluidos.length):null;
    return{total:projetosAtivos.length,ativos:ativos.length,atrasados:atrasados.length,reprovados:projetosRep.length,ttmMedio};
  },[projetosAtivos,projetosRep]);

  const pieDataCat=useMemo(()=>{
    const tot=projetosAtivos.length;if(!tot)return[];
    return Object.entries(CATEGORIAS).map(([k,v])=>{
      const n=projetosAtivos.filter(p=>p.categoria===k).length;
      return{label:v.short,value:n,cor:v.cor,pct:Math.round((n/tot)*100)};
    }).filter(d=>d.value>0);
  },[projetosAtivos]);

  const pieDataStatus=useMemo(()=>{
    const s={atraso:0,atencao:0,ok:0};
    projetosAtivos.filter(p=>p.etapa!=="concluido").forEach(p=>{s[statusP(p)]++;});
    return[{label:"No prazo",value:s.ok,cor:"#639922"},{label:"Atencao",value:s.atencao,cor:"#BA7517"},{label:"Atraso",value:s.atraso,cor:"#E24B4A"}].filter(d=>d.value>0);
  },[projetosAtivos]);

function atualizarProjeto(id,campos){
  setProjetos(ps=>ps.map(p=>{
    if(p.id!==id)return p;
    const novo={...p,...campos};
    if(detalhe&&detalhe.id===id)setDetalhe(novo);
    set(ref(database,"projetos/"+id),novo);
    return novo;
  }));
}
    }));
  }

  function moverEtapa(id,novaEtapa,trilhoDev){
  setProjetos(ps=>ps.map(p=>{
    if(p.id!==id)return p;
    const jaEsta=p.historico.find(h=>h.etapa===novaEtapa);
    const novo={...p,etapa:novaEtapa,trilhoDev:trilhoDev!=null?trilhoDev:p.trilhoDev,historico:jaEsta?p.historico:[...p.historico,{etapa:novaEtapa,data:TODAY}]};
    if(detalhe&&detalhe.id===id)setDetalhe(novo);
    set(ref(database,"projetos/"+id),novo);
    return novo;
  }));
}
    }));
  }

  function handleMover(projeto,proximaEtapa){
    if(["identificacao","analise_tecnica"].includes(proximaEtapa)){
      setRenomearModal({projeto,proximaEtapa});return;
    }
    const todas=etapasCompletas(projeto.trilhoDev);
    const proxObj=todas.find(e=>e.id===proximaEtapa);
    if(proxObj&&proxObj.dev&&!projeto.trilhoDev){setTrilhoModal(projeto);return;}
    moverEtapa(projeto.id,proximaEtapa,projeto.trilhoDev);
  }

  function confirmarRenomeacao(nome){
    if(!renomearModal)return;
    const proj=renomearModal.projeto;
    const prox=renomearModal.proximaEtapa;
    if(nome)atualizarProjeto(proj.id,{nome});
    moverEtapa(proj.id,prox,proj.trilhoDev);
    setRenomearModal(null);
  }

  function criarProjeto(form){
  const trilhoDev=CATEGORIA_TRILHO[form.categoria];
  const novo={id:nextId,nome:form.nome,categoria:form.categoria,trilhoDev,etapa:"busca",inicio:TODAY,historico:[{etapa:"busca",data:TODAY}],matriz:null,responsavel:form.responsavel||"",fonte:form.fonte||"",prazoLimite:form.prazoLimite||"",reprovado:null,formRespostas:{}};
  setProjetos(p=>[...p,novo]);
  set(ref(database,"projetos/"+nextId),novo);
  setNextId(n=>n+1);
  setModal(null);
}
  }

  function confirmarTrilho(projetoId,trilhoEscolhido){
    moverEtapa(projetoId,TRILHOS_DEV[trilhoEscolhido].etapas[0].id,trilhoEscolhido);
    setTrilhoModal(null);
  }

  function salvarMatriz(pid,scores){
    setProjetos(ps=>ps.map(p=>{
      if(p.id!==pid)return p;
      const novo={...p,matriz:scores};
      if(detalhe&&detalhe.id===pid)setDetalhe(novo);
      return novo;
    }));
    setMatrizModal(null);
  }

  function reprovarProjeto(projeto,form){
    atualizarProjeto(projeto.id,{reprovado:{...form,etapa:projeto.etapa,data:TODAY}});
    setReprovModal(null);
  }

  const kanbanEtapas=[...ETAPAS_PRE_DEV,{id:"_dev",label:"Desenvolvimento",isDevGroup:true,gate:false},ETAPA_IMP];
  const TABS=[["pipeline","Pipeline"],["dashboard","Dashboard"],["calendario","Calendario"],["cronograma","Cronograma"],["inovacao","Matriz Inovacao"],["processos","Melhoria"]];

  return(
    <div style={{fontFamily:"Arial,sans-serif",color:"#1a1a1a",minHeight:"100vh",background:"#f5f5f5"}}>
      <div style={{display:"flex",height:"100vh",flexDirection:"column"}}>
        <div style={{padding:"1rem 1rem 0",flexShrink:0,background:"#fff",borderBottom:"1px solid #e0e0e0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
            <div>
              <p style={{margin:"0 0 2px",fontWeight:600,fontSize:17}}>P&D - Formula Animal</p>
              <p style={{margin:0,fontSize:12,color:"#999"}}>Acompanhamento de projetos</p>
            </div>
            <button onClick={()=>setModal("novo")} style={{padding:"7px 14px",borderRadius:6,border:"none",background:"#5E5280",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:500}}>+ Novo projeto</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:"1rem"}}>
            {[["Total ativos",stats.total,""],["Em andamento",stats.ativos,""],["Em atraso",stats.atrasados,stats.atrasados>0?"#A32D2D":""],["Reprovados",stats.reprovados,stats.reprovados>0?"#888":""],["TTM medio",stats.ttmMedio!=null?stats.ttmMedio+"m":"-",""]].map(([l,v,c])=>(
              <div key={l} style={{background:"#f9f9f9",borderRadius:8,padding:"10px 12px",border:"1px solid #e0e0e0"}}>
                <p style={{margin:"0 0 2px",fontSize:11,color:"#999"}}>{l}</p>
                <p style={{margin:0,fontWeight:600,fontSize:18,color:c||"#1a1a1a"}}>{v}</p>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:4,paddingBottom:"0.5rem",flexWrap:"wrap"}}>
            {TABS.map(([k,l])=>(
              <button key={k} onClick={()=>{setView(k);if(k!=="pipeline")setDetalhe(null);}}
                style={{padding:"5px 12px",borderRadius:6,border:"none",background:view===k?"#5E5280":"transparent",color:view===k?"#fff":"#666",cursor:"pointer",fontSize:13,fontWeight:view===k?500:400}}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{display:"flex",flex:1,overflow:"hidden"}}>
          <div style={{flex:1,overflowY:"auto",padding:"1rem"}}>

            {view==="pipeline"&&(<>
              <div style={{display:"flex",gap:6,marginBottom:"0.75rem",flexWrap:"wrap",alignItems:"center"}}>
                <span style={{fontSize:11,color:"#999"}}>Filtrar:</span>
                <button onClick={()=>setFiltroCategoria("todas")} style={{padding:"3px 10px",borderRadius:20,border:"1px solid "+(filtroCategoria==="todas"?"#5E5280":"#ddd"),background:filtroCategoria==="todas"?"#5E5280":"transparent",color:filtroCategoria==="todas"?"#fff":"#555",cursor:"pointer",fontSize:11}}>Todas</button>
                {Object.entries(CATEGORIAS).map(([k,v])=>(
                  <button key={k} onClick={()=>setFiltroCategoria(k)} style={{padding:"3px 10px",borderRadius:20,border:"1px solid "+(filtroCategoria===k?v.cor:"#ddd"),background:filtroCategoria===k?v.cor:"transparent",color:filtroCategoria===k?"#fff":"#555",cursor:"pointer",fontSize:11}}>{v.short}</button>
                ))}
                <button onClick={()=>setMostrarRep(!mostrarRep)} style={{padding:"3px 10px",borderRadius:20,border:"1px solid "+(mostrarRep?"#888":"#ddd"),background:mostrarRep?"#888":"transparent",color:mostrarRep?"#fff":"#555",cursor:"pointer",fontSize:11,marginLeft:"auto"}}>
                  {mostrarRep?"Ocultar reprovados":"Ver reprovados"}
                </button>
              </div>
              <div style={{overflowX:"auto"}}>
                <div style={{display:"flex",gap:6,minWidth:800}}>
                  {kanbanEtapas.map(etapa=>{
                    const pjs=etapa.isDevGroup?projetosFiltrados.filter(p=>etapaEmDev(p.etapa)):projetosFiltrados.filter(p=>p.etapa===etapa.id);
                    return(
                      <div key={etapa.id} style={{minWidth:100,flex:etapa.isDevGroup?2:1,background:etapa.gate?"#EEEDFE":etapa.isDevGroup?"#F6F5FF":"#fff",borderRadius:8,padding:"8px 6px",border:etapa.gate?"1px solid #AFA9EC":etapa.isDevGroup?"1px solid #CECBF6":"1px solid #e0e0e0"}}>
                        <p style={{margin:"0 0 6px",fontSize:10,fontWeight:500,color:etapa.gate?"#534AB7":etapa.isDevGroup?"#7F77DD":"#999",textAlign:"center",lineHeight:1.3}}>{etapa.label}</p>
                        <div style={{display:"flex",flexDirection:"column",gap:5,minHeight:30}}>
                          {pjs.map(p=>{
                            const cat=CATEGORIAS[p.categoria],prog=progProjeto(p);
                            const trilho=p.trilhoDev?TRILHOS_DEV[p.trilhoDev]:null;
                            const subEtapa=trilho?trilho.etapas.find(e=>e.id===p.etapa):null;
                            const diasPrazo=p.prazoLimite?Math.floor((new Date(p.prazoLimite)-new Date(TODAY))/(1000*60*60*24)):null;
                            const resps=p.formRespostas&&p.formRespostas[p.etapa]?p.formRespostas[p.etapa]:{};
                            const pctF=pctRespostas(resps,p.etapa);
                            return(
                              <div key={p.id} onClick={()=>setDetalhe(detalhe&&detalhe.id===p.id?null:p)}
                                style={{background:p.reprovado?"#f5f5f5":"#fff",borderRadius:6,padding:"7px 8px",cursor:"pointer",border:"1px solid "+(detalhe&&detalhe.id===p.id?cat.cor:"#e0e0e0"),borderLeftWidth:3,borderLeftColor:p.reprovado?"#ccc":cat.cor,borderLeftStyle:"solid",opacity:p.reprovado?0.7:1}}>
                                <p style={{margin:"0 0 2px",fontSize:11,fontWeight:500,lineHeight:1.3,color:p.reprovado?"#999":"#1a1a1a"}}>{p.nome}</p>
                                {subEtapa&&<p style={{margin:"0 0 2px",fontSize:9,color:"#999"}}>{subEtapa.label}</p>}
                                {p.responsavel&&<p style={{margin:"0 0 2px",fontSize:9,color:"#999"}}>Resp: {p.responsavel}</p>}
                                {diasPrazo!=null&&!p.reprovado&&<p style={{margin:"0 0 2px",fontSize:9,color:diasPrazo<0?"#A32D2D":diasPrazo<30?"#854F0B":"#999"}}>{diasPrazo<0?"Vencido":diasPrazo+"d"}</p>}
                                {p.reprovado&&<p style={{margin:"0 0 2px",fontSize:9,color:"#999"}}>{p.reprovado.motivo}</p>}
                                {!p.reprovado&&pergEtapa(p.etapa).length>0&&(
                                  <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:3}}>
                                    <div style={{flex:1,background:"#e0e0e0",borderRadius:2,height:3,overflow:"hidden"}}>
                                      <div style={{width:pctF+"%",height:"100%",background:pctF===100?"#1D9E75":cat.cor,borderRadius:2}}/>
                                    </div>
                                    <span style={{fontSize:8,color:"#999"}}>{pctF}%</span>
                                  </div>
                                )}
                                <div style={{display:"flex",alignItems:"center",gap:4}}>
                                  <Bar pct={prog} cor={p.reprovado?"#ccc":cat.cor} h={4}/>
                                  <span style={{fontSize:9,color:"#999",whiteSpace:"nowrap"}}>{prog}%</span>
                                </div>
                              </div>
                            );
                          })}
                          {pjs.length===0&&<p style={{fontSize:10,color:"#ccc",textAlign:"center",margin:"6px 0"}}>-</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{display:"flex",gap:10,marginTop:8,flexWrap:"wrap"}}>
                {Object.entries(CATEGORIAS).map(([k,v])=>(
                  <span key={k} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"#666"}}>
                    <span style={{width:7,height:7,borderRadius:2,background:v.cor,flexShrink:0}}/>{v.short}
                  </span>
                ))}
              </div>
            </>)}

            {view==="dashboard"&&(
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div style={{background:"#fff",borderRadius:12,padding:"1rem",border:"1px solid #e0e0e0"}}>
                    <p style={{margin:"0 0 0.75rem",fontWeight:500,fontSize:13}}>Por categoria</p>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <PieChart data={pieDataCat} size={100}/>
                      <div style={{display:"flex",flexDirection:"column",gap:6,flex:1}}>
                        {pieDataCat.map(d=>(
                          <div key={d.label} style={{display:"flex",alignItems:"center",gap:6}}>
                            <span style={{width:7,height:7,borderRadius:2,background:d.cor,flexShrink:0}}/>
                            <span style={{fontSize:11,color:"#555",flex:1}}>{d.label}</span>
                            <span style={{fontSize:12,fontWeight:500}}>{d.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{background:"#fff",borderRadius:12,padding:"1rem",border:"1px solid #e0e0e0"}}>
                    <p style={{margin:"0 0 0.75rem",fontWeight:500,fontSize:13}}>Status dos ativos</p>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <PieChart data={pieDataStatus} size={100}/>
                      <div style={{display:"flex",flexDirection:"column",gap:6,flex:1}}>
                        {pieDataStatus.map(d=>(
                          <div key={d.label} style={{display:"flex",alignItems:"center",gap:6}}>
                            <span style={{width:7,height:7,borderRadius:2,background:d.cor,flexShrink:0}}/>
                            <span style={{fontSize:11,color:"#555",flex:1}}>{d.label}</span>
                            <span style={{fontSize:12,fontWeight:500}}>{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{background:"#fff",borderRadius:12,padding:"1rem",border:"1px solid #e0e0e0"}}>
                  <p style={{margin:"0 0 0.75rem",fontWeight:500,fontSize:13}}>Progresso individual</p>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {projetosAtivos.map(p=>{
                      const cat=CATEGORIAS[p.categoria],prog=progProjeto(p);
                      const todas=etapasCompletas(p.trilhoDev),etapa=todas.find(e=>e.id===p.etapa);
                      const isNaDev=etapaEmDev(p.etapa);
                      const subLabel=isNaDev&&p.trilhoDev?TRILHOS_DEV[p.trilhoDev].etapas.find(e=>e.id===p.etapa)?TRILHOS_DEV[p.trilhoDev].etapas.find(e=>e.id===p.etapa).label:null:null;
                      return(
                        <div key={p.id} onClick={()=>{setView("pipeline");setDetalhe(detalhe&&detalhe.id===p.id?null:p);}}
                          style={{cursor:"pointer",padding:"9px 10px",background:"#f9f9f9",borderRadius:6,border:"1px solid #e0e0e0"}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,alignItems:"center"}}>
                            <div style={{display:"flex",alignItems:"center",gap:7}}>
                              <span style={{width:7,height:7,borderRadius:2,background:cat.cor,flexShrink:0}}/>
                              <span style={{fontSize:12,fontWeight:500}}>{p.nome}</span>
                              <SBadge p={p}/>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <span style={{fontSize:10,color:"#999"}}>{subLabel||(etapa?etapa.label:"")}</span>
                              <span style={{fontSize:12,fontWeight:500,minWidth:32,textAlign:"right"}}>{prog}%</span>
                            </div>
                          </div>
                          <Bar pct={prog} cor={cat.cor}/>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {projetosRep.length>0&&(
                  <div style={{background:"#fff",borderRadius:12,padding:"1rem",border:"1px solid #e0e0e0"}}>
                    <p style={{margin:"0 0 0.75rem",fontWeight:500,fontSize:13}}>Projetos reprovados</p>
                    {projetosRep.map(p=>(
                      <div key={p.id} onClick={()=>{setView("pipeline");setMostrarRep(true);setDetalhe(p);}}
                        style={{cursor:"pointer",padding:"9px 10px",background:"#f9f9f9",borderRadius:6,border:"1px solid #e0e0e0",marginBottom:6,opacity:0.8}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{display:"flex",alignItems:"center",gap:7}}>
                            <span style={{width:7,height:7,borderRadius:2,background:"#ccc",flexShrink:0}}/>
                            <span style={{fontSize:12,fontWeight:500,color:"#555"}}>{p.nome}</span>
                          </div>
                          <span style={{fontSize:11,color:"#999"}}>{p.reprovado?p.reprovado.motivo:""}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{background:"#fff",borderRadius:12,padding:"1rem",border:"1px solid #e0e0e0"}}>
                  <p style={{margin:"0 0 0.75rem",fontWeight:500,fontSize:13}}>Distribuicao por categoria</p>
                  {Object.entries(CATEGORIAS).map(([k,v])=>{
                    const n=projetosAtivos.filter(p=>p.categoria===k).length;
                    const pct=projetosAtivos.length?Math.round((n/projetosAtivos.length)*100):0;
                    return(
                      <div key={k} style={{marginBottom:9}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <span style={{fontSize:12,color:"#555"}}>{v.label}</span>
                          <span style={{fontSize:12,fontWeight:500}}>{n} - {pct}%</span>
                        </div>
                        <Bar pct={pct} cor={v.cor}/>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {view==="calendario"&&<ViewCalendario projetos={projetos}/>}
            {view==="cronograma"&&<ViewCronograma/>}
            {view==="inovacao"&&<ViewMatrizInovacao/>}

            {view==="processos"&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{background:"#EEEDFE",borderRadius:10,padding:"10px 14px",border:"1px solid #AFA9EC"}}>
                  <p style={{margin:"0 0 3px",fontSize:13,color:"#534AB7",fontWeight:500}}>Projetos de melhoria de processos internos</p>
                </div>
                {projetosAtivos.filter(p=>p.categoria==="melhoria-processos").length===0?(
                  <div style={{background:"#fff",borderRadius:12,padding:"2rem",border:"1px solid #e0e0e0",textAlign:"center"}}>
                    <p style={{margin:"0 0 8px",fontSize:14,fontWeight:500}}>Nenhum projeto de melhoria ainda</p>
                    <button onClick={()=>setModal("novo")} style={{padding:"7px 18px",borderRadius:6,border:"none",background:"#993556",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:500}}>+ Criar projeto de melhoria</button>
                  </div>
                ):projetosAtivos.filter(p=>p.categoria==="melhoria-processos").map(p=>{
                  const prog=progProjeto(p);
                  const todas=etapasCompletas(p.trilhoDev),etapa=todas.find(e=>e.id===p.etapa);
                  return(
                    <div key={p.id} onClick={()=>{setView("pipeline");setDetalhe(detalhe&&detalhe.id===p.id?null:p);}}
                      style={{background:"#fff",borderRadius:6,padding:"10px 12px",border:"1px solid #e0e0e0",cursor:"pointer"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:7,alignItems:"center"}}>
                        <span style={{fontSize:13,fontWeight:500}}>{p.nome}</span>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <span style={{fontSize:11,color:"#999"}}>{etapa?etapa.label:""}</span>
                          <span style={{fontSize:12,fontWeight:500}}>{prog}%</span>
                          <SBadge p={p}/>
                        </div>
                      </div>
                      <Bar pct={prog} cor="#993556"/>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {detalhe&&view==="pipeline"&&(
            <SidePanel
              projeto={detalhe}
              onClose={()=>setDetalhe(null)}
              onMover={handleMover}
              onAbrirMatriz={p=>setMatrizModal(p)}
              onEscolherTrilho={p=>setTrilhoModal(p)}
              onExcluir={id=>{setProjetos(ps=>ps.filter(p=>p.id!==id));setDetalhe(null);}}
              onAtualizar={atualizarProjeto}
              onReprovar={p=>setReprovModal(p)}
              onReativar={id=>atualizarProjeto(id,{reprovado:null})}
            />
          )}
        </div>
      </div>

      {modal==="novo"&&<NovoProjetoModal onSave={criarProjeto} onClose={()=>setModal(null)}/>}
      {matrizModal&&<MatrizModal projeto={matrizModal} onSave={s=>salvarMatriz(matrizModal.id,s)} onClose={()=>setMatrizModal(null)}/>}
      {trilhoModal&&<TrilhoModal projeto={trilhoModal} onEscolha={t=>confirmarTrilho(trilhoModal.id,t)} onClose={()=>setTrilhoModal(null)}/>}
      {reprovModal&&<ReprovacaoModal projeto={reprovModal} onSalvar={form=>reprovarProjeto(reprovModal,form)} onClose={()=>setReprovModal(null)}/>}
      {renomearModal&&<RenomearModal projeto={renomearModal.projeto} proximaEtapa={renomearModal.proximaEtapa} onConfirmar={confirmarRenomeacao} onClose={()=>setRenomearModal(null)}/>}
    </div>
  );
}