
export EMAIL='PARSER@IT.KPI'
export HOSTNAME_URL='events-admin'
export HOSTNAME_PATH='/api/v1/suggested_events'
export HOSTNAME_PORT='5000'

timeout 600 node main.js || echo "KILLED BY TIMEOUT"
