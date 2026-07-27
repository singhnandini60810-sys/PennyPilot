# PennyPilot

**Live Demo:** https://penny-pilot-rho-amber.vercel.app/

PennyPilot is a modern serverless expense management application built with React, TypeScript, AWS, and Amazon Cognito. It helps users securely manage their daily expenses, analyze spending patterns, track budgets and savings, and export financial reports. The application is designed using a cloud-native architecture with secure user authentication and isolated user data.


## Features

- Secure user authentication with Amazon Cognito
- Individual user data isolation
- Dashboard with expense overview and spending insights
- Expense management (Create, Read, Update, Delete)
- Budget management
- Savings tracker
- Expense reports and analytics
- Search and filter expenses
- Export reports as CSV, Excel, and PDF
- Responsive interface for desktop and mobile
- Dark mode support
- Secure REST API using AWS API Gateway and AWS Lambda


## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Recharts
- CSS

### Backend

- AWS Lambda (Python)
- Amazon API Gateway
- Amazon DynamoDB
- Amazon Cognito
- Amazon IAM

### Deployment

- Vercel
- AWS Cloud


## Architecture

```
                +----------------------+
                |      React App       |
                |       (Vite)         |
                +----------+-----------+
                           |
                           |
                    HTTPS Requests
                           |
                           v
                +----------------------+
                |   API Gateway (JWT)  |
                +----------+-----------+
                           |
                           |
                           v
                +----------------------+
                | AWS Lambda (Python)  |
                +----------+-----------+
                           |
                           |
                           v
                +----------------------+
                |   DynamoDB Table     |
                +----------------------+

                           ^
                           |
                           |
                +----------------------+
                | Amazon Cognito       |
                | Authentication       |
                +----------------------+
```



## Security

PennyPilot follows cloud security best practices by implementing:

- JWT authentication using Amazon Cognito
- API Gateway JWT Authorizer
- User-specific expense ownership
- Protected REST endpoints
- IAM-based resource permissions
- Secure communication over HTTPS
- Authorization token validation on every API request

Each authenticated user can access only their own expenses. Expense ownership is validated on every Create, Read, Update, and Delete operation to ensure complete data isolation.



## Project Structure

```
PennyPilot/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   ├── utils/
│   └── auth/
│
├── public/
├── package.json
├── vite.config.ts
└── README.md
```



## Installation

Clone the repository

```bash
git clone https://github.com/singhnandini60810-sys/PennyPilot.git
```

Move into the project directory

```bash
cd PennyPilot
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
VITE_API_BASE_URL=YOUR_API_GATEWAY_URL
VITE_AWS_REGION=YOUR_REGION
VITE_COGNITO_USER_POOL_ID=YOUR_USER_POOL_ID
VITE_COGNITO_CLIENT_ID=YOUR_CLIENT_ID
VITE_COGNITO_DOMAIN=YOUR_COGNITO_DOMAIN
VITE_REDIRECT_URI=http://localhost:5173/
VITE_LOGOUT_URI=http://localhost:5173/
```

Run the development server

```bash
npm run dev
```

Build the application

```bash
npm run build
```

---

## Screenshots

Add screenshots here:

- Login Page
- Dashboard
- Expense Management
- Reports
- Budget Tracker
- Savings
- Export Reports

---

## Future Improvements

- Recurring expenses
- Monthly financial goals
- Email report scheduling
- Expense receipt upload
- OCR-based receipt scanning
- AI-powered spending insights
- Multi-currency support
- Progressive Web App (PWA)

---

## Learning Outcomes

This project demonstrates practical experience with:

- React and TypeScript application development
- Serverless architecture
- REST API development
- AWS Lambda
- Amazon DynamoDB
- Amazon Cognito Authentication
- JWT Authorization
- API Gateway
- Cloud security
- State management
- Data visualization
- Report generation
- Full-stack cloud deployment

---

## Author

**Nandini Singh**

GitHub: https://github.com/singhnandini60810-sys

LinkedIn: https://www.linkedin.com/in/nandini-singh-60810/

Portfolio: https://nandini-singh-portfolio-ictw.vercel.app/

---

## License

This project is licensed under the MIT License.
