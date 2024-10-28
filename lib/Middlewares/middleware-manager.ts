import { IMiddlewareError } from "../Errors/Middlewares/MiddlewareError.interface";
import { IMiddlewareManager } from "../Interfaces/middleware-manager.interface";
import { IRouteProcessorService } from "../Interfaces/route-processor-service.interface";
import { MiddlewareFunction } from "../Types/middlewares";
import { HttpRequest } from "../Types/request";
import { HttpResponse } from "../Types/response";

export class MiddlewareManager implements IMiddlewareManager {
  private middlewares: MiddlewareFunction[] = [];

  constructor(private routeProcessorService: IRouteProcessorService) {}

  public use(middleware: MiddlewareFunction): void {
    this.middlewares.push(middleware);
  }

  public executeMiddlewares(req: HttpRequest, res: HttpResponse): void {
    const execute = (index: number): void => {
      if (index >= this.middlewares.length) {
        this.routeProcessorService.processRoute(req, res, req.url, req.method);
        return null;
      }

      const middleware = this.middlewares[index];
      const next = () => execute(index + 1);

      try {
        middleware(req, res, next);
      } catch (error) {
        this.handleMiddlewareError(error, res);
      }
    };

    execute(0);
  }

  private handleMiddlewareError(
    error: IMiddlewareError,
    res: HttpResponse,
  ): void {
    res.statusCode = 500;
    res.statusMessage = "Internal Server Error";
    res.end("Error: " + error.message);
  }
}