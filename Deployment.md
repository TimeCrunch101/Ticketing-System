# About
This set of instructions is for running the app on Ubuntu Server 20.04 using Apache as the reverse proxy.

# Install Ubuntu Server
Once installed change the root password to something secure

```
sudo passwd root
```

Now, switch to the root user, this will make so we don't have to sudo everything. Not best practice but oh well...

```
sudo su root
```
```
cd /
```

# Update, upgrade, install NodeJs, Apache2, and npm

```
apt update
```

```
apt upgrade
```

```
apt install apache2 nodejs npm -y
```

# Create directory for your NodeJs app in /var/www/html/

```
mkdir /var/www/html/nodejs
```

Copy over your web app files into /var/www/html/nodejs
then cd into the nodejs directory

```
cd /var/www/html/nodejs
```

# Download NodeJs App modules defined in package.json, then install and set up pm2 for the NodeJs process managemnt

```
npm install
```

```
npm i pm2 -g
```

```
pm2 start app.js
```

```
pm2 startup
```

```
pm2 save
```

```
cd /
```

# Enable required proxy mods for Apache


```
sudo a2enmod proxy
```


```
systemctl restart apache2
```

```
sudo a2enmod proxy_http
```

```
systemctl restart apache2
```

# Edit this file 
# /etc/apache2/sites-available/000-default.conf
```
nano /etc/apache2/sites-available/000-default.conf
```

Paste in the below info. Remember to change the port number on `http://127.0.0.1` to the port the app is listneing on

```
<VirtualHost *:80>
	#ServerName test.com
	ProxyRequests Off
	ProxyPreserveHost On
	ProxyVia Full
   <Proxy *>
      Require all granted
   </Proxy>
   <Location />
      ProxyPass http://127.0.0.1:{your port num}/ # <= omit the {} for port num
      ProxyPassReverse http://127.0.0.1:{your port num}/ # <= omit the {} for port num
   </Location>
	ServerAdmin webmaster@localhost
	DocumentRoot /var/www/html
	ErrorLog ${APACHE_LOG_DIR}/error.log
	CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

 save the file "ctrl + x", "Y", "Enter key"

```
systemctl restart apache2
```

# Exit Root session

```
exit
```

Now, find the address your server is running on, if you statically set the address during
the Ubuntu Server setup process, then you obviously don't need this step.
```
ip addr
```
![Showing IP address example](/Documentation/ip-example.jpg "IP Address example")
# Log out of the server

```
logout
```

# Test connection, open a browser and go to.

http://yourServerAddress/