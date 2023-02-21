#!/bin/bash
sleep 30
echo "Installing Nginx"
sudo yum update -y
sudo yum upgrade -y
sudo amazon-linux-extras install nginx1.12 -y

echo "Installing NodeJS"
sudo yum install -y gcc-c++ make
curl -sL https://rpm.nodesource.com/setup_16.x | sudo -E bash -
sudo yum install -y nodejs

echo "Installing MySQL---------------------------------"
sudo rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2022
wget http://dev.mysql.com/get/mysql57-community-release-el7-8.noarch.rpm
sudo yum localinstall -y mysql57-community-release-el7-8.noarch.rpm
sudo yum install -y mysql-community-server
sudo systemctl start mysqld
sudo systemctl enable mysqld
sudo grep 'temporary password' /var/log/mysqld.log | awk '{print $NF}' > /tmp/mysql.password
MYSQL_ROOT_PASSWORD=$(cat /tmp/mysql.password)
mysql -u root --password=$MYSQL_ROOT_PASSWORD --connect-expired-password -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'Anay@123';"

#create database
mysql -u root --password=Anay@123 -e "CREATE DATABASE CSYEWebapp;"
quit

echo "success"

# //go to webapp.zip
sudo yum install unzip -y
cd ~/ && unzip webapp.zip
cd webapp

#set environment variables
sudo touch .env
sudo chmod 777 .env
echo "DB_HOST=localhost" >> .env
echo "PORT = 3000" >> .env
echo "DB_USER = root" >> .env
echo "DB_PASSWORD = Anay@123" >> .env
echo "DB_NAME = CSYEWebapp" >> .env


source /etc/profile

cd ~/webapp && npm i 
sudo mv /tmp/webapp.service /etc/systemd/system/webapp.service
sudo systemctl enable webapp.service
sudo systemctl start webapp.service
sudo systemctl status webapp.service
# sudo npm run dev

