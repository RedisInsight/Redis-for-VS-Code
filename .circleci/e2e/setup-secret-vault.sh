#!/bin/bash
set -e

export V4=4
echo "V5=5" >> $BASH_ENV
echo "export V6=6" >> $BASH_ENV

echo "V4:$V4"
echo "V5:$V5"
echo "V6:$V6"

GNOME_KEYRING_PASS=${GNOME_KEYRING_PASS:-'somepass'}

eval "$(dbus-launch --sh-syntax)"

echo "export DBUS_SESSION_BUS_ADDRESS=$DBUS_SESSION_BUS_ADDRESS" >> $BASH_ENV
echo "export GNOME_KEYRING_PASS=$GNOME_KEYRING_PASS" >> $BASH_ENV

source $BASH_ENV

mkdir -p ~/.cache
mkdir -p ~/.local/share/keyrings

eval "$(echo "$GNOME_KEYRING_PASS" | gnome-keyring-daemon --unlock)"

echo "export GNOME_KEYRING_CONTROL=$GNOME_KEYRING_CONTROL" >> $BASH_ENV
echo "export SSH_AUTH_SOCK=$SSH_AUTH_SOCK" >> $BASH_ENV

source $BASH_ENV

echo "$(echo "$GNOME_KEYRING_PASS" | gnome-keyring-daemon --unlock)"
echo "$(echo "$GNOME_KEYRING_PASS" | gnome-keyring-daemon --unlock)"
echo "$(echo "$GNOME_KEYRING_PASS" | gnome-keyring-daemon --unlock)"

sleep 1

eval "$(echo "$GNOME_KEYRING_PASS" | gnome-keyring-daemon --start)"
