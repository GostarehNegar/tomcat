Service Definition
Services are defined with a name and a set of specs/params.
Examples:
Data Service: {name:'data', params:{exhange:'coinex'}}

Requiring:
Clients may require a service:
Require = 'mesh/require' + Service

A ServiceNode is a process that provides one or more services. Nodes should respond to query status messages. Each node
is identified by an endpoint name that should b unique for each individual instance.
Nodes are also identified with their endpoint name on the messagebus.

a node reply to 'mesh/requests/query/status' should publish a list of servicestatus.

Service Status
mesh/events/status
{service:SeviceDef, node:NodeDef, status{
upsince:
}}

Examples
DataService = {
'name':'data'
'params':{
'exchange':'binance',
'interval':'1m',
'symbol':'btcusdt'
}
}
Strategy = {
'category':'strategy',
'name':'mystrategy',

}
