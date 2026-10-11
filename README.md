# 🌩️ CloudPulse

> **A serverless dashboard that monitors your AWS resource health, tracks costs, and alerts you when something goes wrong.**

CloudPulse is a production-style cloud monitoring system built on AWS serverless and container services. It doesn't just "run" — it watches your cloud, tracks your spending, and screams at you (via email) when thresholds are breached.

---

## 📌 Table of Contents

- [What is CloudPulse?](#-what-is-cloudpulse)
- [Why This Project?](#-why-this-project)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Run Locally (Without Docker)](#2-run-locally-without-docker)
  - [3. Run with Docker](#3-run-with-docker)
- [AWS Deployment](#-aws-deployment)
  - [Step 1: Push Image to Amazon ECR](#step-1-push-image-to-amazon-ecr)
  - [Step 2: Create ECS Cluster & Task Definition](#step-2-create-ecs-cluster--task-definition)
  - [Step 3: Create Service & Load Balancer](#step-3-create-service--load-balancer)
  - [Step 4: Add Serverless Monitoring Layer](#step-4-add-serverless-monitoring-layer)
  - [Step 5: Infrastructure as Code with Terraform](#step-5-infrastructure-as-code-with-terraform)
- [API Endpoints](#-api-endpoints)
- [What Broke & How I Fixed It](#-what-broke--how-i-fixed-it)
- [What I Learned](#-what-i-learned)
- [Environment Variables](#-environment-variables)
- [Testing](#-testing)
- [Future Improvements](#-future-improvements)
- [Author](#-author)
- [License](#-license)

---

## 🚀 What is CloudPulse?

CloudPulse is a **serverless cloud monitoring dashboard** that:

- 📊 Tracks **AWS resource health** in real time
- 💰 Monitors **cost trends** to catch unexpected spikes
- 🚨 Sends **automated email alerts** when thresholds are breached
- ☁️ Runs entirely on **managed, serverless infrastructure** — no servers to babysit

**Simple analogy:** Just like your phone shows battery, storage, and data usage — CloudPulse shows your AWS account's health and spending.

---

## 🎯 Why This Project?

The industry doesn't care that you can follow a tutorial. It cares that you can **design a VPC, write secure IAM policies, and deploy without breaking production.**

CloudPulse was built to touch every layer of modern cloud architecture:

- **IAM roles** (task execution vs. task role — the classic beginner trap)
- **Container registry** (ECR)
- **Container orchestration** (ECS Fargate)
- **Networking** (VPC, subnets, security groups)
- **Serverless compute** (Lambda)
- **Monitoring & alerting** (CloudWatch + SNS)
- **Infrastructure as Code** (Terraform)

This is the **2026 baseline**. Certifications alone won't differentiate you — a GitHub repo showing a deployed, working architecture will.

---

## 🏗️ Architecture
