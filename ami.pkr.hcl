
packer {
  required_plugins {
    amazon = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}


variable "ssh_username" {
  type    = string
  default = "ec2-user"
}

variable "ami_users" {
  type    = list(string)
  default = ["649216824953", "560592248581"]
  }

variable "ami_name" {
  type    = string
  default = "amzn2-ami-hvm-2.0.20210218.0-x86_64-gp2"
}


locals {
  timestamp = regex_replace(timestamp(), "[- TZ:]", "")
}

source "amazon-ebs" "my-ami" {
  ami_name  = "csye-${local.timestamp}"
  ami_users = var.ami_users
  ami_description = "csye6225"

  source_ami_filter {
    filters = {
      name                = var.ami_name
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["amazon"]
  }
  # source_ami = "ami-013a129d325529d4d"


  instance_type = "t2.micro"
  region        = var.aws_region
  ssh_username  = var.ssh_username
}

build {
  sources = ["source.amazon-ebs.my-ami"]


  provisioner "file" {
    source      = "./app_artifact/webapp.zip"
    destination = "/home/ec2-user/webapp.zip"
  }

  provisioner "file" {
    source      = "./webapp.service"
    destination = "/tmp/webapp.service"
  }

  provisioner "shell" {
    script = "./app.sh"
  }
}
