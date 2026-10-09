/** Only adjusts the form layout; existing tour coordinates remain stored. */
export async function configureTourMapEditor(strapi: any) {
 const service=strapi.plugin('content-manager').service('components');
 const component=service.findComponent('shared.map-stops');
 if(!component)return;
 const configuration=await service.findConfiguration(component);
 const labels:Record<string,string>={title:'Título del día',order:'Número de día',duration:'Duración',routeText:'Resumen del transporte',description:'Descripción del día',imagen:'Imagen opcional',routePlan:'Recorrido del día'};
 const metadatas={...configuration.metadatas};
 for(const [name,label] of Object.entries(labels))metadatas[name]={...metadatas[name],edit:{...metadatas[name]?.edit,label,visible:true}};
 for(const name of ['longitude','latitude','transportMode','routeGeometry'])metadatas[name]={...metadatas[name],edit:{...metadatas[name]?.edit,visible:false}};
 const layouts={...configuration.layouts,edit:[[{name:'order',size:4},{name:'title',size:8}],[{name:'duration',size:6},{name:'routeText',size:6}],[{name:'routePlan',size:12}],[{name:'description',size:12}],[{name:'imagen',size:12}]]};
 await service.updateConfiguration(component,{...configuration,metadatas,layouts});
}
