FROM elasticsearch:7.10.1
RUN /usr/share/elasticsearch/bin/elasticsearch-plugin install --batch ingest-attachment
RUN yum install -y yum-utils.noarch
RUN yum-config-manager --add-repo https://download.opensuse.org/repositories/home:/Alexander_Pozdnyakov/CentOS_8/
RUN yum -y install tesseract --nogpgcheck
RUN yum -y install tesseract-langpack-deu --nogpgcheck
