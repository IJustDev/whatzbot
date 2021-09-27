#!/bin/sh

contacts=`curl -sSL http://localhost:5000/contacts`

selected_contact=`echo $contacts | jq -r .[].displayName | fzf`


echo $selected_contact

jid=`echo $contacts | jq ".[] | select (.displayName==\"$selected_contact\") | .jid"`

read -p "Message: " msg
read -p "Repeat: " rep
content="{\"message\": \"$msg\", \"jid\": $jid, \"repeat\": \"$rep\"}"

echo $content

curl -H "Content-Type: application/json" -d "$content" -X POST http://localhost:5000/send
