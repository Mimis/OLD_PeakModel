#!/bin/bash
#!/bin/sh



echo "mvn clean Install...";
mvn clean install


echo "move executable to jetty...";
sudo cp "target/"$1".war" /usr/share/jetty/webapps

echo "restart Jetty...";
sudo /etc/init.d/jetty stop
sudo /etc/init.d/jetty start



