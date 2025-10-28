# EC2 Instance Outputs
output "instance_id" {
  description = "ID der EC2 Instance"
  value       = aws_instance.example.id
}

# SECURE: Sensitive data properly marked
output "instance_public_ip" {
  description = "Öffentliche IP der EC2 Instance"
  value       = aws_instance.example.public_ip
  sensitive   = true
}

output "instance_private_ip" {
  description = "Private IP der EC2 Instance"
  value       = aws_instance.example.private_ip
  sensitive   = true
}

output "instance_arn" {
  description = "ARN der EC2 Instance"
  value       = aws_instance.example.arn
}

# Elastic IP (falls zugewiesen)
output "elastic_ip" {
  description = "Elastic IP Address (falls zugewiesen)"
  value       = var.assign_eip ? aws_eip.example[0].public_ip : null
}

# IAM Role Outputs
output "iam_role_name" {
  description = "Name der IAM Role"
  value       = aws_iam_role.ec2_role.name
}

output "iam_role_arn" {
  description = "ARN der IAM Role"
  value       = aws_iam_role.ec2_role.arn
}

output "iam_instance_profile_name" {
  description = "Name des IAM Instance Profiles"
  value       = aws_iam_instance_profile.ec2_profile.name
}

# Security Group Outputs
output "security_group_id" {
  description = "ID der Security Group"
  value       = aws_security_group.ec2_sg.id
}

output "security_group_name" {
  description = "Name der Security Group"
  value       = aws_security_group.ec2_sg.name
}

# CloudWatch Alarm
output "cloudwatch_alarm_name" {
  description = "Name des CloudWatch CPU Alarms"
  value       = aws_cloudwatch_metric_alarm.cpu_alarm.alarm_name
}

# SECURE: SSH Connection marked as sensitive
output "ssh_connection" {
  description = "SSH Connection String (verwende deinen Private Key)"
  value       = "ssh -i /path/to/key.pem ec2-user@${aws_instance.example.public_ip}"
  sensitive   = true
}

# Summary
output "deployment_summary" {
  description = "Zusammenfassung der Deployment-Informationen"
  value = {
    instance_id      = aws_instance.example.id
    instance_type    = var.instance_type
    monitoring       = "enabled"   # Updated to reflect secure config
    ebs_encrypted    = "true"      # Updated to reflect secure config
    imdsv2_enforced  = "true"      # Updated to reflect secure config
    ebs_optimized    = "true"
    environment      = var.environment
  }
}
