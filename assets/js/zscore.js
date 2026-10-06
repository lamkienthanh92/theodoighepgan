/* Tính Z-score theo phương pháp LMS của WHO
 * - WHO Child Growth Standards 2006 (0–60 tháng): WFA, LFA (0–24 tháng), HFA (24–60 tháng), WFL (<24 tháng), WFH (24–60 tháng)
 * - WHO Growth Reference 2007 (61–228 tháng): HFA, BMI-for-age; WFA (61–120 tháng)
 * Chỉ số dựa trên cân nặng được điều chỉnh khi |z| > 3 theo khuyến cáo WHO (restricted LMS).
 * Phụ thuộc: WHO_LMS (who-lms.js).
 */
function interp(tab,x){ if(!tab||x<tab[0][0]-1e-9||x>tab[tab.length-1][0]+1e-9) return null;
  let i=0; while(i<tab.length-1&&tab[i+1][0]<x) i++;
  const a=tab[i], b=tab[Math.min(i+1,tab.length-1)]; if(b[0]===a[0]) return a.slice(1);
  const t=(x-a[0])/(b[0]-a[0]); return [a[1]+t*(b[1]-a[1]),a[2]+t*(b[2]-a[2]),a[3]+t*(b[3]-a[3])];}
function zLMS(y,p,restricted){ if(!p||!(y>0))return null; const [L,M,S]=p;
  let z= Math.abs(L)<1e-9? Math.log(y/M)/S : (Math.pow(y/M,L)-1)/(L*S);
  if(restricted&&Math.abs(z)>3){ const sd=k=>M*Math.pow(1+L*S*k,1/L);
    if(z>3) z=3+(y-sd(3))/(sd(3)-sd(2)); else z=-3-(sd(-3)-y)/(sd(-2)-sd(-3)); }
  return Math.round(z*100)/100;}
function whoZ(sex,ageM,w,h){ const s=sex==='F'?'F':'M', r={};
  if(ageM==null||ageM<0) return r;
  if(w>0){ if(ageM<=60) r.waz=zLMS(w,interp(WHO_LMS['wfa_'+s],ageM),true); else if(ageM<=120) r.waz=zLMS(w,interp(WHO_LMS['wfa7_'+s],ageM),true); }
  if(h>0){ if(ageM<24) r.haz=zLMS(h,interp(WHO_LMS['lfa_'+s],ageM)); else if(ageM<=60) r.haz=zLMS(h,interp(WHO_LMS['hfa_'+s],ageM)); else if(ageM<=228) r.haz=zLMS(h,interp(WHO_LMS['hfa7_'+s],Math.max(61,ageM))); }
  if(w>0&&h>0){ const B=w/Math.pow(h/100,2);
    if(ageM<=60){ r.whz=zLMS(w,interp(WHO_LMS[(ageM<24?'wfl_':'wfh_')+s],h),true); r.wtype='WHZ'; }
    else if(ageM<=228){ r.whz=zLMS(B,interp(WHO_LMS['bfa7_'+s],Math.max(61,ageM)),true); r.wtype='BMIZ'; } }
  return r;}
function classify(z,ageM){ const c=[];
  if(z.waz!=null){ if(z.waz<-3)c.push(['risk','Nhẹ cân nặng']); else if(z.waz<-2)c.push(['warn','Nhẹ cân']); }
  if(z.haz!=null){ if(z.haz<-3)c.push(['risk','Thấp còi nặng']); else if(z.haz<-2)c.push(['warn','Thấp còi']); }
  if(z.whz!=null){ if(z.wtype==='WHZ'){ if(z.whz<-3)c.push(['risk','Gầy còm nặng']); else if(z.whz<-2)c.push(['warn','Gầy còm']); else if(z.whz>3)c.push(['warn','Béo phì']); else if(z.whz>2)c.push(['warn','Thừa cân']); }
    else { if(z.whz<-3)c.push(['risk','Gầy nặng (BMI)']); else if(z.whz<-2)c.push(['warn','Gầy (BMI)']); else if(z.whz>2)c.push(['warn','Béo phì']); else if(z.whz>1)c.push(['warn','Thừa cân']); } }
  return c;}
