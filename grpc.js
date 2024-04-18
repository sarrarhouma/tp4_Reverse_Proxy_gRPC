const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Chargement du fichier .proto
const PROTO_PATH = __dirname + '/my-service.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const serviceProto = grpc.loadPackageDefinition(packageDefinition).myservice;

// Fonction pour récupérer un enregistrement à partir d'une base de données (exemple avec MySQL)
function getRecord(call, callback) {
    const id = call.request.id;
    // Connexion à la base de données MySQL
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'db'
    });

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to database:', err);
            callback(err);
            return;
        }

        // Requête à la base de données pour obtenir l'enregistrement avec l'ID spécifié
        connection.query('SELECT * FROM records WHERE id = ?', [id], (error, results) => {
            if (error) {
                console.error('Error querying database:', error);
                callback(error);
                return;
            }

            // Renvoyer les données au client gRPC
            const record = results[0];
            callback(null, { record: record ? record.id : '' });
        });

        // Fermer la connexion à la base de données après utilisation
        connection.end();
    });
}

// Configuration du serveur gRPC
const server = new grpc.Server();
server.addService(serviceProto.MyService.service, { getRecord });
const PORT = '50051';
server.bindAsync(`127.0.0.1:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`gRPC server running on port ${PORT}`);
    server.start();
});
