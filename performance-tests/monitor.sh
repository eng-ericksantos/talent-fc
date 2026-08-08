#!/usr/bin/env bash
# Monitora CPU e RAM dos containers TalentFC em tempo real.
# Uso: bash monitor.sh

CONTAINERS="talentfc_api talentfc_mongo"

docker stats $CONTAINERS \
  --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}"
