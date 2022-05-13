const express = require('express');
const router = express.Router();

const fs = require('fs');

const path = require('path');

const helpers = require('../lib/helpers');

const pool = require('../config/conexiondb');

const { isLoggedIn,noNeedSeeIfyouLogIn } = require('../lib/auth');

const verifyToken = require('../lib/verifyToken');
const { render } = require('timeago.js');


//,verifyToken
router.get("/",isLoggedIn,async(req, res)=>{

    const user = req.user;

    let filterUser ="";
    if(user.isadmin!=1){
        filterUser = filterUser + ` WHERE t0.staff_id = ${user.staff_id} `;
    }

    let sql_years_chart = `SELECT DISTINCT YEAR(t0.created) as "year" FROM ost_ticket t0 ${filterUser} ORDER BY 1 DESC`;
    let years_chart = await pool.query(sql_years_chart);
    console.log(years_chart);
    //let last_year = years_chart[0].year;
    /*
    let sql_status_tickets = `SELECT 
    t1.id,
    t1.name ,
    COUNT(t0.ticket_id) AS "TotalStatusTicket", 
    (SELECT COUNT(tt0.ticket_id) FROM ost_ticket tt0) AS "TotalTickets",
    (COUNT(t0.ticket_id)/(SELECT COUNT(tt0.ticket_id) FROM ost_ticket tt0)*100) AS "porcentaje"
    FROM ost_ticket t0
    INNER JOIN ost_ticket_status t1 ON t0.status_id = t1.id
    GROUP BY t1.id,t1.name`;

    let sql_tickets_overdue = `SELECT 
    COUNT(t0.ticket_id) AS "TotalStatusTicket", 
    (SELECT COUNT(tt0.ticket_id) FROM ost_ticket tt0) AS "Totaltickets",
    (COUNT(t0.ticket_id)/(SELECT COUNT(tt0.ticket_id) FROM ost_ticket tt0)*100) AS "porcentaje" 
    FROM ost_ticket t0
    
    WHERE 
    isoverdue = 1`;
   
    let json_status_ticket = [{oepn:[],closed:[],resolved:[], overdue:[]}];
    
    const status_tickets = await pool.query(sql_status_tickets);
    const tickets_overdue = await pool.query(sql_tickets_overdue);

    json_status_ticket.overdue = tickets_overdue[0];

   // console.log(status_tickets);

    for(item in status_tickets){
       //console.log(status_tickets[item]);
        
        switch (status_tickets[item].name) {
            case "Open":
                json_status_ticket.open= status_tickets[item];
                break;

            case "Resolved":
                json_status_ticket.resolved=status_tickets[item];
                break;
            
            case "Closed":
                json_status_ticket.closed=status_tickets[item];
                break;
        }
        
    }*/
/*
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
                                        GROUP BY 
                                        t4.value`;
    const dataPieTicketsServicio = await pool.query(sql_pie_ticket_x_servicio);

    let colorItem = "";
    let labels =[];
    let data = [];
    let backgroundColor =[];
    let hoverBackgroundColor = [];
    
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

    //console.log(labels);
    //console.log(data);
    //console.log(backgroundColor);
    //console.log(hoverBackgroundColor);

    let sql_infoLineChart = `SELECT 
                                YEAR(t0.created) AS "anio",
                                MONTH(t0.created) AS "mes",
                                COUNT(t0.ticket_id) AS "TotalTicket" 
                            FROM ost_ticket t0
                            WHERE YEAR(t0.created) = ${last_year}
                            GROUP BY 
                            YEAR(t0.created),
                                MONTH(t0.created)
                                ORDER BY 1,2 DESC`;

const dataLineChart = await pool.query(sql_infoLineChart);

let jsonFilePieChart = path.join(__dirname,"../public/js/jsonDataPieIndex.json");
    let jsonInfoPieChart ;
    const hoy = new Date();
    if(fs.existsSync(jsonFilePieChart)){
        jsonInfoPieChart = JSON.parse(fs.readFileSync(jsonFilePieChart, 'utf-8'));

        //console.log(jsonInfoPieChart.datasets[0].data);
        jsonInfoPieChart.lastUpdate = helpers.timeago(hoy);
        jsonInfoPieChart.labels = labels;
        jsonInfoPieChart.datasets[0].data = data;
        jsonInfoPieChart.datasets[0].backgroundColor = backgroundColor;
        jsonInfoPieChart.datasets[0].hoverBackgroundColor = hoverBackgroundColor;

        let filePie = fs.writeFileSync(jsonFilePieChart, JSON.stringify(jsonInfoPieChart));

    }else{

        jsonInfoPieChart = {
            "lastUpdate":helpers.timeago(hoy),
            "labels": labels,
            "datasets": [{
                "data": data,
                "backgroundColor": backgroundColor,
                "hoverBackgroundColor": hoverBackgroundColor,
                "hoverBorderColor": "rgba(234, 236, 244, 1)"
              }]
        };

        let filePie =  fs.writeFileSync(jsonFilePieChart, JSON.stringify(jsonInfoPieChart));
    }

    //console.log(dataLineChart);
    let maxMonthLineChart = dataLineChart[0].mes;
    console.log(maxMonthLineChart);
    let dataInfoLineChart =[];
    let sw_mes;
    let indexMes;
    for(i=1;i<=maxMonthLineChart;i++){
        sw_mes = false;
        for(j in dataLineChart){

            console.log(dataLineChart[j].mes,i);
            if(dataLineChart[j].mes == i){
                sw_mes = true;
                indexMes =j;    
            }
        }

        console.log(sw_mes ? dataLineChart[indexMes].TotalTicket:0);

        dataInfoLineChart.push(sw_mes ? dataLineChart[indexMes].TotalTicket:0);
    }

    
    let jsonFileLineChart = path.join(__dirname,"../public/js/jsonDataAreaIndex.json");
    let jsonInfoLineChart ;
   
    if(fs.existsSync(jsonFileLineChart)){
        jsonInfoLineChart = JSON.parse(fs.readFileSync(jsonFileLineChart, 'utf-8'));
        jsonInfoLineChart.lastUpdate = helpers.timeago(hoy);
        jsonInfoLineChart.year = last_year;
        jsonInfoLineChart.data= dataInfoLineChart;

        console.log(jsonInfoLineChart);
        let fileLine = fs.writeFileSync(jsonFileLineChart, JSON.stringify(jsonInfoLineChart));
    }else{
        jsonInfoLineChart = {
            "lastUpdate":helpers.timeago(hoy),
            "data": dataInfoLineChart,
            "year":last_year
        };

        let fileLine = fs.writeFileSync(jsonFileLineChart, JSON.stringify(jsonInfoLineChart));
    }
   */

    res.render('index', { years_chart});
});


module.exports = router;