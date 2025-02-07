
# Delivery Estimation App

This is a backend application for estimating delivery dates and checking product availability based on user-provided details. It is designed to integrate with a frontend for seamless user experience and can be extended for various e-commerce applications.
Logistics Providers:
#1. Provider A: Same-day delivery for orders placed before 5 PM, provided the product
is in stock in the warehouse.
#2. Provider B: Same-day delivery for orders placed before 9 AM; next-day delivery for
orders placed after.
#3. General Partners: Delivery within 2 to 5 days depending on the pincode (metro,

non-metro, or tier 2-3 cities).
Challenge Details:
1. Product Selection:
 Display a list of products for users to select from.
 Simulate product stock availability (e.g., 80% of products are in stock for any
warehouse).
2. Pincode Input:
 Allow users to input a valid pincode.
 Validate the pincode and associate it with the appropriate logistics provider.
3. Delivery Date Estimation Logic:
 Use the pincode and provider to estimate the delivery date:
■ Provider A: Same-day if ordered before 5 PM and in stock.
■ Provider B: Same-day if ordered before 9 AM, next-day otherwise.
■ General Partners: Delivery within 2-5 days depending on the region.


## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## About

The Delivery Estimation App provides functionality for calculating estimated delivery dates based on the product location, pincode validation, and availability checks. This app is built with a **Node.js** backend and can be connected to any frontend application, making it versatile and adaptable.

---

## Features

- **Product Availability Check**: Validates if a product is available in stock.
- **Delivery Date Estimation**: Calculates estimated delivery dates based on various conditions.
- **Pincode Validation**: Ensures the delivery pincode is valid for service.
- **Error Handling**: Logs errors for easier debugging and reliability.
  
---

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with optional Atlas for cloud storage)
- **Frontend**: Any compatible frontend (HTML/CSS, React, etc.)
- **Authentication**: JSON Web Tokens (JWT) or other middleware if required
- **Deployment**: Heroku/Vercel/Docker

---

## Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** v14 or later
- **MongoDB** (local instance or MongoDB Atlas)
- **npm** (Node Package Manager)
- **Git** (for version control)

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/yourusername/delivery-estimation-app.git
cd delivery-estimation-app
```

### Install dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file at the root of your project and add the following environment variables:

```plaintext
PORT=5000
DB_URI=mongodb://localhost:27017/deliveryApp  # Replace with your MongoDB URI
SECRET_KEY=your-secret-key
```

---

## Usage

### Start the server

To start the server in development mode:

```bash
npm run dev
```

The app should now be running on [http://localhost:5000](http://localhost:5000).

### Connecting to the Frontend

You can set up a frontend (e.g., React, Angular) and connect it to this backend by making API calls to `http://localhost:5000/api`.

---

## API Endpoints

### **Product Availability Check**

- **Endpoint**: `/api/product/check-availability`
- **Method**: `POST`
- **Description**: Checks if a product is in stock.
- **Request Body**:
  ```json
  {
    "productId": "1"
  }
  ```

### **Delivery Date Estimation**

- **Endpoint**: `/api/product/estimate-delivery`
- **Method**: `POST`
- **Description**: Estimates delivery dates based on location and product availability.
- **Request Body**:
  ```json
  {
    "productId": "1",
    "pincode": "123456"
  }
  ```

### **Pincode Validation**

- **Endpoint**: `/api/product/validate-pincode`
- **Method**: `POST`
- **Description**: Validates if the provided pincode is serviceable.
- **Request Body**:
  ```json
  {
    "pincode": "123456"
  }
  ```

---

## Troubleshooting

### Common Issues

- **Database Connection Failed**: Ensure MongoDB is running locally or the URI is correctly configured for a cloud database.
- **Port Conflicts**: If port 5000 is in use, change the `PORT` variable in `.env`.

---

