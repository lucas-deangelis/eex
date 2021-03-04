# TODO: logs de partout
# TODO: expriration date est le jour d'avant
# TODO: gestion d'erreur?

import requests
from datetime import date, datetime, timedelta
import subprocess

def pad_day(day: str):
    if len(day) < 2:
        return "0" + day
    else:
        return day

def day_to_param(day):
    return day.strftime("%Y") + "%2F" + day.strftime("%m") + "%2F" + pad_day(day.strftime("%d"))

def url_params(day):
    today = day
    yesterday = day - timedelta(days=1)

    onDate = day_to_param(today)
    expirationDate = day_to_param(yesterday)

    return "expirationdate=" + expirationDate + "&onDate=" + onDate

def log(logs: str):
    filename = "eex log " + date.today().strftime("%Y-%m-%d")
    with open(filename, 'a') as file:
        file.write(datetime.today().strftime("%H:%M:%S") + " " + logs)
        file.write("\n")

def get_load(url):
    # Les headers de chrome quand on fait la requête sur le site officiel
    headers = {
        "A6ccept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "fr-FR,fr,q=0.9,en-US;q=0.8,en;q=0.7",
        "Connection": "keep-alive",
        "Host": "webservice-eex.gvsi.com",
        "Origin": "https://www.eex.com",
        "Referer": "https://www.eex.com/en/market-data/power/futures",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36"
    }

    # La date pour laquelle on demande les données. Le %2 est simplement le formatage que EEX utilise
    total_url = url + url_params(date.today() - timedelta(days=1))
    log("total URL: " + total_url)

    data = requests.get(total_url, headers=headers)
    json = data.json()

    settlement_price = []

    for el in json["results"]["items"]:
        if el["close"] is None:
            settlement_price.append("-")
        else:
            settlement_price.append(str(el["close"]))
    
    return settlement_price

def get_baseload():
    baseload_url = "https://webservice-eex.gvsi.com/query/json/getChain/gv.pricesymbol/gv.displaydate/gv.expirationdate/tradedatetimegmt/ontradeprice/close/onexchsingletradevolume/onexchtradevolumeeex/offexchtradevolumeeex/openinterest/?optionroot=%22%2FE.F7BY%22&"

    return get_load(baseload_url)

def get_peakload():
    peakload_url = "https://webservice-eex.gvsi.com/query/json/getChain/gv.pricesymbol/gv.displaydate/gv.expirationdate/tradedatetimegmt/ontradeprice/close/onexchsingletradevolume/onexchtradevolumeeex/offexchtradevolumeeex/openinterest/?optionroot=%22%2FE.F7PY%22&"

    return get_load(peakload_url)

def run_eex(baseloads, peakloads):
    print("run")
    command = ["eex.exe"]
    for el in baseloads:
        command.append(el)
    for el in peakloads:
        command.append(el)
    subprocess.run(command)

baseloads = get_baseload()
log("baseloads ok")
# Python supporte pas de juste print/afficher en string une liste
log(' '.join(baseloads))
peakloads = get_peakload()
log("peakloads ok")
# Python supporte pas de juste print/afficher en string une liste
log(' '.join(peakloads))
run_eex(baseloads, peakloads)
log("eex launched")
