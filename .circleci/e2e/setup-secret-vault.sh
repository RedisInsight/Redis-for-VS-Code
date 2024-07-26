#!/bin/bash
set -e

GNOME_KEYRING_PASS=${GNOME_KEYRING_PASS:-'somepass'}

echo "dbus-launch"
eval "$(dbus-launch --sh-syntax)"
echo "dbus launched"

echo "export GNOME_KEYRING_PASS=$GNOME_KEYRING_PASS" >> $BASH_ENV
echo "export DBUS_SESSION_BUS_ADDRESS=$DBUS_SESSION_BUS_ADDRESS" >> $BASH_ENV
echo "export DBUS_SESSION_BUS_PID=$DBUS_SESSION_BUS_PID" >> $BASH_ENV
echo "export DBUS_SESSION_BUS_WINDOWID=$DBUS_SESSION_BUS_WINDOWID" >> $BASH_ENV
echo "exported envs"

source $BASH_ENV

#mkdir -p ~/.cache
#mkdir -p ~/.local/share/keyrings

echo "GNOME keyring unlock"
eval "$(echo "$GNOME_KEYRING_PASS" | gnome-keyring-daemon --unlock)"

echo "export GNOME_KEYRING_CONTROL=$GNOME_KEYRING_CONTROL" >> $BASH_ENV
echo "export SSH_AUTH_SOCK=$SSH_AUTH_SOCK" >> $BASH_ENV

source $BASH_ENV

sleep 1

echo "GNOME keyring start"
eval "$(echo "$GNOME_KEYRING_PASS" | gnome-keyring-daemon --start)"

yarn --cwd ky
node kt/index.js
