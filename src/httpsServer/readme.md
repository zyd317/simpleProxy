## 证书生成
# 1,生成密钥
>bash $ sudo openssl genrsa -des3 -out rootCA.key 2048


# 2,使用生成的密钥来创建新的根SSL证书。并将其保存为rootCA.pem
>bash $ sudo openssl req -x509 -new -nodes -key zyd.key -sha256 -days 3650 -out zyd.pem