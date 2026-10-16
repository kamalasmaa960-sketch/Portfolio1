export { PortfolioDatabase };

const DEFAULT_DATA = {
  services: [
    {id:"svc1",title:"تصميم المواقع",desc:"مواقع احترافية متجاوبة مع الهواتف والأجهزة المختلفة.",image:"",emoji:"💻",link:""},
    {id:"svc2",title:"المتاجر الإلكترونية",desc:"تجربة منظمة لعرض المنتجات وتسهيل وصول العملاء إليها.",image:"",emoji:"🛍️",link:""},
    {id:"svc3",title:"أنظمة الإدارة والعيادات",desc:"واجهات لإدارة البيانات والحجوزات وسير العمل حسب احتياج المشروع.",image:"",emoji:"🗂️",link:""},
    {id:"svc4",title:"تصميم الإعلانات والبنرات",desc:"تصاميم رقمية واضحة تناسب حملتك أو نشاطك.",image:"",emoji:"🎨",link:""},
    {id:"svc5",title:"ملفات Excel وGoogle Sheets",desc:"جداول منظمة لمتابعة البيانات والمهام والتقارير.",image:"",emoji:"📊",link:""},
    {id:"svc6",title:"الترجمة والمحتوى والكتب الإلكترونية",desc:"مساعدة في الترجمة وصياغة المحتوى وتجهيز الكتب الرقمية.",image:"",emoji:"📚",link:""}
  ],
  projects: [],
  learning: [
    {id:"lng1",title:"الإسبانية",desc:"تطوير المفردات والقواعد والمحادثة خطوة بخطوة.",status:"أتعلمها حاليًا",progress:15,emoji:"🇪🇸"},
    {id:"lng2",title:"الصينية",desc:"التعرّف على اللغة والنطق والكتابة تدريجيًا.",status:"أعمل على تطويرها",progress:5,emoji:"🇨🇳"},
    {id:"lng3",title:"اليابانية",desc:"تطوير القراءة والمفردات والقواعد الأساسية.",status:"أتعلمها حاليًا",progress:10,emoji:"🇯🇵"},
    {id:"lng4",title:"الألمانية",desc:"بناء أساس لغوي في الكلمات والتراكيب اليومية.",status:"أعمل على تطويرها",progress:5,emoji:"🇩🇪"},
    {id:"lng5",title:"الأردية",desc:"التعرّف على المفردات والتعبيرات الأساسية.",status:"أخطط لتعلمها",progress:0,emoji:"🌿"},
    {id:"lng6",title:"Flutter",desc:"تطوير مهارات بناء تطبيقات الهاتف والواجهات.",status:"أعمل على تطويرها",progress:10,emoji:"📱"}
  ],
  settings:{email:"",owner:"أسماء كمال",adminName:"Asmaa",adminCode:"444444",purple:"#6d28d9",deep:"#3b0764",lav:"#ede9fe",paper:"#fcfaff"}
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/data") {
      const id = env.PORTFOLIO_DB.idFromName("asmaa-digital-studio-main");
      const stub = env.PORTFOLIO_DB.get(id);
      return stub.fetch(new Request("https://db.internal" + url.pathname, request));
    }
    if (url.pathname === "/api/health") {
      return Response.json({ok:true,service:"Asmaa Digital Studio Durable Object API"});
    }
    return env.ASSETS.fetch(request);
  }
};

class PortfolioDatabase {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; }
  async fetch(request) {
    const cors = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,PUT,OPTIONS","Access-Control-Allow-Headers":"Content-Type","Cache-Control":"no-store"};
    if (request.method === "OPTIONS") return new Response(null,{status:204,headers:cors});
    if (request.method === "GET") {
      let data = await this.ctx.storage.get("siteData");
      const empty = !data;
      if (!data) {
        data = DEFAULT_DATA;
        await this.ctx.storage.put("siteData", data);
      }
      return Response.json({data,empty},{headers:cors});
    }
    if (request.method === "PUT") {
      let incoming;
      try { incoming = await request.json(); } catch { return Response.json({error:"Invalid JSON"},{status:400,headers:cors}); }
      if (!incoming || !Array.isArray(incoming.services) || !Array.isArray(incoming.projects) || !Array.isArray(incoming.learning) || typeof incoming.settings !== "object") {
        return Response.json({error:"Invalid portfolio data"},{status:400,headers:cors});
      }
      const raw = JSON.stringify(incoming);
      if (raw.length > 900_000) return Response.json({error:"Database payload too large. Use image URLs instead of embedded images."},{status:413,headers:cors});
      await this.ctx.storage.put("siteData", incoming);
      return Response.json({ok:true,updatedAt:new Date().toISOString()},{headers:cors});
    }
    return new Response("Method Not Allowed",{status:405,headers:cors});
  }
}
