# ECOMMERCE API

This is a project to authenticate two kinds of users **admin** and **customer** assigning them to their specific roles

## Features

- Both kinds of users can register and login
- Admin can add, edit and delete a product
- customer can view all products, view single products, add an order and checkout with products
- testing using jest and supertest

## Installation

- Clone repository
  `git clone https://github.com/mdmuche/kodecamp4_stage6.git`

- Change directory
  `cd kodecamp4_stage6`

- Install dependency
  `npm install`

- Install dev-dependency
  `npm install --save-dev nodemon`

- Setup .env config files

  ```
   PORT=your_port_here

   URL=url_mongodb_url_here

   SECRET=your_secret_key
  ```

- Start your application
  `npm start`

## Register, Login, Forgot-password, Reset-password Routes

### Register

### POST /v1/auth/register

Creates a user for both admin and customers with paths: fullName, email and password

Request body

```

Content-Type: application/json

{
    "fullName": "john doe",
    "email": "johndoe@example.com",
    "password": "your_password"
}

```

### Login

### POST /v1/auth/login

Login a user for both admin and customers with paths: email and password

Request body

```

Content-Type: application/json

{
"email": "johndoe@example.com",
"password": "your_password"
}

```

### Forgot-password

### POST /v1/auth/forgot-password

Forgot password route with path: email

Request body

```

Content-Type: application/json

{
    "email": "johndoe@example.com"
}


```

### Reset-password

### POST /v1/auth/reset-password

Reset password route with path: token and newPassword

Request body

```

Content-Type: application/json

{
    "token": your_generated_uuid,
    "newPassword": "your_new_password"
}


```

## Admin Routes

### Create_product

### POST /v1/admins

Create product with paths: prodName, prodPrice, prodSnippet, prodDetails

Request body with header

```

Content-Type: application/json
Authorization: Bearer your_jwt_token

{
"prodName": "prodName_here",
"prodPrice": Number(prodPrice),
"prodSnippet": "prodSnippet_here",
"prodDetails": "prodDetails_here"
}

```

### Edit Product

### PATCH /v1/admins/${id}

Edit product with paths: prodName, prodPrice, prodSnippet, prodDetails where id is your ObjectId(\_id)

Request body and header

```

Content-Type: application/json
Authorization: Bearer your_jwt_token

{
"prodName": "prodName_updated_here",
"prodPrice": Number(prodPrice),
"prodSnippet": "prod_snippet_updated_here",
"prodDetails": "prod_details_updated_here"
}

```

### Delete Product

### DELETE /v1/admins/${id}

Delete a product by id

Request header

```

Authorization: Bearer your_jwt_token

```

## Customer Routes

### View all product

### GET /v1/product/${page}/${limit}

View products with pagination where ${page} && ${limit} must be a Number

Request header

```

Authorization: Bearer your_jwt_token

```

### View single product by id

### GET /v1/product/${id}

view a single product with an ObjectId(\_id)

Request header

```

Authorization: Bearer your_jwt_here

```

### Create order

### POST /v1/customers/order

Create an order order items(products) containing paths: productId, quantity, and totalCost

Request body and header

```

Content-Type: application/json
Authorization: Bearer your_jwt_here

{
"products": [
{
"productId": your_first_ordered_product_id,
"quantity": your_quantity_here,
"totalCost": your_total_cost_here
},
{
"productId": your_second_ordered_product_id,
"quantity": your_quantity_here,
"totalCost": your_total_cost_here
}
]
}

```

### Checkout with products

### GET /v1/customers/orders

Get all your orders

Request header

```

Authorization: Bearer your_jwt_token

```

## Testing

### Run test suites for admin and customer endponits

Admin Tests
`npm run adminTest`

Customer Test
`npm run customerTest`

```

```
