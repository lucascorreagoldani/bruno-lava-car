#!/usr/bin/env bash
set -euo pipefail

echo "=========================================================="
echo "  BRUNO LAVA CAR - SETUP INICIAL DA VPS UBUNTU 24.04 LTS  "
echo "=========================================================="

if [ "$EUID" -ne 0 ]; then
  echo "Por favor, execute este script como root (sudo ./setup-vps.sh)"
  exit 1
fi

echo "--> 1. Expandindo partição LVM / NVMe para usar 100% do disco..."
# Detecta o Physical Volume do LVM (ex: /dev/vda3)
PV_DEV=$(pvs --noheadings -o pv_name 2>/dev/null | tr -d ' ' | head -n 1 || true)

if [ -n "$PV_DEV" ]; then
  PARENT_DISK=$(echo "$PV_DEV" | sed -E 's/p?[0-9]+$//')
  PART_NUM=$(echo "$PV_DEV" | grep -o '[0-9]*$')
  echo "Expandindo partição física $PART_NUM no disco $PARENT_DISK..."
  growpart "$PARENT_DISK" "$PART_NUM" 2>/dev/null || true
  pvresize "$PV_DEV" 2>/dev/null || true
  lvextend -l +100%FREE /dev/mapper/ubuntu--vg-ubuntu--lv -r 2>/dev/null || true
fi

echo "Espaço disponível em disco atualizado:"
df -h /

echo "--> 2. Atualizando repositórios e pacotes do sistema..."
apt-get clean
apt-get update -y
apt-get upgrade -y
apt-get autoremove -y
apt-get install -y curl git ufw ca-certificates gnupg lsb-release

echo "--> 3. Configurando Memória Swap..."
SWAP_EXISTS=$(swapon --show | wc -l)
if [ "$SWAP_EXISTS" -le 1 ]; then
  rm -f /swapfile
  echo "Alocando 2 GB de Swap no NVMe..."
  fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  
  if ! grep -q '/swapfile' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi
  echo "Swap de 2 GB configurado com sucesso!"
else
  echo "Swap já detectado e ativo."
fi

echo "--> 4. Instalando Docker Engine e Docker Compose oficial..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable docker
systemctl start docker
echo "Docker $(docker --version) instalado e ativo!"

echo "--> 5. Criando diretório de deploy..."
mkdir -p /opt/bruno-lava-car
chmod 755 /opt/bruno-lava-car

echo "--> 6. Configurando Firewall UFW..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw allow 9001/tcp comment 'MinIO Console'
ufw allow 5540/tcp comment 'RedisInsight'

echo "y" | ufw enable
ufw status verbose

echo "=========================================================="
echo "  VPS PREPARADA COM SUCESSO PARA O BRUNO LAVA CAR!       "
echo "  Diretório de Deploy: /opt/bruno-lava-car                "
echo "  Docker e Compose prontos para receber o GitHub Actions  "
echo "=========================================================="
