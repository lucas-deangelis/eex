const axios = require("axios").default;

const options = {
  headers: {
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language":
      "en-GB,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,zh-CN;q=0.5,zh;q=0.4,ja;q=0.3",
    Connection: "keep-alive",
    DNT: "1",
    Host: "webservice-eex.gvsi.com",
    Origin: "https://www.eex.com",
    Referer: "https://www.eex.com/",
    "sec-ch-ua":
      '"Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "cross-site",
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36",
  },
};

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

function createUrl(testing) {
  const url =
    "https://webservice-eex.gvsi.com/query/json/getChain/gv.pricesymbol/gv.displaydate/gv.expirationdate/tradedatetimegmt/gv.eexdeliverystart/ontradeprice/close/onexchsingletradevolume/onexchtradevolumeeex/offexchtradevolumeeex/openinterest/";
  const baseload = "?optionroot=%22%2FE.F7BY%22&";
  const peakload = "?optionroot=%22%2FE.F7PY%22&";

  let today;

  if (testing) {
    today = new Date();
    today.setDate(today.getDate() - 1);
  } else {
    today = new Date();
  }

  let yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const onDate = dayToParams(today);
  const experationDate = dayToParams(yesterday);

  const params = `expirationdate=${experationDate}&onDate=${onDate}`;

  return {
    baseload: url + baseload + params,
    peakload: url + peakload + params,
  };
}

async function basepeak(testing) {
  let urls = createUrl(testing);

  let base_response = await axios.get(urls.baseload, options);

  let baseload_data = base_response.data.results.items.map((el) => {
    return {
      Cal: el["gv.pricesymbol"].slice(8, 10),
      SettlementPrice: el.close,
    };
  });

  let peak_response = await axios.get(urls.peakload, options);

  let peakload_data = peak_response.data.results.items.map((el) => {
    return {
      Cal: el["gv.pricesymbol"].slice(8, 10),
      SettlementPrice: el.close,
    };
  });

  return {
    base: baseload_data,
    peak: peakload_data,
  };
}

basepeak().then((res) => console.log(res));

// exports.handler = async function(event, context) {
//     return JSON.stringify(basepeak(testing));
// }
