import express, { Router } from 'express';
import path from 'path';
import fileUpload from "express-fileupload";
import { RequestLogger } from './middlewares/requestLogger.middleware';
import { createAdminUser } from '../utils/admin-user';

interface Options {
  port: number;
  routes: Router;
  public_path?: string;
}


export class Server {

  public readonly app = express();
  private serverListener?: any;
  private readonly port: number;
  private readonly publicPath: string;
  private readonly routes: Router;

  constructor(options: Options) {
    const { port, routes, public_path = 'public' } = options;
    this.port = port;
    this.publicPath = public_path;
    this.routes = routes;
  }

  
  
  async start() {
    

    //* Middlewares
    this.app.use( express.json() );
    this.app.use( express.urlencoded({ extended: true }) ); 
    this.app.use( fileUpload({ limits: { fileSize: 50 * 1024 * 1024 }}));
    this.app.use(RequestLogger.logRequest);

    //* Se crea admin
    await createAdminUser()

    //* Public Folder
    this.app.use( express.static( this.publicPath ) );

    //* Routes
    this.app.use( this.routes );

    //* SPA
    this.app.get('*', (req, res) => {
      const indexPath = path.join( __dirname + `../../../${ this.publicPath }/index.html` );
      res.sendFile(indexPath);
    });
    

    this.serverListener = this.app.listen(this.port, () => {
      console.log(`Server running on port ${ this.port }`);
    });

  }

  public close() {
    this.serverListener?.close();
  }

}