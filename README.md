** ForEventsBackend **

# User manual to deploy and use 4Events API REST 

## Previous considerations

This API assumes you've already installed the MongoDB database engine in your system and it's running with a script similar to show below:

```
./bin/mongod --dbpath ./data/db --directoryperdb
```

The name of the database in MongoDB is: **forEvents**

We recommend to use a user with limited access to database, only to read/write permissions.
This user and his password must be configured following the instructions in the next section of this manual.

Steps to create that user:

* Connect to database
* Type command ```use forEvents```
* Type command ```db.createUser(
{user: “usuario”,
Pwd: “password”,
roles: [{role:”readWrite”, db:”4events”}]
})```


## Previous configurations to run the API service

This API need to have configured several environment variables, you must configure the value previouly to run the API

The values to configure are:

* **NODE_ENV**=[ production | development ]

  You can control with this variable the running environment where you are executing your API, by default development

* **PORT**=nnnnn

   You can specify the port where your API is accepting requests, by default 3000

* **ForEvents_dbUser**=xxxxx 


	User to connect to MongoDb database, previously configured

*	**ForEvents_dbPass**=xxxxx

	Password of the user to connect database, previously configured
	
*  **ForEvents_jwtPrivateKey**=xxxxxxxxxxxxxx

	Private key used to generate tokens, JWT
	
* **ForEvents_smtpUser**=xxxxxx

	User to connect SMTP Server to send emails
	
*	**ForEvents_smtpPass**=xxxxxx

	Password to connect SMTP Server to send emails

* **ForEvents_FBKey**=xxxxxx

	You must configure the key provided by Firebase to send notifications
		
Note: It's possible to use a specific SMTP server, in our development we used a Gmail to test account and with the nodemailer component user this parameter it wasn't necessary.

## Procedure to run the API service

From a console you only have to run the following command to begin to use the service

```
npm run start
```

## Documentation to use API

Please click the following link to access

[Documentation](https://services.4events.net/apidoc)

## Notes of the deployment in real enviornment

In the real environment we use nginx like webpages server and we use certbot and nginx to manage the https access and the response to the different requests to our configured sub/domains.
Certbot allow us to manage the semi-automatic way all the certificates generated from letsencrypt.
The ReactJS project, panel administrator, is directly managed by nginx.
Nginx is also use like inverse proxy to access nodeJS server, this is answering in the port configured, and make it possible to access from internet in secured channel, https (443).
Our MongoDB engine is configured to be started by the PM2 application like a service.
Everytime our server is restarted PM2 is in charge to start all the services required to server Admin Web and Node Server (API service) 