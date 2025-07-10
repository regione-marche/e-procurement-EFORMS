# m-eforms-ms



## Avvio

Avviare la classe principale con i seguenti parametri

```
spring.profiles.active=dev
CVS_API_KEY=<la chiave per le APIs TED>
```
## Lista variabili d'ambiente

| Nome                   | Default                              | Default (DEV)     | Descrizione                                             |
|------------------------|--------------------------------------|-------------------|---------------------------------------------------------|
| SERVER_PORT            | 8080                                 | 8181              | Porta del microservizio                                 |
| spring.profiles.active | prod                                 | -                 | Profilo Spring                                          |
| CONTEXT_PATH           | -                                    | /rest/m-eforms-ms | Contesto di base Spring                                 |
| LOG_LEVEL              | INFO                                 | DEBUG             | Livello di logging                                      |
| PROXY_ENABLED          | false                                | -                 | Booleano per abilitare il consumo di APIs tramite proxy |
| CVS_API_KEY            | -                                    | -                 | API Key TED                                             |
| CVS_API_URL            | https://cvs.preview.ted.europa.eu    | -                 | Url controllo CVS                                       |
| RENDER_API_URL         | https://viewer.preview.ted.europa.eu | -                 | URL Preview PDF                                         |

## Modifiche al TED SDK

Nei file JSON di alcune notice-types, è stata rimossa la seguente riga `"nodeId" : "ND-LotTenderingProcess"` poichè causava un problema nel file XML.  
In particolare, alcuni campi venivano inseriti erroneamente in gruppi che non sono gli stessi definiti nel `fields.json` (es.: `BT-60-Lot`).  
Le enotice-types coinvolte sono quelle dalla 7 alla 40, CEI, T01 e T02.  
Vedi issue: https://github.com/OP-TED/eForms-SDK/issues/799.

Nei file JSON 4.json e 6.json, è stata rimossa la seguente riga `"nodeId" : "ND-ProcedureProcurementScope"` poichè causava un problema nel file XML.  
In particolare, alcuni campi venivano inseriti erroneamente in gruppi che non sono gli stessi definiti nel `fields.json` (es.: `BT-127-notice`).

## Swagger UI
Per accedere a swagger occorre andare al seguente URL
http://localhost:8181/rest/m-eforms-ms/swagger-ui/index.html

oppure qui per le APIs
http://localhost:8181/rest/m-eforms-ms/v3/api-docs

**Swagger è disabilitato in tutti i profili diversi da "dev"**