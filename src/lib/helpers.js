const { format } = require('timeago.js');
const moment = require('./moment');
const path = require('path');
const  mailer  = require('../lib/mailer');
const bcrypt = require('bcryptjs');
const pool = require('../config/conexiondb');


const helpers = {};

helpers.matchPassword = async(password,savePassword)=>{
   try {
     return  await bcrypt.compare(password,savePassword);
   } catch (error) {
       let now= new Date();
       console.log(error," ",now);
   }
};

helpers.lenArray = async(array)=>{
   console.log(array.length);
   return array.length;
};

helpers.getInfoPieChart = async(user, year)=>{
   //console.log(user,year);
  

   let filterUser = user.isadmin!=1 ? ` AND  t0.staff_id = ${user.staff_id} `:"";

   let filterYear = year != "Todos"? ` AND YEAR(t0.created)=${year} `: "";

   let subWhere = filterUser+filterYear;

  
   let sql_pie_ticket_x_servicio = `SELECT 
                                        t4.value AS "Servicio", 
                                        COUNT(t0.ticket_id) AS "TotalTickets"
                                        FROM ost_ticket t0
                                        INNER JOIN ost_thread t1 ON t0.ticket_id = t1.object_id AND t1.object_type='T'
                                        INNER JOIN ost_form_entry t2 ON t1.object_type= t2.object_type AND t1.object_id =t2.object_id
                                        INNER JOIN ost_form t3 ON t2.form_id = t3.id
                                        INNER JOIN ost_form_entry_values t4 ON t2.id = t4.entry_id
                                        INNER JOIN ost_ticket_status t5 ON t0.status_id = t5.id
                                        WHERE 
                                        t3.id = 18
                                        AND t4.field_id=40
                                        ${subWhere}
                                        GROUP BY 
                                        t4.value`;

   //console.log(sql_pie_ticket_x_servicio);

    const dataPieTicketsServicio = await pool.query(sql_pie_ticket_x_servicio);

    let colorItem = "";
    let labels =[];
    let data = [];
    let backgroundColor =[];
    let hoverBackgroundColor = [];
    let status = 200;
    if(dataPieTicketsServicio.length > 0 ){

      for(item in dataPieTicketsServicio){
         jsonServicio = JSON.parse(dataPieTicketsServicio[item].Servicio)
         for(j in jsonServicio){
             //console.log(jsonServicio[j]);
             labels.push(jsonServicio[j]);
         }
   
         data.push(dataPieTicketsServicio[item].TotalTickets);
         colorItem = '#'+Math.floor(Math.random()*16777215).toString(16);
         backgroundColor.push(colorItem);
         hoverBackgroundColor.push(colorItem);
      }
   
    }else{
      status = 500;
    }
    
  let jsonInfoPie = {labels,data,backgroundColor,hoverBackgroundColor,year,status};

  return jsonInfoPie;

};

helpers.timeago = (timestamp)=>{
    return format(timestamp);
 }
 
helpers.ifCond = async(v1, v2, optrue, compare="=")=>{
   
    switch (compare){
         case "<":
            return await (parseInt(v1) < parseInt(v2)) ? optrue : '';

         case ">":
            console.log(v1,v2);
            return await (parseInt(v1) > parseInt(v2)) ? optrue : '';
            
         default:
            return await (v1 == v2) ? optrue : '';
   }

    
 }

 
 helpers.consecutivo = (index)=>{
    return parseInt(index) +1;
 }

 
 helpers.formatDate =  (fecha)=>{
      const newDate = new Date(fecha);
      //console.log(newDate.toLocaleString());
      return newDate.toLocaleString();
 }

 

helpers.toDateString = (fecha)=>{
   const newDate = new Date(fecha);
   //console.log(newDate.toDateString());
   return newDate.toDateString();
}

helpers.mesStr = (fecha)=>{
   const MESES = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    const newDate = new Date(fecha);
    
    return MESES[newDate.getMonth()];
   
}

helpers.diaStr = (fecha)=>{
   const DIAS = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miercoles",
      "Jueves",
      "Viernes",
      "Sabado",
    ];
    const newDate = new Date(fecha);
    
    return DIAS[newDate.getDay()];
   
}

helpers.deteLong = (fecha)=>{
   const newDate = new Date(fecha);
   return moment(fecha).format('dddd, DD MMMM YYYY');
}


helpers.formatNumber = (valor)=>{
   let valorFormat  = new Intl.NumberFormat().format(valor);
   return valorFormat;
}

helpers.number_format = (number, decimals, dec_point, thousands_sep)=>{
   // *     example: number_format(1234.56, 2, ',', ' ');
  // *     return: '1 234,56'
  number = (number + '').replace(',', '').replace(' ', '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + Math.round(n * k) / k;
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }
  return s.join(dec);
}



helpers.redondear= (valor,tipo) =>{

   valor = valor ==null ? 0 : valor;
   let newValor;
   
   if(tipo =="Entero"){
      newValor = Math.round(valor);
   }
   if(tipo =="Decimal"){
      newValor = parseFloat(valor).toFixed(2);
   }
   
   
   return newValor;
}



helpers.anioActual = (anio ="")=>{
   if(anio==""){
      var date = new Date();
      return date.getFullYear();
   }else{
      return anio;
   }
   
}

helpers.ultimoDiaFecha = (fecha) =>{
   var date = new Date(fecha);
   var primerDia = new Date(date.getFullYear(), date.getMonth(), 1);
   var ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 0);

   //console.log(primerDia,ultimoDia);

   return ultimoDia;
}

helpers.restarFechas = (fecha1, fecha2, opcionArestar) =>{

   var f1 = new Date(fecha1); 
   var f2 = new Date(fecha2);

   var difference= Math.abs(f1-f2);
   switch (opcionArestar) {
      case 'dias':
         return difference/(1000 * 3600 * 24);
      case 'meses':
         return difference/(1000 * 3600 * 24 * 30);
         case 'años':
            return difference/(1000 * 3600 * 24 * 30 * 12);

   }
   

}


helpers.ipClient = async(req)=>{
   
   const ip = await (req.header('x-forwarded-for') || req.connection.remoteAddress);
   return ip;
};

helpers.dateForLog = ()=>{
   return moment().format('LLLL');
};


helpers.sendEmail= async (contentMail)=>{

         mailer.sendMail({
                 from:"'SIIS' <mesadeayuda@bienestarips.com>",
                 to: "",
                 bcc:"ronald.albor@bienestarips.com,carlos.navas@bienestarips.com",
                 subject:`Notificación pendiente de revisión SIIS`,
                 html:contentHTML
             }, async function (error, info){
                 if(error){
                     console.error(error);
                     return 200;
                 }else{
                     console.log("Mensaje enviado", info.messageId);
                     return 200;
                 }
                 
             });
             
        
}
    



module.exports = helpers; 