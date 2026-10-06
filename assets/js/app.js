/* Ứng dụng theo dõi dinh dưỡng trẻ ghép gan – Bệnh viện Nhi Đồng 2
 * Phụ thuộc: React 18 (UMD), WHO_LMS, zscore.js
 */

const LOGO_DHYD="assets/img/logo-dhyd.png";
const LOGO_ND2="assets/img/logo-nd2.png";
const h=React.createElement, {useState,useMemo,useEffect}=React;
const KEY='nd2-ghepgan-dinhduong-v1';
const MOCS=[{k:'T0',d:0,lab:'T0',name:'Trước ghép'},{k:'T1',d:30,lab:'T1',name:'1 tháng',win:[21,40]},{k:'T3',d:90,lab:'T3',name:'3 tháng',win:[75,105]},{k:'T6',d:180,lab:'T6',name:'6 tháng',win:[150,210]},{k:'T12',d:365,lab:'T12',name:'12 tháng',win:[330,400]},{k:'T24',d:730,lab:'T24',name:'24 tháng',win:[690,770]}];
// Hành lang tham chiếu: trung bình ước lượng GEE (KTC 95%) của 62 trẻ ghép gan tại BV Nhi Đồng 2 (luận văn CKII, 2026)
const REF={
 waz:{T0:[-1.22,-1.49,-0.95],T1:[-1.87,-2.14,-1.59],T3:[-1.59,-1.84,-1.33],T6:[-1.33,-1.57,-1.09]},
 haz:{T0:[-1.89,-2.23,-1.55],T1:[-2.05,-2.37,-1.73],T3:[-2.18,-2.49,-1.87],T6:[-2.27,-2.59,-1.96]},
 whz:{T0:[-0.35,-0.68,-0.03],T1:[-1.16,-1.49,-0.82],T3:[-0.67,-0.99,-0.36],T6:[-0.26,-0.55,0.04]},
 alb:{T0:[31.9,30.5,33.3],T1:[37.6,36.1,39.1],T3:[40.9,39.9,42.0],T6:[41.9,41.0,42.8]},
 hb:{T0:[10.07,9.65,10.48],T1:[10.29,9.85,10.72],T3:[11.63,11.18,12.07],T6:[11.84,11.44,12.23]},
 inr:{T0:[1.32,1.24,1.40],T1:[1.19,1.15,1.24],T3:[1.11,1.09,1.14],T6:[1.09,1.06,1.11]}};
const FIELDS=[
 {k:'date',lab:'Ngày đo',type:'date'},
 {k:'w',lab:'Cân nặng (kg)',step:'0.1'},{k:'h',lab:'Chiều dài/cao (cm)',step:'0.1'},{k:'muac',lab:'MUAC (cm)',step:'0.1'},

 {k:'alb',lab:'Albumin (g/L)',step:'0.1'},{k:'hb',lab:'Hemoglobin (g/dL)',step:'0.1'},{k:'inr',lab:'INR',step:'0.01'},{k:'vitd',lab:'25(OH)D (nmol/L)',step:'1'}];

function derive(p){ const v={}; for(const m of MOCS){ const r=p.v[m.k]; if(!r){continue}
  const a=r.date&&p.dob?months(p.dob,r.date):null; const z=whoZ(p.sex,a,num(r.w),num(r.h));
  v[m.k]={...r,ageM:a,waz:z.waz??null,haz:z.haz??null,whz:z.whz??null,wtype:z.wtype||null}; }
  return {...p,v};}

const num=v=>v===''||v==null||isNaN(+v)?null:+v;
const fmt=(v,d=2)=>v==null?'–':(+v).toFixed(d).replace('.',',').replace('-','−');
const addDays=(s,n)=>{if(!s)return null;const t=new Date(s+'T00:00:00');t.setDate(t.getDate()+n);return t.toISOString().slice(0,10)};
const days=(a,b)=>(!a||!b)?null:Math.round((new Date(b)-new Date(a))/864e5);
const months=(a,b)=>{const d=days(a,b);return d==null?null:d/30.4375};
const vn=s=>s?s.split('-').reverse().join('/'):'–';
function hbCut(ageM,sex){ // WHO 2024
  if(ageM==null||ageM<6)return null; if(ageM<24)return 10.5; if(ageM<60)return 11.0; if(ageM<144)return 11.5; if(ageM<180)return 12.0; return sex==='M'?13.0:12.0;}
function demo(){
  return [{id:'d1',code:'DEMO-01',sex:'M',dob:'2023-03-10',lt:'2025-01-15',dx:'Teo đường mật, đã phẫu thuật Kasai lúc 75 ngày tuổi',peld:'18',enteral:'84',note:'Dữ liệu giả định để minh họa',
    v:{T0:{date:'2025-01-12',w:'9.6',h:'81.5',muac:'12.2',waz:'-1.35',haz:'-1.80',whz:'-0.55',alb:'31',hb:'9.8',inr:'1.45',vitd:'28'},
       T1:{date:'2025-02-14',w:'8.9',h:'81.8',muac:'12.0',waz:'-2.05',haz:'-2.05',whz:'-1.30',alb:'36',hb:'9.9',inr:'1.18',vitd:''},
       T3:{date:'2025-04-16',w:'9.5',h:'82.3',muac:'12.6',waz:'-1.70',haz:'-2.20',whz:'-0.70',alb:'40',hb:'11.2',inr:'1.10',vitd:''},
       T6:{date:'2025-07-15',w:'10.2',h:'83.5',muac:'13.1',waz:'-1.40',haz:'-2.30',whz:'-0.20',alb:'42',hb:'11.6',inr:'1.06',vitd:'52'}}},
   {id:'d2',code:'DEMO-02',sex:'F',dob:'2021-08-02',lt:'2025-10-08',dx:'PFIC',peld:'12',enteral:'36',note:'Dữ liệu giả định để minh họa',
    v:{T0:{date:'2025-10-05',w:'13.6',h:'97.5',muac:'',waz:'-1.10',haz:'-1.60',whz:'-0.40',alb:'34',hb:'10.6',inr:'1.25',vitd:''},
       T1:{date:'2025-11-07',w:'12.9',h:'97.7',muac:'',waz:'-1.55',haz:'-1.75',whz:'-0.95',alb:'38',hb:'10.4',inr:'1.12',vitd:''}}}];
}
function load(){try{const s=localStorage.getItem(KEY);if(s){const p=JSON.parse(s);if(Array.isArray(p))return p}}catch(e){}return demo()}
function save(p){try{localStorage.setItem(KEY,JSON.stringify(p))}catch(e){}}
function lastWith(p,k){for(let i=MOCS.length-1;i>=0;i--){const v=p.v[MOCS[i].k];if(v&&num(v[k])!=null)return{m:MOCS[i],val:num(v[k]),rec:v}}return null}
function alertsFor(p0){
  const p=derive(p0); const A=[], V=p.v||{}, t0=V.T0||{};
  const ageAt=r=>r&&r.date?months(p.dob,r.date):null;
  const w0=num(t0.waz), w1=num((V.T1||{}).waz);
  if(w0!=null&&w1!=null&&w1-w0<=-0.5)A.push({lv:'warn',t:`WAZ giảm ${fmt(w1-w0)} SD trong tháng đầu sau ghép`,s:'Mức giảm trung bình của nhóm nghiên cứu là −0,65 SD; cần đánh giá năng lượng ăn vào và thời điểm tái lập dinh dưỡng.'});
  const h0=num(t0.haz), hl=lastWith(p,'haz');
  if(hl&&hl.m.k!=='T0'){
    if(h0!=null&&h0>=-2&&hl.val<-2)A.push({lv:'risk',t:`Thấp còi mới xuất hiện tại ${hl.m.lab} (HAZ ${fmt(hl.val)})`,s:'Trẻ không thấp còi trước ghép; trong nghiên cứu, 30% trẻ thuộc nhóm này trở thành thấp còi tại 6 tháng.'});
    else if(h0!=null&&hl.val-h0<=-0.3)A.push({lv:'warn',t:`HAZ giảm ${fmt(hl.val-h0)} SD so với trước ghép`,s:'Chiều cao chưa phục hồi; theo dõi tốc độ tăng chiều cao đến ít nhất năm thứ hai, cân nhắc giảm corticosteroid khi điều kiện cho phép.'});}
  if(hl&&hl.val<-2&&!(h0!=null&&h0>=-2))A.push({lv:'warn',t:`Thấp còi (HAZ ${fmt(hl.val)} tại ${hl.m.lab})`});
  const wl=lastWith(p,'whz'); if(wl&&wl.val<-2)A.push({lv:'risk',t:`Gầy còm (WHZ/BMIZ ${fmt(wl.val)} tại ${wl.m.lab})`});
  const wa=lastWith(p,'waz'); if(wa&&wa.val<-2)A.push({lv:'warn',t:`Nhẹ cân (WAZ ${fmt(wa.val)} tại ${wa.m.lab})`});
  const mu=lastWith(p,'muac'); if(mu){const a=ageAt(mu.rec); if(a!=null&&a>=6&&a<60&&mu.val<12.5)A.push({lv:mu.val<11.5?'risk':'warn',t:`MUAC ${fmt(mu.val,1)} cm tại ${mu.m.lab}`,s:'Dưới ngưỡng 12,5 cm (trẻ 6–59 tháng). MUAC ít bị ảnh hưởng bởi báng bụng so với cân nặng.'})}
  const al=lastWith(p,'alb'); if(al&&al.val<35)A.push({lv:'warn',t:`Albumin ${fmt(al.val,1)} g/L tại ${al.m.lab}`});
  const hb=lastWith(p,'hb'); if(hb){const c=hbCut(ageAt(hb.rec),p.sex); if(c!=null&&hb.val<c)A.push({lv:'warn',t:`Thiếu máu: Hb ${fmt(hb.val,1)} g/dL tại ${hb.m.lab}`,s:`Ngưỡng WHO 2024 theo tuổi: < ${fmt(c,1)} g/dL. Nếu còn thiếu máu sau 3–6 tháng, cân nhắc ferritin và sắt huyết thanh.`})}
  const ir=lastWith(p,'inr'); if(ir&&ir.val>1.5)A.push({lv:'warn',t:`INR ${fmt(ir.val)} tại ${ir.m.lab}`});
  const vd=lastWith(p,'vitd'); if(!vd)A.push({lv:'info',t:'Chưa có kết quả 25(OH)D',s:'Nên xét nghiệm trước ghép và theo dõi sau ghép.'}); else if(vd.val<50)A.push({lv:vd.val<30?'risk':'warn',t:`25(OH)D ${fmt(vd.val,0)} nmol/L tại ${vd.m.lab} (${vd.val<30?'thiếu':'không đủ'})`});
  const en=num(p.enteral); if(en!=null&&en>24)A.push({lv:'info',t:`Bắt đầu nuôi ăn đường ruột sau ${fmt(en,0)} giờ`,s:'Khuyến cáo khởi động dinh dưỡng đường ruột sớm, lý tưởng trong 24 giờ đầu nếu có nhu động ruột.'});
  MOCS.forEach(m=>{const r=V[m.k]; if(r&&r.date&&(num(r.h)==null))A.push({lv:'info',t:`Chưa ghi chiều cao tại ${m.lab}`})});
  const today=new Date().toISOString().slice(0,10);
  for(const m of MOCS.slice(1)){const r=V[m.k]; if(!(r&&r.date)){const due=addDays(p.lt,m.d); const late=days(addDays(p.lt,m.win[1]),today)>0; A.push({lv:late?'warn':'info',t:`${late?'Đã qua':'Sắp đến'} mốc ${m.lab} (${m.name}): ${vn(addDays(p.lt,m.win[0]))} – ${vn(addDays(p.lt,m.win[1]))}`}); break;}}
  ['T1','T3','T6','T12','T24'].forEach(k=>{const r=V[k]; const m=MOCS.find(x=>x.k===k); if(r&&r.date&&p.lt){const d=days(p.lt,r.date); if(d<m.win[0]||d>m.win[1])A.push({lv:'info',t:`Ngày đo ${m.lab} là ngày ${d} sau ghép, ngoài cửa sổ ${m.win[0]}–${m.win[1]} ngày`})}});
  [['waz','WAZ'],['haz','HAZ'],['whz','WHZ/BMIZ']].forEach(([k,l])=>MOCS.forEach(m=>{const v=num((V[m.k]||{})[k]); if(v!=null&&Math.abs(v)>6)A.push({lv:'risk',t:`${l} = ${fmt(v)} tại ${m.lab}: ngoài khoảng ±6, kiểm tra lại cân nặng, chiều cao hoặc ngày sinh`})}));
  MOCS.forEach(m=>{const r=V[m.k]; if(r&&r.date&&(num(r.w)!=null||num(r.h)!=null)&&!p.dob)A.push({lv:'info',t:'Cần nhập ngày sinh để tự tính Z-score'})});
  return A;
}
const lvRank={risk:0,warn:1,info:2};
function level(A){if(A.some(a=>a.lv==='risk'))return'risk';if(A.some(a=>a.lv==='warn'))return'warn';return'ok'}
function Chart({p:p0,metric}){
  const p=derive(p0);
  const W=680,H=300,L=48,R=56,T=18,B=40;
  const C={waz:{k:'waz',lab:'WAZ',col:'var(--waz)',z:1},haz:{k:'haz',lab:'HAZ/LAZ',col:'var(--haz)',z:1},whz:{k:'whz',lab:'WHZ/BMIZ',col:'var(--whz)',z:1},
    alb:{k:'alb',lab:'Albumin (g/L)',col:'var(--waz)',y:[20,50],step:5,dec:1,cut:35,cutLab:'35'},hb:{k:'hb',lab:'Hemoglobin (g/dL)',col:'var(--haz)',y:[6,16],step:2,dec:1},inr:{k:'inr',lab:'INR',col:'var(--whz)',y:[0.8,2.2],step:0.2,dec:2,cut:1.5,cutLab:'1,5'}}[metric];
  const pts=MOCS.map((m,i)=>({i,v:num((p.v[m.k]||{})[C.k])})).filter(o=>o.v!=null);
  const ref=REF[C.k];
  let y0,y1;
  if(C.z){ const vals=pts.map(o=>o.v).concat(ref?Object.values(ref).flat():[]); y0=Math.min(-4,Math.floor(Math.min(...vals)-0.3)); y1=Math.max(1,Math.ceil(Math.max(...vals)+0.3)); }
  else [y0,y1]=C.y;
  const PADX=28; const xs=MOCS.map((m,i)=>L+PADX+i*(W-L-R-PADX-12)/(MOCS.length-1));
  const Y=v=>T+(1-(Math.max(y0,Math.min(y1,v))-y0)/(y1-y0))*(H-T-B);
  const el=[]; const step=C.z?1:C.step, n=Math.round((y1-y0)/step);
  for(let i=0;i<=n;i++){const v=y0+i*step; el.push(h('line',{key:'g'+i,x1:L,x2:W-R,y1:Y(v),y2:Y(v),stroke:'var(--line)'}), h('text',{key:'gt'+i,x:L-10,y:Y(v)+4,textAnchor:'end',fontSize:12,fill:'var(--muted)'},fmt(v,C.z?0:(metric==='inr'?1:0))));}
  MOCS.forEach((m,i)=>el.push(h('text',{key:'x'+i,x:xs[i],y:H-B+22,textAnchor:'middle',fontSize:12.5,fill:'var(--muted)',fontWeight:600},m.lab)));
  const cutV=C.z?-2:C.cut, cutL=C.z?'−2SD':C.cutLab;
  if(cutV!=null) el.push(h('line',{key:'cut',x1:L,x2:W-R,y1:Y(cutV),y2:Y(cutV),stroke:C.z?'var(--risk)':'var(--warn)',strokeDasharray:'6 5',strokeWidth:1.2}),h('text',{key:'cutt',x:W-R+6,y:Y(cutV)+4,fontSize:12,fill:C.z?'var(--risk)':'var(--warn)',fontWeight:600},cutL));
  if(ref){const ks=['T0','T1','T3','T6']; const up=ks.map((t,i)=>`${xs[i]},${Y(ref[t][2])}`), lo=ks.map((t,i)=>`${xs[i]},${Y(ref[t][1])}`).reverse();
    el.push(h('polygon',{key:'band',points:up.concat(lo).join(' '),fill:C.col,opacity:.13}));
    el.push(h('polyline',{key:'bm',points:ks.map((t,i)=>`${xs[i]},${Y(ref[t][0])}`).join(' '),fill:'none',stroke:C.col,strokeDasharray:'3 4',strokeWidth:1.6,opacity:.75}));}
  if(pts.length>1) el.push(h('polyline',{key:'ln',points:pts.map(o=>`${xs[o.i]},${Y(o.v)}`).join(' '),fill:'none',stroke:C.col,strokeWidth:3,strokeLinejoin:'round',strokeLinecap:'round'}));
  // Vị trí nhãn: đặt phía trên nếu điểm cao hơn trung bình hai điểm kề (hoặc là điểm đầu/cuối cao hơn điểm kề), ngược lại đặt phía dưới; tránh đè lên đường ngưỡng
  const cutY=cutV!=null?Y(cutV):null;
  pts.forEach((o,j)=>{
    const prev=pts[j-1], next=pts[j+1];
    const nb=[prev,next].filter(Boolean).map(q=>q.v);
    let above= nb.length? o.v>=nb.reduce((a,b)=>a+b,0)/nb.length : true;
    let ly=Y(o.v)+(above?-14:24);
    const clash=y=>cutY!=null&&Math.abs((y-5)-cutY)<11;
    if(clash(ly)){ const alt=Y(o.v)+(above?24:-14); if(!clash(alt)&&alt>T+10&&alt<H-B-4){ly=alt;} else {ly=Y(o.v)+(above?-24:34);} }
    ly=Math.max(T+12,Math.min(H-B-6,ly));
    el.push(h('circle',{key:'c'+o.i,cx:xs[o.i],cy:Y(o.v),r:5.5,fill:'#fff',stroke:C.col,strokeWidth:3}));
    el.push(h('text',{key:'t'+o.i,x:xs[o.i],y:ly,textAnchor:'middle',fontSize:13,fill:C.col,fontWeight:700,paintOrder:'stroke',stroke:'#fff',strokeWidth:5,strokeLinejoin:'round'},fmt(o.v,C.dec||2)));});
  if(!pts.length) el.push(h('text',{key:'none',x:W/2,y:H/2,textAnchor:'middle',fontSize:14,fill:'var(--muted)'},'Chưa có số liệu cho chỉ số này'));
  return h('div',null,h('svg',{className:'chart',viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'Biểu đồ diễn tiến '+C.lab},el),
    h('div',{className:'legend'},h('span',null,h('i',{style:{background:C.col}}),C.lab+' của bệnh nhi'),
      ref&&h('span',null,h('i',{className:'band',style:{background:C.col,opacity:.18}}),'Trung bình (KTC 95%) của 62 trẻ ghép gan tại Bệnh viện Nhi Đồng 2, T0–T6')));
}
function Field({f,val,onChange,cls}){return h('td',{className:cls||''},h('input',{type:f.type||'number',step:f.step,value:val??'','aria-label':f.lab,onChange:e=>onChange(e.target.value)}))}
function cellClass(k,v,p,rec){const x=num(v); if(x==null)return'';
  if(['waz','haz','whz'].includes(k))return x<-3?'bad':x<-2?'mid':'';
  if(k==='alb')return x<35?'mid':''; if(k==='inr')return x>1.5?'mid':''; if(k==='vitd')return x<30?'bad':x<50?'mid':'';
  if(k==='muac'){const a=rec&&rec.date?months(p.dob,rec.date):null; return a!=null&&a>=6&&a<60?(x<11.5?'bad':x<12.5?'mid':''):''}
  if(k==='hb'){const c=hbCut(rec&&rec.date?months(p.dob,rec.date):null,p.sex);return c!=null&&x<c?'mid':''}
  return'';}
function Patient({p,update,remove}){
  const [metric,setMetric]=useState('haz');
  const A=useMemo(()=>alertsFor(p).sort((a,b)=>lvRank[a.lv]-lvRank[b.lv]),[p]);
  const set=(k,v)=>update({...p,[k]:v});
  const setV=(m,k,v)=>update({...p,v:{...p.v,[m]:{...(p.v[m]||{}),[k]:v}}});
  const ageLt=months(p.dob,p.lt); const D=derive(p);
  return h(React.Fragment,null,
    h('section',{className:'panel'},
      h('div',{className:'row',style:{justifyContent:'space-between'}},h('h2',null,'Thông tin bệnh nhi'),h('button',{className:'btn link danger',onClick:()=>{if(confirm('Xóa bệnh nhi '+p.code+'?'))remove(p.id)}},'Xóa bệnh nhi')),
      h('div',{className:'grid'},
        h('label',{className:'f'},'Mã bệnh nhi',h('input',{value:p.code,onChange:e=>set('code',e.target.value)})),
        h('label',{className:'f'},'Giới',h('select',{value:p.sex,onChange:e=>set('sex',e.target.value)},h('option',{value:'M'},'Nam'),h('option',{value:'F'},'Nữ'))),
        h('label',{className:'f'},'Ngày sinh',h('input',{type:'date',value:p.dob,onChange:e=>set('dob',e.target.value)})),
        h('label',{className:'f'},'Ngày ghép gan',h('input',{type:'date',value:p.lt,onChange:e=>set('lt',e.target.value)})),
        h('label',{className:'f'},'Điểm PELD/MELD',h('input',{type:'number',value:p.peld,onChange:e=>set('peld',e.target.value)})),
        h('label',{className:'f'},'Giờ bắt đầu nuôi ăn đường ruột sau ghép',h('input',{type:'number',value:p.enteral,onChange:e=>set('enteral',e.target.value)}))),
      h('label',{className:'f',style:{marginTop:10}},'Chẩn đoán, ghi chú',h('input',{value:p.dx,onChange:e=>set('dx',e.target.value)})),
      h('div',{className:'facts'},
        h('div',null,h('b',null,ageLt!=null?fmt(ageLt,1)+' tháng':'–'),'Tuổi lúc ghép'),
        h('div',null,h('b',null,p.lt?days(p.lt,new Date().toISOString().slice(0,10))+' ngày':'–'),'Thời gian sau ghép'),
        h('div',null,h('b',null,A.filter(a=>a.lv!=='info').length),'Cảnh báo cần xem'))),
    h('section',{className:'panel'},
      h('h2',null,'Số đo và xét nghiệm theo mốc'),
      h('p',{style:{margin:'0 0 8px',fontSize:12.5,color:'var(--muted)'}},'Nhập ngày sinh, giới, ngày đo, cân nặng và chiều dài/chiều cao: Z-score được tự tính theo chuẩn WHO 2006 (0–5 tuổi) và tham chiếu WHO 2007 (5–19 tuổi). Dưới 2 tuổi dùng chiều dài nằm; từ 5 tuổi chỉ số gầy được tính theo BMI theo tuổi (ký hiệu ᴮ). Ô tô màu: dưới ngưỡng tham chiếu.'),
      h('div',{className:'tblwrap'},h('table',{className:'v'},
        h('thead',null,h('tr',null,h('th',null,''),MOCS.map(m=>h('th',{key:m.k},m.lab+' ',h('span',{className:'due'},m.k==='T0'?m.name:(p.lt?vn(addDays(p.lt,m.d)):m.name)))))),
        h('tbody',null,FIELDS.map(f=>h('tr',{key:f.k},h('td',null,f.lab),MOCS.map(m=>{const rec=p.v[m.k]||{};return h(Field,{key:m.k,f,val:rec[f.k],cls:cellClass(f.k,rec[f.k],p,rec),onChange:v=>setV(m.k,f.k,v)})})))
          ,h('tr',null,h('td',null,'BMI (kg/m²)'),MOCS.map(m=>{const r=p.v[m.k]||{};const w=num(r.w),hh=num(r.h);return h('td',{key:m.k},w&&hh?fmt(w/(hh/100)**2,1):'–')}))
          ,h('tr',{className:'calc'},h('td',null,'Tuổi lúc đo (tháng)'),MOCS.map(m=>{const r=D.v[m.k]||{};return h('td',{key:m.k},r.ageM!=null?fmt(r.ageM,1):'–')}))
          ,[['waz','WAZ (tự tính)'],['haz','HAZ/LAZ (tự tính)'],['whz','WHZ hoặc BMIZ (tự tính)']].map(([k,l])=>h('tr',{key:k,className:'calc'},h('td',null,l),MOCS.map(m=>{const r=D.v[m.k]||{};const z=r[k];const cl=z==null?'':z<-3?'bad':z<-2?'mid':'';return h('td',{key:m.k,className:'zc '+cl,title:k==='whz'&&r.wtype?r.wtype:''},z==null?'–':fmt(z)+(k==='whz'&&r.wtype==='BMIZ'?' ᴮ':''))})))
          ,h('tr',{className:'calc'},h('td',null,'Phân loại'),MOCS.map(m=>{const r=D.v[m.k]||{};const c=classify(r,r.ageM);return h('td',{key:m.k},c.length?c.map((x,i)=>h('span',{key:i,className:'pill '+x[0],style:{display:'inline-block',margin:'1px'}},x[1])):(r.waz!=null||r.haz!=null?h('span',{className:'pill ok'},'Bình thường'):'–'))})))))),
    h('div',{className:'two'},
      h('section',{className:'panel'},h('h2',null,'Cảnh báo và nhắc việc'),
        A.length?h('ul',{className:'alerts'},A.map((a,i)=>h('li',{key:i,className:a.lv},a.t,a.s&&h('small',null,a.s)))):h('p',{className:'empty'},'Không có cảnh báo.')),
      h('section',{className:'panel'},h('h2',null,'Diễn tiến qua các mốc'),
        h('div',{className:'chips',role:'group'},[['waz','WAZ'],['haz','HAZ'],['whz','WHZ/BMIZ'],['alb','Albumin'],['hb','Hemoglobin'],['inr','INR']].map(([k,l])=>h('button',{key:k,'aria-pressed':metric===k,onClick:()=>setMetric(k)},l))),
        h(Chart,{p,metric}))));
}
function Overview({patients}){
  const rows=patients.map(p=>({p,A:alertsFor(p)}));
  const n=patients.length, cnt=lv=>rows.filter(r=>level(r.A)===lv).length;
  const stunt=rows.filter(r=>{const l=lastWith(derive(r.p),'haz');return l&&l.val<-2}).length;
  const muacDone=rows.filter(r=>num((r.p.v.T0||{}).muac)!=null).length, vitdDone=rows.filter(r=>lastWith(r.p,'vitd')).length;
  const en=rows.map(r=>num(r.p.enteral)).filter(v=>v!=null).sort((a,b)=>a-b); const med=en.length?en[Math.floor(en.length/2)]:null;
  return h('div',{className:'main',style:{gridColumn:'1 / -1'}},
    h('section',{className:'panel'},h('h2',null,'Bệnh nhi đang theo dõi'),
      h('div',{className:'stat'},
        h('div',null,h('b',null,n),h('span',null,'bệnh nhi')),
        h('div',null,h('b',{style:{color:'var(--risk)'}},cnt('risk')),h('span',null,'có cảnh báo mức cao')),
        h('div',null,h('b',{style:{color:'var(--warn)'}},cnt('warn')),h('span',null,'có cảnh báo cần theo dõi')),
        h('div',null,h('b',null,stunt),h('span',null,'thấp còi ở lần đo gần nhất')),
        h('div',null,h('b',null,n?Math.round(muacDone/n*100)+'%':'–'),h('span',null,'được đo MUAC trước ghép')),
        h('div',null,h('b',null,n?Math.round(vitdDone/n*100)+'%':'–'),h('span',null,'có xét nghiệm 25(OH)D')),
        h('div',null,h('b',null,med!=null?med+' giờ':'–'),h('span',null,'trung vị thời điểm nuôi ăn đường ruột')))),
    h('section',{className:'panel'},h('h2',null,'Số liệu tham chiếu từ nghiên cứu (62 trẻ, 2005–2026)'),
      h('div',{className:'tblwrap'},h('table',{className:'v',style:{minWidth:560}},
        h('thead',null,h('tr',null,h('th',null,'Chỉ số'),['T0','T1','T3','T6'].map(t=>h('th',{key:t},t)))),
        h('tbody',null,[['Thấp còi (HAZ < −2SD)',['41,9%','48,3%','52,7%','55,8%']],['Nhẹ cân (WAZ < −2SD)',['23,7%','40,0%','31,4%','14,6%']],['Gầy còm (WHZ < −2SD)',['9,4%','28,6%','12,8%','2,3%']],['Thiếu máu (WHO 2024)',['66,1%','62,1%','30,9%','15,4%']],['Albumin < 35 g/L',['64,5%','31,0%','5,5%','2,0%']],['INR > 1,5',['19,4%','3,4%','0%','0%']]].map(([l,v])=>h('tr',{key:l},h('td',null,l),v.map((x,i)=>h('td',{key:i},x))))))),
      h('p',{style:{fontSize:12.5,color:'var(--muted)',margin:'8px 0 0'}},'Nguồn: Trần Ngọc Lưu. Tình trạng dinh dưỡng bệnh nhi trước và sau ghép gan tại Bệnh viện Nhi Đồng 2. Luận văn CKII, Đại học Y Dược TP. Hồ Chí Minh, 2026.')));
}
function Guide({patients,setPatients}){
  const [txt,setTxt]=useState(''); const [msg,setMsg]=useState('');
  return h('div',{className:'main',style:{gridColumn:'1 / -1'}},h('section',{className:'panel prose'},
    h('h2',null,'Cách dùng'),
    h('p',null,'Công cụ giúp theo dõi dinh dưỡng trẻ ghép gan theo các mốc trước ghép, 1, 3, 6, 12 và 24 tháng. Mỗi bệnh nhi có bảng số đo, biểu đồ so với hành lang tham chiếu của nghiên cứu và danh sách cảnh báo.'),
    h('h3',null,'Các cảnh báo dựa trên'),
    h('ul',null,h('li',null,'WAZ giảm ≥ 0,5 SD trong tháng đầu; HAZ giảm ≥ 0,3 SD hoặc thấp còi mới xuất hiện sau ghép.'),h('li',null,'Phân loại theo tuổi: nhẹ cân (WAZ, đến 10 tuổi), thấp còi (HAZ/LAZ), gầy còm (WHZ/WLZ đến 5 tuổi; BMIZ từ 5 đến 19 tuổi); mức nặng khi < −3SD; thừa cân, béo phì theo ngưỡng WHO. MUAC < 12,5 cm ở trẻ 6–59 tháng.'),h('li',null,'Albumin < 35 g/L; thiếu máu theo ngưỡng WHO 2024; INR > 1,5; 25(OH)D < 50 nmol/L.'),h('li',null,'Nuôi ăn đường ruột sau 24 giờ; số đo ngoài cửa sổ của mốc; mốc tái khám sắp đến hoặc đã qua.')),
    h('h3',null,'Lưu ý'),
    h('ul',null,h('li',null,'Đây là phiên bản thử nghiệm xây dựng từ kết quả luận văn, sẽ được hoàn thiện trong đề án sáng kiến cải tiến của Bệnh viện Nhi Đồng 2 (lưu trữ trên máy chủ bệnh viện, phân quyền người dùng, kết nối hồ sơ bệnh án điện tử).'),h('li',null,'Hành lang tham chiếu mô tả nhóm 62 trẻ, không phải chuẩn tăng trưởng.'),h('li',null,'Cảnh báo chỉ mang tính nhắc nhở, không thay thế quyết định lâm sàng.'),h('li',null,'Dữ liệu chỉ lưu trong trình duyệt của máy đang dùng. Chỉ nhập mã bệnh nhi đã ẩn danh, không nhập họ tên hay số hồ sơ.')),
    h('h3',null,'Sao lưu dữ liệu'),
    h('div',{className:'row'},
      h('button',{className:'btn',onClick:()=>{const s=JSON.stringify(patients);setTxt(s);try{navigator.clipboard.writeText(s);setMsg('Đã sao chép dữ liệu.')}catch(e){setMsg('Chọn và sao chép nội dung bên dưới.')}}},'Sao chép dữ liệu'),
      h('button',{className:'btn',onClick:()=>{try{const p=JSON.parse(txt);if(!Array.isArray(p))throw 0;setPatients(p);setMsg('Đã nhập '+p.length+' bệnh nhi.')}catch(e){setMsg('Không đọc được dữ liệu: dán đúng nội dung đã sao chép.')}}},'Nhập dữ liệu đã dán'),
      h('button',{className:'btn link danger',onClick:()=>{if(confirm('Thay toàn bộ dữ liệu bằng 2 bệnh nhi minh họa?')){setPatients(demo());setMsg('Đã khôi phục dữ liệu minh họa.')}}},'Khôi phục dữ liệu minh họa')),
    msg&&h('p',{role:'status',style:{color:'var(--grow)'}},msg),
    h('textarea',{className:'io',value:txt,onChange:e=>setTxt(e.target.value),'aria-label':'Dữ liệu sao lưu'})));
}
function App(){
  const [patients,setPatients]=useState(load); const [sel,setSel]=useState(()=>{const p=load();return p[0]&&p[0].id});
  const [tab,setTab]=useState('pt');
  useEffect(()=>save(patients),[patients]);
  const cur=patients.find(p=>p.id===sel);
  const update=np=>setPatients(ps=>ps.map(p=>p.id===np.id?np:p));
  const remove=id=>{setPatients(ps=>ps.filter(p=>p.id!==id));setSel(null)};
  const add=()=>{const id='p'+Date.now();const np={id,code:'BN-'+String(patients.length+1).padStart(3,'0'),sex:'M',dob:'',lt:'',dx:'',peld:'',enteral:'',v:{}};setPatients(ps=>[...ps,np]);setSel(id);setTab('pt')};
  return h(React.Fragment,null,
    h('header',{className:'top'},h('div',{className:'top-inner'},
      h('div',{className:'logos'},h('img',{src:LOGO_DHYD,alt:'Logo Đại học Y Dược TP. Hồ Chí Minh'}),
        LOGO_ND2?h('img',{src:LOGO_ND2,alt:'Logo Bệnh viện Nhi Đồng 2'}):h('div',{className:'nd2',title:'Chèn logo Bệnh viện Nhi Đồng 2'},'NĐ2')),
      h('div',{className:'title'},h('h1',null,'Theo dõi dinh dưỡng trẻ ghép gan'),h('p',null,'Khoa Gan Mật Tụy – Ghép gan, Bệnh viện Nhi Đồng 2 · Đại học Y Dược TP. Hồ Chí Minh')),
      h('nav',{className:'tabs',role:'tablist'},[['pt','Bệnh nhi'],['ov','Tổng quan'],['gd','Hướng dẫn']].map(([k,l])=>h('button',{key:k,role:'tab','aria-selected':tab===k,onClick:()=>setTab(k)},l))))),
    h('p',{className:'note'},h('b',{style:{color:'var(--ink)'}},'Phiên bản thử nghiệm, sẽ được hoàn thiện trong đề án sáng kiến cải tiến của Bệnh viện Nhi Đồng 2. '),'Chỉ nhập dữ liệu đã ẩn danh; dữ liệu lưu trên trình duyệt của máy này.'),
    h('div',{className:'wrap'},
      tab==='pt'?h(React.Fragment,null,
        h('aside',{className:'side'},h('h2',null,'Danh sách bệnh nhi'),
          patients.map(p=>{const lv=level(alertsFor(p));return h('button',{key:p.id,className:'pt','aria-current':p.id===sel,onClick:()=>setSel(p.id)},
            h('b',null,p.code,h('span',{className:'pill '+lv},lv==='risk'?'Cao':lv==='warn'?'Theo dõi':'Ổn')),h('span',null,(p.sex==='F'?'Nữ':'Nam')+(p.lt?' · ghép '+vn(p.lt):'')))}),
          h('button',{className:'btn primary',onClick:add},'Thêm bệnh nhi')),
        h('main',{className:'main'},cur?h(Patient,{p:cur,update,remove}):h('section',{className:'panel empty'},'Chọn một bệnh nhi ở danh sách hoặc thêm bệnh nhi mới.'))):
      tab==='ov'?h(Overview,{patients}):h(Guide,{patients,setPatients})),
    h('footer',{className:'foot'},'Z-score tính theo chuẩn tăng trưởng WHO 2006 (0–5 tuổi) và tham chiếu WHO 2007 (5–19 tuổi). Hành lang tham chiếu: 62 trẻ ghép gan tại Bệnh viện Nhi Đồng 2 (Trần Ngọc Lưu, luận văn CKII, Đại học Y Dược TP. Hồ Chí Minh, 2026).'));
}
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
