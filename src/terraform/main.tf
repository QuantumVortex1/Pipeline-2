# AWS Provider Configuration
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# IAM Role für EC2 Instance
resource "aws_iam_role" "ec2_role" {
  name               = "${var.project_name}-ec2-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-ec2-role"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-ec2-profile"
  role = aws_iam_role.ec2_role.name

  tags = {
    Name        = "${var.project_name}-ec2-profile"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Optional: IAM Policy für CloudWatch Logs
resource "aws_iam_role_policy" "cloudwatch_logs_policy" {
  name   = "${var.project_name}-cloudwatch-logs"
  role   = aws_iam_role.ec2_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# Security Group für EC2 Instance
resource "aws_security_group" "ec2_sg" {
  name        = "${var.project_name}-ec2-sg"
  description = "Security group for ${var.project_name} EC2 instance"
  vpc_id      = var.vpc_id

  # SSH Access (nur für Demo - in Production mit spezifischen IPs einschränken)
  ingress {
    description = "SSH from allowed IPs"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidr_blocks
  }

  # HTTP Access (optional, für Webserver)
  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS Access (optional, für Webserver)
  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound traffic
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-ec2-sg"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# EC2 Instance mit allen Security Best Practices
resource "aws_instance" "example" {
  ami                  = var.ami_id
  instance_type        = var.instance_type
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]
  subnet_id            = var.subnet_id

  # IMDSv2 Enforcement (SSRF-Protection)
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"  # IMDSv2 - verhindert SSRF-Angriffe
    http_put_response_hop_limit = 1
    instance_metadata_tags      = "enabled"
  }

  # Detailed Monitoring aktivieren
  monitoring = true

  # EBS-Optimized für bessere Performance
  ebs_optimized = true

  # Encrypted Root Volume
  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.root_volume_size
    encrypted             = true
    delete_on_termination = true
    
    tags = {
      Name        = "${var.project_name}-root-volume"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }

  # User Data für initiale Konfiguration (optional)
  user_data = var.user_data_script

  tags = {
    Name        = "${var.project_name}-ec2-instance"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Purpose     = "DevSecOps Demo"
  }

  # Lifecycle-Regel: Bei AMI-Änderung neue Instance erstellen, dann alte löschen
  lifecycle {
    create_before_destroy = true
  }
}

# Optional: Elastic IP für statische öffentliche IP
resource "aws_eip" "example" {
  count    = var.assign_eip ? 1 : 0
  instance = aws_instance.example.id
  domain   = "vpc"

  tags = {
    Name        = "${var.project_name}-eip"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# CloudWatch Alarm für hohe CPU-Auslastung
resource "aws_cloudwatch_metric_alarm" "cpu_alarm" {
  alarm_name          = "${var.project_name}-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This metric monitors EC2 CPU utilization"
  alarm_actions       = var.alarm_actions

  dimensions = {
    InstanceId = aws_instance.example.id
  }

  tags = {
    Name        = "${var.project_name}-cpu-alarm"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
