# webapp

### Git Command Workflow for adding origin
- git remote -v
- git remote remove origin
- git remote add anay fork_repo_name
- git remote add upstream org_repo_name

### Git Workflow
- git checkout -b feature_x
- git add -A :/
- git commit -m "msg"
- git push anay feature_x
- Go to github and get pull request in organization
- git checkout main
- git pull upstream main
- git push anay main/or go to your fork and click sync
- git checkout -b feature_y

### create a .env file with following details
NODE_ENV = development
PORT = 3000

DB_HOST = "host"
DB_USER = root
DB_PASSWORD = ""
DB_NAME = db_name

### To install dependencies and run project
- Install node
- Run npm init --yes
- Run npm i 

- Create a new file named server.js

- To install nodemon
- Run npm i -g nodemon

- Use set command to add environment variable
- set PORT=3000
- Run node server.js to run the project
- Test using postman
- Run Get http://localhost:3000/healthz in postman to get status code 200

### To install mysql 
- Run npm install --save mysql

### To install bycrpt
- Run npm i bcryptjs

### To install basic auth
- Run npm install express-basic-auth

### To Install mocha and chai
- npm i chai
- npm i mocha
- npm i chai-http

### Assignment 1
- Develop a web application with RESTful API without any UI

### Assignment 2
- Make use of ORM Framework like Sequalize 

### Assignment 4
- Use packer to create AMI 
