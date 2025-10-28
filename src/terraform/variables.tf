# AWS Region
variable "aws_region" {
  description = "AWS Region für die Ressourcen"
  type        = string
  default     = "eu-central-1"
}

# Projektname
variable "project_name" {
  description = "Name des Projekts (wird für Resource-Tagging verwendet)"
  type        = string
  default     = "devsecops-pipeline"
}

# Environment
variable "environment" {
  description = "Environment (dev, staging, production)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment muss 'dev', 'staging' oder 'production' sein."
  }
}

# AMI ID
variable "ami_id" {
  description = "AMI ID für die EC2 Instance (z.B. Amazon Linux 2023)"
  type        = string
  default     = "ami-0c55b159cbfafe1f0"  # Beispiel - muss für deine Region angepasst werden
}

# Instance Type
variable "instance_type" {
  description = "EC2 Instance Type"
  type        = string
  default     = "t2.micro"
}

# VPC ID
variable "vpc_id" {
  description = "VPC ID für die Security Group"
  type        = string
}

# Subnet ID
variable "subnet_id" {
  description = "Subnet ID für die EC2 Instance"
  type        = string
}

# Root Volume Size
variable "root_volume_size" {
  description = "Größe des Root Volumes in GB"
  type        = number
  default     = 20
}

# Allowed SSH CIDR Blocks
variable "allowed_ssh_cidr_blocks" {
  description = "CIDR-Blöcke, die SSH-Zugriff erhalten (Best Practice: nur spezifische IPs)"
  type        = list(string)
  # VULNERABILITY 10: Default erlaubt SSH von überall
  default     = ["0.0.0.0/0"]  # CRITICAL: In Production einschränken!
}

# VULNERABILITY 11: Hardcoded Secrets in Variables
variable "db_password" {
  description = "Database password"
  type        = string
  default     = "SuperSecret123!"  # Sollte NIEMALS hardcoded sein!
  # sensitive = true  # Sollte mindestens sensitive sein!
}

# Elastic IP zuweisen?
variable "assign_eip" {
  description = "Elastic IP der Instance zuweisen?"
  type        = bool
  default     = false
}

# User Data Script
variable "user_data_script" {
  description = "User Data Script für initiale Instance-Konfiguration"
  type        = string
  default     = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y amazon-cloudwatch-agent
    echo "EC2 Instance initialized" > /var/log/user-data.log
  EOF
}

# CloudWatch Alarm Actions
variable "alarm_actions" {
  description = "ARNs für CloudWatch Alarm Actions (z.B. SNS Topics)"
  type        = list(string)
  default     = []
}
