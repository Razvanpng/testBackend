Catalog Produse si Comenzi API

Tehnologii folosite:
- backend: node.js (v18+) cu express
- baza de date: mysql (v8+) prin pachetul mysql2
- teste automate: jest si supertest

Cum se instaleaza dependentele:
Deschideti un terminal in folderul proiectului si executati comanda: npm install

Cum se configureaza baza de date:
Pentru a crea baza de date, executati in terminal comanda:
mysql -u root -p -e "CREATE DATABASE softprim_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
Pentru a importa structura si datele initiale, executati comanda:
mysql -u root -p softprim_test < setup.sql
Creati o copie a fisierului .env.example si redenumiti-o in .env. Deschideti acest fisier si completati cu parola pentru serverul MySQL.

Cum se porneste aplicatia:
In terminal, in folderul proiectului executati: npm start (API-ul va porni pe localhost:3000)
Pentru a rula testele automatizate, executati: npm run test

Exemple de apeluri de test pentru API:
- pentru a lua toate produsele: curl http://localhost:3000/api/products
- pentru a lua produsele dintr-o categorie (ex: id 1): curl "http://localhost:3000/api/products?category_id=1"
- pentru a lua detaliile unui produs (ex: id 1): curl http://localhost:3000/api/products/1
- pentru a plasa o comanda: curl -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" -d "{\"product_id\": 1, \"quantity\": 2, \"customer_email\": \"client@exemplu.ro\"}"

Pe langa ce se cerea in cerinta, am mai adaugat teste automatizate pe care le puteti rula. De asemenea, pentru endpoint-ul de comenzi am implementat o tranzactie SQL cu clauza "FOR UPDATE".