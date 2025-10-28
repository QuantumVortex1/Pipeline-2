variable "aws_region" { description = "AWS Region für die Ressourcen" type = string default = "eu-central-1" }

variable "project_name" { description = "Name des Projekts (wird für Resource-Tagging verwendet)" type = string default = "devsecops-pipeline" }

variable "environment" {
  description = "Environment (dev, staging, production)"
  type        = string
  default     = "dev"
  validation { condition = contains(["dev", "staging", "production"], var.environment) error_message = "Environment muss 'dev', 'staging' oder 'production' sein." }
}

variable "ami_id" { description = "AMI ID für die EC2 Instance (z.B. Amazon Linux 2023)" type = string default = "ami-0c55b159cbfafe1f0" }

variable "instance_type" { description = "EC2 Instance Type" type = string default = "t2.micro" }

variable "vpc_id" { description = "VPC ID für die Security Group" type = string }

variable "subnet_id" { description = "Subnet ID für die EC2 Instance" type = string }

variable "root_volume_size" { description = "Größe des Root Volumes in GB" type = number default = 20 }

variable "allowed_http_cidrs" { description = "CIDR-Blöcke für HTTP-Zugriff (z.B. Load Balancer IPs)" type = list(string) default = [] }

variable "allowed_https_cidrs" { description = "CIDR-Blöcke für HTTPS-Zugriff (z.B. Load Balancer IPs)" type = list(string) default = [] }

variable "db_password" { description = "Database password (must be provided via terraform.tfvars or environment variable)" type = string sensitive = true }

variable "assign_eip" { description = "Elastic IP der Instance zuweisen?" type = bool default = false }

variable "user_data_script" { description = "User Data Script für initiale Instance-Konfiguration" type = string default = <<-EOF
  #!/bin/bash
  yum update -y
  yum install -y amazon-cloudwatch-agent
  echo "EC2 Instance initialized" > /var/log/user-data.log
EOF }

variable "alarm_actions" { description = "ARNs für CloudWatch Alarm Actions (z.B. SNS Topics)" type = list(string) default = [] }
