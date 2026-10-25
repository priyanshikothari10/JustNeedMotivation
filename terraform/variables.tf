variable "aws_region" {
  description = "AWS region for the network and instances."
  type        = string
  default     = "us-east-1"
}

variable "my_ip_cidr" {
  description = "Your public IPv4 CIDR allowed to SSH, for example 203.0.113.10/32."
  type        = string

  validation {
    condition     = can(cidrhost(var.my_ip_cidr, 0)) && can(regex("^[0-9.]+/[0-9]+$", var.my_ip_cidr))
    error_message = "my_ip_cidr must be a valid IPv4 CIDR."
  }
}

variable "key_name" {
  description = "Name of an existing AWS EC2 key pair for SSH access."
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type for both Kubernetes nodes."
  type        = string
  default     = "t3.medium"
}

variable "worker_count" {
  description = "Number of worker nodes."
  type        = number
  default     = 1

  validation {
    condition     = var.worker_count >= 1 && var.worker_count == floor(var.worker_count)
    error_message = "worker_count must be a positive whole number."
  }
}

variable "vpc_cidr" {
  description = "CIDR for the Kubernetes VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR for the public subnet."
  type        = string
  default     = "10.0.1.0/24"
}
