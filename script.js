// ======================================================================
// SECTION 1: DATA
// Problem categories, evidence types, and safety-risk wording
// ======================================================================
var PROBLEM_CATEGORIES = {
  roads:{label:"Roads, sidewalks and transit", fit:0.9, progs:["the Safe Streets and Roads for All grant program","federal-aid highway funding"], subs:[
    ["Unsafe crossing or intersection",null],["Missing or broken sidewalk",null],["Potholes and road damage",null],
    ["Speeding and dangerous driving",null],["Bus or transit service",["Federal Transit Administration grants"]],["Bike and walking paths",null]]},
  safety:{label:"Public safety", fit:0.6, progs:["Department of Justice community policing and violence-prevention grants"], subs:[
    ["Crime in my area",null],["Gun violence prevention",null],["Slow emergency response",null],
    ["Drug and overdose crisis",["federal opioid response and treatment funding"]],["Domestic violence resources",["Violence Against Women Act programs"]],
    ["Disaster preparedness",["FEMA hazard mitigation grants"]]]},
  schools:{label:"Schools and education", fit:0.7, progs:["Department of Education funding streams such as Title I"], subs:[
    ["Underfunded school",null],["Special education support",["IDEA special education funding"]],["School safety",null],
    ["Student mental health",null],["Childcare access",["Child Care and Development Block Grant funding"]],
    ["College and trade-school costs",["Pell Grants and federal student aid"]]]},
  env:{label:"Environment and climate", fit:0.85, progs:["EPA grants and cleanup programs"], subs:[
    ["Unsafe drinking water",["EPA drinking water state revolving funds"]],["Air pollution",null],["Dumping or contamination",["EPA brownfield cleanup grants"]],
    ["Flooding and drainage",["FEMA hazard mitigation grants"]],["Wildfire and smoke",["FEMA and wildfire mitigation funding"]],["Clean energy access",null]]},
  housing:{label:"Housing and homelessness", fit:0.75, progs:["HUD housing programs"], subs:[
    ["Unaffordable rent",null],["Homelessness",["HUD Continuum of Care homelessness funding"]],["Unsafe or poorly kept rentals",null],
    ["Not enough new housing",null],["Eviction and foreclosure",null]]},
  health:{label:"Health care and mental health", fit:0.7, progs:["HHS community health funding"], subs:[
    ["No clinic or doctor nearby",["federally qualified health center funding"]],["Mental health services",["SAMHSA mental health grants"]],
    ["Prescription and care costs",null],["Addiction treatment",["SAMHSA treatment grants"]],["Maternal and child health",null]]},
  internet:{label:"Internet and technology", fit:0.95, progs:["the BEAD broadband program","FCC connectivity programs"], subs:[
    ["No broadband available",null],["Internet too slow or costly",["FCC affordability and connectivity programs"]],
    ["Cell service dead zones",null],["Digital skills training",null],["Online scams and safety",null]]},
  econ:{label:"Jobs, money and the economy", fit:0.7, progs:["Department of Labor workforce programs","Small Business Administration programs"], subs:[
    ["Not enough good jobs",null],["Job training",["Workforce Innovation and Opportunity Act programs"]],
    ["Small business support",["Small Business Administration programs"]],["Hunger and food access",["SNAP and WIC"]],["Cost of living",null]]},
  access:{label:"Accessibility and disability", fit:0.8, progs:["Americans with Disabilities Act enforcement and accessibility funding"], subs:[
    ["Inaccessible buildings",null],["Inaccessible transit",["Federal Transit Administration accessibility funding"]],
    ["Services for people with disabilities",null],["Inaccessible websites and apps",null]]},
  seniors:{label:"Seniors and veterans", fit:0.9, progs:["Older Americans Act programs"], subs:[
    ["Veterans benefits and care",["Department of Veterans Affairs benefits and care"]],["Senior isolation and services",["Older Americans Act programs"]],
    ["Medicare or Social Security problem",["casework help with Medicare and Social Security"]],["Elder fraud",null]]},
  parks:{label:"Parks, libraries and community spaces", fit:0.4, progs:["the Land and Water Conservation Fund"], subs:[
    ["Park needs repair",["the Land and Water Conservation Fund"]],["No youth programs",null],["Library or community center",["Institute of Museum and Library Services grants"]],["Arts and culture",null]]},
  gov:{label:"Government services and red tape", fit:0.8, progs:["casework services for problems with federal agencies"], subs:[
    ["Stuck with a federal agency",["casework services for problems with federal agencies"]],["Local permit or service delays",[]],["Voting access",[]]]},
  other:{label:"Something else", fit:0.3, progs:[], subs:[["Another community issue",null]]}
};
function getSubcategoryLabel(d){return PROBLEM_CATEGORIES[d.cat].subs[d.subIdx||0][0]}
function getFederalPrograms(d){var x=PROBLEM_CATEGORIES[d.cat].subs[d.subIdx||0][1];return x||PROBLEM_CATEGORIES[d.cat].progs}
function joinWithCommas(a){return a.length<3?a.join(" and "):a.slice(0,-1).join(", ")+", and "+a[a.length-1]}
function fillSubcategoryOptions(){var sel=byId("subcategory");sel.textContent="";PROBLEM_CATEGORIES[byId("category").value].subs.forEach(function(x,i){var o=document.createElement("option");o.value=i;o.textContent=x[0];sel.appendChild(o)})}
var EVIDENCE_TYPES = [
  ["photos","I have photos or video"],
  ["log","I have written down dates and incidents"],
  ["neighbors","Neighbors or a group support this"],
  ["report","I filed an official report or request"],
  ["local","I already asked my city or county"]
];
var RISK_DESCRIPTIONS = [
  "It isn’t dangerous, but it wears on people’s daily lives.",
  "It’s mostly an inconvenience, with a bit of a safety concern.",
  "It’s a real, ongoing safety concern for people here.",
  "People here are at real risk of getting hurt.",
  "I’m genuinely worried someone will be seriously hurt.",
  "This is an urgent safety problem, and I’m afraid someone will be badly hurt if nothing changes."
];
var byId = function(id){return document.getElementById(id)};
var currentTab = 1, attachedFiles = [], previewUrls = [];

// ======================================================================
// SECTION 2: BUILD THE FORM
// Fill the dropdowns and evidence checkboxes when the page loads
// ======================================================================
Object.keys(PROBLEM_CATEGORIES).forEach(function(k){var o=document.createElement("option");o.value=k;o.textContent=PROBLEM_CATEGORIES[k].label;byId("category").appendChild(o)});
fillSubcategoryOptions();
EVIDENCE_TYPES.forEach(function(e){var l=document.createElement("label");var c=document.createElement("input");c.type="checkbox";c.id="evidence-"+e[0];var s=document.createElement("span");s.textContent=e[1];l.appendChild(c);l.appendChild(s);byId("evidenceList").appendChild(l)});

// ======================================================================
// SECTION 3: READ + SCORE
// Read the form, calculate the 0-100 score, give a verdict, routing advice, and tips
// ======================================================================
function readForm(){
  var ev = EVIDENCE_TYPES.filter(function(e){return byId("evidence-"+e[0]).checked}).map(function(e){return e[0]});
  return {
    problem:byId("problem").value.trim(), cat:byId("category").value, subIdx:parseInt(byId("subcategory").value)||0, place:byId("place").value.trim(),
    people:Math.max(1,parseInt(byId("people").value)||1), months:Math.max(0,parseInt(byId("months").value)||0),
    risk:parseInt(byId("risk").value), ev:ev, ask:byId("ask").value.trim(), further:byId("further").value.trim(), phone:byId("phone").value.trim(), nfiles:attachedFiles.length,
    name:byId("name").value.trim(), rep:byId("repLastName").value.trim()
  };
}
function calculateScore(d){
  var c = PROBLEM_CATEGORIES[d.cat];
  var parts = [
    {k:"Reach", max:25, v:Math.min(Math.log10(d.people+1)/3.5,1)*25},
    {k:"Safety risk", max:30, v:d.risk/5*30},
    {k:"How long it has lasted", max:15, v:Math.min(d.months/12,1)*15},
    {k:"Evidence", max:20, v:d.ev.length/EVIDENCE_TYPES.length*20},
    {k:"Federal fit", max:10, v:c.fit*10}
  ];
  var total = Math.round(parts.reduce(function(a,p){return a+p.v},0));
  return {parts:parts,total:total};
}
function getVerdict(t){
  if(t<35) return ["Build the case","You’re just getting started. Collect a bit more proof and talk to your neighbors before you send this."];
  if(t<60) return ["Getting stronger","This is clearly a real problem. A little more proof will make it hard to brush aside."];
  if(t<80) return ["Strong case","This is ready to send. The tips below can make it even stronger."];
  return ["Send it","This is a serious, well-documented case. Send it, then follow up."];
}
function getRecommendedTarget(d,s){
  var c = PROBLEM_CATEGORIES[d.cat], local = d.ev.indexOf("local")>-1;
  if(d.cat==="gov" && d.subIdx===0) return "Contact your U.S. Representative’s office. Helping constituents who are stuck with a federal agency is one of the main things a House office does, so send this now.";
  if(!local) return "Start local. Ask your city or county first and keep the reply. Representatives take a case more seriously when local channels have already been tried.";
  if(c.fit>=0.7 && s.total>=50) return "Send this to your U.S. Representative. Federal programs can fund this kind of fix" + (getFederalPrograms(d).length?": ask about "+joinWithCommas(getFederalPrograms(d))+".":".");
  if(c.fit>=0.7) return "Federal money can help here, but strengthen the case first, then send it to your U.S. Representative.";
  return "This is mostly handled locally or by your state. Send it to your city council and state legislator, and copy your U.S. Representative.";
}
function getImprovementTips(d,s){
  var T = {
    "Reach":"Count who is affected (students, drivers, households) and use a real number. Ask neighbors to add their names.",
    "Safety risk":"Write down specific incidents: near misses, injuries, or complaints. Specifics move the risk rating.",
    "How long it has lasted":"Find the earliest date it was reported and say how long it has gone unresolved.",
    "Evidence":"Take dated photos, keep a simple log, and file an official request so you have a reference number.",
    "Federal fit":"Look up whether a federal grant covers this problem, and mention it by name in your ask."
  };
  return s.parts.map(function(p){return {k:p.k,r:p.v/p.max}}).sort(function(a,b){return a.r-b.r}).slice(0,2).map(function(x){return T[x.k]});
}

// ======================================================================
// SECTION 4: WRITING
// Generate the letter and the 60-second call script from templates
// ======================================================================
function describeDuration(m){ if(m<1) return " recently"; if(m<12) return " for about "+m+(m===1?" month":" months"); var y=Math.round(m/12*10)/10; return " for about "+y+(y===1?" year":" years"); }
function describeEvidence(d){
  var m = {photos:"photos and video",log:"a dated log of what has happened",neighbors:"support from my neighbors",report:"an official report on file"};
  var l = d.ev.filter(function(k){return m[k]}).map(function(k){return m[k]});
  var t = "";
  if(l.length){ if(l.length>1) l[l.length-1]="and "+l[l.length-1]; t = "I’ve kept track of it carefully, with "+l.join(l.length>2?", ":" ")+". "; }
  if(d.nfiles) t += "I’ve also gathered "+d.nfiles+(d.nfiles===1?" photo or video":" photos and videos")+" that I’m glad to send. ";
  return t;
}
function lowerFirst(t){return t.charAt(0).toLowerCase()+t.slice(1).replace(/\.$/,"")}
function writeLetter(d){
  var p = d.problem||"[describe the problem]", rep = d.rep?("Representative "+d.rep):"Representative [last name]";
  var who = d.name||"[your name]", where = d.place?(" near "+d.place):"";
  var s = "Dear "+rep+",\n\nMy name is "+who+", and I’m one of your constituents. I’m writing about something that has been worrying a lot of us"+where+": "+lowerFirst(p)+" ("+getSubcategoryLabel(d).toLowerCase()+").\n\n";
  s += "It affects roughly "+d.people.toLocaleString()+" people, and it has been going on"+describeDuration(d.months)+". "+RISK_DESCRIPTIONS[d.risk]+" "+describeEvidence(d);
  if(d.ev.indexOf("local")>-1) s += "I’ve already raised it with my city or county, and I’d like to bring it to you as well. ";
  if(d.further) s += "\n\nA few more details that matter to me:\n"+d.further;
  s += "\n\nHere’s what I’m hoping you can help with: "+(d.ask?lowerFirst(d.ask):"[say exactly what you’d like done]")+".";
  if(getFederalPrograms(d).length) s += " I’ve read that "+joinWithCommas(getFederalPrograms(d))+" may be worth looking into, and I’d really value your office’s guidance.";
  s += "\n\nI know your office hears from a lot of people, so thank you for taking the time to read this. Could someone on your staff let me know who is looking into it and what the next step might be? I’m happy to share photos, dates, or put you in touch with neighbors who feel the same way.\n\nThank you, truly.\n\nWarmly,\n"+who;
  return s;
}
function writeCallScript(d){
  var who = d.name||"[your name]", p = d.problem||"[the problem]";
  return "Hi, my name is "+who+" and I’m a constituent"+(d.place?" from "+d.place:"")+". Thanks for taking my call.\n\n"+
  "I’m calling about "+lowerFirst(p)+". It affects around "+d.people.toLocaleString()+" people and has been going on"+describeDuration(d.months)+". "+RISK_DESCRIPTIONS[d.risk]+"\n\n"+
  "What I’m hoping the Representative can do is "+(d.ask?lowerFirst(d.ask):"[your ask]")+".\n\n"+
  "Could you tell me who on the staff handles "+PROBLEM_CATEGORIES[d.cat].label.toLowerCase()+"? I’d be glad to email photos and details. And may I leave my phone number in case someone wants to follow up?\n\nThank you so much for your time.";
}

// ---------- renderCase ----------
function renderCase(){
  var d = readForm(), s = calculateScore(d), v = getVerdict(s.total);
  byId("riskOut").textContent = d.risk;
  byId("score").textContent = s.total;
  byId("verdict").textContent = v[0]; byId("verdictSub").textContent = v[1];
  var b = byId("bars"); b.textContent = "";
  s.parts.forEach(function(p){
    var w = document.createElement("div"); w.className = "bar";
    var h = document.createElement("b"), a = document.createElement("span"), n = document.createElement("span");
    a.textContent = p.k; n.textContent = Math.round(p.v)+" / "+p.max; h.appendChild(a); h.appendChild(n);
    var t = document.createElement("div"); t.className = "track";
    var f = document.createElement("div"); f.className = "fill"; f.style.width = (p.v/p.max*100)+"%";
    t.appendChild(f); w.appendChild(h); w.appendChild(t); b.appendChild(w);
  });
  byId("target").textContent = getRecommendedTarget(d,s);
  var tl = byId("tips"); tl.textContent = "";
  getImprovementTips(d,s).forEach(function(x){var li=document.createElement("li");li.textContent=x;tl.appendChild(li)});
  byId("doc").textContent = currentTab===1 ? writeLetter(d) : writeCallScript(d);
  renderWhoToCall(d);
  byId("letterTab").setAttribute("aria-selected",currentTab===1); byId("callTab").setAttribute("aria-selected",currentTab===2);
}
function renderWhoToCall(d){
  var w = byId("who"); w.textContent = "";
  function line(t){var p=document.createElement("p");p.style.margin="0 0 8px";p.textContent=t;w.appendChild(p);return p}
  function tel(p,num,label){var a=document.createElement("a");a.href="tel:+"+num;a.textContent=label;a.style.fontWeight="700";p.appendChild(a)}
  var dg = (d.phone||"").replace(/\D/g,"");
  if(dg.length===10||(dg.length===11&&dg.charAt(0)==="1")) tel(line("Your representative’s office: "), dg.length===10?"1"+dg:dg, d.phone);
  else line("Add your representative’s office number above and it will appear here as a tap-to-call link.");
  line("Don’t have it? Open your representative’s website from the House.gov lookup and find the Contact page. Most offices list a Washington, D.C. number plus district offices closer to home, and a district office is often the easiest place to start.");
  tel(line("Or call the U.S. House switchboard and ask to be connected to your representative’s office: "), "12022243121", "(202) 224-3121");
  line("Tell whoever answers that you’re a constituent, name the issue, and ask who on the staff handles it.");
}
function showToast(m){var t=byId("toast");t.textContent=m;t.classList.add("on");setTimeout(function(){t.classList.remove("on")},1800)}

// ======================================================================
// SECTION 6: EVENTS
// Buttons, tabs, copy, email, file previews, ZIP lookup, and the example case
// ======================================================================
byId("category").addEventListener("input",fillSubcategoryOptions);
document.querySelectorAll("input,select,textarea").forEach(function(el){el.addEventListener("input",renderCase)});
byId("letterTab").onclick = function(){currentTab=1;renderCase()};
byId("callTab").onclick = function(){currentTab=2;renderCase()};
byId("copy").onclick = function(){
  var txt = byId("doc").textContent;
  function fb(){var a=document.createElement("textarea");a.value=txt;document.body.appendChild(a);a.select();try{document.execCommand("copy");showToast("Copied")}catch(e){showToast("Select the text and copy it")}document.body.removeChild(a)}
  try{ navigator.clipboard.writeText(txt).then(function(){showToast("Copied")},fb) }catch(e){ fb() }
};
byId("zip").addEventListener("input",function(){
  var z = byId("zip").value.replace(/\D/g,"");
  byId("findrep").href = z.length===5 ? "https://www.house.gov/htbin/findrep?ZIP="+z : "https://www.house.gov/representatives/find-your-representative";
});
byId("files").addEventListener("change",function(){
  previewUrls.forEach(function(u){URL.revokeObjectURL(u)}); previewUrls = [];
  attachedFiles = Array.prototype.slice.call(byId("files").files).filter(function(f){return /^(image|video)\//.test(f.type)}).slice(0,12);
  var box = byId("previews"); box.textContent = "";
  attachedFiles.forEach(function(f){
    var u = URL.createObjectURL(f); previewUrls.push(u);
    var isV = f.type.indexOf("video")===0, el = document.createElement(isV?"video":"img");
    el.src = u; if(isV){el.controls = true; el.preload = "metadata"} else el.alt = f.name;
    box.appendChild(el);
  });
  renderCase();
});
byId("mail").onclick = function(){
  var d = readForm(), subj = "Constituent concern: "+(d.problem||"a problem in our community");
  window.location.href = "mailto:?subject="+encodeURIComponent(subj)+"&body="+encodeURIComponent(writeLetter(d));
};
byId("sample").onclick = function(){
  byId("problem").value="No crosswalk at the entrance of our elementary school";
  byId("category").value="roads";fillSubcategoryOptions();byId("subcategory").value="0"; byId("place").value="Maple St & 5th Ave, Boise";
  byId("people").value=480; byId("months").value=14; byId("risk").value=4;
  byId("ask").value="Fund a marked crosswalk with a flashing beacon and a crossing guard";
  byId("name").value="Alex Rivera"; byId("repLastName").value="Smith";
  byId("further").value="Two near misses were reported to the school office in March. City request #4821 is still open.";
  ["photos","log","neighbors","report","local"].forEach(function(k,i){byId("evidence-"+k).checked = i<4});
  renderCase();
};

// ======================================================================
// SECTION 7: SAVED CASES
// Save, open, and delete cases using localStorage (safe if storage is blocked)
// ======================================================================
function loadSavedCases(){try{return JSON.parse(localStorage.getItem("louder.cases")||"[]")}catch(e){return []}}
function saveCases(a){try{localStorage.setItem("louder.cases",JSON.stringify(a))}catch(e){showToast("Saving is blocked in this browser")}}
function fillFormFromCase(d){
  byId("problem").value=d.problem;byId("category").value=d.cat;fillSubcategoryOptions();byId("subcategory").value=String(d.subIdx||0);byId("place").value=d.place;byId("people").value=d.people;byId("months").value=d.months;
  byId("risk").value=d.risk;byId("further").value=d.further||"";byId("phone").value=d.phone||"";byId("ask").value=d.ask;byId("name").value=d.name;byId("repLastName").value=d.rep;
  EVIDENCE_TYPES.forEach(function(e){byId("evidence-"+e[0]).checked = d.ev.indexOf(e[0])>-1});
  renderCase();
}
function renderSavedCases(){
  var a = loadSavedCases(), ul = byId("savedList"); ul.textContent = ""; byId("savedBox").hidden = !a.length;
  a.forEach(function(d,i){
    var li=document.createElement("li"), n=document.createElement("span"); n.textContent=(d.problem||"Untitled case")+" ("+calculateScore(d).total+")";
    var bx=document.createElement("span");
    var o=document.createElement("button");o.className="ghost";o.type="button";o.textContent="Open";o.onclick=function(){fillFormFromCase(d)};
    var x=document.createElement("button");x.className="ghost";x.type="button";x.textContent="Delete";x.style.marginLeft="6px";
    x.onclick=function(){var b=loadSavedCases();b.splice(i,1);saveCases(b);renderSavedCases()};
    bx.appendChild(o);bx.appendChild(x);li.appendChild(n);li.appendChild(bx);ul.appendChild(li);
  });
}
byId("save").onclick = function(){var d=readForm(); if(!d.problem){showToast("Describe the problem first");return} var a=loadSavedCases();a.unshift(d);saveCases(a.slice(0,10));renderSavedCases();showToast("Saved")};

renderCase(); renderSavedCases();
