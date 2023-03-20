#!/bin/bash
sleep 30
echo "Installing Nginx"
sudo yum update -y
sudo yum upgrade -y
sudo amazon-linux-extras install nginx1.12 -y

echo "CW Agent"
#download cloudwatch agent rpm
sudo wget https://s3.us-east-1.amazonaws.com/amazoncloudwatch-agent-us-east-1/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
#install cloudwatch agent
sudo rpm -U ./amazon-cloudwatch-agent.rpm
#check if cloudwatch agent is running
sudo systemctl status amazon-cloudwatch-agent.service

echo "Installing NodeJS"
sudo yum install -y gcc-c++ make
curl -sL https://rpm.nodesource.com/setup_16.x | sudo -E bash -
sudo yum install -y nodejs




# //go to webapp.zip
sudo yum install unzip -y   
mkdir ~/webapp
unzip webapp.zip -d ~/webapp
cd ~/webapp && npm i
cd ~/webapp



cd ~/webapp && npm i 
sudo mv /tmp/webapp.service /etc/systemd/system/webapp.service
sudo systemctl enable webapp.service
sudo systemctl start webapp.service
sudo systemctl status webapp.service
# sudo npm run dev

