import bodyParser from 'body-parser';
import { PORT as port } from './config';


module.exports = (app, api) => {

    // Dar permiso de acceso a la app
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    app.use('/api',api);
    //Usar estrucutura json
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    //Configuración de variables
    app.set('json spaces', 4);
    app.set('port', process.env.PORT || port);



};