output "control_plane_public_ip" {
  description = "Public IPv4 address of the control-plane instance."
  value       = aws_instance.control_plane.public_ip
}

output "worker_public_ips" {
  description = "Public IPv4 addresses of the worker instances."
  value       = aws_instance.worker[*].public_ip
}
