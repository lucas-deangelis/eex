"https://webservice-eex.gvsi.com/query/json/getChain/gv.pricesymbol/gv.displaydate/gv.expirationdate/tradedatetimegmt/gv.eexdeliverystart/ontradeprice/close/onexchsingletradevolume/onexchtradevolumeeex/offexchtradevolumeeex/openinterest/?optionroot=%22%2FE.ATPY%22&expirationdate=2021%2F03%2F02&onDate=2021%2F03%2F03"

const https = require("https");

const options = {
    headers: {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-GB,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,zh-CN;q=0.5,zh;q=0.4,ja;q=0.3",
        "Connection": "keep-alive",
        "DNT": "1",
        "Host": "webservice-eex.gvsi.com",
        "Origin": "https://www.eex.com",
        "Referer": "https://www.eex.com/",
        "sec-ch-ua": '"Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36",
    }
}

function dayToParams(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month.toString().length < 2) {
        month = "0" + month;
    }
    let day = date.getDate();
    if (day.toString().length < 2) {
        day = "0" + day;
    }

    return `${year}%2F${month}%2F${day}`;
}

function createUrl() {
    const url = "https://webservice-eex.gvsi.com/query/json/getChain/gv.pricesymbol/gv.displaydate/gv.expirationdate/tradedatetimegmt/gv.eexdeliverystart/ontradeprice/close/onexchsingletradevolume/onexchtradevolumeeex/offexchtradevolumeeex/openinterest/"; 
    const baseload = "?optionroot=%22%2FE.F7BY%22&";
    const peakload = "?optionroot=%22%2FE.F7PY%22&";

    let today = new Date();
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const onDate = dayToParams(today);
    const experationDate = dayToParams(yesterday);

    const params = `expirationdate=${experationDate}&onDate=${onDate}`;

    return {
        baseload: url + baseload + params,
        peakload: url + peakload + params,
    }
}

function basepeak() {
    let urls = createUrl();

    console.log("Baseload: " + urls.baseload);
    console.log("Peakload: " + urls.peakload);

    https.get(urls.baseload, options, (res) => {
        https.get(urls.peakload, options, (res2) => {
            res.on('data', (d) => {
                let toto = JSON.parse(d.toString("utf8"));
                console.log(toto);
            });

            res2.on('data', (d2) => {
                console.log(d2.toString('utf8'));
            })
        });
    });
}

basepeak();

// exports.handler = async function(event, context) {
    

//     return {
//         statusCode: 200,
//         body: JSON.stringify({message: "Hello World"})
//     }
// }